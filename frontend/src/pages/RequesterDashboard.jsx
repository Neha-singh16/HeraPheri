import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../api/client.jsx";

import { useAuth } from "../context/AuthContext.jsx";

export default function RequesterDashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    try {
      const response = await api.get("/tasks/mine", {
        params: {
          page: 1,
          limit: 5,
        },
      });

      setTasks(response.data.data?.tasks || []);
    } catch (error) {
      console.error("Requester dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const openTasks = tasks.filter((task) => task.status === "OPEN").length;

  const activeTasks = tasks.filter(
    (task) =>
      task.status === "ASSIGNED" ||
      task.status === "IN_PROGRESS" ||
      task.status === "PENDING_APPROVAL",
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  return (
    <div className="mode-dashboard">
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">REQUESTER</p>

          <h1>Get things done, {user?.name?.split(" ")[0]}.</h1>

          <p>Delegate work and get your time back.</p>
        </div>

        <Link to="/tasks/create" className="primary-button">
          + Create Task
        </Link>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Open</span>

          <strong>{loading ? "—" : openTasks}</strong>

          <small>Waiting for an Executor</small>
        </div>

        <div className="stat-card">
          <span>Active</span>

          <strong>{loading ? "—" : activeTasks}</strong>

          <small>Currently being handled</small>
        </div>

        <div className="stat-card">
          <span>Completed</span>

          <strong>{loading ? "—" : completedTasks}</strong>

          <small>Successfully finished</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Your tasks</h2>

          <Link to="/tasks" className="text-link">
            View all →
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>

            <p>Create your first task and let someone handle it.</p>

            <Link to="/tasks/create" className="primary-button">
              Create Task
            </Link>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="task-card"
              >
                <div className="task-card-top">
                  <span className="task-category">{task.category}</span>

                  <span className="status-badge">{task.status}</span>
                </div>

                <h3>{task.title}</h3>

                <div className="task-card-footer">
                  <strong>₹{task.reward_amount}</strong>

                  <span>{task.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
