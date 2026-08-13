import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const DEFAULT_CONFIG = {
  base_fee: 50,
  per_km_fee: 5,
  assistance_fee: 25,
  service_enabled: true,
  disclaimer_text:
    'For life-threatening emergencies, contact your local emergency medical services immediately. Do not rely on this application for emergency response.'
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }
}

export class AmbulanceService {

  // =========================================================
  // CONFIG
  // =========================================================

  static async getConfig() {
    ensureSupabase();

    const { data, error } = await supabase
      .from('ambulance_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get ambulance config: ${error.message}`);
    }

    return data || DEFAULT_CONFIG;
  }

  static async updateConfig(configData, userProfile) {
    if (userProfile?.role !== 'ADMIN') {
      throw new Error(
        'Unauthorized: Only hospital administrators can modify ambulance configuration.'
      );
    }

    ensureSupabase();

    const updatedConfig = {
      base_fee: Number(configData.base_fee ?? 50),
      per_km_fee: Number(configData.per_km_fee ?? 5),
      assistance_fee: Number(configData.assistance_fee ?? 25),
      service_enabled: Boolean(configData.service_enabled ?? true),
      disclaimer_text:
        configData.disclaimer_text || DEFAULT_CONFIG.disclaimer_text,
      updated_at: new Date().toISOString(),
      updated_by: userProfile.id
    };

    const { data, error } = await supabase
      .from('ambulance_config')
      .insert(updatedConfig)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ambulance config: ${error.message}`);
    }

    return data;
  }

  // =========================================================
  // AMBULANCES
  // =========================================================

  static async getAmbulances() {
    ensureSupabase();

    const { data, error } = await supabase
      .from('ambulances')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get ambulances: ${error.message}`);
    }

    return data || [];
  }

  static async createAmbulance(vehicleData, userProfile) {
    if (userProfile?.role !== 'ADMIN') {
      throw new Error(
        'Unauthorized: Only administrators can add ambulance vehicles.'
      );
    }

    ensureSupabase();

    const config = await this.getConfig();

    const ambulance = {
      vehicle_number: vehicleData.vehicle_number,
      ambulance_type: vehicleData.ambulance_type || 'BASIC',
      status: vehicleData.status || 'AVAILABLE',
      base_fee: Number(vehicleData.base_fee ?? config.base_fee),
      per_km_fee: Number(vehicleData.per_km_fee ?? config.per_km_fee),
      assistance_fee: Number(
        vehicleData.assistance_fee ?? config.assistance_fee
      ),
      driver_name: vehicleData.driver_name || null,
      contact_number: vehicleData.contact_number || null
    };

    const { data, error } = await supabase
      .from('ambulances')
      .insert(ambulance)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ambulance: ${error.message}`);
    }

    return data;
  }

  static async updateAmbulance(id, vehicleData, userProfile) {
    if (!['ADMIN', 'RECEPTIONIST'].includes(userProfile?.role)) {
      throw new Error(
        'Unauthorized: Only staff members can update ambulance details.'
      );
    }

    ensureSupabase();

    const allowedFields = [
      'vehicle_number',
      'ambulance_type',
      'status',
      'base_fee',
      'per_km_fee',
      'assistance_fee',
      'driver_name',
      'contact_number'
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (vehicleData[field] !== undefined) {
        updateData[field] = vehicleData[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('ambulances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ambulance: ${error.message}`);
    }

    return data;
  }

  // =========================================================
  // CREATE AMBULANCE REQUEST
  // =========================================================

  static async createRequest(requestData, userProfile) {
    ensureSupabase();

    if (!userProfile) {
      throw new Error('User authentication is required.');
    }

    if (!requestData.disclaimer_acknowledged) {
      throw new Error(
        'Mandatory Disclaimer: You must acknowledge that this is a non-emergency hospital transport service and additional charges may apply.'
      );
    }

    if (
      !requestData.pickup_address ||
      !requestData.pickup_address.trim()
    ) {
      throw new Error('Validation Error: Pickup address is required.');
    }

    const config = await this.getConfig();

    if (!config.service_enabled) {
      throw new Error('Ambulance service is currently disabled.');
    }

    // ---------------------------------------------------------
    // Resolve patient ID
    // ---------------------------------------------------------

    let patientId = userProfile.patient_id;

    if (!patientId && userProfile.role === 'PATIENT') {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', userProfile.id)
        .maybeSingle();

      if (error) {
        throw new Error(
          `Failed to find patient profile: ${error.message}`
        );
      }

      if (!patient) {
        throw new Error('Patient record not found.');
      }

      patientId = patient.id;
    }

    if (!patientId) {
      patientId = requestData.patient_id;
    }

    if (!patientId) {
      throw new Error('Patient ID is required.');
    }

    // ---------------------------------------------------------
    // Calculate fee
    // ---------------------------------------------------------

    const distance = Math.max(
      1,
      Number(requestData.estimated_distance || 10)
    );

    const isAssisted =
      requestData.assistance_required === 'ASSISTED';

    const baseFee = Number(config.base_fee || 50);
    const perKmFee = Number(config.per_km_fee || 5);
    const assistanceFee = isAssisted
      ? Number(config.assistance_fee || 25)
      : 0;

    const estimatedFee = Number(
      (
        baseFee +
        distance * perKmFee +
        assistanceFee
      ).toFixed(2)
    );

    // ---------------------------------------------------------
    // Create request in Supabase
    // ---------------------------------------------------------

    const request = {
      appointment_id: requestData.appointment_id || null,
      patient_id: patientId,
      ambulance_id: null,

      pickup_address: requestData.pickup_address,
      pickup_latitude: requestData.pickup_latitude || null,
      pickup_longitude: requestData.pickup_longitude || null,

      destination:
        requestData.destination ||
        'CarePulse Central Hospital - Main Medical Center',

      assistance_required:
        requestData.assistance_required || 'BASIC',

      reason:
        requestData.reason ||
        'Hospital appointment transfer assistance',

      contact_number:
        requestData.contact_number ||
        userProfile.phone ||
        null,

      estimated_distance: distance,
      estimated_fee: estimatedFee,
      final_fee: estimatedFee,

      status: 'REQUESTED',

      notes: requestData.notes || '',

      disclaimer_acknowledged: true,

      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ambulance_requests')
      .insert(request)
      .select('*')
      .single();

    if (error) {
      throw new Error(
        `Failed to create ambulance request: ${error.message}`
      );
    }

    return data;
  }

  // =========================================================
  // GET REQUESTS
  // =========================================================

  static async getRequests(filters = {}, userProfile = null) {
    ensureSupabase();

    let query = supabase
      .from('ambulance_requests')
      .select(`
        *,
        patients (
          id,
          profile_id
        ),
        ambulances (
          id,
          vehicle_number,
          ambulance_type,
          status,
          driver_name,
          contact_number
        )
      `)
      .order('created_at', { ascending: false });

    // ---------------------------------------------------------
    // Patient can only see their own requests
    // ---------------------------------------------------------

    if (userProfile?.role === 'PATIENT') {
      let patientId = userProfile.patient_id;

      if (!patientId) {
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('profile_id', userProfile.id)
          .maybeSingle();

        patientId = patient?.id;
      }

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
    }

    // ---------------------------------------------------------
    // Filters
    // ---------------------------------------------------------

    if (filters.appointment_id) {
      query = query.eq(
        'appointment_id',
        filters.appointment_id
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Get ambulance requests Supabase error: ${error.message}`
      );
    }

    const requests = data || [];

    // ---------------------------------------------------------
    // Enrich appointment + doctor information
    // ---------------------------------------------------------

    const enriched = await Promise.all(
      requests.map(async request => {

        let appointment = null;
        let doctor = null;
        let doctorProfile = null;
        let patientProfile = null;

        // Appointment
        if (request.appointment_id) {
          const { data: appointmentData } = await supabase
            .from('appointments')
            .select(`
              id,
              appointment_date,
              appointment_time,
              doctor_id
            `)
            .eq('id', request.appointment_id)
            .maybeSingle();

          appointment = appointmentData;

          // Doctor
          if (appointment?.doctor_id) {
            const { data: doctorData } = await supabase
              .from('doctors')
              .select(`
                id,
                specialization,
                profile_id
              `)
              .eq('id', appointment.doctor_id)
              .maybeSingle();

            doctor = doctorData;

            if (doctor?.profile_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, name, phone')
                .eq('id', doctor.profile_id)
                .maybeSingle();

              doctorProfile = profileData;
            }
          }
        }

        // Patient profile
        if (request.patients?.profile_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, name, phone')
            .eq('id', request.patients.profile_id)
            .maybeSingle();

          patientProfile = profileData;
        }

        return {
          ...request,

          patient: {
            id: request.patient_id,
            name: patientProfile?.name || 'Patient',
            phone:
              patientProfile?.phone ||
              request.contact_number ||
              null
          },

          appointment: appointment
            ? {
                id: appointment.id,
                appointment_date:
                  appointment.appointment_date,
                appointment_time:
                  appointment.appointment_time,
                doctor_name:
                  doctorProfile?.name || 'Doctor',
                specialization:
                  doctor?.specialization || 'General'
              }
            : null,

          ambulance: request.ambulances || null
        };
      })
    );

    return enriched;
  }

  // =========================================================
  // UPDATE REQUEST STATUS
  // =========================================================

  static async updateRequestStatus(
    requestId,
    status,
    details = {},
    userProfile
  ) {
    ensureSupabase();

    const { data: request, error: requestError } =
      await supabase
        .from('ambulance_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (requestError || !request) {
      throw new Error('Ambulance request not found.');
    }

    // Patients can only cancel
    if (userProfile?.role === 'PATIENT') {
      if (status !== 'CANCELLED') {
        throw new Error(
          'Unauthorized: Patients can only cancel ambulance requests.'
        );
      }

      if (
        ['COMPLETED', 'EN_ROUTE', 'ARRIVED', 'PICKED_UP']
          .includes(request.status)
      ) {
        throw new Error(
          'Cannot cancel an ambulance request that is already in progress.'
        );
      }
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (details.notes !== undefined) {
      updateData.notes = details.notes;
    }

    if (status === 'CONFIRMED') {
      updateData.confirmed_at =
        new Date().toISOString();
    }

    if (status === 'COMPLETED') {
      updateData.completed_at =
        new Date().toISOString();

      if (details.final_fee !== undefined) {
        updateData.final_fee =
          Number(details.final_fee);
      }
    }

    if (status === 'CANCELLED') {
      updateData.cancelled_at =
        new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('ambulance_requests')
      .update(updateData)
      .eq('id', requestId)
      .select('*')
      .single();

    if (error) {
      throw new Error(
        `Failed to update ambulance request: ${error.message}`
      );
    }

    // Release ambulance after completion/cancellation
    if (
      ['COMPLETED', 'CANCELLED', 'REJECTED']
        .includes(status) &&
      request.ambulance_id
    ) {
      await supabase
        .from('ambulances')
        .update({
          status: 'AVAILABLE',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.ambulance_id);
    }

    return data;
  }

  // =========================================================
  // ASSIGN AMBULANCE
  // =========================================================

  static async assignVehicle(
    requestId,
    ambulanceId,
    userProfile
  ) {
    if (!['ADMIN', 'RECEPTIONIST'].includes(userProfile?.role)) {
      throw new Error(
        'Unauthorized: Only hospital staff can assign ambulances.'
      );
    }

    ensureSupabase();

    // Get request
    const { data: request, error: requestError } =
      await supabase
        .from('ambulance_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (requestError || !request) {
      throw new Error('Ambulance request not found.');
    }

    // Get ambulance
    const { data: ambulance, error: ambulanceError } =
      await supabase
        .from('ambulances')
        .select('*')
        .eq('id', ambulanceId)
        .single();

    if (ambulanceError || !ambulance) {
      throw new Error(
        'Selected ambulance vehicle not found.'
      );
    }

    if (
      ambulance.status !== 'AVAILABLE' &&
      request.ambulance_id !== ambulanceId
    ) {
      throw new Error(
        `Ambulance ${ambulance.vehicle_number} is currently ${ambulance.status}.`
      );
    }

    // Check existing active assignment
    const { data: existing } = await supabase
      .from('ambulance_requests')
      .select('id')
      .eq('ambulance_id', ambulanceId)
      .not(
        'status',
        'in',
        '(COMPLETED,CANCELLED,REJECTED)'
      )
      .neq('id', requestId)
      .limit(1);

    if (existing?.length) {
      throw new Error(
        'This ambulance is already assigned to another active request.'
      );
    }

    // Assign request
    const now = new Date().toISOString();

    const { data: updatedRequest, error } =
      await supabase
        .from('ambulance_requests')
        .update({
          ambulance_id: ambulanceId,
          status: 'AMBULANCE_ASSIGNED',
          assigned_at: now,
          updated_at: now
        })
        .eq('id', requestId)
        .select('*')
        .single();

    if (error) {
      throw new Error(
        `Failed to assign ambulance: ${error.message}`
      );
    }

    // Mark vehicle assigned
    await supabase
      .from('ambulances')
      .update({
        status: 'ASSIGNED',
        updated_at: now
      })
      .eq('id', ambulanceId);

    return {
      request: updatedRequest,
      vehicle: ambulance
    };
  }

  // =========================================================
  // ANALYTICS
  // =========================================================

  static async getAnalytics() {
    ensureSupabase();

    const { data: requests, error } = await supabase
      .from('ambulance_requests')
      .select(
        'id, status, final_fee, estimated_fee, ambulance_id'
      );

    if (error) {
      throw new Error(
        `Failed to get ambulance analytics: ${error.message}`
      );
    }

    const { data: ambulances } = await supabase
      .from('ambulances')
      .select('id, status');

    const allRequests = requests || [];
    const allAmbulances = ambulances || [];

    const completed =
      allRequests.filter(
        r => r.status === 'COMPLETED'
      );

    const totalRevenue = completed.reduce(
      (sum, r) =>
        sum +
        (Number(r.final_fee) ||
          Number(r.estimated_fee) ||
          0),
      0
    );

    const activeAmbulances =
      allAmbulances.filter(a =>
        ['ASSIGNED', 'EN_ROUTE', 'ON_TRIP']
          .includes(a.status)
      ).length;

    const totalAmbulances =
      allAmbulances.length;

    return {
      total_requests: allRequests.length,

      confirmed_requests:
        allRequests.filter(r =>
          [
            'CONFIRMED',
            'AMBULANCE_ASSIGNED',
            'EN_ROUTE',
            'ARRIVED',
            'PICKED_UP',
            'COMPLETED'
          ].includes(r.status)
        ).length,

      rejected_requests:
        allRequests.filter(
          r => r.status === 'REJECTED'
        ).length,

      completed_requests:
        completed.length,

      cancelled_requests:
        allRequests.filter(
          r => r.status === 'CANCELLED'
        ).length,

      total_revenue:
        totalRevenue.toFixed(2),

      avg_charge:
        completed.length > 0
          ? (totalRevenue / completed.length).toFixed(2)
          : '0.00',

      active_ambulances:
        activeAmbulances,

      total_ambulances:
        totalAmbulances,

      utilization_rate:
        totalAmbulances > 0
          ? `${(
              (activeAmbulances /
                totalAmbulances) *
              100
            ).toFixed(1)}%`
          : '0%'
    };
  }
}