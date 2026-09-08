
import {
  Verification,
} from "../models/index.js";

// Get the user's identity verification record.
// Create it if it does not exist yet.
export async function getOrCreateVerification(
  userId
) {
  let verification =
    await Verification.findOne({
      where: {
        user_id: userId,
        verification_type: "IDENTITY",
      },
    });

  if (!verification) {
    verification =
      await Verification.create({
        user_id: userId,
        verification_type: "IDENTITY",
        status: "PENDING",
      });
  }

  return verification;
}

// User starts or re-starts verification.
export async function startVerification(
  userId
) {
  const verification =
    await getOrCreateVerification(userId);

  if (
    verification.status === "VERIFIED"
  ) {
    throw new Error(
      "Identity is already verified."
    );
  }

  await verification.update({
    status: "PENDING",
    rejection_reason: null,
  });

  return verification;
}

// Admin/provider approves verification.
export async function approveVerification({
  userId,
  provider = "MANUAL",
}) {
  const verification =
    await getOrCreateVerification(userId);

  await verification.update({
    status: "VERIFIED",
    provider,
    rejection_reason: null,
    verified_at: new Date(),
  });

  return verification;
}

// Admin/provider rejects verification.
export async function rejectVerification({
  userId,
  reason,
  provider = "MANUAL",
}) {
  if (!reason?.trim()) {
    throw new Error(
      "Rejection reason is required."
    );
  }

  const verification =
    await getOrCreateVerification(userId);

  await verification.update({
    status: "REJECTED",
    provider,
    rejection_reason:
      reason.trim(),
    verified_at: null,
  });

  return verification;
}