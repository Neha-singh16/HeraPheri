import rateLimit from "express-rate-limit";

const commonOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
};

/*
  Authentication endpoints are more sensitive because
  brute-force attempts happen here.
*/
export const authLimiter = rateLimit({
  ...commonOptions,

  windowMs: 15 * 60 * 1000,

  limit: 20,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

/*
  Payment endpoints need stricter protection.
*/
export const paymentLimiter = rateLimit({
  ...commonOptions,

  windowMs: 15 * 60 * 1000,

  limit: 30,

  message: {
    success: false,
    message: "Too many payment requests. Please try again later.",
  },
});

/*
  General API protection.
  Keep this relatively generous because your frontend
  makes multiple API requests during normal navigation.
*/
export const apiLimiter = rateLimit({
  ...commonOptions,

  windowMs: 15 * 60 * 1000,

  limit: 300,

  message: {
    success: false,
    message: "Too many requests. Please try again shortly.",
  },
});
