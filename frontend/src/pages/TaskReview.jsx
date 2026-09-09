import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.jsx";
function formatDate(date) {
  if (!date) {
    return "Not specified";
  }
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
export default function TaskReview() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [disputeForm, setDisputeForm] = useState({
    reason: "",
    description: "",
  });
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
  async function approveTask() {
    const confirmed = window.confirm("Approve the submitted work?");
    if (!confirmed) {
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/tasks/${taskId}/approve`);
      await fetchTask();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to approve task.");
    } finally {
      setActionLoading(false);
    }
  }
  function handleDisputeChange(event) {
    const { name, value } = event.target;
    setDisputeForm({ ...disputeForm, [name]: value });
  }
  async function submitDispute(event) {
    event.preventDefault();
    if (!disputeForm.reason.trim() || !disputeForm.description.trim()) {
      setError("Reason and description are required.");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/tasks/${taskId}/disputes`, {
        reason: disputeForm.reason.trim(),
        description: disputeForm.description.trim(),
      });
      await fetchTask();
      setDisputeForm({ reason: "", description: "" });
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create dispute.");
    } finally {
      setActionLoading(false);
    }
  }
  if (loading) {
    return <div className="empty-state"> Loading review... </div>;
  }
  if (!task) {
    return (
      <div className="empty-state">
        {" "}
        <h3> Task unavailable </h3> <p> {error || "Unable to load task."} </p>{" "}
        <button className="secondary-button" onClick={() => navigate("/tasks")}>
          {" "}
          Back to tasks{" "}
        </button>{" "}
      </div>
    );
  }
  return (
    <div className="page-container">
      {" "}
      <Link to={`/tasks/${taskId}`} className="back-link">
        {" "}
        ← Back to task{" "}
      </Link>{" "}
      {error && <div className="error-message"> {error} </div>}{" "}
      <div className="review-layout">
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
              {task.status}{" "}
            </span>{" "}
          </div>{" "}
          <h1> Review completed work </h1>{" "}
          <h2 className="review-task-title"> {task.title} </h2>{" "}
          <p className="task-detail-description"> {task.description} </p>{" "}
          <div className="detail-grid">
            {" "}
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
              <small> Proof required </small>{" "}
              <strong> {task.proof_type} </strong>{" "}
            </div>{" "}
          </div>{" "}
          {task.status === "PENDING_APPROVAL" ? (
            <>
              {" "}
              <div className="review-actions">
                {" "}
                <button
                  className="primary-button"
                  onClick={approveTask}
                  disabled={actionLoading}
                >
                  {" "}
                  {actionLoading ? "Processing..." : "Approve Task"}{" "}
                </button>{" "}
              </div>{" "}
              <div className="detail-section">
                {" "}
                <h2> Dispute the work </h2>{" "}
                <p>
                  {" "}
                  Use a dispute when the submitted work does not satisfy the
                  task requirements.{" "}
                </p>{" "}
                <form className="proof-form" onSubmit={submitDispute}>
                  {" "}
                  <label>
                    {" "}
                    Reason{" "}
                    <input
                      type="text"
                      name="reason"
                      value={disputeForm.reason}
                      onChange={handleDisputeChange}
                      placeholder="e.g. Proof does not match the task"
                      required
                    />{" "}
                  </label>{" "}
                  <label>
                    {" "}
                    Description{" "}
                    <textarea
                      name="description"
                      value={disputeForm.description}
                      onChange={handleDisputeChange}
                      rows="5"
                      placeholder="Explain what is wrong..."
                      required
                    />{" "}
                  </label>{" "}
                  <button
                    type="submit"
                    className="danger-button"
                    disabled={actionLoading}
                  >
                    {" "}
                    {actionLoading ? "Submitting..." : "Raise Dispute"}{" "}
                  </button>{" "}
                </form>{" "}
              </div>{" "}
            </>
          ) : (
            <div className="empty-state review-state">
              {" "}
              <h3> No review action available </h3>{" "}
              <p>
                {" "}
                This task is currently{" "}
                {` ${task.status.toLowerCase().replaceAll("_", " ")}`}.{" "}
              </p>{" "}
            </div>
          )}{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
