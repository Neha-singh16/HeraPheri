import User from "./user.js";
import ExecutorProfile from "./executorprofile.js";
import Task from "./task.js";
import TaskAssignment from "./taskassignment.js";
import TaskEvent from "./taskevent.js";
import TaskProof from "./taskproof.js";
import Dispute from "./dispute.js";
import Payment from "./payment.js";
import LedgerEntry from "./ledgerentry.js";
import PaymentWebhookEvent from "./paymentwebhookevent.js";
import RefreshToken from "./refreshtoken.js";

// User → Executor profile
User.hasOne(ExecutorProfile, {
  foreignKey: "user_id",
  as: "executorProfile",
});

ExecutorProfile.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// User → Tasks
User.hasMany(Task, {
  foreignKey: "requester_id",
  as: "tasks",
});

Task.belongsTo(User, {
  foreignKey: "requester_id",
  as: "requester",
});


// Task → Assignments
Task.hasMany(TaskAssignment, {
  foreignKey: "task_id",
  as: "assignments",
});

TaskAssignment.belongsTo(Task, {
  foreignKey: "task_id",
  as: "task",
});

// Executor → Assignments
User.hasMany(TaskAssignment, {
  foreignKey: "executor_id",
  as: "assignments",
});

TaskAssignment.belongsTo(User, {
  foreignKey: "executor_id",
  as: "executor",
});

// Task → Events
Task.hasMany(TaskEvent, {
  foreignKey: "task_id",
  as: "events",
});

TaskEvent.belongsTo(Task, {
  foreignKey: "task_id",
  as: "task",
});

// User → Events they caused
User.hasMany(TaskEvent, {
  foreignKey: "actor_user_id",
  as: "taskEvents",
});

TaskEvent.belongsTo(User, {
  foreignKey: "actor_user_id",
  as: "actor",
});

// Task → Proofs
Task.hasMany(TaskProof, {
  foreignKey: "task_id",
  as: "proofs",
});

TaskProof.belongsTo(Task, {
  foreignKey: "task_id",
  as: "task",
});

// User → Proofs uploaded
User.hasMany(TaskProof, {
  foreignKey: "uploaded_by",
  as: "uploadedProofs",
});

TaskProof.belongsTo(User, {
  foreignKey: "uploaded_by",
  as: "uploader",
});


// Task → Disputes
Task.hasMany(Dispute, {
  foreignKey: "task_id",
  as: "disputes",
});

Dispute.belongsTo(Task, {
  foreignKey: "task_id",
  as: "task",
});

// User → Disputes raised by them
User.hasMany(Dispute, {
  foreignKey: "raised_by",
  as: "raisedDisputes",
});

Dispute.belongsTo(User, {
  foreignKey: "raised_by",
  as: "raiser",
});

// Admin/User who resolves the dispute
User.hasMany(Dispute, {
  foreignKey: "resolved_by",
  as: "resolvedDisputes",
});

Dispute.belongsTo(User, {
  foreignKey: "resolved_by",
  as: "resolver",
});
 


// Task → Payment
Task.hasOne(Payment, {
  foreignKey: "task_id",
  as: "payment",
});

Payment.belongsTo(Task, {
  foreignKey: "task_id",
  as: "task",
});

// User → Payments as requester
User.hasMany(Payment, {
  foreignKey: "requester_id",
  as: "requesterPayments",
});

Payment.belongsTo(User, {
  foreignKey: "requester_id",
  as: "requester",
});

// User → Payments as executor
User.hasMany(Payment, {
  foreignKey: "executor_id",
  as: "executorPayments",
});

Payment.belongsTo(User, {
  foreignKey: "executor_id",
  as: "executor",
});

// Payment → Ledger
Payment.hasMany(LedgerEntry, {
  foreignKey: "payment_id",
  as: "ledgerEntries",
});

LedgerEntry.belongsTo(Payment, {
  foreignKey: "payment_id",
  as: "payment",
});

// Task → Ledger
Task.hasMany(LedgerEntry, {
  foreignKey: "task_id",
  as: "ledgerEntries",
});

LedgerEntry.belongsTo(Task, {
  foreignKey: "task_id",
  as: "task",
});

// User → Ledger
User.hasMany(LedgerEntry, {
  foreignKey: "user_id",
  as: "ledgerEntries",
});

LedgerEntry.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(RefreshToken, {
  foreignKey: "user_id",
  as: "refreshTokens",
});

RefreshToken.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});


export {
  User,
  ExecutorProfile,
  Task,
  TaskAssignment,
  TaskEvent,
  TaskProof,
  Dispute,
  Payment,
  LedgerEntry,
  PaymentWebhookEvent,
  RefreshToken,
};