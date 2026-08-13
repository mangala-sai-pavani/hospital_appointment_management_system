import { getAllDepartments, createDepartment } from '../services/departmentService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parseJSONBody } from '../utils/bodyParser.js';

export async function handleGetDepartments(req, res) {
  try {
    const departments = await getAllDepartments();
    sendSuccess(res, departments);
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

export async function handleCreateDepartment(req, res) {
  try {
    const body = await parseJSONBody(req);
    if (!body.name) {
      return sendError(res, 400, 'Department name is required');
    }
    const newDept = await createDepartment(body.name, body.description);
    sendSuccess(res, newDept, 201);
  } catch (err) {
    sendError(res, 400, err.message);
  }
}
