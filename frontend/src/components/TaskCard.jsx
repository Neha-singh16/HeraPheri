import { Link } from "react-router-dom";
// Convert backend status into a readable label.
function formatStatus(status) {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function formatCategory(category) {
  const labels = { GO: "Go", GET: "Get", CHECK: "Check", DIGITAL: "Digital" };
  return labels[category] || category;
}
function formatDate(date) {
  if (!date) return "No deadline";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
export default function TaskCard({ task }) {
  return (
    <Link to={`/tasks/${task.id}`} className="task-card">
      {" "}
      <div className="task-card-top">
        {" "}
        <span className="task-category">
          {" "}
          {formatCategory(task.category)}{" "}
        </span>{" "}
        <span className={`status-badge status-${task.status?.toLowerCase()}`}>
          {" "}
          {formatStatus(task.status)}{" "}
        </span>{" "}
      </div>{" "}
      <h3> {task.title} </h3>{" "}
      <p className="task-description"> {task.description} </p>{" "}
      <div className="task-card-footer">
        {" "}
        <div>
          {" "}
          <small> Reward </small> <strong> ₹{task.reward_amount} </strong>{" "}
        </div>{" "}
        <div>
          {" "}
          <small> Deadline </small>{" "}
          <span> {formatDate(task.deadline_at)} </span>{" "}
        </div>{" "}
      </div>{" "}
    </Link>
  );
}
