import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/client.jsx";
import { useSocket } from "../context/SocketContext.jsx";

function formatMoney(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Earnings() {
  const { socket } = useSocket();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEarnings() {
    try {
      const response = await api.get("/earnings/mine");

      setData(response.data.data);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load earnings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEarnings();
  }, []);

  /*
    When a task is approved/payment is released,
    refresh the earnings automatically.
  */
  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleTaskUpdated(event) {
      if (["TASK_APPROVED", "PAYMENT_RELEASED"].includes(event.reason)) {
        fetchEarnings();
      }
    }

    socket.on("task:updated", handleTaskUpdated);

    return () => {
      socket.off("task:updated", handleTaskUpdated);
    };
  }, [socket]);

  if (loading) {
    return <div className="empty-state">Loading earnings...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">EXECUTOR</p>

          <h1>Earnings</h1>

          <p className="page-description">
            Track the money you've earned from completed tasks.
          </p>
        </div>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Total earned</span>

          <strong>{formatMoney(data?.totalEarned)}</strong>

          <small>Released earnings</small>
        </div>

        <div className="stat-card">
          <span>Completed tasks</span>

          <strong>{data?.completedTasks || 0}</strong>

          <small>Tasks contributing to earnings</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Earnings history</h2>
        </div>

        {!data?.entries?.length ? (
          <div className="empty-state">
            <h3>No earnings yet</h3>

            <p>
              Complete and get approval on your first task to see your earnings
              here.
            </p>

            <Link to="/find-tasks" className="primary-button">
              Find Tasks
            </Link>
          </div>
        ) : (
          <div className="notification-list">
            {data.entries.map((entry) => (
              <article key={entry.id} className="notification-item read">
                <div className="notification-icon">₹</div>

                <div className="notification-content">
                  <h3>{entry.task?.title || "Task earning"}</h3>

                  <p>+{formatMoney(entry.amount)}</p>

                  <small>{formatDate(entry.created_at)}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
