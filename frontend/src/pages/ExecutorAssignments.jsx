import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../api/client.jsx";

export default function ExecutorAssignments() {
  const [assignments, setAssignments] = useState([]);

  const [status, setStatus] = useState("ACTIVE");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function fetchAssignments() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/task-assignments/mine", {
        params: {
          status,
        },
      });

      setAssignments(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssignments();
  }, [status]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">EXECUTOR</p>

          <h1>My Assignments</h1>

          <p className="page-description">
            Tasks you've accepted and worked on.
          </p>
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="ACTIVE">Active</option>

          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <h3>No {status.toLowerCase()} assignments</h3>

          <p>Find a task to get started.</p>

          <Link to="/find-tasks" className="primary-button">
            Find Tasks
          </Link>
        </div>
      ) : (
        <div className="task-grid">
          {assignments.map((assignment) => {
            const task = assignment.task;

            return (
              <Link
                key={assignment.id}
                to={`/tasks/${task.id}`}
                className="task-card"
              >
                <div className="task-card-top">
                  <span className="task-category">{task.category}</span>

                  <span className="status-badge">{task.status}</span>
                </div>

                <h3>{task.title}</h3>

                <p className="task-description">{task.description}</p>

                <div className="task-card-footer">
                  <strong>₹{task.reward_amount}</strong>

                  <span>
                    {task.deadline_at
                      ? new Date(task.deadline_at).toLocaleString("en-IN")
                      : "No deadline"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
