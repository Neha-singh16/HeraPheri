import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../api/client.jsx";

export default function AdminDashboard() {
  const [disputes, setDisputes] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/admin/disputes");

        setDisputes(response.data.data || []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const openDisputes = disputes.filter((item) => item.status === "OPEN").length;

  const underReview = disputes.filter(
    (item) => item.status === "UNDER_REVIEW",
  ).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">ADMIN</p>

          <h1>HEREPHERI Admin</h1>

          <p className="page-description">
            Monitor marketplace issues and resolve disputes.
          </p>
        </div>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Open disputes</span>

          <strong>{loading ? "—" : openDisputes}</strong>

          <small>Need review</small>
        </div>

        <div className="stat-card">
          <span>Under review</span>

          <strong>{loading ? "—" : underReview}</strong>

          <small>Currently being handled</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Marketplace operations</h2>
        </div>

        <div className="task-grid">
          <Link to="/admin/disputes" className="task-card">
            <div className="task-card-top">
              <span className="task-category">SAFETY</span>
            </div>

            <h3>Dispute resolution</h3>

            <p>Review disputed tasks, proofs and payment outcomes.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
