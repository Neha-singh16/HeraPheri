import { Op } from "sequelize";

import { LedgerEntry, Task } from "../models/index.js";

export async function getExecutorEarnings(userId) {
  const entries = await LedgerEntry.findAll({
    where: {
      user_id: userId,
      entry_type: "EXECUTOR_EARNING",
      direction: "CREDIT",
    },

    include: [
      {
        model: Task,
        as: "task",
        attributes: ["id", "title", "status", "reward_amount", "currency"],
      },
    ],

    order: [["created_at", "DESC"]],
  });

  const totalEarned = entries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );

  return {
    totalEarned,
    completedTasks: entries.length,
    entries,
  };
}
