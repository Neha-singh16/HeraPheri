import { useEffect, useState } from "react";

import api from "../api/client.jsx";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [riskLevel, setRiskLevel] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function fetchTasks() {
    setLoading(true);

    try {
      const response = await api.get("/admin/tasks", {
        params: {
          search,
          status,
          riskLevel,
          page: 1,
          limit: 50,
        },
      });

      setTasks(response.data.data?.tasks || []);

      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [status, riskLevel]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">OPERATIONS</p>

          <h1>Task monitoring</h1>

          <p className="page-description">
            Monitor marketplace activity without changing participant actions.
          </p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchTasks();
            }
          }}
          placeholder="Search task..."
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="PENDING_APPROVAL">Pending approval</option>
          <option value="COMPLETED">Completed</option>
          <option value="DISPUTED">Disputed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>

        <select
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
        >
          <option value="">All risk</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <button className="secondary-button" onClick={fetchTasks}>
          Search
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>Try changing the filters.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Requester</th>
                <th>Executor</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Reward</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => {
                const assignment = task.assignments?.[0];

                return (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.title}</strong>
                      <small>
                        {task.category} · {task.task_mode}
                      </small>
                    </td>

                    <td>
                      <strong>{task.requester?.name || "—"}</strong>
                      <small>{task.requester?.email || ""}</small>
                    </td>

                    <td>
                      {assignment?.executor ? (
                        <>
                          <strong>{assignment.executor.name}</strong>
                          <small>{assignment.executor.email}</small>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <span className="table-badge">{task.status}</span>
                    </td>

                    <td>{task.risk_level}</td>

                    <td>₹{Number(task.reward_amount).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
