import {
  handleLogin,
  handleRegister,
  handleGetMe,
  handleLogout,
  handleGetProfile,
  handleUpdateProfile,
  handleAdminCreateUser
} from '../controllers/authController.js';

import {
  handleGetQueue,
  handleJoinQueue,
  handleCallQueue,
  handleStartConsultation,
  handleCompleteQueue,
  handleSkipPatient,
  handleNoShow,
  handleQRCheckin,
  handleGetWaitTimes
} from '../controllers/queueController.js';

import {
  handleGetDepartments,
  handleCreateDepartment
} from '../controllers/departmentController.js';

import {
  handleGetDoctors,
  handleGetDoctorById,
  handleCreateDoctor
} from '../controllers/doctorController.js';

import {
  handleGetPatients,
  handleGetPatientById,
  handleUpdatePatient
} from '../controllers/patientController.js';

import {
  handleGetAppointments,
  handleCreateAppointment,
  handleEmergencyAppointment,
  handleRescheduleAppointment,
  handleCancelAppointment,
  handleMarkNoShow,
  handleScheduleFollowUp,
  handleReassignDoctor,
  handleUpdateAppointment
} from '../controllers/appointmentController.js';

import { handleGetAnalytics } from '../controllers/analyticsController.js';

import {
  handleGetNotifications,
  handleGetSettings,
  handleUpdateSettings,
  handleGetLogs,
  handleTriggerReminders,
  handleSendSingleReminder,
  handlePreviewReminder
} from '../controllers/notificationController.js';

import {
  handleGetAmbulanceConfig,
  handleUpdateAmbulanceConfig,
  handleGetAmbulances,
  handleCreateAmbulance,
  handleUpdateAmbulance,
  handleCreateAmbulanceRequest,
  handleGetAmbulanceRequests,
  handleUpdateAmbulanceRequestStatus,
  handleAssignAmbulanceVehicle,
  handleGetAmbulanceAnalytics
} from '../controllers/ambulanceController.js';

import { sendSuccess, sendError } from '../utils/response.js';


