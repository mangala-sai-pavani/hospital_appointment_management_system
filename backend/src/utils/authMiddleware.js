import { getProfileByToken } from '../services/authService.js';
import { sendError } from './response.js';

/**
 * Authentication Middleware for Native Node.js HTTP Server.
 * Validates Bearer token from headers and attaches `req.user` object.
 */
export async function requireAuth(req, res) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'Authentication required: Missing or invalid Authorization token');
      return null;
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      sendError(res, 401, 'Authentication required: Token is empty');
      return null;
    }

    const profile = await getProfileByToken(token);
    if (!profile) {
      sendError(res, 401, 'Authentication failed: Invalid user profile or expired session');
      return null;
    }

    req.user = {
      id: profile.auth_user_id || profile.id,
      profile_id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role
    };

    req.token = token;
    return req.user;
  } catch (err) {
    sendError(res, 401, err.message || 'Authentication failed: Invalid session');
    return null;
  }
}

/**
 * Role Authorization Helper for Native Node.js HTTP Server.
 * Checks whether `req.user.role` matches any of the allowed roles.
 */
export function requireRole(...allowedRoles) {
  return async function(req, res) {
    const user = await requireAuth(req, res);
    if (!user) return false; // Error response already sent by requireAuth

    if (!allowedRoles.includes(user.role)) {
      sendError(res, 403, `Access forbidden: Required role [${allowedRoles.join(', ')}], but your account is [${user.role}]`);
      return false;
    }

    return true;
  };
}
