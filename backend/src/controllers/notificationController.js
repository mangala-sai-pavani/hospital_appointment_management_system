
import {
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationLogs,
  checkAndSend24hReminders,
  sendAppointmentReminder,
  generateEmailTemplate,
  generateSmsTemplate,
  getNotifications
} from '../services/notificationService.js';

import { getAllAppointments } from '../services/appointmentService.js';
import { sendSuccess, sendError } from '../utils/response.js';


// ============================================================
// GET NOTIFICATIONS
// ============================================================

export async function handleGetNotifications(req, res) {
  try {
    const url = new URL(
      req.url,
      `http://${req.headers.host || 'localhost'}`
    );

    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return sendError(res, 400, 'user_id is required');
    }

    const notifications = await getNotifications(userId);

    return sendSuccess(res, notifications);
  } catch (err) {
    console.error(
      '[NotificationController] Get notifications error:',
      err
    );

    return sendError(res, 500, err.message);
  }
}


// ============================================================
// NOTIFICATION SETTINGS
// ============================================================

export async function handleGetSettings(req, res) {
  try {
    const settings = getNotificationSettings();

    return sendSuccess(res, settings);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
}


export async function handleUpdateSettings(req, res) {
  let body = {};
  let rawData = '';

  req.on('data', chunk => {
    rawData += chunk;
  });

  req.on('end', () => {
    try {
      if (rawData) {
        body = JSON.parse(rawData);
      }

      const updated = updateNotificationSettings(body);

      return sendSuccess(
        res,
        updated,
        'Notification service settings updated successfully'
      );
    } catch (err) {
      return sendError(res, 400, 'Invalid JSON body');
    }
  });
}


// ============================================================
// NOTIFICATION LOGS
// ============================================================

export async function handleGetLogs(req, res) {
  try {
    const logs = getNotificationLogs();

    return sendSuccess(res, logs);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
}


// ============================================================
// TRIGGER AUTOMATED REMINDERS
// ============================================================

export async function handleTriggerReminders(req, res) {
  try {
    const result = await checkAndSend24hReminders();

    return sendSuccess(
      res,
      result,
      'Automated 24h appointment reminder check completed'
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
}


// ============================================================
// SEND SINGLE REMINDER
// ============================================================

export async function handleSendSingleReminder(req, res) {
  let body = {};
  let rawData = '';

  req.on('data', chunk => {
    rawData += chunk;
  });

  req.on('end', async () => {
    try {
      if (rawData) {
        body = JSON.parse(rawData);
      }

      const {
        appointment_id,
        channel
      } = body;

      if (!appointment_id) {
        return sendError(
          res,
          400,
          'appointment_id is required'
        );
      }

      const appointments = await getAllAppointments();

      const appointment = appointments.find(
        item => item.id === appointment_id
      );

      if (!appointment) {
        return sendError(
          res,
          404,
          'Appointment record not found'
        );
      }

      const result = await sendAppointmentReminder(
        appointment,
        channel || null,
        false
      );

      return sendSuccess(
        res,
        result,
        `Reminder dispatched via ${
          channel || 'configured channel'
        }`
      );
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  });
}


// ============================================================
// PREVIEW REMINDER
// ============================================================

export async function handlePreviewReminder(req, res) {
  let body = {};
  let rawData = '';

  req.on('data', chunk => {
    rawData += chunk;
  });

  req.on('end', async () => {
    try {
      if (rawData) {
        body = JSON.parse(rawData);
      }

      const {
        appointment_id
      } = body;

      const appointments = await getAllAppointments();

      let appointment = appointments.find(
        item => item.id === appointment_id
      );

      // Use first appointment if no ID was supplied
      if (!appointment && appointments.length > 0) {
        appointment = appointments[0];
      }

      if (!appointment) {
        return sendError(
          res,
          404,
          'No appointment available for preview'
        );
      }

      const emailData =
        generateEmailTemplate(appointment);

      const smsData =
        generateSmsTemplate(appointment);

      return sendSuccess(res, {
        appointment,
        email: emailData,
        sms: smsData
      });
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  });
}

