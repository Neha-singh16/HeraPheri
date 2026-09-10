import {
  createRating,
  getTaskRatings,
  getUserReputation,
  getMyReputation,
} from "../services/ratingService.js";

export async function createRatingController(req, res) {
  try {
    const { taskId } = req.params;

    const { rating, review } = req.body;

    const createdRating = await createRating({
      taskId,

      reviewerId: req.user.id,

      rating,

      review,
    });

    return res.status(201).json({
      success: true,

      message: "Rating submitted successfully.",

      data: createdRating,
    });
  } catch (error) {
    console.error("Create rating error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTaskRatingsController(req, res) {
  try {
    const ratings = await getTaskRatings(req.params.taskId);

    return res.status(200).json({
      success: true,

      data: ratings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getUserReputationController(req, res) {
  try {
    const reputation = await getUserReputation(req.params.userId);

    return res.status(200).json({
      success: true,

      data: reputation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMyReputationController(req, res) {
  try {
    const reputation = await getMyReputation(req.user.id);

    return res.status(200).json({
      success: true,

      data: reputation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
