export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
    requestId: req.requestId || null,
  });
}

export function errorHandler(error, req, res, next) {
  console.error(
    JSON.stringify({
      type: "http_error",

      requestId: req.requestId || null,

      method: req.method,

      path: req.originalUrl,

      userId: req.user?.id || null,

      message: error.message,

      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,

      timestamp: new Date().toISOString(),
    }),
  );

  /*
    CORS errors
  */
  if (error.message === "Origin not allowed by CORS.") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed.",
      requestId: req.requestId || null,
    });
  }

  /*
    Unknown/unhandled error.
  */
  return res.status(500).json({
    success: false,
    message: "Something went wrong.",
    requestId: req.requestId || null,
  });
}
