import { AmbulanceService } from '../services/ambulanceService.js';
import { getProfileByToken } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parseJSONBody } from '../utils/bodyParser.js';

async function getUserProfileFromReq(req) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (token) {
      const profile = await getProfileByToken(token);
      if (profile) return profile;
    }
  } catch (error) {
    console.error('Failed to get user profile:', error.message);
  }

  return {
    id: 'p1000000-0000-0000-0000-000000000007',
    role: 'PATIENT'
  };
}

export async function handleGetAmbulanceConfig(req, res) {
  try {
    const config = await AmbulanceService.getConfig();
    sendSuccess(res, config);
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

export async function handleUpdateAmbulanceConfig(req, res) {
  try {
    const userProfile = await getUserProfileFromReq(req);
    const body = await parseJSONBody(req);

    const result = await AmbulanceService.updateConfig(
      body,
      userProfile
    );

    sendSuccess(res, result);
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    sendError(res, status, err.message);
  }
}

export async function handleGetAmbulances(req, res) {
  try {
    const ambulances = await AmbulanceService.getAmbulances();
    sendSuccess(res, ambulances);
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

export async function handleCreateAmbulance(req, res) {
  try {
    const userProfile = await getUserProfileFromReq(req);
    const body = await parseJSONBody(req);

    const result = await AmbulanceService.createAmbulance(
      body,
      userProfile
    );

    sendSuccess(res, result, 201);
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    sendError(res, status, err.message);
  }
}

export async function handleUpdateAmbulance(req, res, ambulanceId) {
  try {
    const userProfile = await getUserProfileFromReq(req);
    const body = await parseJSONBody(req);

    const result = await AmbulanceService.updateAmbulance(
      ambulanceId,
      body,
      userProfile
    );

    sendSuccess(res, result);
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    sendError(res, status, err.message);
  }
}

export async function handleCreateAmbulanceRequest(req, res) {
  try {
    const userProfile = await getUserProfileFromReq(req);
    const body = await parseJSONBody(req);

    const result = await AmbulanceService.createRequest(
      body,
      userProfile
    );

    sendSuccess(res, result, 201);
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

export async function handleGetAmbulanceRequests(req, res, searchParams) {
  try {
    const userProfile = await getUserProfileFromReq(req);

    const filters = {
      appointment_id: searchParams.get('appointment_id'),
      status: searchParams.get('status')
    };

    const requests = await AmbulanceService.getRequests(
      filters,
      userProfile
    );

    sendSuccess(res, requests);
  } catch (err) {
    console.error('GET AMBULANCE REQUESTS ERROR:', err);
    sendError(res, 500, err.message);
  }
}

export async function handleUpdateAmbulanceRequestStatus(
  req,
  res,
  requestId
) {
  try {
    const userProfile = await getUserProfileFromReq(req);
    const body = await parseJSONBody(req);

    if (!body.status) {
      return sendError(res, 400, 'Status is required.');
    }

    const result = await AmbulanceService.updateRequestStatus(
      requestId,
      body.status,
      body,
      userProfile
    );

    sendSuccess(res, result);
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    sendError(res, status, err.message);
  }
}

export async function handleAssignAmbulanceVehicle(
  req,
  res,
  requestId
) {
  try {
    const userProfile = await getUserProfileFromReq(req);
    const body = await parseJSONBody(req);

    if (!body.ambulance_id) {
      return sendError(
        res,
        400,
        'ambulance_id is required for assignment.'
      );
    }

    const result = await AmbulanceService.assignVehicle(
      requestId,
      body.ambulance_id,
      userProfile
    );

    sendSuccess(res, result);
  } catch (err) {
    const status = err.message.includes('Unauthorized') ? 403 : 400;
    sendError(res, status, err.message);
  }
}

export async function handleGetAmbulanceAnalytics(req, res) {
  try {
    const analytics = await AmbulanceService.getAnalytics();
    sendSuccess(res, analytics);
  } catch (err) {
    sendError(res, 500, err.message);
  }
}