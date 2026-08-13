import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';
import { validateAppointment } from '../validations/appointmentValidation.js';
import { calculateFeeAndRefund, createAuditLog, createRefundRecord } from './policyService.js';
import { addNotification } from './notificationService.js';

export async function getAllAppointments(filters = {}) {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('appointments')
      .select('*, patients(*, profiles(*)), doctors(*, profiles(*), departments(*)), departments(*)');

    if (filters.patient_id) query = query.eq('patient_id', filters.patient_id);
    if (filters.doctor_id) query = query.eq('doctor_id', filters.doctor_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.date) query = query.eq('appointment_date', filters.date);
    if (filters.priority) query = query.eq('priority', filters.priority);

    const { data, error } = await query.order('appointment_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  let results = mockData.appointments.map(apt => {
    const patient = mockData.patients.find(p => p.id === apt.patient_id);
    const patProfile = patient ? mockData.profiles.find(pr => pr.id === patient.profile_id) : null;
    const doctor = mockData.doctors.find(d => d.id === apt.doctor_id);
    const docProfile = doctor ? mockData.profiles.find(pr => pr.id === doctor.profile_id) : null;
    const department = mockData.departments.find(dep => dep.id === (apt.department_id || doctor?.department_id));

    return {
      ...apt,
      priority: apt.priority || 'NORMAL',
      patients: patient ? { ...patient, profiles: patProfile } : null,
      doctors: doctor ? { ...doctor, profiles: docProfile, departments: department } : null,
      departments: department
    };
  });

  if (filters.patient_id) {
    results = results.filter(a => a.patient_id === filters.patient_id || a.patients?.profile_id === filters.patient_id);
  }
  if (filters.doctor_id) {
    results = results.filter(a => a.doctor_id === filters.doctor_id || a.doctors?.profile_id === filters.doctor_id);
  }
  if (filters.status) {
    results = results.filter(a => a.status === filters.status);
  }
  if (filters.date) {
    results = results.filter(a => a.appointment_date === filters.date);
  }
  if (filters.priority) {
    results = results.filter(a => a.priority === filters.priority);
  }

  return results;
}

let bookingMutex = Promise.resolve();

