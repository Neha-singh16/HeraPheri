import {
  getExecutorEarnings,
} from "../services/earningsService.js";

export async function getExecutorEarningsController(
  req,
  res,
) {
  try {
    const data =
      await getExecutorEarnings(
        req.user.id,
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get executor earnings error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load earnings.",
    });
  }
}