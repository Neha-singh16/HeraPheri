import { Op } from "sequelize";

import sequelize from "../config/database.js";

import { Rating, Task, TaskAssignment, User } from "../models/index.js";
import { recalculateTrustScore } from "./trustService.js";
function validateRatingValue(rating) {
  const value = Number(rating);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  return value;
}

// Determine who the current user is
// allowed to review.
async function getReviewTarget({ task, userId, transaction }) {
  // Requester reviews Executor.
  if (task.requester_id === userId) {
    const assignment = await TaskAssignment.findOne({
      where: {
        task_id: task.id,
        status: "COMPLETED",
      },
      transaction,
    });

    if (!assignment) {
      throw new Error("Completed assignment not found.");
    }

    return assignment.executor_id;
  }

  // Executor reviews Requester.
  const assignment = await TaskAssignment.findOne({
    where: {
      task_id: task.id,
      executor_id: userId,
      status: "COMPLETED",
    },
    transaction,
  });

  if (!assignment) {
    throw new Error("You are not a completed participant in this task.");
  }

  return task.requester_id;
}

// Create one rating for a completed task.
export async function createRating({ taskId, reviewerId, rating, review }) {
  const transaction = await sequelize.transaction();

  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
      },

      transaction,

      lock: transaction.LOCK.UPDATE,
    });

    if (!task) {
      throw new Error("Task not found.");
    }

    if (task.status !== "COMPLETED") {
      throw new Error("Ratings can only be submitted for completed tasks.");
    }

    if (task.requester_id === reviewerId) {
      // Requester can review the completed Executor.
    } else {
      const assignment = await TaskAssignment.findOne({
        where: {
          task_id: taskId,
          executor_id: reviewerId,
          status: "COMPLETED",
        },

        transaction,
      });

      if (!assignment) {
        throw new Error("You are not a participant in this task.");
      }
    }

    const reviewedUserId = await getReviewTarget({
      task,
      userId: reviewerId,
      transaction,
    });

    if (reviewerId === reviewedUserId) {
      throw new Error("You cannot rate yourself.");
    }

    const ratingValue = validateRatingValue(rating);

    const existingRating = await Rating.findOne({
      where: {
        task_id: taskId,
        reviewer_id: reviewerId,
      },

      transaction,

      lock: transaction.LOCK.UPDATE,
    });

    if (existingRating) {
      throw new Error("You have already rated this task.");
    }

    const createdRating = await Rating.create(
      {
        task_id: taskId,

        reviewer_id: reviewerId,

        reviewed_user_id: reviewedUserId,

        rating: ratingValue,

        review: review?.trim() || null,
      },

      {
        transaction,
      },
    );

    await transaction.commit();
    await recalculateTrustScore(reviewedUserId);

    return createdRating;
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}

// Get ratings for a particular task.
export async function getTaskRatings(taskId) {
  return Rating.findAll({
    where: {
      task_id: taskId,
    },

    include: [
      {
        model: User,

        as: "reviewer",

        attributes: ["id", "name"],
      },

      {
        model: User,

        as: "reviewedUser",

        attributes: ["id", "name"],
      },
    ],

    order: [["created_at", "DESC"]],
  });
}

// Get reputation summary for a user.
export async function getUserReputation(userId) {
  const ratings = await Rating.findAll({
    where: {
      reviewed_user_id: userId,
    },

    attributes: ["rating"],
  });

  const count = ratings.length;

  if (count === 0) {
    return {
      averageRating: 0,
      ratingCount: 0,
      distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  const total = ratings.reduce((sum, item) => sum + Number(item.rating), 0);

  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  ratings.forEach((item) => {
    const value = Number(item.rating);

    distribution[value] += 1;
  });

  return {
    averageRating: Number((total / count).toFixed(2)),

    ratingCount: count,

    distribution,
  };
}

// Get the logged-in user's
// reputation.
export async function getMyReputation(userId) {
  return getUserReputation(userId);
}
