import { QueryTypes } from "sequelize";
import sequelize from "../config/database.js";
import { Task } from "../models/index.js";

const DEFAULT_RADIUS_KM = 10;
const DEFAULT_LIMIT = 10;
const MAX_ACTIVE_TASKS = 3;
const LOCATION_FRESHNESS_MINUTES = 30;

export async function getTaskMatches({
  taskId,
  requesterId,
  radiusKm = DEFAULT_RADIUS_KM,
  limit = DEFAULT_LIMIT,
}) {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found.");
  }
  // Only OPEN tasks should enter the matching engine.
  if (task.status !== "OPEN") {
    throw new Error("Only OPEN tasks can be matched.");
  }

  if (task.requester_id !== requesterId) {
    throw new Error("You are not authorized to match this task.");
  }

  const radiusMeters = Number(radiusKm) * 1000;
  const candidateLimit = Number(limit);

  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    throw new Error("Radius must be greater than zero.");
  }

  if (
    !Number.isInteger(candidateLimit) ||
    candidateLimit <= 0 ||
    candidateLimit > 50
  ) {
    throw new Error("Limit must be between 1 and 50.");
  }
  // High-risk tasks are not automatically matched.
  if (task.risk_level === "HIGH") {
    throw new Error(
      "HIGH-risk tasks are not supported by the V1 matching engine.",
    );
  }

  const replacements = {
    taskId,
    requesterId,
    radiusMeters,
    candidateLimit,
  };

  /* Matching strategy: LOW-risk task: trust + completion + on-time + proximity 
  MEDIUM-risk task: same score, but weaker Executors are filtered first.
   Physical / Hybrid: Executor must have a fresh location. 
   Digital: Location is not required.
    */
  const matches = await sequelize.query(
    ` SELECT
     ep.user_id AS executor_id,
    u.name, u.email, ep.bio,
    ep.trust_score, ep.completion_rate, 
    ep.on_time_rate, ep.total_tasks,
    ep.completed_tasks, 
    ( SELECT COUNT(*) 
    FROM task_assignments ta
    WHERE ta.executor_id = ep.user_id 
       AND ta.status = 'ACTIVE' 
    ) AS active_task_count,
     
    CASE WHEN t.task_mode = 'DIGITAL' THEN NULL
    
    ELSE ST_Distance_Sphere(
    t.location,
    ep.current_location ) 
    END AS distance_meters, 
    CASE
       WHEN t.task_mode = 'DIGITAL' THEN 
       (
        (ep.trust_score * 0.45) + 
        (ep.completion_rate * 0.30) +
        (ep.on_time_rate * 0.25)
       )
     ELSE 
     (
      (ep.trust_score * 0.30) +
      (ep.completion_rate * 0.25) +
      (ep.on_time_rate * 0.25) +
         (
       GREATEST( 
       0,
       1 -
       (
        ST_Distance_Sphere(
         t.location, 
         ep.current_location) / :radiusMeters ) ) * 100 * 0.20 ) ) END AS match_score FROM tasks t INNER JOIN executor_profiles ep ON 1 = 1 INNER JOIN users u ON u.id = ep.user_id WHERE t.id = :taskId -- Never recommend the requester themselves. AND ep.user_id != :requesterId -- Suspended/banned/deactivated users are excluded. AND u.account_status = 'ACTIVE' -- Executor must currently be available. AND ep.is_available = TRUE -- Prevent overload. AND ( SELECT COUNT(*) FROM task_assignments ta WHERE ta.executor_id = ep.user_id AND ta.status = 'ACTIVE' ) < ${MAX_ACTIVE_TASKS} /* MEDIUM-risk tasks require stronger reliability. LOW-risk tasks can use the normal eligibility rules. */ AND ( t.risk_level = 'LOW' OR ( t.risk_level = 'MEDIUM' AND ep.trust_score >= 60 AND ep.completion_rate >= 80 AND ep.on_time_rate >= 80 ) ) /* Physical and Hybrid tasks require: 1. current location 2. recent location update 3. executor inside radius */ AND ( t.task_mode = 'DIGITAL' OR ( t.task_mode IN ('PHYSICAL', 'HYBRID') AND t.location IS NOT NULL AND ep.current_location IS NOT NULL AND ep.last_location_at >= ( NOW() - INTERVAL ${LOCATION_FRESHNESS_MINUTES} MINUTE ) AND ST_Distance_Sphere( t.location, ep.current_location ) <= :radiusMeters ) ) ORDER BY match_score DESC LIMIT :candidateLimit; `,
    { replacements, type: QueryTypes.SELECT },
  );
  return matches;
}
