import { getAllDoctors, getDoctorById, createDoctor } from '../services/doctorService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parseJSONBody } from '../utils/bodyParser.js';

export async function handleGetDoctors(req, res) {
  try {
    const doctors = await getAllDoctors();
    sendSuccess(res, doctors);
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

export async function handleGetDoctorById(req, res, id) {
  try {
    const doctor = await getDoctorById(id);
    sendSuccess(res, doctor);
  } catch (err) {
    sendError(res, 404, err.message);
  }
}

export async function handleCreateDoctor(req, res) {
  try {
    const body = await parseJSONBody(req);
    if (!body.name || !body.email || !body.department_id) {
      return sendError(res, 400, 'Name, email, and department are required');
    }
    const result = await createDoctor(body);
    sendSuccess(res, result, 201);
  } catch (err) {
    sendError(res, 400, err.message);
  }
}
