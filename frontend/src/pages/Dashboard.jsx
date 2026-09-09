import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <p className="eyebrow">DASHBOARD</p>

          <h1>Good to see you, {user?.name?.split(" ")[0]}.</h1>

          <p className="page-description">
            What would you like to get done today?
          </p>
        </div>

        <Link to="/tasks/create" className="primary-button">
          + Create Task
        </Link>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Open tasks</span>

          <strong>0</strong>

          <small>Tasks waiting for Executors</small>
        </div>

        <div className="stat-card">
          <span>Active tasks</span>

          <strong>0</strong>

          <small>Currently being executed</small>
        </div>

        <div className="stat-card">
          <span>Completed</span>

          <strong>0</strong>

          <small>Successfully completed</small>
        </div>

        <div className="stat-card">
          <span>Earnings</span>

          <strong>₹0</strong>

          <small>Executor earnings</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>What do you need?</h2>

            <p>Delegate something and get your time back.</p>
          </div>
        </div>

        <div className="action-grid">
          <Link to="/tasks/create" className="action-card">
            <span className="action-icon">→</span>

            <h3>Create a task</h3>

            <p>Tell an Executor what you need done.</p>
          </Link>

          <Link to="/find-tasks" className="action-card">
            <span className="action-icon">⌕</span>

            <h3>Find tasks</h3>

            <p>Use your free time to earn money.</p>
          </Link>

          <Link to="/executor-profile" className="action-card">
            <span className="action-icon">◉</span>

            <h3>Become an Executor</h3>

            <p>Set your availability and build your reputation.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
