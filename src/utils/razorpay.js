// import crypto from "crypto";

// export function verifyRazorpaySignature({
//   orderId,
//   paymentId,
//   signature,
// }) {
//   const body = `${orderId}|${paymentId}`;

//   const expectedSignature =
//     crypto
//       .createHmac(
//         "sha256",
//         process.env.RAZORPAY_KEY_SECRET
//       )
//       .update(body)
//       .digest("hex");

//   return (
//     expectedSignature === signature
//   );
// }


import crypto from "crypto";

export function verifyWebhookSignature(
  rawBody,
  signature
) {
  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_WEBHOOK_SECRET
    )
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}
// Frontend
//    ↓
// "I paid!"
//    ↓
// Backend
//    ↓
// Verify Razorpay signature
//    ↓
// Trust payment result