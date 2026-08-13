```javascript
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';

// ============================================================
// NOTIFICATION SETTINGS
// ============================================================

let reminderSettings = {
  enabled: true,
  leadHours: 24,
  channels: 'BOTH',
  autoCheckIntervalMinutes: 5,
  emailSender: 'notifications@carepulse-hospital.com',
  smsSenderId: 'CAREPULSE',
  hospitalName: 'CarePulse Medical Center',
  hospitalAddress: '100 Health Science Blvd, Suite 400',
  hospitalPhone: '+1 (800) 555-CARE',
  lastRunAt: null,
  totalSentCount: 0
};

// ============================================================
// IN-MEMORY LOGS
// ============================================================

const notificationLogs = [];

// ============================================================
// HELPERS
// ============================================================

function ensureMockNotifications() {
  if (!mockData.notifications) {
    mockData.notifications = [];
  }

  return mockData.notifications;
}

function generateId(prefix = 'notif') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}

// -------------------- PATIENT --------------------

function getPatientName(apt) {
  return (
    apt?.patients?.profiles?.name ||
    apt?.patients?.name ||
    null
  );
}

function getPatientEmail(apt) {
  return (
    apt?.patients?.profiles?.email ||
    apt?.patients?.email ||
    null
  );
}

function getPatientPhone(apt) {
  return (
    apt?.patients?.phone ||
    apt?.patients?.profiles?.phone ||
    null
  );
}

function getPatientProfileId(apt) {
  return (
    apt?.patients?.profile_id ||
    apt?.patients?.profiles?.id ||
    null
  );
}

// -------------------- DOCTOR --------------------

function getDoctorName(apt) {
  return (
    apt?.doctors?.profiles?.name ||
    apt?.doctors?.name ||
    null
  );
}

function getDoctorEmail(apt) {
  return (
    apt?.doctors?.profiles?.email ||
    apt?.doctors?.email ||
    null
  );
}

function getDoctorPhone(apt) {
  return (
    apt?.doctors?.phone ||
    apt?.doctors?.profiles?.phone ||
    null
  );
}

function getDoctorProfileId(apt) {
  return (
    apt?.doctors?.profile_id ||
    apt?.doctors?.profiles?.id ||
    null
  );
}

function getDepartment(apt) {
  return (
    apt?.departments?.name ||
    apt?.doctors?.departments?.name ||
    'Clinical Care'
  );
}

// ============================================================
// SETTINGS
// ============================================================

export function getNotificationSettings() {
  return { ...reminderSettings };
}

export function updateNotificationSettings(newSettings = {}) {
  reminderSettings = {
    ...reminderSettings,
    ...newSettings
  };

  return { ...reminderSettings };
}

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export async function getNotifications(userId = null) {
  try {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (!error) {
        return data || [];
      }

      console.warn(
        '[NotificationService] Supabase notification fetch failed:',
        error.message
      );
    }

    const notifications = ensureMockNotifications();

    if (userId) {
      return notifications.filter(
        notification => notification.user_id === userId
      );
    }

    return [...notifications].sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );
  } catch (error) {
    console.error(
      '[NotificationService] getNotifications error:',
      error.message
    );

    return [];
  }
}

// ============================================================
// GET LOGS
// ============================================================

export function getNotificationLogs() {
  return [...notificationLogs].reverse();
}

// ============================================================
// ADD IN-APP NOTIFICATION
// ============================================================

export async function addNotification({
  user_id,
  title,
  message,
  type = 'INFO'
}) {
  if (!user_id) {
    return null;
  }

  const notification = {
    id: generateId(),
    user_id,
    title,
    message,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (!error) {
        return data || notification;
      }

      console.warn(
        '[NotificationService] Supabase notification insert failed:',
        error.message
      );
    } catch (error) {
      console.warn(
        '[NotificationService] Supabase notification insert error:',
        error.message
      );
    }
  }

  const notifications = ensureMockNotifications();

  notifications.unshift(notification);

  return notification;
}

// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================

export async function markNotificationAsRead(
  notificationId,
  userId = null
) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query
        .select()
        .single();

      if (!error) {
        return data;
      }
    } catch (error) {
      console.warn(
        '[NotificationService] Failed to mark notification as read:',
        error.message
      );
    }
  }

  const notifications = ensureMockNotifications();

  const notification = notifications.find(
    item =>
      item.id === notificationId &&
      (!userId || item.user_id === userId)
  );

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.is_read = true;

  return notification;
}

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

export async function markAllNotificationsAsRead(userId) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (!error) {
        return { success: true };
      }
    } catch (error) {
      console.warn(
        '[NotificationService] Failed to mark all as read:',
        error.message
      );
    }
  }

  const notifications = ensureMockNotifications();

  notifications.forEach(notification => {
    if (
      (!userId || notification.user_id === userId) &&
      !notification.is_read
    ) {
      notification.is_read = true;
    }
  });

  return { success: true };
}

// ============================================================
// DELETE NOTIFICATION
// ============================================================

export async function deleteNotification(
  notificationId,
  userId = null
) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (!error) {
        return { success: true };
      }
    } catch (error) {
      console.warn(
        '[NotificationService] Failed to delete notification:',
        error.message
      );
    }
  }

  const notifications = ensureMockNotifications();

  const index = notifications.findIndex(
    item =>
      item.id === notificationId &&
      (!userId || item.user_id === userId)
  );

  if (index === -1) {
    throw new Error('Notification not found');
  }

  notifications.splice(index, 1);

  return { success: true };
}

// ============================================================
// EMAIL TEMPLATE - PATIENT
// ============================================================

export function generatePatientEmailTemplate(apt) {
  const patientName = getPatientName(apt) || 'Patient';
  const doctorName = getDoctorName(apt) || 'Your Doctor';
  const department = getDepartment(apt);

  const date = apt?.appointment_date || 'Tomorrow';
  const time = apt?.appointment_time || 'Scheduled Time';

  const subject =
    `Appointment Reminder: 24 Hours to Your Visit with ${doctorName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Appointment Reminder</title>
</head>

<body style="
  margin:0;
  padding:20px;
  background:#f4f7f6;
  font-family:Arial,sans-serif;
  color:#212529;
">

<div style="
  max-width:600px;
  margin:auto;
  background:white;
  border-radius:12px;
  overflow:hidden;
  border:1px solid #e2e8f0;
">

  <div style="
    background:#0d9488;
    color:white;
    padding:24px;
    text-align:center;
  ">
    <h1 style="margin:0;">
      ${reminderSettings.hospitalName}
    </h1>

    <p>24-Hour Appointment Reminder</p>
  </div>

  <div style="padding:30px 24px;">

    <h2>Hello ${patientName},</h2>

    <p>
      This is a reminder that you have an appointment
      scheduled within the next 24 hours.
    </p>

    <div style="
      background:#f8fafc;
      border:1px solid #cbd5e1;
      border-left:5px solid #0d9488;
      padding:20px;
      border-radius:8px;
      margin:20px 0;
    ">

      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Department:</strong> ${department}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Location:</strong> ${reminderSettings.hospitalAddress}</p>

    </div>

    <p>
      Please arrive 15 minutes before your appointment.
    </p>

    <p>
      For rescheduling or cancellation, contact:
      ${reminderSettings.hospitalPhone}
    </p>

  </div>

  <div style="
    background:#f1f5f9;
    padding:20px;
    text-align:center;
    font-size:12px;
    color:#64748b;
  ">
    ${reminderSettings.hospitalName}
  </div>

</div>

</body>
</html>
`;

  return {
    subject,
    html
  };
}

// ============================================================
// EMAIL TEMPLATE - DOCTOR
// ============================================================

export function generateDoctorEmailTemplate(apt) {
  const doctorName = getDoctorName(apt) || 'Doctor';
  const patientName = getPatientName(apt) || 'Patient';
  const department = getDepartment(apt);

  const date = apt?.appointment_date || 'Tomorrow';
  const time = apt?.appointment_time || 'Scheduled Time';

  const subject =
    `24-Hour Appointment Reminder: ${patientName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Doctor Appointment Reminder</title>
</head>

<body style="
  margin:0;
  padding:20px;
  background:#f4f7f6;
  font-family:Arial,sans-serif;
  color:#212529;
">

<div style="
  max-width:600px;
  margin:auto;
  background:white;
  border-radius:12px;
  overflow:hidden;
  border:1px solid #e2e8f0;
">

  <div style="
    background:#0d9488;
    color:white;
    padding:24px;
    text-align:center;
  ">
    <h1 style="margin:0;">
      ${reminderSettings.hospitalName}
    </h1>

    <p>Doctor Appointment Reminder</p>
  </div>

  <div style="padding:30px 24px;">

    <h2>Hello ${doctorName},</h2>

    <p>
      This is a reminder that you have an appointment
      scheduled within the next 24 hours.
    </p>

    <div style="
      background:#f8fafc;
      border:1px solid #cbd5e1;
      border-left:5px solid #0d9488;
      padding:20px;
      border-radius:8px;
      margin:20px 0;
    ">

      <p><strong>Patient:</strong> ${patientName}</p>
      <p><strong>Department:</strong> ${department}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>

    </div>

    <p>
      Please review the appointment details before the scheduled time.
    </p>

  </div>

  <div style="
    background:#f1f5f9;
    padding:20px;
    text-align:center;
    font-size:12px;
    color:#64748b;
  ">
    ${reminderSettings.hospitalName}
  </div>

</div>

</body>
</html>
`;

  return {
    subject,
    html
  };
}

// ============================================================
// SMS TEMPLATE - PATIENT
// ============================================================

export function generatePatientSmsTemplate(apt) {
  const patientName = getPatientName(apt) || 'Patient';
  const doctorName = getDoctorName(apt) || 'your doctor';

  const date = apt?.appointment_date || 'tomorrow';
  const time = apt?.appointment_time || 'your scheduled time';

  return {
    body:
      `[${reminderSettings.hospitalName}] ` +
      `Hi ${patientName}, your appointment with ${doctorName} ` +
      `is scheduled for ${date} at ${time}. ` +
      `Please arrive 15 minutes early. ` +
      `Call ${reminderSettings.hospitalPhone} for assistance.`
  };
}

// ============================================================
// SMS TEMPLATE - DOCTOR
// ============================================================

export function generateDoctorSmsTemplate(apt) {
  const doctorName = getDoctorName(apt) || 'Doctor';
  const patientName = getPatientName(apt) || 'Patient';

  const date = apt?.appointment_date || 'tomorrow';
  const time = apt?.appointment_time || 'your scheduled time';

  return {
    body:
      `[${reminderSettings.hospitalName}] ` +
      `Dr. ${doctorName}, reminder: patient ${patientName} ` +
      `has an appointment with you on ${date} at ${time}.`
  };
}

// ============================================================
// CREATE NOTIFICATION LOG
// ============================================================

function createNotificationLog({
  apt,
  recipientType,
  recipientName,
  recipientEmail,
  recipientPhone,
  channel,
  subject,
  messageBody,
  isAutomated
}) {
  const log = {
    id: generateId('log'),
    appointment_id: apt.id,

    recipient_type: recipientType,

    recipient_name: recipientName,
    recipient_email: recipientEmail,
    recipient_phone: recipientPhone,

    patient_name: getPatientName(apt),
    patient_email: getPatientEmail(apt),
    patient_phone: getPatientPhone(apt),

    doctor_name: getDoctorName(apt),

    department: getDepartment(apt),

    appointment_date: apt.appointment_date,
    appointment_time: apt.appointment_time,

    channel,
    status: 'DELIVERED',

    subject,
    message_body,

    sent_at: new Date().toISOString(),

    is_automated: isAutomated
  };

  notificationLogs.push(log);

  return log;
}

// ============================================================
// SEND EMAIL/SMS TO ONE RECIPIENT
// ============================================================

async function sendToRecipient({
  apt,
  recipientType,
  name,
  email,
  phone,
  emailContent,
  smsContent,
  channel,
  isAutomated
}) {
  const sentLogs = [];

  // ---------------- EMAIL ----------------

  if (channel === 'EMAIL' || channel === 'BOTH') {
    if (email) {
      const emailLog = createNotificationLog({
        apt,
        recipientType,
        recipientName: name,
        recipientEmail: email,
        recipientPhone: phone,
        channel: 'EMAIL',
        subject: emailContent.subject,
        messageBody: emailContent.html,
        isAutomated
      });

      sentLogs.push(emailLog);

      console.log(
        `[NotificationService] EMAIL reminder prepared for ${recipientType}: ${email}`
      );
    } else {
      console.warn(
        `[NotificationService] No email found for ${recipientType}.`
      );
    }
  }

  // ---------------- SMS ----------------

  if (channel === 'SMS' || channel === 'BOTH') {
    if (phone) {
      const smsLog = createNotificationLog({
        apt,
        recipientType,
        recipientName: name,
        recipientEmail: email,
        recipientPhone: phone,
        channel: 'SMS',
        subject: 'Appointment Reminder',
        messageBody: smsContent.body,
        isAutomated
      });

      sentLogs.push(smsLog);

      console.log(
        `[NotificationService] SMS reminder prepared for ${recipientType}: ${phone}`
      );
    } else {
      console.warn(
        `[NotificationService] No phone number found for ${recipientType}.`
      );
    }
  }

  return sentLogs;
}

// ============================================================
// SEND APPOINTMENT REMINDER
// ============================================================

export async function sendAppointmentReminder(
  apt,
  targetChannel = null,
  isAutomated = false
) {
  if (!apt?.id) {
    throw new Error('Invalid appointment');
  }

  const channel =
    targetChannel || reminderSettings.channels;

  const patientName = getPatientName(apt);
  const patientEmail = getPatientEmail(apt);
  const patientPhone = getPatientPhone(apt);

  const doctorName = getDoctorName(apt);
  const doctorEmail = getDoctorEmail(apt);
  const doctorPhone = getDoctorPhone(apt);

  // ---------------- TEMPLATES ----------------

  const patientEmailContent =
    generatePatientEmailTemplate(apt);

  const doctorEmailContent =
    generateDoctorEmailTemplate(apt);

  const patientSmsContent =
    generatePatientSmsTemplate(apt);

  const doctorSmsContent =
    generateDoctorSmsTemplate(apt);

  // ---------------- PATIENT ----------------

  const patientLogs = await sendToRecipient({
    apt,
    recipientType: 'PATIENT',
    name: patientName,
    email: patientEmail,
    phone: patientPhone,
    emailContent: patientEmailContent,
    smsContent: patientSmsContent,
    channel,
    isAutomated
  });

  // ---------------- DOCTOR ----------------

  const doctorLogs = await sendToRecipient({
    apt,
    recipientType: 'DOCTOR',
    name: doctorName,
    email: doctorEmail,
    phone: doctorPhone,
    emailContent: doctorEmailContent,
    smsContent: doctorSmsContent,
    channel,
    isAutomated
  });

  const sentLogs = [
    ...patientLogs,
    ...doctorLogs
  ];

  // ==========================================================
  // UPDATE APPOINTMENT IN SUPABASE
  // ==========================================================

  const reminderSentAt =
    new Date().toISOString();

  apt.reminder_sent_24h = true;
  apt.reminder_sent_at = reminderSentAt;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          reminder_sent_24h: true,
          reminder_sent_at: reminderSentAt
        })
        .eq('id', apt.id);

      if (error) {
        console.warn(
          '[NotificationService] Appointment update failed:',
          error.message
        );
      }
    } catch (error) {
      console.warn(
        '[NotificationService] Appointment update error:',
        error.message
      );
    }
  }

  // ==========================================================
  // PATIENT IN-APP NOTIFICATION
  // ==========================================================

  const patientProfileId =
    getPatientProfileId(apt);

  if (patientProfileId) {
    await addNotification({
      user_id: patientProfileId,

      title: '24-Hour Appointment Reminder',

      message:
        `Your appointment with ${doctorName || 'your doctor'} ` +
        `is tomorrow (${apt.appointment_date}) ` +
        `at ${apt.appointment_time}.`,

      type: 'INFO'
    });
  }

  // ==========================================================
  // DOCTOR IN-APP NOTIFICATION
  // ==========================================================

  const doctorProfileId =
    getDoctorProfileId(apt);

  if (doctorProfileId) {
    await addNotification({
      user_id: doctorProfileId,

      title: '24-Hour Appointment Reminder',

      message:
        `You have an appointment with ` +
        `${patientName || 'a patient'} ` +
        `tomorrow (${apt.appointment_date}) ` +
        `at ${apt.appointment_time}.`,

      type: 'INFO'
    });
  }

  reminderSettings.totalSentCount +=
    sentLogs.length;

  return {
    success: true,

    sentCount: sentLogs.length,

    patientNotifications: patientLogs.length,

    doctorNotifications: doctorLogs.length,

    logs: sentLogs
  };
}

// ============================================================
// AUTOMATED 24-HOUR REMINDERS
// ============================================================

export async function checkAndSend24hReminders() {
  if (!reminderSettings.enabled) {
    return {
      checked: 0,
      sent: 0,
      status: 'DISABLED'
    };
  }

  reminderSettings.lastRunAt =
    new Date().toISOString();

  const now = new Date();

  const twentyFourHoursFromNow =
    new Date(
      now.getTime() +
      reminderSettings.leadHours *
        60 *
        60 *
        1000
    );

  const todayStr =
    now.toISOString().split('T')[0];

  const tomorrowStr =
    twentyFourHoursFromNow
      .toISOString()
      .split('T')[0];

  let appointmentsToCheck = [];

  // ==========================================================
  // SUPABASE
  // ==========================================================

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(
            *,
            profiles(*)
          ),
          doctors(
            *,
            profiles(*)
          ),
          departments(*)
        `)
        .in('appointment_date', [
          todayStr,
          tomorrowStr
        ])
        .neq('status', 'CANCELLED')
        .or(
          'reminder_sent_24h.is.null,reminder_sent_24h.eq.false'
        );

      if (error) {
        console.error(
          '[NotificationService] Reminder query failed:',
          error.message
        );
      } else {
        appointmentsToCheck = data || [];
      }
    } catch (error) {
      console.error(
        '[NotificationService] Reminder query failed:',
        error.message
      );
    }
  }

  // ==========================================================
  // MOCK DATA
  // ==========================================================

  else {
    appointmentsToCheck =
      (mockData.appointments || []).filter(
        apt => {
          return (
            (
              apt.appointment_date === todayStr ||
              apt.appointment_date === tomorrowStr
            ) &&
            apt.status !== 'CANCELLED' &&
            !apt.reminder_sent_24h
          );
        }
      );
  }

  // ==========================================================
  // PROCESS APPOINTMENTS
  // ==========================================================

  let totalSent = 0;

  const results = [];

  for (const appointment of appointmentsToCheck) {
    try {
      const result =
        await sendAppointmentReminder(
          appointment,
          reminderSettings.channels,
          true
        );

      totalSent += result.sentCount;

      results.push({
        appointment_id: appointment.id,

        patientNotifications:
          result.patientNotifications,

        doctorNotifications:
          result.doctorNotifications,

        result
      });

    } catch (error) {
      console.error(
        `[NotificationService] Reminder failed for appointment ${appointment.id}:`,
        error.message
      );

      results.push({
        appointment_id: appointment.id,
        error: error.message
      });
    }
  }

  return {
    targetDate: tomorrowStr,

    checkedCount:
      appointmentsToCheck.length,

    sentCount: totalSent,

    lastRunAt:
      reminderSettings.lastRunAt,

    results
  };
}

