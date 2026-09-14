import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import api from "../api/client.jsx";

export default function AdminDashboard() {
  const [disputes, setDisputes] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await api.get("/admin/disputes");

        setDisputes(response.data.data || []);
      } catch (error) {
        console.error("Unable to load admin overview:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const openDisputes = disputes.filter(
    (dispute) => dispute.status === "OPEN",
  ).length;

  const underReview = disputes.filter(
    (dispute) => dispute.status === "UNDER_REVIEW",
  ).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">PLATFORM ADMINISTRATION</p>

          <h1>Admin overview</h1>

          <p className="page-description">
            Keep HEREPHERI safe, fair, and operational.
          </p>
        </div>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Open disputes</span>

          <strong>{loading ? "—" : openDisputes}</strong>

          <small>Require attention</small>
        </div>

        <div className="stat-card">
          <span>Under review</span>

          <strong>{loading ? "—" : underReview}</strong>

          <small>Currently being handled</small>
        </div>

        <div className="stat-card">
          <span>Platform</span>

          <strong>Live</strong>

          <small>HEREPHERI marketplace</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Admin responsibilities</h2>
        </div>

        <div className="task-grid">
          <Link to="/admin/disputes" className="task-card">
            <div className="task-card-top">
              <span className="task-category">SAFETY</span>

              <span className="status-badge">{openDisputes}</span>
            </div>

            <h3>Dispute resolution</h3>

            <p>
              Review disputed tasks, evidence, payment state, and decide the
              final outcome.
            </p>

            <div className="task-card-footer">
              <span>Open dispute queue</span>

              <strong>→</strong>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
