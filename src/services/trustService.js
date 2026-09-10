import { Verification, ExecutorProfile, Rating } from "../models/index.js";

const MAX_EXPERIENCE_TASKS = 50;

export async function getTrustProfile(userId) {
  const profile = await ExecutorProfile.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!profile) {
    throw new Error("Executor profile not found.");
  }

  return profile;
}

// Calculate reputation from actual
// ratings received by this user.
async function getRatingScore(userId) {
  const ratings = await Rating.findAll({
    where: {
      reviewed_user_id: userId,
    },

    attributes: ["rating"],
  });

  if (ratings.length === 0) {
    return {
      averageRating: 0,
      ratingCount: 0,
      score: 0,
    };
  }

  const total = ratings.reduce((sum, item) => sum + Number(item.rating), 0);

  const averageRating = total / ratings.length;

  /*
    Don't give a brand-new user
    the full reputation score from
    a single rating.

    Reputation confidence grows
    with more completed ratings.
  */
  const confidence = Math.min(ratings.length / 10, 1);

  const normalizedRating = (averageRating / 5) * 25;

  const score = normalizedRating * confidence;

  return {
    averageRating,
    ratingCount: ratings.length,
    score,
  };
}

// Recalculate an Executor's trust score.
export async function recalculateTrustScore(userId) {
  const profile = await ExecutorProfile.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!profile) {
    throw new Error("Executor profile not found.");
  }

  const verification = await Verification.findOne({
    where: {
      user_id: userId,

      verification_type: "IDENTITY",
    },
  });

  // -------------------------------------------
  // 1. Identity
  // -------------------------------------------

  const verificationScore = verification?.status === "VERIFIED" ? 15 : 0;

  // -------------------------------------------
  // 2. Completion
  // -------------------------------------------

  const completionRate = Math.max(
    0,
    Math.min(100, Number(profile.completion_rate) || 0),
  );

  const completionScore = completionRate * 0.25;

  // -------------------------------------------
  // 3. On-time
  // -------------------------------------------

  const onTimeRate = Math.max(
    0,
    Math.min(100, Number(profile.on_time_rate) || 0),
  );

  const onTimeScore = onTimeRate * 0.2;

  // -------------------------------------------
  // 4. Experience
  // -------------------------------------------

  const completedTasks = Math.max(0, Number(profile.completed_tasks) || 0);

  const experienceRatio = Math.min(completedTasks / MAX_EXPERIENCE_TASKS, 1);

  const experienceScore = experienceRatio * 15;

  // -------------------------------------------
  // 5. Reputation
  // -------------------------------------------

  const reputation = await getRatingScore(userId);

  // -------------------------------------------
  // Final score
  // -------------------------------------------

  const trustScore =
    verificationScore +
    completionScore +
    onTimeScore +
    experienceScore +
    reputation.score;

  const finalScore = Math.max(0, Math.min(100, Number(trustScore.toFixed(2))));

  await profile.update({
    trust_score: finalScore,
  });

  return {
    profile,
    reputation,
    trustScore: finalScore,
  };
}
