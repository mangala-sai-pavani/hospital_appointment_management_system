export function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

export function sendError(res, statusCode, message) {
  sendJSON(res, statusCode, {
    success: false,
    message: message || 'An unexpected error occurred'
  });
}

export function sendSuccess(res, data = {}, statusCode = 200) {
  sendJSON(res, statusCode, {
    success: true,
    data
  });
}
