import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';

/* =========================================================
   CONSTANTS
========================================================= */

export const QUEUE_STATUS = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const PRIORITY = {
  EMERGENCY: 'EMERGENCY',
  URGENT: 'URGENT',
  NORMAL: 'NORMAL'
};

const PRIORITY_SCORE = {
  EMERGENCY: 3,
  URGENT: 2,
  NORMAL: 1
};

export const DEPARTMENT_AVG_MINUTES = {
  Cardiology: 20,
  Dermatology: 12,
  Neurology: 25,
  Pediatrics: 15,
  'General Medicine': 15,
  default: 15
};


/* =========================================================
   HELPERS
========================================================= */

function getPriorityScore(priority) {
  return PRIORITY_SCORE[priority] || PRIORITY_SCORE.NORMAL;
}

function getQueuePriority(queue) {
  return (
    queue.priority ||
    queue.appointments?.priority ||
    PRIORITY.NORMAL
  );
}

/**
 * Strict queue ordering:
 *
 * 1. EMERGENCY
 * 2. URGENT
 * 3. NORMAL
 *
 * Within the same priority:
 * earliest check-in first
 *
 * If check-in time doesn't exist:
 * joined_at
 *
 * Final fallback:
 * queue number
 */
function sortQueueEntries(queue) {
  return [...queue].sort((a, b) => {
    const priorityA = getPriorityScore(getQueuePriority(a));
    const priorityB = getPriorityScore(getQueuePriority(b));

    // Higher priority first
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    const timeA = new Date(
      a.checked_in_at ||
      a.joined_at ||
      0
    ).getTime();

    const timeB = new Date(
      b.checked_in_at ||
      b.joined_at ||
      0
    ).getTime();

    // Earlier check-in first
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // Final fallback
    return (a.queue_number || 0) - (b.queue_number || 0);
  });
}


/* =========================================================
   GET QUEUE
========================================================= */

export async function getQueue(doctorId = null, date = null) {

  if (isSupabaseConfigured) {

    let query = supabase
      .from('queues')
      .select(`
        *,
        appointments(
          *,
          departments(*)
        ),
        patients(
          *,
          profiles(*)
        ),
        doctors(
          *,
          profiles(*),
          departments(*)
        )
      `);

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    let results = data || [];

    // Optional date filtering
    if (date) {
      results = results.filter(queue => {
        const joinedDate = queue.joined_at
          ? new Date(queue.joined_at)
              .toISOString()
              .split('T')[0]
          : null;

        return joinedDate === date;
      });
    }

    return sortQueueEntries(results);
  }


  /* ---------------- MOCK DATA ---------------- */

  let results = mockData.queues.map(queue => {

    const appointment = mockData.appointments.find(
      appointment =>
        appointment.id === queue.appointment_id
    );

    const patient = mockData.patients.find(
      patient =>
        patient.id === queue.patient_id
    );

    const patientProfile = patient
      ? mockData.profiles.find(
          profile =>
            profile.id === patient.profile_id
        )
      : null;

    const doctor = mockData.doctors.find(
      doctor =>
        doctor.id === queue.doctor_id
    );

    const doctorProfile = doctor
      ? mockData.profiles.find(
          profile =>
            profile.id === doctor.profile_id
        )
      : null;

    const department = mockData.departments.find(
      department =>
        department.id === (
          appointment?.department_id ||
          doctor?.department_id
        )
    );

    return {
      ...queue,

      appointments: appointment
        ? {
            ...appointment,
            departments: department
          }
        : null,

      patients: patient
        ? {
            ...patient,
            profiles: patientProfile
          }
        : null,

      doctors: doctor
        ? {
            ...doctor,
            profiles: doctorProfile,
            departments: department
          }
        : null,

      departments: department
    };
  });


  if (doctorId) {
    results = results.filter(
      queue =>
        queue.doctor_id === doctorId ||
        queue.doctors?.profile_id === doctorId
    );
  }


  if (date) {
    results = results.filter(queue => {
      const joinedDate = queue.joined_at
        ? new Date(queue.joined_at)
            .toISOString()
            .split('T')[0]
        : null;

      return joinedDate === date;
    });
  }


  return sortQueueEntries(results);
}


