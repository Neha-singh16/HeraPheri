import User from "./user.js";
import ExecutorProfile from "./executorprofile.js";
import Task from "./task.js";

User.hasOne(ExecutorProfile, {
  foreignKey: "user_id",
  as: "executorProfile",
});

ExecutorProfile.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(Task, {
  foreignKey: "requester_id",
  as: "tasks",
});

Task.belongsTo(User, {
  foreignKey: "requester_id",
  as: "requester",
});

export {
  User,
  ExecutorProfile,
  Task,
};