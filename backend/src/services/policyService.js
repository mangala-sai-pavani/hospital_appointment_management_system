/**
 * CarePulse Hospital Policy & Financial Rule Engine
 * Configurable business rules for rescheduling, cancellations, refunds, and audit logging.
 */

import { mockData } from '../utils/mockStore.js';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

// Default Fee Rules Configuration (Hours before appointment -> Fee Percentage)
export const DEFAULT_RESCHEDULE_RULES = {
  MORE_THAN_24_HOURS: 10, // 10% fee
  HOURS_12_TO_24: 25,     // 25% fee
  HOURS_2_TO_12: 50,      // 50% fee
  LESS_THAN_2_HOURS: 75,   // 75% fee
  HOSPITAL_OR_DOCTOR_CANCEL: 0 // 0% fee (100% refund)
};

/**
 * Calculates the rescheduling/cancellation fee and refund percentage based on appointment time.
 */
export function calculateFeeAndRefund(appointmentDateStr, appointmentTimeStr, totalFee = 0, isHospitalInitiated = false) {
  if (isHospitalInitiated) {
    return {
      hoursRemaining: 999,
      feePercentage: 0,
      refundPercentage: 100,
      feeAmount: 0,
      refundAmount: Number(totalFee) || 0,
      reason: '100% Full Refund due to Hospital / Doctor Unavailability or Admin Override'
    };
  }

  const aptDateTime = new Date(`${appointmentDateStr}T${appointmentTimeStr || '09:00:00'}`);
  const now = new Date();
  const diffMs = aptDateTime.getTime() - now.getTime();
  const hoursRemaining = diffMs / (1000 * 60 * 60);

  let feePercentage = DEFAULT_RESCHEDULE_RULES.MORE_THAN_24_HOURS;

  if (hoursRemaining < 2) {
    feePercentage = DEFAULT_RESCHEDULE_RULES.LESS_THAN_2_HOURS;
  } else if (hoursRemaining < 12) {
    feePercentage = DEFAULT_RESCHEDULE_RULES.HOURS_2_TO_12;
  } else if (hoursRemaining < 24) {
    feePercentage = DEFAULT_RESCHEDULE_RULES.HOURS_12_TO_24;
  } else {
    feePercentage = DEFAULT_RESCHEDULE_RULES.MORE_THAN_24_HOURS;
  }

  const refundPercentage = 100 - feePercentage;
  const baseFee = Number(totalFee) || 0;
  const feeAmount = Number(((baseFee * feePercentage) / 100).toFixed(2));
  const refundAmount = Number(((baseFee * refundPercentage) / 100).toFixed(2));

  return {
    hoursRemaining: Math.max(0, Math.round(hoursRemaining * 10) / 10),
    feePercentage,
    refundPercentage,
    feeAmount,
    refundAmount,
    reason: `Notice period: ${Math.max(0, Math.round(hoursRemaining))} hrs. Standard processing fee of ${feePercentage}% applied.`
  };
}

/**
 * Records an Audit Log for tracking all system overrides, cancellations, and status changes.
 */
export async function createAuditLog({ action, performed_by, target_id, details }) {
  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    action,
    performed_by: performed_by || 'SYSTEM',
    target_id: target_id || null,
    details: typeof details === 'object' ? JSON.stringify(details) : String(details),
    timestamp: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('audit_logs').insert([logEntry]);
    } catch (err) {
      console.warn('Supabase audit log insert fallback to mock:', err.message);
      if (!mockData.audit_logs) mockData.audit_logs = [];
      mockData.audit_logs.unshift(logEntry);
    }
  } else {
    if (!mockData.audit_logs) mockData.audit_logs = [];
    mockData.audit_logs.unshift(logEntry);
  }
  return logEntry;
}

/**
 * Records a financial refund record for accounting and panel presentation.
 */
export async function createRefundRecord({ appointment_id, patient_id, original_amount, refund_amount, fee_amount, reason }) {
  const refundEntry = {
    id: `ref-${Date.now()}`,
    appointment_id,
    patient_id,
    original_amount: Number(original_amount) || 0,
    refund_amount: Number(refund_amount) || 0,
    fee_amount: Number(fee_amount) || 0,
    reason: reason || 'Appointment Reschedule / Cancellation Refund',
    status: 'PROCESSED',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('refunds').insert([refundEntry]);
    } catch (err) {
      console.warn('Supabase refund record fallback to mock:', err.message);
      if (!mockData.refunds) mockData.refunds = [];
      mockData.refunds.unshift(refundEntry);
    }
  } else {
    if (!mockData.refunds) mockData.refunds = [];
    mockData.refunds.unshift(refundEntry);
  }
  return refundEntry;
}
