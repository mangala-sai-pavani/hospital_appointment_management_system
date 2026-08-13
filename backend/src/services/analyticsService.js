
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';

export async function getDashboardAnalytics(role, userId) {
  const todayStr = new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured) {
    // ============================================================
    // ADMIN / RECEPTIONIST
    // ============================================================

    if (role === 'ADMIN' || role === 'RECEPTIONIST') {
      const [
        { count: totalPatients },
        { count: totalDoctors },
        { data: appointments, error: appointmentsError }
      ] = await Promise.all([
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('appointments')
          .select(`
            *,
            departments(id, name),
            doctors(
              id,
              profile_id,
              profiles(name)
            )
          `)
      ]);

      if (appointmentsError) {
        throw new Error(appointmentsError.message);
      }

      const allAppointments = appointments || [];

      const todayAppointments = allAppointments.filter(
        appointment =>
          appointment.appointment_date === todayStr
      );

      // Department-wise appointment statistics
      const departmentMap = {};

      allAppointments.forEach(appointment => {
        const departmentName =
          appointment.departments?.name ||
          appointment.doctors?.departments?.name ||
          'General Medicine';

        departmentMap[departmentName] =
          (departmentMap[departmentName] || 0) + 1;
      });

      const totalDepartmentAppointments =
        allAppointments.length;

      const departmentAnalytics = Object.entries(
        departmentMap
      )
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalDepartmentAppointments
            ? Math.round(
                (count / totalDepartmentAppointments) * 100
              )
            : 0
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalPatients: totalPatients || 0,
        totalDoctors: totalDoctors || 0,
        totalAppointments: allAppointments.length,
        todayAppointments: todayAppointments.length,

        completedAppointments: allAppointments.filter(
          appointment =>
            appointment.status === 'COMPLETED'
        ).length,

        pendingAppointments: allAppointments.filter(
          appointment =>
            appointment.status === 'PENDING'
        ).length,

        cancelledAppointments: allAppointments.filter(
          appointment =>
            appointment.status === 'CANCELLED'
        ).length,

        confirmedAppointments: allAppointments.filter(
          appointment =>
            appointment.status === 'CONFIRMED'
        ).length,

        noShowAppointments: allAppointments.filter(
          appointment =>
            appointment.status === 'NO_SHOW'
        ).length,

        departmentAnalytics
      };
    }

    // ============================================================
    // DOCTOR
    // ============================================================

    if (role === 'DOCTOR') {
      const { data: doctor, error: doctorError } =
        await supabase
          .from('doctors')
          .select('id')
          .eq('profile_id', userId)
          .single();

      if (doctorError && doctorError.code !== 'PGRST116') {
        throw new Error(doctorError.message);
      }

      const doctorId = doctor?.id || userId;

      const {
        data: appointments,
        error: appointmentsError
      } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId);

      if (appointmentsError) {
        throw new Error(appointmentsError.message);
      }

      const doctorAppointments = appointments || [];

      const todayAppointments =
        doctorAppointments.filter(
          appointment =>
            appointment.appointment_date === todayStr
        );

      const { data: queues, error: queueError } =
        await supabase
          .from('queues')
          .select('*')
          .eq('doctor_id', doctorId)
          .eq('status', 'WAITING');

      if (queueError) {
        throw new Error(queueError.message);
      }

      return {
        totalAppointments: doctorAppointments.length,

        todayAppointments:
          todayAppointments.length,

        waitingPatients:
          (queues || []).length,

        completedConsultations:
          doctorAppointments.filter(
            appointment =>
              appointment.status === 'COMPLETED'
          ).length,

        upcomingAppointments:
          doctorAppointments.filter(
            appointment =>
              appointment.appointment_date >= todayStr &&
              appointment.status !== 'CANCELLED'
          ).length
      };
    }

    // ============================================================
    // PATIENT
    // ============================================================

    const { data: patient, error: patientError } =
      await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', userId)
        .single();

    if (
      patientError &&
      patientError.code !== 'PGRST116'
    ) {
      throw new Error(patientError.message);
    }

    const patientId = patient?.id || userId;

    const {
      data: appointments,
      error: appointmentsError
    } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId);

    if (appointmentsError) {
      throw new Error(appointmentsError.message);
    }

    const patientAppointments = appointments || [];

    const upcoming =
      patientAppointments
        .filter(
          appointment =>
            appointment.appointment_date >= todayStr &&
            appointment.status !== 'CANCELLED'
        )
        .sort(
          (a, b) =>
            new Date(
              `${a.appointment_date}T${a.appointment_time}`
            ) -
            new Date(
              `${b.appointment_date}T${b.appointment_time}`
            )
        );

    return {
      totalAppointments:
        patientAppointments.length,

      upcomingAppointmentsCount:
        upcoming.length,

      nextAppointment:
        upcoming[0] || null,

      completedCount:
        patientAppointments.filter(
          appointment =>
            appointment.status === 'COMPLETED'
        ).length
    };
  }

  // ============================================================
  // MOCK DATA FALLBACK
  // ============================================================

  const appointments =
    mockData.appointments || [];

  const todayAppointments =
    appointments.filter(
      appointment =>
        appointment.appointment_date === todayStr
    );

  // ============================================================
  // MOCK ADMIN / RECEPTIONIST
  // ============================================================

  if (
    role === 'ADMIN' ||
    role === 'RECEPTIONIST'
  ) {
    const departmentMap = {};

    appointments.forEach(appointment => {
      const doctor =
        mockData.doctors.find(
          doctor =>
            doctor.id === appointment.doctor_id
        );

      const department =
        mockData.departments.find(
          department =>
            department.id ===
            (
              appointment.department_id ||
              doctor?.department_id
            )
        );

      const departmentName =
        department?.name ||
        'General Medicine';

      departmentMap[departmentName] =
        (departmentMap[departmentName] || 0) + 1;
    });

    const departmentAnalytics =
      Object.entries(departmentMap)
        .map(([name, count]) => ({
          name,
          count,
          percentage: appointments.length
            ? Math.round(
                (count / appointments.length) * 100
              )
            : 0
        }))
        .sort((a, b) => b.count - a.count);

    return {
      totalPatients:
        mockData.patients.length,

      totalDoctors:
        mockData.doctors.length,

      totalAppointments:
        appointments.length,

      todayAppointments:
        todayAppointments.length,

      completedAppointments:
        appointments.filter(
          appointment =>
            appointment.status === 'COMPLETED'
        ).length,

      pendingAppointments:
        appointments.filter(
          appointment =>
            appointment.status === 'PENDING'
        ).length,

      cancelledAppointments:
        appointments.filter(
          appointment =>
            appointment.status === 'CANCELLED'
        ).length,

      confirmedAppointments:
        appointments.filter(
          appointment =>
            appointment.status === 'CONFIRMED'
        ).length,

      noShowAppointments:
        appointments.filter(
          appointment =>
            appointment.status === 'NO_SHOW'
        ).length,

      departmentAnalytics
    };
  }

  // ============================================================
  // MOCK DOCTOR
  // ============================================================

  if (role === 'DOCTOR') {
    const doctor =
      mockData.doctors.find(
        doctor =>
          doctor.profile_id === userId ||
          doctor.id === userId
      ) || mockData.doctors[0];

    const doctorAppointments =
      appointments.filter(
        appointment =>
          appointment.doctor_id === doctor.id
      );

    return {
      totalAppointments:
        doctorAppointments.length,

      todayAppointments:
        doctorAppointments.filter(
          appointment =>
            appointment.appointment_date === todayStr
        ).length,

      waitingPatients:
        mockData.queues.filter(
          queue =>
            queue.doctor_id === doctor.id &&
            queue.status === 'WAITING'
        ).length,

      completedConsultations:
        doctorAppointments.filter(
          appointment =>
            appointment.status === 'COMPLETED'
        ).length,

      upcomingAppointments:
        doctorAppointments.filter(
          appointment =>
            appointment.appointment_date >= todayStr &&
            appointment.status !== 'CANCELLED'
        ).length
    };
  }

  // ============================================================
  // MOCK PATIENT
  // ============================================================

  const patient =
    mockData.patients.find(
      patient =>
        patient.profile_id === userId ||
        patient.id === userId
    ) || mockData.patients[0];

  const patientAppointments =
    appointments.filter(
      appointment =>
        appointment.patient_id === patient.id
    );

  const upcoming =
    patientAppointments.filter(
      appointment =>
        appointment.appointment_date >= todayStr &&
        appointment.status !== 'CANCELLED'
    );

  return {
    totalAppointments:
      patientAppointments.length,

    upcomingAppointmentsCount:
      upcoming.length,

    nextAppointment:
      upcoming[0] || null,

    completedCount:
      patientAppointments.filter(
        appointment =>
          appointment.status === 'COMPLETED'
      ).length
  };
}

