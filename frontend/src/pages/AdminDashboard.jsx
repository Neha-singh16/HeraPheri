import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../api/client.jsx";
import { DashboardSkeleton } from "../components/Skeleton.jsx";

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await api.get("/admin/overview");

        setOverview(response.data.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load admin overview.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">PLATFORM ADMINISTRATION</p>

          <h1>Good morning, Admin.</h1>

          <p className="page-description">
            Monitor HEREPHERI and keep the marketplace safe, healthy, and fair.
          </p>
        </div>
      </div>

      <section className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>Total users</span>

          <strong>{overview.users.total}</strong>

          <small>{overview.users.active} active</small>
        </div>

        <div className="admin-stat-card">
          <span>Executors</span>

          <strong>{overview.executors}</strong>

          <small>Executor profiles</small>
        </div>

        <div className="admin-stat-card">
          <span>Pending verification</span>

          <strong>{overview.verifications.pending}</strong>

          <small>Require review</small>
        </div>

        <div className="admin-stat-card">
          <span>Open disputes</span>

          <strong>{overview.disputes.open}</strong>

          <small>Need attention</small>
        </div>

        <div className="admin-stat-card">
          <span>Active tasks</span>

          <strong>{overview.tasks.active}</strong>

          <small>Currently running</small>
        </div>

        <div className="admin-stat-card">
          <span>Funds held</span>

          <strong>{formatMoney(overview.payments.heldAmount)}</strong>

          <small>Awaiting settlement</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ACTION CENTER</p>

            <h2>Needs your attention</h2>
          </div>
        </div>

        <div className="admin-action-grid">
          <Link to="/admin/users" className="admin-action-card">
            <span className="admin-action-icon">👥</span>

            <h3>Manage users</h3>

            <p>
              Search accounts, inspect account status, executor capability, and
              verification.
            </p>

            <strong>
              <span>Open user management</span>

              <span>→</span>
            </strong>
          </Link>

          <Link to="/admin/verifications" className="admin-action-card">
            <span className="admin-action-icon">✓</span>

            <h3>Review verification</h3>

            <p>
              Review pending identity verification before an Executor can
              receive higher trust.
            </p>

            <strong>
              <span>{overview.verifications.pending} pending</span>

              <span>→</span>
            </strong>
          </Link>

          <Link to="/admin/disputes" className="admin-action-card">
            <span className="admin-action-icon">⚖</span>

            <h3>Resolve disputes</h3>

            <p>
              Review task evidence and choose the appropriate financial outcome.
            </p>

            <strong>
              <span>{overview.disputes.open} open</span>

              <span>→</span>
            </strong>
          </Link>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MARKETPLACE</p>

            <h2>Current activity</h2>
          </div>
        </div>

        <div className="admin-summary-row">
          <div>
            <span>Completed tasks</span>

            <strong>{overview.tasks.completed}</strong>
          </div>

          <div>
            <span>Suspended accounts</span>

            <strong>{overview.users.suspended}</strong>
          </div>

          <div>
            <span>Funds awaiting settlement</span>

            <strong>{formatMoney(overview.payments.heldAmount)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