export async function createAppointment(data, userProfile = null) {
  // Transactional Mutex Lock for atomic slot verification & creation
  let release;
  const lockPromise = new Promise(resolve => { release = resolve; });
  const previousLock = bookingMutex;
  bookingMutex = previousLock.then(() => lockPromise);

  await previousLock;

  try {
    const isEmergency = data.priority === 'EMERGENCY';
    const isAdmin = userProfile?.role === 'ADMIN';
    const { isValid, errors } = validateAppointment(data, isEmergency, isAdmin);
    if (!isValid) throw new Error(errors.join(', '));

    let { patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, symptoms, priority } = data;
    priority = priority || 'NORMAL';

    // If emergency, select an available doctor in department if doctor_id not specified
    if (isEmergency && !doctor_id) {
      const deptDocs = mockData.doctors.filter(d => d.department_id === department_id && d.availability_status !== 'ON_LEAVE');
      if (deptDocs.length > 0) {
        doctor_id = deptDocs[0].id;
      } else {
        const anyDoc = mockData.doctors.find(d => d.availability_status !== 'ON_LEAVE');
        if (anyDoc) doctor_id = anyDoc.id;
        else throw new Error('No doctor currently available for emergency booking');
      }
    }

    // Doctor availability check
    const targetDoctor = mockData.doctors.find(d => d.id === doctor_id);
    if (targetDoctor && targetDoctor.availability_status === 'ON_LEAVE') {
      throw new Error('Selected doctor is currently ON LEAVE. Please select another doctor or department.');
    }

    // Strict Double Booking & Slot Lock check
    const existingSlot = mockData.appointments.find(
      a => a.doctor_id === doctor_id &&
           a.appointment_date === appointment_date &&
           a.appointment_time === appointment_time &&
           a.status !== 'CANCELLED'
    );

    if (existingSlot && !isEmergency) {
      throw new Error(`Time slot ${appointment_time} on ${appointment_date} is already booked for this doctor. Double booking prevented.`);
    }

    if (isSupabaseConfigured) {
      const { data: newApt, error } = await supabase
        .from('appointments')
        .insert([{
          patient_id,
          doctor_id,
          department_id: department_id || targetDoctor?.department_id,
          appointment_date,
          appointment_time,
          reason: isEmergency ? `[EMERGENCY] ${reason || 'Urgent medical attention'}` : reason,
          symptoms,
          priority,
          status: isEmergency ? 'CONFIRMED' : 'PENDING'
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Auto-create queue entry for emergency
      if (isEmergency) {
        await createEmergencyQueueEntry(newApt.id, doctor_id, patient_id);
      }

      return newApt;
    } else {
      const newApt = {
        id: `apt-${Date.now()}`,
        patient_id,
        doctor_id,
        department_id: department_id || targetDoctor?.department_id,
        appointment_date,
        appointment_time,
        reason: isEmergency ? `[EMERGENCY] ${reason || 'Urgent medical care required'}` : reason,
        symptoms,
        priority,
        status: isEmergency ? 'CONFIRMED' : 'PENDING',
        created_at: new Date().toISOString()
      };

      mockData.appointments.unshift(newApt);

      // Create queue entry if emergency
      if (isEmergency) {
        await createEmergencyQueueEntry(newApt.id, doctor_id, patient_id);
      }

      // Send notifications
      const patientObj = mockData.patients.find(p => p.id === patient_id);
      if (patientObj) {
        await addNotification({
          user_id: patientObj.profile_id,
          title: isEmergency ? '🚨 Emergency Appointment Confirmed' : 'Appointment Booked',
          message: isEmergency
            ? `Emergency appointment booked for ${appointment_date} at ${appointment_time}. Added with HIGH PRIORITY.`
            : `Appointment booked for ${appointment_date} at ${appointment_time}. Status: PENDING.`,
          type: isEmergency ? 'ALERT' : 'INFO'
        });
      }

      await createAuditLog({
        action: isEmergency ? 'BOOK_EMERGENCY_APPOINTMENT' : 'BOOK_APPOINTMENT',
        performed_by: userProfile?.id || patient_id,
        target_id: newApt.id,
        details: { doctor_id, appointment_date, appointment_time, priority }
      });

      return newApt;
    }
  } finally {
    release();
  }
}

async function createEmergencyQueueEntry(appointmentId, doctorId, patientId) {
  const docQueues = mockData.queues.filter(q => q.doctor_id === doctorId);
  const nextNum = docQueues.length + 1;

  const newQ = {
    id: `que-${Date.now()}`,
    appointment_id: appointmentId,
    doctor_id: doctorId,
    patient_id: patientId,
    queue_number: nextNum,
    priority: 'EMERGENCY',
    status: 'ARRIVED',
    joined_at: new Date().toISOString(),
    arrived_at: new Date().toISOString()
  };

  mockData.queues.unshift(newQ);
  return newQ;
}

export async function rescheduleAppointment(
  appointmentId,
  newDate,
  newTime,
  newDoctorId = null,
  userProfile = null
) {
  let apt;

  // =========================
  // GET APPOINTMENT
  // =========================
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(*, profiles(*)),
        doctors(*, profiles(*), departments(*)),
        departments(*)
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !data) {
      throw new Error('Appointment not found');
    }

    apt = data;
  } else {
    apt = mockData.appointments.find(
      a => a.id === appointmentId
    );

    if (!apt) {
      throw new Error('Appointment not found');
    }
  }

  // =========================
  // STATUS CHECK
  // =========================
  if (['COMPLETED', 'CANCELLED'].includes(apt.status)) {
    throw new Error(
      `Cannot reschedule an appointment with status '${apt.status}'.`
    );
  }

  // =========================
  // TARGET DOCTOR
  // =========================
  const targetDocId = newDoctorId || apt.doctor_id;

  let targetDoc;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles(*),
        departments(*)
      `)
      .eq('id', targetDocId)
      .single();

    if (error || !data) {
      throw new Error('Doctor not found');
    }

    targetDoc = data;
  } else {
    targetDoc = mockData.doctors.find(
      d => d.id === targetDocId
    );
  }

  if (!targetDoc) {
    throw new Error('Doctor not found');
  }

  if (targetDoc.availability_status === 'ON_LEAVE') {
    throw new Error(
      'Selected doctor is currently ON LEAVE.'
    );
  }

  // =========================
  // DOUBLE BOOKING CHECK
  // =========================
  let doubleBooked;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', targetDocId)
      .eq('appointment_date', newDate)
      .eq('appointment_time', newTime)
      .neq('id', appointmentId)
      .neq('status', 'CANCELLED')
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    doubleBooked = data?.length > 0;
  } else {
    doubleBooked = mockData.appointments.some(a =>
      a.id !== appointmentId &&
      a.doctor_id === targetDocId &&
      a.appointment_date === newDate &&
      a.appointment_time === newTime &&
      a.status !== 'CANCELLED'
    );
  }

  if (doubleBooked) {
    throw new Error(
      'The requested time slot is already taken for this doctor. Please choose another slot.'
    );
  }

  // =========================
  // CALCULATE FEE
  // =========================
  const feeCalc = calculateFeeAndRefund(
    apt.appointment_date,
    apt.appointment_time,
    Number(targetDoc.consultation_fee) || 100
  );

  const oldDate = apt.appointment_date;
  const oldTime = apt.appointment_time;

  const updateData = {
    original_appointment_id:
      apt.original_appointment_id || apt.id,

    appointment_date: newDate,
    appointment_time: newTime,
    doctor_id: targetDocId,
    department_id:
      targetDoc.department_id || apt.department_id,

    reschedule_count:
      (apt.reschedule_count || 0) + 1,

    status: 'CONFIRMED',
    updated_at: new Date().toISOString()
  };

  // =========================
  // UPDATE SUPABASE
  // =========================
  if (isSupabaseConfigured) {
    const { data: updatedAppointment, error } =
      await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select(`
          *,
          patients(*, profiles(*)),
          doctors(*, profiles(*), departments(*)),
          departments(*)
        `)
        .single();

    if (error) {
      throw new Error(error.message);
    }

    apt = updatedAppointment;
  } else {
    Object.assign(apt, updateData);
  }

  // =========================
  // REFUND / FEE RECORD
  // =========================
  if (feeCalc.feeAmount > 0) {
    await createRefundRecord({
      appointment_id: appointmentId,
      patient_id: apt.patient_id,
      original_amount:
        Number(targetDoc.consultation_fee) || 100,
      refund_amount: feeCalc.refundAmount,
      fee_amount: feeCalc.feeAmount,
      reason:
        `Rescheduling Fee (${feeCalc.feePercentage}% penalty ` +
        `for ${feeCalc.hoursRemaining}h notice)`
    });
  }

  // =========================
  // AUDIT LOG
  // =========================
  await createAuditLog({
    action: 'RESCHEDULE_APPOINTMENT',
    performed_by: userProfile?.id || 'STAFF',
    target_id: appointmentId,
    details: {
      oldDate,
      oldTime,
      newDate,
      newTime,
      newDoctorId: targetDocId,
      feeCalc
    }
  });

  // =========================
  // NOTIFICATION
  // =========================
  const patientProfileId =
    apt?.patients?.profile_id ||
    apt?.patients?.profiles?.id;

  if (patientProfileId) {
    await addNotification({
      user_id: patientProfileId,
      title: 'Appointment Rescheduled Successfully',
      message:
        `Your appointment has been moved to ${newDate} ` +
        `at ${newTime}. Processing Fee: ₹${feeCalc.feeAmount}.`,
      type: 'SUCCESS'
    });
  }

  return {
    appointment: apt,
    feeCalculation: feeCalc
  };
}

export async function cancelAppointment(appointmentId, reason = 'Patient Request', cancelledByRole = 'PATIENT', userProfile = null) {
  const apt = mockData.appointments.find(a => a.id === appointmentId);
  if (!apt) throw new Error('Appointment not found');

  if (apt.status === 'CANCELLED') {
    throw new Error('Appointment is already cancelled');
  }
  if (apt.status === 'COMPLETED') {
    throw new Error('Cannot cancel a completed appointment');
  }

  const doctorObj = mockData.doctors.find(d => d.id === apt.doctor_id);
  const isHospitalCancel = ['ADMIN', 'DOCTOR', 'RECEPTIONIST'].includes(cancelledByRole) || doctorObj?.availability_status === 'ON_LEAVE';

  const feeCalc = calculateFeeAndRefund(
    apt.appointment_date,
    apt.appointment_time,
    doctorObj?.consultation_fee || 100,
    isHospitalCancel
  );

  apt.status = 'CANCELLED';
  apt.cancellation_reason = reason;
  apt.cancelled_at = new Date().toISOString();

  // Cancel associated queue slot if present
  const queueEntry = mockData.queues.find(q => q.appointment_id === appointmentId);
  if (queueEntry) {
    queueEntry.status = 'CANCELLED';
  }

  await createRefundRecord({
    appointment_id: appointmentId,
    patient_id: apt.patient_id,
    original_amount: doctorObj?.consultation_fee || 100,
    refund_amount: feeCalc.refundAmount,
    fee_amount: feeCalc.feeAmount,
    reason: isHospitalCancel ? '100% Full Refund due to Hospital/Doctor Cancellation' : `Cancellation Refund (${feeCalc.refundPercentage}%)`
  });

  await createAuditLog({
    action: 'CANCEL_APPOINTMENT',
    performed_by: userProfile?.id || cancelledByRole,
    target_id: appointmentId,
    details: { reason, feeCalc, cancelledByRole }
  });

  const patientObj = mockData.patients.find(p => p.id === apt.patient_id);
  if (patientObj) {
    await addNotification({
      user_id: patientObj.profile_id,
      title: 'Appointment Cancelled',
      message: `Your appointment on ${apt.appointment_date} was cancelled. Refund of $${feeCalc.refundAmount} has been initiated.`,
      type: 'WARNING'
    });
  }

  return { appointment: apt, feeCalculation: feeCalc };
}

export async function markNoShow(appointmentId, userProfile = null) {
  const apt = mockData.appointments.find(a => a.id === appointmentId);
  if (!apt) throw new Error('Appointment not found');

  const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
  const now = new Date();

  // Prevent marking NO_SHOW before appointment time
  if (now < aptDateTime) {
    throw new Error('Cannot mark NO_SHOW before the scheduled appointment date and time.');
  }

  apt.status = 'NO_SHOW';
  apt.no_show_at = now.toISOString();

  const queueEntry = mockData.queues.find(q => q.appointment_id === appointmentId);
  if (queueEntry) {
    queueEntry.status = 'CANCELLED';
  }

  await createAuditLog({
    action: 'MARK_NO_SHOW',
    performed_by: userProfile?.id || 'STAFF',
    target_id: appointmentId,
    details: { appointment_date: apt.appointment_date, appointment_time: apt.appointment_time }
  });

  return apt;
}

export async function scheduleFollowUp(
  originalAptId,
  followUpData,
  doctorProfile = null
) {
  const {
    follow_up_date,
    follow_up_time,
    reason,
    notes
  } = followUpData;

  if (!follow_up_date) {
    throw new Error('follow_up_date is required');
  }

  let originalApt;

  // ============================================================
  // SUPABASE
  // ============================================================

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', originalAptId)
      .single();

    if (error || !data) {
      console.error(
        '[AppointmentService] Original appointment lookup failed:',
        error?.message
      );

      throw new Error('Original appointment not found');
    }

    originalApt = data;

    // Create follow-up appointment in Supabase
    const { data: newFollowUpApt, error: insertError } =
      await supabase
        .from('appointments')
        .insert([{
          patient_id: originalApt.patient_id,
          doctor_id: originalApt.doctor_id,
          department_id: originalApt.department_id,
          appointment_date: follow_up_date,
          appointment_time: follow_up_time || '10:00:00',
          reason: `[FOLLOW-UP] ${
            reason || 'Post-consultation evaluation'
          }`,
          symptoms:
            notes || 'Scheduled by doctor after previous visit',
          priority: 'NORMAL',
          status: 'CONFIRMED',
          original_appointment_id: originalAptId
        }])
        .select()
        .single();

    if (insertError) {
      throw new Error(
        `Failed to create follow-up appointment: ${insertError.message}`
      );
    }

    // Notify patient
    await addNotification({
      user_id: originalApt.patient_id,
      title: 'Follow-Up Appointment Scheduled',
      message:
        `Your follow-up appointment has been scheduled for ` +
        `${follow_up_date} at ${follow_up_time || '10:00:00'}.`,
      type: 'INFO'
    });

    await createAuditLog({
      action: 'SCHEDULE_FOLLOW_UP',
      performed_by: doctorProfile?.id || 'DOCTOR',
      target_id: newFollowUpApt.id,
      details: {
        originalAptId,
        follow_up_date,
        follow_up_time
      }
    });

    return newFollowUpApt;
  }

  // ============================================================
  // MOCK DATA
  // ============================================================

  originalApt = mockData.appointments.find(
    a => a.id === originalAptId
  );

  if (!originalApt) {
    throw new Error('Original appointment not found');
  }

  const newFollowUpApt = {
    id: `apt-followup-${Date.now()}`,
    patient_id: originalApt.patient_id,
    doctor_id: originalApt.doctor_id,
    department_id: originalApt.department_id,
    appointment_date: follow_up_date,
    appointment_time: follow_up_time || '10:00:00',
    reason:
      `[FOLLOW-UP] ${
        reason || 'Post-consultation evaluation'
      }`,
    symptoms:
      notes || 'Scheduled by doctor after previous visit',
    priority: 'NORMAL',
    status: 'CONFIRMED',
    original_appointment_id: originalAptId,
    created_at: new Date().toISOString()
  };

  mockData.appointments.unshift(newFollowUpApt);

  const patientObj = mockData.patients.find(
    p => p.id === originalApt.patient_id
  );

  if (patientObj) {
    await addNotification({
      user_id: patientObj.profile_id,
      title: 'Follow-Up Appointment Scheduled',
      message:
        `Your follow-up appointment has been scheduled for ` +
        `${follow_up_date} at ${follow_up_time || '10:00:00'}.`,
      type: 'INFO'
    });
  }

  await createAuditLog({
    action: 'SCHEDULE_FOLLOW_UP',
    performed_by: doctorProfile?.id || 'DOCTOR',
    target_id: newFollowUpApt.id,
    details: {
      originalAptId,
      follow_up_date
    }
  });

  return newFollowUpApt;
}

export async function reassignDoctor(appointmentId, newDoctorId, userProfile = null) {
  const apt = mockData.appointments.find(a => a.id === appointmentId);
  if (!apt) throw new Error('Appointment not found');

  const newDoctor = mockData.doctors.find(d => d.id === newDoctorId);
  if (!newDoctor) throw new Error('Target doctor not found');

  if (newDoctor.availability_status === 'ON_LEAVE') {
    throw new Error('Target doctor is currently ON LEAVE');
  }

  apt.doctor_id = newDoctorId;
  apt.department_id = newDoctor.department_id;
  apt.updated_at = new Date().toISOString();

  await createAuditLog({
    action: 'REASSIGN_DOCTOR',
    performed_by: userProfile?.id || 'ADMIN',
    target_id: appointmentId,
    details: { newDoctorId, newDoctorName: newDoctor.profiles?.name }
  });

  const patientObj = mockData.patients.find(p => p.id === apt.patient_id);
  if (patientObj) {
    await addNotification({
      user_id: patientObj.profile_id,
      title: 'Doctor Reassigned for Your Appointment',
      message: `Your appointment on ${apt.appointment_date} has been reassigned to ${newDoctor.profiles?.name || 'Dr. Specialist'}.`,
      type: 'INFO'
    });
  }

  return apt;
}

export async function updateAppointment(id, updateData) {
  if (isSupabaseConfigured) {
    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  } else {
    const apt = mockData.appointments.find(a => a.id === id);
    if (!apt) throw new Error('Appointment not found');
    Object.assign(apt, updateData, { updated_at: new Date().toISOString() });
    return apt;
  }
}
