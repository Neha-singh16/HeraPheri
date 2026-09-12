import { useEffect, useState } from "react";

import api from "../api/client.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminDisputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState("");
  const [error, setError] = useState("");

  async function fetchDisputes() {
    try {
      const response = await api.get("/admin/disputes");
      setDisputes(response.data.data || []);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load disputes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchDisputes();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  async function resolveDispute(disputeId, resolution) {
    const action =
      resolution === "REFUND_REQUESTER"
        ? "refund the requester"
        : "release payment to the Executor";

    if (!window.confirm(`Are you sure you want to ${action}?`)) {
      return;
    }

    setResolving(disputeId);
    setError("");

    try {
      await api.post(`/admin/disputes/${disputeId}/resolve`, { resolution });
      await fetchDisputes();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to resolve dispute.");
    } finally {
      setResolving("");
    }
  }

  if (user?.role !== "ADMIN") {
    return <div className="empty-state">Admin access required.</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">ADMIN</p>
          <h1>Dispute resolution</h1>
          <p className="page-description">
            Review disputed tasks and choose the final payment outcome.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading disputes...</div>
      ) : disputes.length === 0 ? (
        <div className="empty-state">
          <h3>No open disputes</h3>
          <p>New disputes will appear here for review.</p>
        </div>
      ) : (
        <div className="admin-dispute-list">
          {disputes.map((dispute) => {
            const task = dispute.task;
            const payment = task?.payment;
            const proof = task?.proofs?.[task.proofs.length - 1];
            const isResolving = resolving === dispute.id;

            return (
              <article className="profile-card admin-dispute-card" key={dispute.id}>
                <div className="profile-card-header">
                  <div>
                    <span className="task-category">{dispute.reason}</span>
                    <h2>{task?.title || "Task unavailable"}</h2>
                    <p>{dispute.description}</p>
                  </div>
                  <span className="status-badge status-disputed">DISPUTED</span>
                </div>

                <div className="detail-grid">
                  <div>
                    <small>Requester</small>
                    <strong>{task?.requester?.name || "Unknown"}</strong>
                  </div>
                  <div>
                    <small>Payment</small>
                    <strong>{payment?.status || "Not found"}</strong>
                  </div>
                  <div>
                    <small>Proof items</small>
                    <strong>
                      {proof
                        ? `${proof.proof_type}${proof.text_content ? `: ${proof.text_content}` : proof.storage_key ? `: ${proof.storage_key}` : ""}`
                        : "Not submitted"}
                    </strong>
                  </div>
                  <div>
                    <small>Raised</small>
                    <strong>
                      {new Date(dispute.created_at).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div className="admin-dispute-actions">
                  <button
                    className="secondary-button"
                    disabled={isResolving}
                    onClick={() => resolveDispute(dispute.id, "REFUND_REQUESTER")}
                  >
                    Refund requester
                  </button>
                  <button
                    className="primary-button"
                    disabled={isResolving}
                    onClick={() => resolveDispute(dispute.id, "RELEASE_EXECUTOR")}
                  >
                    Release Executor
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}