import {
  getQueue,
  joinQueue,
  callNextPatient,
  startConsultation,
  completeVisit,
  skipPatient,
  markNoShow,
  checkInViaQR,
  getDepartmentWaitTimes
} from '../services/queueService.js';

import { sendSuccess, sendError } from '../utils/response.js';
import { parseJSONBody } from '../utils/bodyParser.js';


// =====================================================
// GET QUEUE
// GET /api/queue
// =====================================================

export async function handleGetQueue(req, res, queryParams) {
  try {
    const doctorId = queryParams?.get('doctor_id') || null;

    const queue = await getQueue(doctorId);

    return sendSuccess(res, queue);
  } catch (err) {
    console.error('Get queue error:', err);
    return sendError(res, 500, err.message);
  }
}


// =====================================================
// GET WAIT TIMES
// GET /api/queue/wait-times
// =====================================================

export async function handleGetWaitTimes(req, res) {
  try {
    const waitTimes = await getDepartmentWaitTimes();

    return sendSuccess(res, waitTimes);
  } catch (err) {
    console.error('Get wait times error:', err);
    return sendError(res, 500, err.message);
  }
}


// =====================================================
// JOIN QUEUE
// POST /api/queue/join
// =====================================================

export async function handleJoinQueue(req, res) {
  try {
    const body = await parseJSONBody(req);

    if (!body.appointment_id) {
      return sendError(
        res,
        400,
        'appointment_id is required to join queue'
      );
    }

    const queueEntry = await joinQueue(body.appointment_id);

    return sendSuccess(res, queueEntry, 201);
  } catch (err) {
    console.error('Join queue error:', err);
    return sendError(res, 400, err.message);
  }
}


// =====================================================
// QR CHECK-IN
// POST /api/queue/qr-checkin
// =====================================================

export async function handleQRCheckin(req, res) {
  try {
    const body = await parseJSONBody(req);

    if (!body.appointment_id && !body.patient_id) {
      return sendError(
        res,
        400,
        'appointment_id or patient_id is required'
      );
    }

    const result = await checkInViaQR(body);

    return sendSuccess(
      res,
      result,
      200,
      'Patient checked in successfully'
    );
  } catch (err) {
    console.error('QR check-in error:', err);
    return sendError(res, 400, err.message);
  }
}


// =====================================================
// CALL PATIENT
// PUT /api/queue/:id/call
// =====================================================

export async function handleCallQueue(req, res, id) {
  try {
    if (!id) {
      return sendError(res, 400, 'Queue ID is required');
    }

    const queueEntry = await callNextPatient(id);

    return sendSuccess(
      res,
      queueEntry,
      200,
      'Patient called successfully'
    );
  } catch (err) {
    console.error('Call patient error:', err);
    return sendError(res, 400, err.message);
  }
}


// =====================================================
// START CONSULTATION
// PUT /api/queue/:id/start
// =====================================================

export async function handleStartConsultation(req, res, id) {
  try {
    if (!id) {
      return sendError(res, 400, 'Queue ID is required');
    }

    const queueEntry = await startConsultation(id);

    return sendSuccess(
      res,
      queueEntry,
      200,
      'Consultation started successfully'
    );
  } catch (err) {
    console.error('Start consultation error:', err);
    return sendError(res, 400, err.message);
  }
}


// =====================================================
// COMPLETE VISIT
// PUT /api/queue/:id/complete
// =====================================================

export async function handleCompleteQueue(req, res, id) {
  try {
    if (!id) {
      return sendError(res, 400, 'Queue ID is required');
    }

    const queueEntry = await completeVisit(id);

    return sendSuccess(
      res,
      queueEntry,
      200,
      'Visit completed successfully'
    );
  } catch (err) {
    console.error('Complete visit error:', err);
    return sendError(res, 400, err.message);
  }
}


// =====================================================
// SKIP PATIENT
// PUT /api/queue/:id/skip
// =====================================================

export async function handleSkipPatient(req, res, id) {
  try {
    if (!id) {
      return sendError(res, 400, 'Queue ID is required');
    }

    const queueEntry = await skipPatient(id);

    return sendSuccess(
      res,
      queueEntry,
      200,
      'Patient skipped successfully'
    );
  } catch (err) {
    console.error('Skip patient error:', err);
    return sendError(res, 400, err.message);
  }
}


// =====================================================
// NO-SHOW
// PUT /api/queue/:id/no-show
// =====================================================

export async function handleNoShow(req, res, id) {
  try {
    if (!id) {
      return sendError(res, 400, 'Queue ID is required');
    }

    const queueEntry = await markNoShow(id);

    return sendSuccess(
      res,
      queueEntry,
      200,
      'Patient marked as no-show'
    );
  } catch (err) {
    console.error('No-show error:', err);
    return sendError(res, 400, err.message);
  }
}