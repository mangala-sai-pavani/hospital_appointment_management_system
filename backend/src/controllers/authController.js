import {
  loginUser,
  registerPatient,
  getProfileByToken,
  logoutUser,
  updateProfile,
  createStaffUser
} from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parseJSONBody } from '../utils/bodyParser.js';
import { requireAuth, requireRole } from '../utils/authMiddleware.js';
import { validateName, validateEmail, validatePhone } from '../validations/inputValidations.js';

export async function handleLogin(req, res) {
  try {
    const body = await parseJSONBody(req);
    const { email, password } = body;

    const emailErr = validateEmail(email);
    if (emailErr) return sendError(res, 400, emailErr);

    if (!password || typeof password !== 'string' || password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    const result = await loginUser(email, password);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, 401, err.message || 'Login authentication failed');
  }
}

export async function handleRegister(req, res) {
  try {
    const body = await parseJSONBody(req);
    const { name, email, password, phone, role: requestedRole } = body;

    // Security check: Ignore/warn if user attempted role escalation
    if (requestedRole && requestedRole !== 'PATIENT') {
      console.warn(`[Security Alert] Public registration attempt with unauthorized role '${requestedRole}'. Overriding to PATIENT.`);
    }

    // Backend authoritative validation
    const nameErr = validateName(name, 'Full Name');
    if (nameErr) return sendError(res, 400, nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) return sendError(res, 400, emailErr);

    if (!password || typeof password !== 'string' || password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    if (phone) {
      const phoneErr = validatePhone(phone);
      if (phoneErr) return sendError(res, 400, phoneErr);
    }

    // Force PATIENT role
    const result = await registerPatient(body);
    sendSuccess(res, result, 201);
  } catch (err) {
    sendError(res, 400, err.message || 'Registration failed');
  }
}

export async function handleLogout(req, res) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const result = await logoutUser(token);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, 500, err.message || 'Logout failed');
  }
}

export async function handleGetMe(req, res) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return; // Response sent by middleware

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      profile_id: user.profile_id
    });
  } catch (err) {
    sendError(res, 401, err.message || 'Unauthorized');
  }
}

export async function handleGetProfile(req, res) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const profile = await getProfileByToken(token);

    sendSuccess(res, { profile });
  } catch (err) {
    sendError(res, 401, err.message || 'Failed to fetch profile');
  }
}

export async function handleUpdateProfile(req, res) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const body = await parseJSONBody(req);

    // Prevent non-admin users from setting role
    if (body.role && user.role !== 'ADMIN') {
      return sendError(res, 403, 'Forbidden: Modifying user role requires ADMIN permission');
    }

    const updatedProfile = await updateProfile(user.id, body, user.role);
    sendSuccess(res, {
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (err) {
    sendError(res, 400, err.message || 'Profile update failed');
  }
}

export async function handleAdminCreateUser(req, res) {
  try {
    // Requires ADMIN role
    const isAuthorized = await requireRole('ADMIN')(req, res);
    if (!isAuthorized) return;

    const body = await parseJSONBody(req);
    const { role, name, email, password } = body;

    if (!role || !['DOCTOR', 'RECEPTIONIST', 'ADMIN'].includes(role)) {
      return sendError(res, 400, 'Invalid or missing staff role (DOCTOR, RECEPTIONIST, or ADMIN required)');
    }

    const nameErr = validateName(name, 'Staff Name');
    if (nameErr) return sendError(res, 400, nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) return sendError(res, 400, emailErr);

    if (!password || password.length < 6) {
      return sendError(res, 400, 'Temporary password must be at least 6 characters long');
    }

    const result = await createStaffUser(req.user.profile_id, body);
    sendSuccess(res, result, 201);
  } catch (err) {
    sendError(res, 400, err.message || 'Failed to create staff account');
  }
}
