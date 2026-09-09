import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.jsx";
import { useAuth } from "../context/AuthContext.jsx";
function formatDate(date) {
  if (!date) {
    return "Not specified";
  }
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
export default function TaskExecution() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [proofForm, setProofForm] = useState({
    proofType: "TEXT",
    textContent: "",
    storageKey: "",
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
  async function startTask() {
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/tasks/${taskId}/start`);
      await fetchTask();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to start task.");
    } finally {
      setActionLoading(false);
    }
  }
  function handleProofChange(event) {
    const { name, value } = event.target;
    setProofForm({ ...proofForm, [name]: value });
  }
  async function submitProof(event) {
    event.preventDefault();
    if (!proofForm.textContent.trim()) {
      setError("Please provide proof details.");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/tasks/${taskId}/proofs`, {
        proofType: proofForm.proofType,
        textContent: proofForm.textContent.trim(),
        storageKey: proofForm.storageKey.trim() || null,
        metadata: { submittedFrom: "web" },
      });
      await fetchTask();
      setProofForm({ proofType: "TEXT", textContent: "", storageKey: "" });
    } catch (error) {
      setError(error.response?.data?.message || "Unable to submit proof.");
    } finally {
      setActionLoading(false);
    }
  }
  if (loading) {
    return <div className="empty-state"> Loading task... </div>;
  }
  if (!task) {
    return (
      <div className="empty-state">
        {" "}
        <h3> Task unavailable </h3>{" "}
        <p> {error || "The task could not be found."} </p>{" "}
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
      <div className="execution-layout">
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
          <h1> {task.title} </h1>{" "}
          <p className="task-detail-description"> {task.description} </p>{" "}
          <div className="detail-section">
            {" "}
            <h2> Task information </h2>{" "}
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
                <small> Task mode </small>{" "}
                <strong> {task.task_mode} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Required proof </small>{" "}
                <strong> {task.proof_type} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Risk </small> <strong> {task.risk_level} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <small> Location </small>{" "}
                <strong> {task.address_text || "Digital task"} </strong>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {task.status === "ASSIGNED" && (
            <div className="detail-section">
              {" "}
              <h2> Start execution </h2>{" "}
              <p> Start the task when you are ready to begin. </p>{" "}
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
          {task.status === "IN_PROGRESS" && (
            <div className="detail-section">
              {" "}
              <h2> Submit proof </h2>{" "}
              <p> Add evidence that shows the task was completed. </p>{" "}
              <form className="proof-form" onSubmit={submitProof}>
                {" "}
                <label>
                  {" "}
                  Proof type{" "}
                  <select
                    name="proofType"
                    value={proofForm.proofType}
                    onChange={handleProofChange}
                  >
                    {" "}
                    <option value="TEXT"> Text </option>{" "}
                    <option value="PHOTO"> Photo </option>{" "}
                    <option value="SCREENSHOT"> Screenshot </option>{" "}
                  </select>{" "}
                </label>{" "}
                <label>
                  {" "}
                  Proof details{" "}
                  <textarea
                    name="textContent"
                    value={proofForm.textContent}
                    onChange={handleProofChange}
                    rows="6"
                    placeholder="Describe what you completed and include any useful evidence details..."
                    required
                  />{" "}
                </label>{" "}
                <label>
                  {" "}
                  Storage key <span className="optional-label">
                    {" "}
                    Optional{" "}
                  </span>{" "}
                  <input
                    type="text"
                    name="storageKey"
                    value={proofForm.storageKey}
                    onChange={handleProofChange}
                    placeholder="proofs/task-id/file-name"
                  />{" "}
                </label>{" "}
                <button
                  type="submit"
                  className="primary-button"
                  disabled={actionLoading}
                >
                  {" "}
                  {actionLoading ? "Submitting..." : "Submit Proof"}{" "}
                </button>{" "}
              </form>{" "}
            </div>
          )}{" "}
          {task.status === "PENDING_APPROVAL" && (
            <div className="detail-section">
              {" "}
              <h2> Proof submitted ✓ </h2>{" "}
              <p>
                {" "}
                Your proof has been submitted and is waiting for requester
                approval.{" "}
              </p>{" "}
            </div>
          )}{" "}
          {task.status === "COMPLETED" && (
            <div className="detail-section">
              {" "}
              <h2> Task completed ✓ </h2>{" "}
              <p> This task has been successfully completed. </p>{" "}
            </div>
          )}{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
