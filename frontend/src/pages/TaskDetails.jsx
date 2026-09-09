import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.jsx";
import { useAuth } from "../context/AuthContext.jsx";
function formatStatus(status) {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function formatDate(date) {
  if (!date) return "Not specified";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
export default function TaskDetails() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const isRequester = task?.requester_id === user?.id;
  async function fetchTask() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load task.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchTask();
  }, [taskId]);
  async function cancelTask() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this task?",
    );
    if (!confirmed) {
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/tasks/${taskId}/cancel`);
      await fetchTask();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to cancel task.");
    } finally {
      setActionLoading(false);
    }
  }
  async function startTask() {
    setActionLoading(true);
    try {
      await api.post(`/task-execution/${taskId}/start`);
      await fetchTask();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to start task.");
    } finally {
      setActionLoading(false);
    }
  }
  if (loading) {
    return <div className="empty-state"> Loading task... </div>;
  }
  if (error && !task) {
    return (
      <div className="empty-state">
        {" "}
        <h3> Task unavailable </h3> <p> {error} </p>{" "}
        <button className="secondary-button" onClick={() => navigate("/tasks")}>
          {" "}
          Back to tasks{" "}
        </button>{" "}
      </div>
    );
  }
  if (!task) {
    return null;
  }
  return (
    <div className="page-container">
      {" "}
      <Link to="/tasks" className="back-link">
        {" "}
        ← Back to My Tasks{" "}
      </Link>{" "}
      {error && <div className="error-message"> {error} </div>}{" "}
      <div className="task-detail-layout">
        {" "}
        <main className="task-detail-main">
          {" "}
          <div className="detail-top">
            {" "}
            <span className="task-category"> {task.category} </span>{" "}
            <span
              className={`status-badge status-${task.status?.toLowerCase()}`}
            >
              {" "}
              {formatStatus(task.status)}{" "}
            </span>{" "}
          </div>{" "}
          <h1> {task.title} </h1>{" "}
          <p className="task-detail-description"> {task.description} </p>{" "}
          <div className="detail-section">
            {" "}
            <h2> Task information </h2>{" "}
            <div className="detail-grid">
              {" "}
              <div>
                {" "}
                <small> Task mode </small>{" "}
                <strong> {task.task_mode} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Reward </small>{" "}
                <strong> ₹{task.reward_amount} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Deadline </small>{" "}
                <strong> {formatDate(task.deadline_at)} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Risk </small> <strong> {task.risk_level} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Proof </small> <strong> {task.proof_type} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Location </small>{" "}
                <strong> {task.address_text || "Digital task"} </strong>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {task.status === "OPEN" && isRequester && (
            <div className="detail-section">
              {" "}
              <h2> Matching </h2>{" "}
              <p>
                {" "}
                Your task is open and ready to be matched with suitable
                Executors.{" "}
              </p>{" "}
              <Link to={`/tasks/${task.id}/matches`} className="primary-button">
                {" "}
                View matching Executors{" "}
              </Link>{" "}
            </div>
          )}{" "}
          {isRequester && task.status === "OPEN" && (
            <div className="danger-zone">
              {" "}
              <h3> Cancel task </h3>{" "}
              <p> You can cancel this task while it is still open. </p>{" "}
              <button
                className="danger-button"
                onClick={cancelTask}
                disabled={actionLoading}
              >
                {" "}
                Cancel task{" "}
              </button>{" "}
            </div>
          )}{" "}
          {!isRequester && task.status === "ASSIGNED" && (
            <div className="detail-section">
              {" "}
              <h2> Execution </h2> <p> This task is assigned to you. </p>{" "}
              <button
                className="primary-button"
                onClick={startTask}
                disabled={actionLoading}
              >
                {" "}
                {actionLoading ? "Starting..." : "Start Task"}{" "}
              </button>{" "}
            </div>
          )}{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
