import sequelize from "./config/database.js";
import { acceptTask } from "./services/taskAssignmentService.js";

async function testAssignment() {
  try {
    await sequelize.authenticate();

    // Replace these with real IDs from your database.
    const taskId = "YOUR_TASK_UUID";
    const executorId = "YOUR_EXECUTOR_UUID";

    const assignment = await acceptTask(taskId, executorId);

    console.log("Assignment created:");
    console.log(assignment.toJSON());
  } catch (error) {
    console.error("Assignment failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

testAssignment();