/* =========================================================
   GET NEXT PATIENT
========================================================= */

export async function getNextPatient(doctorId) {

  const queue = await getQueue(doctorId);

  const activePatients = queue.filter(
    entry =>
      entry.status === QUEUE_STATUS.WAITING
  );

  if (activePatients.length === 0) {
    return null;
  }

  // getQueue already applies strict priority ordering
  return activePatients[0];
}


/* =========================================================
   GET WAIT TIMES
========================================================= */

export async function getDepartmentWaitTimes() {

  const queues = await getQueue();

  let departments = [];

  if (isSupabaseConfigured) {

    const { data, error } = await supabase
      .from('departments')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    departments = data || [];

  } else {
    departments = mockData.departments || [];
  }


  return departments.map(department => {

    const avgMinutes =
      DEPARTMENT_AVG_MINUTES[department.name] ||
      DEPARTMENT_AVG_MINUTES.default;


    const departmentQueues = queues.filter(queue => {

      const departmentId =
        queue.departments?.id ||
        queue.doctors?.department_id ||
        queue.appointments?.department_id;

      const departmentName =
        queue.departments?.name ||
        queue.doctors?.departments?.name;

      return (
        departmentId === department.id ||
        departmentName === department.name
      );
    });


    const activeQueues = departmentQueues.filter(
      queue =>
        [
          QUEUE_STATUS.WAITING,
          QUEUE_STATUS.CALLED,
          QUEUE_STATUS.IN_PROGRESS
        ].includes(queue.status)
    );


    const waitingCount = departmentQueues.filter(
      queue =>
        queue.status === QUEUE_STATUS.WAITING
    ).length;


    const estimatedWait =
      waitingCount * avgMinutes;


    let queueLoad = 'LIGHT';

    if (estimatedWait > 35) {
      queueLoad = 'HEAVY';
    } else if (estimatedWait > 15) {
      queueLoad = 'MODERATE';
    }


    return {
      id: department.id,
      name: department.name,

      avg_processing_time_mins:
        avgMinutes,

      active_queue_count:
        activeQueues.length,

      waiting_count:
        waitingCount,

      estimated_wait_mins:
        estimatedWait,

      queue_load:
        queueLoad
    };
  });
}


/* =========================================================
   JOIN QUEUE
========================================================= */

