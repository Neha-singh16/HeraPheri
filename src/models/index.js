import User from "./user.js";
import ExecutorProfile from "./executorprofile.js";
import Task from "./task.js";
import TaskAssignment from "./taskassignment.js";
import TaskEvents from "./taskevent.js";

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


export {
  User,
  ExecutorProfile,
  Task,
  TaskAssignment,
  TaskEvent
};