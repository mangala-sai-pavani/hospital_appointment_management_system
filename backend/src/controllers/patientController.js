import { getAllPatients, getPatientById, updatePatientProfile } from '../services/patientService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parseJSONBody } from '../utils/bodyParser.js';

export async function handleGetPatients(req, res) {
  try {
    const patients = await getAllPatients();
    sendSuccess(res, patients);
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

export async function handleGetPatientById(req, res, id) {
  try {
    const patient = await getPatientById(id);
    sendSuccess(res, patient);
  } catch (err) {
    sendError(res, 404, err.message);
  }
}

export async function handleUpdatePatient(req, res, id) {
  try {
    const body = await parseJSONBody(req);
    const updated = await updatePatientProfile(id, body);
    sendSuccess(res, updated);
  } catch (err) {
    sendError(res, 400, err.message);
  }
}