// ============================================================
// AUTOMATED SCHEDULER
// ============================================================

let timerId = null;

export function startAutomatedReminderScheduler() {
  if (timerId) {
    clearInterval(timerId);
  }

  const intervalMinutes =
    Number(
      reminderSettings.autoCheckIntervalMinutes
    ) || 5;

  const intervalMs =
    intervalMinutes * 60 * 1000;

  console.log(
    `[NotificationService] 24h Reminder Scheduler started. ` +
    `Interval: ${intervalMinutes} minutes`
  );

  // Run once shortly after server startup
  setTimeout(() => {
    checkAndSend24hReminders()
      .then(result => {
        console.log(
          '[NotificationService] Startup reminder scan:',
          result
        );
      })
      .catch(error => {
        console.error(
          '[NotificationService] Startup reminder error:',
          error.message
        );
      });
  }, 3000);

  // Continue automatically
  timerId = setInterval(() => {
    checkAndSend24hReminders()
      .then(result => {
        console.log(
          '[NotificationService] Scheduled reminder scan:',
          result
        );
      })
      .catch(error => {
        console.error(
          '[NotificationService] Scheduled reminder error:',
          error.message
        );
      });
  }, intervalMs);
}

// ============================================================
// STOP SCHEDULER
// ============================================================

export function stopAutomatedReminderScheduler() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  console.log(
    '[NotificationService] Reminder scheduler stopped.'
  );
}
```
