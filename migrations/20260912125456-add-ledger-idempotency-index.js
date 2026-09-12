'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface) {
  await queryInterface.addIndex(
    "ledger_entries",
    ["payment_id", "entry_type"],
    {
      name: "uniq_ledger_payment_entry_type",
      unique: true,
    },
  );
}

export async function down(queryInterface) {
  await queryInterface.removeIndex(
    "ledger_entries",
    "uniq_ledger_payment_entry_type",
  );
}

// One caveat

// This index means a payment can have only one entry of each type.

// That's exactly what we want for:

// PAYMENT_HELD
// EXECUTOR_EARNING
// PLATFORM_FEE
// REFUND

// For future multiple partial adjustments, we'd change the design deliberately instead of allowing accidental duplicates.