export async function router(req, res) {

  const url = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`
  );

  const pathname = url.pathname;
  const method = req.method.toUpperCase();


  // ============================================================
  // CORS
  // ============================================================

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });

    return res.end();
  }


  // ============================================================
  // HEALTH CHECK
  // ============================================================

  if (method === 'GET' && pathname === '/api/health') {

    return sendSuccess(res, {
      status: 'ok',
      message: 'Backend + Supabase connected!'
    });

  }


  // ============================================================
  // AUTH
  // ============================================================

  if (method === 'POST' && pathname === '/api/auth/login') {
    return handleLogin(req, res);
  }

  if (method === 'POST' && pathname === '/api/auth/register') {
    return handleRegister(req, res);
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    return handleLogout(req, res);
  }

  if (method === 'GET' && pathname === '/api/auth/me') {
    return handleGetMe(req, res);
  }


  // ============================================================
  // PROFILE
  // ============================================================

  if (method === 'GET' && pathname === '/api/profile') {
    return handleGetProfile(req, res);
  }

  if (method === 'PATCH' && pathname === '/api/profile') {
    return handleUpdateProfile(req, res);
  }


  // ============================================================
  // ADMIN USER
  // ============================================================

  if (method === 'POST' && pathname === '/api/admin/create-user') {
    return handleAdminCreateUser(req, res);
  }


  // ============================================================
  // DEPARTMENTS
  // ============================================================

  if (method === 'GET' && pathname === '/api/departments') {
    return handleGetDepartments(req, res);
  }

  if (method === 'POST' && pathname === '/api/departments') {
    return handleCreateDepartment(req, res);
  }


  // ============================================================
  // DOCTORS
  // ============================================================

  if (method === 'GET' && pathname === '/api/doctors') {
    return handleGetDoctors(req, res);
  }

  if (method === 'POST' && pathname === '/api/doctors') {
    return handleCreateDoctor(req, res);
  }

  const doctorIdMatch =
    pathname.match(/^\/api\/doctors\/([a-zA-Z0-9-]+)$/);

  if (method === 'GET' && doctorIdMatch) {
    return handleGetDoctorById(
      req,
      res,
      doctorIdMatch[1]
    );
  }


  // ============================================================
  // PATIENTS
  // ============================================================

  if (method === 'GET' && pathname === '/api/patients') {
    return handleGetPatients(req, res);
  }

  const patientIdMatch =
    pathname.match(/^\/api\/patients\/([a-zA-Z0-9-]+)$/);

  if (method === 'GET' && patientIdMatch) {
    return handleGetPatientById(
      req,
      res,
      patientIdMatch[1]
    );
  }

  if (method === 'PUT' && patientIdMatch) {
    return handleUpdatePatient(
      req,
      res,
      patientIdMatch[1]
    );
  }


  // ============================================================
  // APPOINTMENTS
  // ============================================================

  if (method === 'GET' && pathname === '/api/appointments') {
    return handleGetAppointments(
      req,
      res,
      url.searchParams
    );
  }

  if (
    method === 'POST' &&
    pathname === '/api/appointments/emergency'
  ) {
    return handleEmergencyAppointment(req, res);
  }

  if (
    method === 'POST' &&
    pathname === '/api/appointments'
  ) {
    return handleCreateAppointment(req, res);
  }


  const aptRescheduleMatch =
    pathname.match(
      /^\/api\/appointments\/([a-zA-Z0-9-]+)\/reschedule$/
    );

  if (method === 'POST' && aptRescheduleMatch) {
    return handleRescheduleAppointment(
      req,
      res,
      aptRescheduleMatch[1]
    );
  }


  const aptCancelMatch =
    pathname.match(
      /^\/api\/appointments\/([a-zA-Z0-9-]+)\/cancel$/
    );

  if (
    (method === 'POST' || method === 'DELETE') &&
    aptCancelMatch
  ) {
    return handleCancelAppointment(
      req,
      res,
      aptCancelMatch[1]
    );
  }


  const aptNoShowMatch =
    pathname.match(
      /^\/api\/appointments\/([a-zA-Z0-9-]+)\/no-show$/
    );

  if (method === 'PUT' && aptNoShowMatch) {
    return handleMarkNoShow(
      req,
      res,
      aptNoShowMatch[1]
    );
  }


  const aptFollowUpMatch =
    pathname.match(
      /^\/api\/appointments\/([a-zA-Z0-9-]+)\/follow-up$/
    );

  if (method === 'POST' && aptFollowUpMatch) {
    return handleScheduleFollowUp(
      req,
      res,
      aptFollowUpMatch[1]
    );
  }


  const aptReassignMatch =
    pathname.match(
      /^\/api\/appointments\/([a-zA-Z0-9-]+)\/reassign-doctor$/
    );

  if (method === 'POST' && aptReassignMatch) {
    return handleReassignDoctor(
      req,
      res,
      aptReassignMatch[1]
    );
  }


  const aptIdMatch =
    pathname.match(
      /^\/api\/appointments\/([a-zA-Z0-9-]+)$/
    );

  if (method === 'PUT' && aptIdMatch) {
    return handleUpdateAppointment(
      req,
      res,
      aptIdMatch[1]
    );
  }

  if (method === 'DELETE' && aptIdMatch) {
    return handleCancelAppointment(
      req,
      res,
      aptIdMatch[1]
    );
  }


  // ============================================================
  // QUEUE SYSTEM
  // ============================================================

  // GET queue
  if (
    method === 'GET' &&
    pathname === '/api/queue'
  ) {
    return handleGetQueue(
      req,
      res,
      url.searchParams
    );
  }


  // GET department wait times
  if (
    method === 'GET' &&
    (
      pathname === '/api/queue/wait-times' ||
      pathname === '/api/queue/wait-time-estimates'
    )
  ) {
    return handleGetWaitTimes(req, res);
  }


  // POST join queue
  if (
    method === 'POST' &&
    pathname === '/api/queue/join'
  ) {
    return handleJoinQueue(req, res);
  }


  // POST QR check-in
  if (
    method === 'POST' &&
    (
      pathname === '/api/queue/qr-checkin' ||
      pathname === '/api/queue/checkin'
    )
  ) {
    return handleQRCheckin(req, res);
  }


  // PUT call patient
  const queueCallMatch =
    pathname.match(
      /^\/api\/queue\/([a-zA-Z0-9-]+)\/call$/
    );

  if (method === 'PUT' && queueCallMatch) {
    return handleCallQueue(
      req,
      res,
      queueCallMatch[1]
    );
  }


  // PUT start consultation
  const queueStartMatch =
    pathname.match(
      /^\/api\/queue\/([a-zA-Z0-9-]+)\/start$/
    );

  if (method === 'PUT' && queueStartMatch) {
    return handleStartConsultation(
      req,
      res,
      queueStartMatch[1]
    );
  }


  // PUT complete consultation
  const queueCompleteMatch =
    pathname.match(
      /^\/api\/queue\/([a-zA-Z0-9-]+)\/complete$/
    );

  if (method === 'PUT' && queueCompleteMatch) {
    return handleCompleteQueue(
      req,
      res,
      queueCompleteMatch[1]
    );
  }


  // PUT skip patient
  const queueSkipMatch =
    pathname.match(
      /^\/api\/queue\/([a-zA-Z0-9-]+)\/skip$/
    );

  if (method === 'PUT' && queueSkipMatch) {
    return handleSkipPatient(
      req,
      res,
      queueSkipMatch[1]
    );
  }


  // PUT mark no-show
  const queueNoShowMatch =
    pathname.match(
      /^\/api\/queue\/([a-zA-Z0-9-]+)\/no-show$/
    );

  if (method === 'PUT' && queueNoShowMatch) {
    return handleNoShow(
      req,
      res,
      queueNoShowMatch[1]
    );
  }


  // ============================================================
  // ANALYTICS
  // ============================================================

  if (
    method === 'GET' &&
    pathname === '/api/analytics/dashboard'
  ) {
    return handleGetAnalytics(
      req,
      res,
      url.searchParams
    );
  }


  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  // GET notifications
if (
  method === 'GET' &&
  pathname === '/api/notifications'
) {
  return handleGetNotifications(req, res);
}

if (
  method === 'GET' &&
  pathname === '/api/notifications'
) {
  return handleGetNotifications(req, res);
}
  if (
    method === 'GET' &&
    pathname === '/api/notifications/reminders/settings'
  ) {
    return handleGetSettings(req, res);
  }

  if (
    method === 'PUT' &&
    pathname === '/api/notifications/reminders/settings'
  ) {
    return handleUpdateSettings(req, res);
  }

  if (
    method === 'GET' &&
    pathname === '/api/notifications/reminders/logs'
  ) {
    return handleGetLogs(req, res);
  }

  if (
    method === 'POST' &&
    pathname === '/api/notifications/reminders/trigger'
  ) {
    return handleTriggerReminders(req, res);
  }

  if (
    method === 'POST' &&
    pathname === '/api/notifications/reminders/send-single'
  ) {
    return handleSendSingleReminder(req, res);
  }

  if (
    method === 'POST' &&
    pathname === '/api/notifications/reminders/preview'
  ) {
    return handlePreviewReminder(req, res);
  }


  // ============================================================
  // AMBULANCE
  // ============================================================

  if (
    method === 'GET' &&
    pathname === '/api/ambulance/config'
  ) {
    return handleGetAmbulanceConfig(req, res);
  }

  if (
    method === 'PUT' &&
    pathname === '/api/ambulance/config'
  ) {
    return handleUpdateAmbulanceConfig(req, res);
  }

  if (
    method === 'GET' &&
    pathname === '/api/ambulance/vehicles'
  ) {
    return handleGetAmbulances(req, res);
  }

  if (
    method === 'POST' &&
    pathname === '/api/ambulance/vehicles'
  ) {
    return handleCreateAmbulance(req, res);
  }


  const ambVehicleMatch =
    pathname.match(
      /^\/api\/ambulance\/vehicles\/([a-zA-Z0-9-]+)$/
    );

  if (method === 'PUT' && ambVehicleMatch) {
    return handleUpdateAmbulance(
      req,
      res,
      ambVehicleMatch[1]
    );
  }


  if (
    method === 'GET' &&
    pathname === '/api/ambulance/requests'
  ) {
    return handleGetAmbulanceRequests(
      req,
      res,
      url.searchParams
    );
  }

  if (
    method === 'POST' &&
    pathname === '/api/ambulance/requests'
  ) {
    return handleCreateAmbulanceRequest(req, res);
  }


  const ambReqAssignMatch =
    pathname.match(
      /^\/api\/ambulance\/requests\/([a-zA-Z0-9-]+)\/assign$/
    );

  if (method === 'PUT' && ambReqAssignMatch) {
    return handleAssignAmbulanceVehicle(
      req,
      res,
      ambReqAssignMatch[1]
    );
  }


  const ambReqStatusMatch =
    pathname.match(
      /^\/api\/ambulance\/requests\/([a-zA-Z0-9-]+)\/status$/
    );

  if (method === 'PUT' && ambReqStatusMatch) {
    return handleUpdateAmbulanceRequestStatus(
      req,
      res,
      ambReqStatusMatch[1]
    );
  }


  if (
    method === 'GET' &&
    pathname === '/api/ambulance/analytics'
  ) {
    return handleGetAmbulanceAnalytics(req, res);
  }


  // ============================================================
  // 404
  // ============================================================

  return sendError(
    res,
    404,
    `API route ${method} ${pathname} not found`
  );
}