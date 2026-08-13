import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  cancelAppointment,
  markNoShow,
  scheduleFollowUp,
  reassignDoctor
} from '../services/appointmentService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parseJSONBody } from '../utils/bodyParser.js';

export async function handleGetAppointments(req, res, queryParams) {
  try {
    const filters = {
      patient_id: queryParams.get('patient_id'),
      doctor_id: queryParams.get('doctor_id'),
      status: queryParams.get('status'),
      date: queryParams.get('date'),
      priority: queryParams.get('priority')
    };
    const appointments = await getAllAppointments(filters);
    sendSuccess(res, appointments);
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

export async function handleCreateAppointment(req, res) {
  try {
    const body = await parseJSONBody(req);
    const appointment = await createAppointment(body);
    sendSuccess(res, appointment, 201);
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

export async function handleEmergencyAppointment(req, res) {
  try {
    const body = await parseJSONBody(req);
    const appointment = await createAppointment({ ...body, priority: 'EMERGENCY' });
    sendSuccess(res, appointment, 201, 'Emergency appointment booked with TOP PRIORITY queue slot');
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

export async function handleRescheduleAppointment(req, res, id) {
  try {
    const body = await parseJSONBody(req);
    const { new_date, new_time, doctor_id } = body;
    if (!new_date || !new_time) {
      return sendError(res, 400, 'New date (new_date) and new time (new_time) are required');
    }
const result = await rescheduleAppointment(
  id,
  new_date,
  new_time,
  doctor_id,
  req.user || null
);    sendSuccess(res, result, 200, 'Appointment rescheduled successfully');
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

export async function handleCancelAppointment(req, res, id) {
  try {
    const body = await parseJSONBody(req).catch(() => ({}));
    const reason = body.reason || 'Patient Request';
    const cancelledByRole = body.cancelled_by_role || 'PATIENT';
    const result = await cancelAppointment(id, reason, cancelledByRole);
    sendSuccess(res, result, 200, 'Appointment cancelled successfully');
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

export async function handleMarkNoShow(req, res, id) {
  try {
    const result = await markNoShow(id);
    sendSuccess(res, result, 200, 'Appointment marked as NO_SHOW');
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

export async function handleScheduleFollowUp(req, res, id) {
  try {
    const body = await parseJSONBody(req);

    console.log('FOLLOW-UP APPOINTMENT ID:', id);
    console.log('FOLLOW-UP BODY:', body);

    const result = await scheduleFollowUp(id, body);

    sendSuccess(
      res,
      result,
      201,
      'Follow-up appointment scheduled successfully'
    );
  } catch (err) {
    console.error('FOLLOW-UP ERROR:', err);
    sendError(res, 400, err.message);
  }
}

export async function handleReassignDoctor(req, res, id) {
  try {
    const body = await parseJSONBody(req);
    if (!body.new_doctor_id) {
      return sendError(res, 400, 'new_doctor_id is required for reassignment');
    }
    const result = await reassignDoctor(id, body.new_doctor_id);
    sendSuccess(res, result, 200, 'Doctor reassigned successfully');
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

export async function handleUpdateAppointment(req, res, id) {
  try {
    const body = await parseJSONBody(req);
    const updated = await updateAppointment(id, body);
    sendSuccess(res, updated);
  } catch (err) {
    sendError(res, 400, err.message);
  }
}