export async function joinQueue(appointmentId) {

  const now = new Date().toISOString();


  /* ---------------- SUPABASE ---------------- */

  if (isSupabaseConfigured) {

    const {
      data: appointment,
      error: appointmentError
    } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();


    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }


    if (
      appointment.status === 'CANCELLED' ||
      appointment.status === 'COMPLETED'
    ) {
      throw new Error(
        'This appointment cannot join the queue'
      );
    }


    // Prevent duplicate queue entry
    const {
      data: existing
    } = await supabase
      .from('queues')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();


    if (existing) {
      return existing;
    }


    // Get highest queue number for this doctor
    const {
      data: latestQueue,
      error: latestError
    } = await supabase
      .from('queues')
      .select('queue_number')
      .eq('doctor_id', appointment.doctor_id)
      .order('queue_number', {
        ascending: false
      })
      .limit(1)
      .maybeSingle();


    if (latestError) {
      throw new Error(latestError.message);
    }


    const nextQueueNumber =
      latestQueue?.queue_number
        ? latestQueue.queue_number + 1
        : 1;


    const priority =
      appointment.priority || PRIORITY.NORMAL;


    const {
      data: newQueue,
      error: queueError
    } = await supabase
      .from('queues')
      .insert([{
        appointment_id: appointmentId,
        doctor_id: appointment.doctor_id,
        patient_id: appointment.patient_id,

        queue_number:
          nextQueueNumber,

        priority,

        status:
          QUEUE_STATUS.WAITING,

        joined_at:
          now,

        checked_in_at:
          now
      }])
      .select()
      .single();


    if (queueError) {
      throw new Error(queueError.message);
    }


    // Confirm appointment
    if (appointment.status === 'PENDING') {

      await supabase
        .from('appointments')
        .update({
          status: 'CONFIRMED'
        })
        .eq('id', appointmentId);
    }


    return newQueue;
  }


  /* ---------------- MOCK DATA ---------------- */

  const appointment =
    mockData.appointments.find(
      appointment =>
        appointment.id === appointmentId
    );


  if (!appointment) {
    throw new Error('Appointment not found');
  }


  const existing =
    mockData.queues.find(
      queue =>
        queue.appointment_id === appointmentId
    );


  if (existing) {
    return existing;
  }


  const doctorQueues =
    mockData.queues.filter(
      queue =>
        queue.doctor_id === appointment.doctor_id
    );


  const nextQueueNumber =
    doctorQueues.length + 1;


  const newQueue = {

    id:
      `que-${Date.now()}`,

    appointment_id:
      appointmentId,

    doctor_id:
      appointment.doctor_id,

    patient_id:
      appointment.patient_id,

    queue_number:
      nextQueueNumber,

    priority:
      appointment.priority ||
      PRIORITY.NORMAL,

    status:
      QUEUE_STATUS.WAITING,

    joined_at:
      now,

    checked_in_at:
      now,

    started_at:
      null,

    called_at:
      null,

    completed_at:
      null,

    skipped_at:
      null,

    no_show_at:
      null
  };


  mockData.queues.push(newQueue);


  if (appointment.status === 'PENDING') {
    appointment.status = 'CONFIRMED';
  }


  return newQueue;
}


/* =========================================================
   CALL NEXT PATIENT
========================================================= */

