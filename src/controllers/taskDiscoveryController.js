import {
  getNearbyTasks,
} from "../services/taskDiscoveryService.js";

export async function getNearbyTasksController(
  req,
  res
) {
  try {
    const {
      latitude,
      longitude,
      radiusKm,
      category,
    } = req.query;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required.",
      });
    }

    const tasks =
      await getNearbyTasks({
        executorId: req.user.id,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusKm: Number(radiusKm) || 5,
        category,
      });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error(
      "Nearby task error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}