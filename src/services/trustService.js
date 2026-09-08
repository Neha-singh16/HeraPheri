import {
  Verification,
  ExecutorProfile,
} from "../models/index.js";

const MAX_EXPERIENCE_TASKS = 50;

// Recalculate the Executor's trust score
// using system-controlled signals.
export async function recalculateTrustScore(
  userId
) {
  const profile =
    await ExecutorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

  if (!profile) {
    throw new Error(
      "Executor profile not found."
    );
  }

  const verification =
    await Verification.findOne({
      where: {
        user_id: userId,
        verification_type: "IDENTITY",
      },
    });

 // 1. Identity score
  const verificationScore =
    verification?.status === "VERIFIED"
      ? 20
      : 0;


  // 2. Completion score
  const completionRate =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          profile.completion_rate
        ) || 0
      )
    );

  const completionScore =
    completionRate * 0.30;


    // 3. On-time score
  const onTimeRate =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          profile.on_time_rate
        ) || 0
      )
    );

  const onTimeScore =
    onTimeRate * 0.25;


   // 4. Experience score
  const completedTasks =
    Math.max(
      0,
      Number(
        profile.completed_tasks
      ) || 0
    );

  const experienceRatio =
    Math.min(
      completedTasks /
        MAX_EXPERIENCE_TASKS,
      1
    );

  const experienceScore =
    experienceRatio * 25;


  // Final score
  const trustScore =
    verificationScore +
    completionScore +
    onTimeScore +
    experienceScore;

  // Keep score inside 0-100.
  const finalScore =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          trustScore.toFixed(2)
        )
      )
    );

  // Trust score is controlled by the system.
  await profile.update({
    trust_score: finalScore,
  });

  return profile;
}

export async function getTrustProfile(
  userId
) {
  const profile =
    await ExecutorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

  if (!profile) {
    throw new Error(
      "Executor profile not found."
    );
  }

  return profile;
}
