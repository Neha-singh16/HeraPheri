import {
  registerLocalUser,
  loginLocalUser,
  loginWithGoogle,
  logoutUser,
  refreshAccessToken,
} from "../services/authService.js";

export async function registerController(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required.",
      });
    }

    const result = await registerLocalUser({
      name,
      email,
      phone,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    const result = await loginLocalUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

export async function googleLoginController(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required.",
      });
    }

    const result = await loginWithGoogle({ idToken });

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      data: result,
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
}

export async function logoutController(req, res) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
}

export async function refreshController(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const result = await refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}
