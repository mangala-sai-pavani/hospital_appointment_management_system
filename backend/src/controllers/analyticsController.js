
import {
  getDashboardAnalytics
} from '../services/analyticsService.js';

import {
  sendSuccess,
  sendError
} from '../utils/response.js';

export async function handleGetAnalytics(
  req,
  res,
  queryParams
) {
  try {
    const role =
      queryParams.get('role') || 'ADMIN';

    const userId =
      queryParams.get('userId');

    const analytics =
      await getDashboardAnalytics(
        role,
        userId
      );

    return sendSuccess(
      res,
      analytics
    );
  } catch (err) {
    console.error(
      '[AnalyticsController] Error:',
      err
    );

    return sendError(
      res,
      500,
      err.message
    );
  }
}

