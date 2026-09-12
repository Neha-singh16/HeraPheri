export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      JSON.stringify({
        type: "http_request",
        requestId: req.requestId,

        method: req.method,

        path: req.originalUrl,

        status: res.statusCode,

        durationMs: duration,

        userId: req.user?.id || null,

        timestamp: new Date().toISOString(),
      }),
    );
  });

  next();
}
