export function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function sendError(res, message = 'An error occurred', statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
}
