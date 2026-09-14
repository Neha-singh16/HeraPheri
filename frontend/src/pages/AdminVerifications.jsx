import { useEffect, useState } from "react";

import api from "../api/client.jsx";

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");

  async function fetchVerifications() {
    setLoading(true);

    try {
      const response = await api.get("/admin/verifications");

      setVerifications(response.data.data || []);

      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load verification queue.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVerifications();
  }, []);

  async function approve(userId) {
    setActionLoading(userId);

    try {
      await api.post(`/verifications/admin/${userId}/approve`, {
        provider: "MANUAL",
      });

      await fetchVerifications();
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to approve verification.",
      );
    } finally {
      setActionLoading("");
    }
  }

  async function reject(userId) {
    const reason = window.prompt("Why is this verification being rejected?");

    if (!reason?.trim()) {
      return;
    }

    setActionLoading(userId);

    try {
      await api.post(`/verifications/admin/${userId}/reject`, {
        provider: "MANUAL",
        reason: reason.trim(),
      });

      await fetchVerifications();
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to reject verification.",
      );
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">PLATFORM SAFETY</p>

          <h1>Identity verification</h1>

          <p className="page-description">
            Review pending users before their verification status is trusted by
            the marketplace.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading verification queue...</div>
      ) : verifications.length === 0 ? (
        <div className="empty-state">
          <h3>All caught up</h3>

          <p>There are no pending identity verifications right now.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>

                <th>Verification</th>

                <th>Submitted</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {verifications.map((verification) => {
                const user = verification.user;

                const busy = actionLoading === user.id;

                return (
                  <tr key={verification.id}>
                    <td>
                      <strong>{user?.name}</strong>

                      <small>{user?.email}</small>
                    </td>

                    <td>
                      <span className="status-badge status-pending_approval">
                        {verification.verification_type}
                      </span>
                    </td>

                    <td>
                      {new Date(verification.created_at).toLocaleString(
                        "en-IN",
                      )}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",

                          gap: "8px",
                        }}
                      >
                        <button
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => approve(user.id)}
                        >
                          {busy ? "Working..." : "Approve"}
                        </button>

                        <button
                          className="table-action-button"
                          disabled={busy}
                          onClick={() => reject(user.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
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
