import {
  getTaskMatches,
} from "../services/matchingService.js";

export async function getTaskMatchesController(
  req,
  res
) {
  try {
    const {
      taskId,
    } = req.params;

    const {
      radiusKm,
      limit,
    } = req.query;

    const matches =
      await getTaskMatches({
        taskId,
        requesterId: req.user.id,
        radiusKm:
          radiusKm !== undefined
            ? Number(radiusKm)
            : 10,
        limit:
          limit !== undefined
            ? Number(limit)
            : 10,
      });

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error(
      "Task matching error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


