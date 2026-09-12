import { LedgerEntry } from "../models/index.js";

export async function createLedgerEntryOnce({
  paymentId,
  taskId,
  userId,
  entryType,
  amount,
  direction,
  reference,
  transaction,
}) {
  const [entry] = await LedgerEntry.findOrCreate({
    where: {
      payment_id: paymentId,
      entry_type: entryType,
    },

    defaults: {
      user_id: userId,
      task_id: taskId,
      payment_id: paymentId,
      entry_type: entryType,
      amount,
      direction,
      reference,
    },

    transaction,
  });

  return entry;
}