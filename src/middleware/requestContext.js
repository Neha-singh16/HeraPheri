import crypto from "crypto";

export function requestContext(
  req,
  res,
  next,
) {
  const requestId = crypto.randomUUID();

  req.requestId = requestId;

  res.setHeader(
    "X-Request-Id",
    requestId,
  );

  next();
}