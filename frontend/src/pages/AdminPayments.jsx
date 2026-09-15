import { useEffect, useState } from "react";

import api from "../api/client.jsx";

function formatMoney(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);

  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function fetchPayments() {
    setLoading(true);

    try {
      const response = await api.get("/admin/payments", {
        params: {
          status,
          search,
          page: 1,
          limit: 50,
        },
      });

      setPayments(response.data.data?.payments || []);

      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, [status]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">OPERATIONS</p>

          <h1>Payment monitoring</h1>

          <p className="page-description">
            Monitor payment state, settlement, and refunds.
          </p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchPayments();
            }
          }}
          placeholder="Search task..."
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All payment states</option>
          <option value="PENDING">Pending</option>
          <option value="HELD">Held</option>
          <option value="RELEASED">Released</option>
          <option value="REFUND_REQUESTED">Refund requested</option>
          <option value="REFUNDED">Refunded</option>
          <option value="FAILED">Failed</option>
        </select>

        <button className="secondary-button" onClick={fetchPayments}>
          Search
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <h3>No payments found</h3>
          <p>No payments match the current filter.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Requester</th>
                <th>Executor</th>
                <th>Gross</th>
                <th>Executor</th>
                <th>Platform fee</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong>{payment.task?.title || "—"}</strong>

                    <small>{payment.task?.status || ""}</small>
                  </td>

                  <td>{payment.requester?.name || "—"}</td>

                  <td>{payment.executor?.name || "—"}</td>

                  <td>{formatMoney(payment.gross_amount)}</td>

                  <td>{formatMoney(payment.executor_amount)}</td>

                  <td>{formatMoney(payment.platform_fee)}</td>

                  <td>
                    <span className="table-badge">{payment.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