export async function callNextPatient(doctorId) {
  if (!doctorId) {
    throw new Error('doctorId is required');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.rpc(
      'claim_next_queue_patient',
      {
        p_doctor_id: doctorId
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('No waiting patients in the queue');
    }

    return data[0];
  }

  // Mock mode
  const nextPatient = await getNextPatient(doctorId);

  if (!nextPatient) {
    throw new Error('No waiting patients in the queue');
  }

  return updateQueueStatus(
    nextPatient.id,
    QUEUE_STATUS.CALLED
  );
}


/* =========================================================
   UPDATE QUEUE STATUS
========================================================= */

export async function updateQueueStatus(
  queueId,
  status
) {

  const validStatuses = Object.values(
    QUEUE_STATUS
  );


  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid queue status: ${status}`
    );
  }


  const now =
    new Date().toISOString();


  const updateData = {
    status
  };


  /* ---------------- TIMESTAMPS ---------------- */

  if (status === QUEUE_STATUS.CALLED) {

    updateData.called_at = now;
  }


  if (status === QUEUE_STATUS.IN_PROGRESS) {

    updateData.started_at = now;

    // If consultation starts without explicit CALL
    updateData.called_at = now;
  }


  if (status === QUEUE_STATUS.COMPLETED) {

    updateData.completed_at = now;
  }


  if (status === QUEUE_STATUS.CANCELLED) {

    updateData.completed_at = null;
  }


  /* ---------------- SUPABASE ---------------- */

  if (isSupabaseConfigured) {

    const {
      data: currentQueue,
      error: fetchError
    } = await supabase
      .from('queues')
      .select('*')
      .eq('id', queueId)
      .single();


    if (fetchError || !currentQueue) {
      throw new Error(
        'Queue entry not found'
      );
    }


    // Prevent invalid transitions
    if (
      currentQueue.status ===
        QUEUE_STATUS.COMPLETED &&
      status !== QUEUE_STATUS.COMPLETED
    ) {
      throw new Error(
        'Completed queue entries cannot be changed'
      );
    }


    const {
      data: updated,
      error
    } = await supabase
      .from('queues')
      .update(updateData)
      .eq('id', queueId)
      .select()
      .single();


    if (error) {
      throw new Error(error.message);
    }


    // Appointment lifecycle update
    if (
      status === QUEUE_STATUS.COMPLETED &&
      updated?.appointment_id
    ) {

      await supabase
        .from('appointments')
        .update({
          status: 'COMPLETED'
        })
        .eq(
          'id',
          updated.appointment_id
        );
    }


    return updated;
  }


  /* ---------------- MOCK DATA ---------------- */

  const queue =
    mockData.queues.find(
      queue =>
        queue.id === queueId
    );


  if (!queue) {
    throw new Error(
      'Queue entry not found'
    );
  }


  if (
    queue.status === QUEUE_STATUS.COMPLETED &&
    status !== QUEUE_STATUS.COMPLETED
  ) {
    throw new Error(
      'Completed queue entries cannot be changed'
    );
  }


  Object.assign(
    queue,
    updateData
  );


  if (
    status === QUEUE_STATUS.COMPLETED
  ) {

    const appointment =
      mockData.appointments.find(
        appointment =>
          appointment.id ===
          queue.appointment_id
      );


    if (appointment) {
      appointment.status =
        'COMPLETED';
    }
  }


  return queue;
}


/* =========================================================
   START CONSULTATION
========================================================= */

export async function startConsultation(
  queueId
) {

  return updateQueueStatus(
    queueId,
    QUEUE_STATUS.IN_PROGRESS
  );
}


/* =========================================================
   COMPLETE VISIT
========================================================= */

export async function completeVisit(
  queueId
) {

  return updateQueueStatus(
    queueId,
    QUEUE_STATUS.COMPLETED
  );
}


/* =========================================================
   SKIP PATIENT
========================================================= */

export async function skipPatient(
  queueId
) {

  const now =
    new Date().toISOString();


  if (isSupabaseConfigured) {

    const {
      data,
      error
    } = await supabase
      .from('queues')
      .update({
        status: QUEUE_STATUS.CANCELLED,
        skipped_at: now
      })
      .eq('id', queueId)
      .eq('status', QUEUE_STATUS.WAITING)
      .select()
      .single();


    if (error) {
      throw new Error(error.message);
    }


    return data;
  }


  const queue =
    mockData.queues.find(
      queue =>
        queue.id === queueId
    );


  if (!queue) {
    throw new Error(
      'Queue entry not found'
    );
  }


  queue.status =
    QUEUE_STATUS.CANCELLED;

  queue.skipped_at =
    now;


  return queue;
}


/* =========================================================
   MARK NO-SHOW
========================================================= */

export async function markNoShow(
  queueId
) {

  const now =
    new Date().toISOString();


  if (isSupabaseConfigured) {

    const {
      data,
      error
    } = await supabase
      .from('queues')
      .update({
        status: QUEUE_STATUS.CANCELLED,
        no_show_at: now
      })
      .eq('id', queueId)
      .in('status', [
        QUEUE_STATUS.WAITING,
        QUEUE_STATUS.CALLED
      ])
      .select()
      .single();


    if (error) {
      throw new Error(error.message);
    }


    return data;
  }


  const queue =
    mockData.queues.find(
      queue =>
        queue.id === queueId
    );


  if (!queue) {
    throw new Error(
      'Queue entry not found'
    );
  }


  queue.status =
    QUEUE_STATUS.CANCELLED;

  queue.no_show_at =
    now;


  return queue;
}


/* =========================================================
   QR CHECK-IN
========================================================= */

export async function checkInViaQR({
  appointment_id,
  patient_id,
  desk_token
}) {

  const now =
    new Date().toISOString();


  let appointmentId =
    appointment_id;


  /* ---------------------------------------------
     Find today's appointment by patient
  --------------------------------------------- */

  if (!appointmentId && patient_id) {

    const today =
      new Date()
        .toISOString()
        .split('T')[0];


    if (isSupabaseConfigured) {

      const {
        data,
        error
      } = await supabase
        .from('appointments')
        .select('*')
        .eq(
          'patient_id',
          patient_id
        )
        .eq(
          'appointment_date',
          today
        )
        .not(
          'status',
          'eq',
          'CANCELLED'
        )
        .order(
          'appointment_time',
          {
            ascending: true
          }
        )
        .limit(1);


      if (error) {
        throw new Error(
          error.message
        );
      }


      if (data?.length) {
        appointmentId =
          data[0].id;
      }

    } else {

      const patient =
        mockData.patients.find(
          patient =>
            patient.id === patient_id ||
            patient.profile_id === patient_id
        );


      const actualPatientId =
        patient?.id || patient_id;


      const appointment =
        mockData.appointments.find(
          appointment =>
            appointment.patient_id ===
              actualPatientId &&
            appointment.status !==
              'CANCELLED'
        );


      if (appointment) {
        appointmentId =
          appointment.id;
      }
    }
  }


  if (!appointmentId) {

    throw new Error(
      'No active appointment found for check-in'
    );
  }


  /* =====================================================
     SUPABASE CHECK-IN
  ===================================================== */

  if (isSupabaseConfigured) {

    const {
      data: appointment,
      error: appointmentError
    } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();


    if (
      appointmentError ||
      !appointment
    ) {
      throw new Error(
        'Appointment not found'
      );
    }


    if (
      appointment.status ===
        'CANCELLED' ||
      appointment.status ===
        'COMPLETED'
    ) {
      throw new Error(
        'Appointment is not eligible for check-in'
      );
    }


    /* ---------------------------------------------
       Check existing queue
    --------------------------------------------- */

    const {
      data: existingQueue
    } = await supabase
      .from('queues')
      .select('*')
      .eq(
        'appointment_id',
        appointmentId
      )
      .maybeSingle();


    if (existingQueue) {

      // Replay prevention
      if (
        existingQueue.checked_in_at
      ) {

        return {
          queue: existingQueue,
          appointment,
          status:
            existingQueue.status,
          already_checked_in: true,
          checked_in_at:
            existingQueue.checked_in_at
        };
      }


      const {
        data: updatedQueue,
        error
      } = await supabase
        .from('queues')
        .update({
          status:
            QUEUE_STATUS.WAITING,
          checked_in_at:
            now
        })
        .eq(
          'id',
          existingQueue.id
        )
        .select()
        .single();


      if (error) {
        throw new Error(
          error.message
        );
      }


      return {
        queue: updatedQueue,
        appointment,
        status:
          QUEUE_STATUS.WAITING,
        checked_in_at: now
      };
    }


    /* ---------------------------------------------
       Create queue entry
    --------------------------------------------- */

    const {
      data: latestQueue
    } = await supabase
      .from('queues')
      .select('queue_number')
      .eq(
        'doctor_id',
        appointment.doctor_id
      )
      .order(
        'queue_number',
        {
          ascending: false
        }
      )
      .limit(1)
      .maybeSingle();


    const nextQueueNumber =
      latestQueue?.queue_number
        ? latestQueue.queue_number + 1
        : 1;


    const {
      data: newQueue,
      error: queueError
    } = await supabase
      .from('queues')
      .insert([{
        appointment_id:
          appointmentId,

        doctor_id:
          appointment.doctor_id,

        patient_id:
          appointment.patient_id,

        queue_number:
          nextQueueNumber,

        priority:
          appointment.priority ||
          PRIORITY.NORMAL,

        status:
          QUEUE_STATUS.WAITING,

        joined_at:
          now,

        checked_in_at:
          now
      }])
      .select()
      .single();


    if (queueError) {
      throw new Error(
        queueError.message
      );
    }


    /* ---------------------------------------------
       Update appointment
    --------------------------------------------- */

    await supabase
      .from('appointments')
      .update({
        status: 'CONFIRMED'
      })
      .eq(
        'id',
        appointmentId
      );


    return {
      queue: newQueue,
      appointment,
      status:
        QUEUE_STATUS.WAITING,
      checked_in_at: now
    };
  }


  /* =====================================================
     MOCK CHECK-IN
  ===================================================== */

  const appointment =
    mockData.appointments.find(
      appointment =>
        appointment.id ===
        appointmentId
    );


  if (!appointment) {
    throw new Error(
      'Appointment not found'
    );
  }


  appointment.status =
    'CONFIRMED';


  let queue =
    mockData.queues.find(
      queue =>
        queue.appointment_id ===
        appointmentId
    );


  /* Replay prevention */

  if (queue?.checked_in_at) {

    return {
      queue,
      appointment,
      status:
        queue.status,
      already_checked_in: true,
      checked_in_at:
        queue.checked_in_at
    };
  }


  /* Existing queue */

  if (queue) {

    queue.status =
      QUEUE_STATUS.WAITING;

    queue.checked_in_at =
      now;

  } else {

    const doctorQueues =
      mockData.queues.filter(
        queue =>
          queue.doctor_id ===
          appointment.doctor_id
      );


    const nextQueueNumber =
      doctorQueues.length + 1;


    queue = {

      id:
        `que-${Date.now()}`,

      appointment_id:
        appointmentId,

      doctor_id:
        appointment.doctor_id,

      patient_id:
        appointment.patient_id,

      queue_number:
        nextQueueNumber,

      priority:
        appointment.priority ||
        PRIORITY.NORMAL,

      status:
        QUEUE_STATUS.WAITING,

      joined_at:
        now,

      checked_in_at:
        now,

      called_at:
        null,

      started_at:
        null,

      completed_at:
        null,

      skipped_at:
        null,

      no_show_at:
        null
    };


    mockData.queues.push(queue);
  }


  return {
    queue,
    appointment,
    status:
      QUEUE_STATUS.WAITING,
    checked_in_at:
      now
  };
}


/* =========================================================
   ESTIMATED WAIT FOR ONE PATIENT
========================================================= */

export async function getEstimatedWaitTime(
  queueId
) {

  const queue =
    await getQueue();


  const target =
    queue.find(
      entry =>
        entry.id === queueId
    );


  if (!target) {
    throw new Error(
      'Queue entry not found'
    );
  }


  const priority =
    getQueuePriority(target);


  const score =
    getPriorityScore(priority);


  const patientsAhead =
    queue.filter(entry => {

      if (
        entry.doctor_id !==
        target.doctor_id
      ) {
        return false;
      }


      if (
        entry.status !==
        QUEUE_STATUS.WAITING
      ) {
        return false;
      }


      const entryScore =
        getPriorityScore(
          getQueuePriority(entry)
        );


      if (entryScore > score) {
        return true;
      }


      if (entryScore < score) {
        return false;
      }


      const entryTime =
        new Date(
          entry.checked_in_at ||
          entry.joined_at ||
          0
        ).getTime();


      const targetTime =
        new Date(
          target.checked_in_at ||
          target.joined_at ||
          0
        ).getTime();


      return entryTime < targetTime;
    });


  const avgMinutes =
    DEPARTMENT_AVG_MINUTES[
      target.departments?.name ||
      target.doctors?.departments?.name
    ] ||
    DEPARTMENT_AVG_MINUTES.default;


  return {
    queue_id:
      queueId,

    patients_ahead:
      patientsAhead.length,

    average_processing_time_mins:
      avgMinutes,

    estimated_wait_mins:
      patientsAhead.length *
      avgMinutes
  };
}