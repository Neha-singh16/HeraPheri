import { User } from "../models/index.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
    }

    const user = await User.findByPk(payload.sub, {
      attributes: {
        exclude: ["password_hash"],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    if (user.account_status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is not active.",
      });
    }

    // Make authenticated user available to later middleware/controllers.
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
}

export function requireAccountStatus(
  ...allowedStatuses
) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !allowedStatuses.includes(
        req.user.account_status
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  };
}


export function requireAdmin(
  req,
  res,
  next
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
}