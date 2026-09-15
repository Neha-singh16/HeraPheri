import { useEffect, useState } from "react";

import api from "../api/client.jsx";

const EVENT_TYPES = [
  "TASK_CREATED",
  "TASK_ASSIGNED",
  "TASK_STARTED",
  "TASK_ARRIVED",
  "PROOF_SUBMITTED",
  "TASK_APPROVED",
  "TASK_DISPUTED",
  "TASK_CANCELLED",
  "TASK_EXPIRED",
  "PAYMENT_HELD",
  "PAYMENT_RELEASED",
  "PAYMENT_REFUNDED",
];

export default function AdminAudit() {
  const [events, setEvents] = useState([]);

  const [eventType, setEventType] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function fetchEvents() {
    setLoading(true);

    try {
      const response = await api.get("/admin/audit", {
        params: {
          search,
          eventType,
          page: 1,
          limit: 50,
        },
      });

      setEvents(response.data.data?.events || []);

      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load audit log.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [eventType]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">OPERATIONS</p>

          <h1>Audit log</h1>

          <p className="page-description">
            Review the important events that happened across the marketplace.
          </p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchEvents();
            }
          }}
          placeholder="Search task..."
        />

        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="">All events</option>

          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button className="secondary-button" onClick={fetchEvents}>
          Search
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading audit log...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <h3>No events found</h3>

          <p>There are no audit events matching the current filters.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Task</th>
                <th>Actor</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{new Date(event.created_at).toLocaleString("en-IN")}</td>

                  <td>
                    <span className="table-badge">{event.event_type}</span>
                  </td>

                  <td>
                    <strong>{event.task?.title || "—"}</strong>

                    <small>{event.task?.status || ""}</small>
                  </td>

                  <td>{event.actor?.name || "System"}</td>

                  <td>
                    <code>
                      {event.metadata ? JSON.stringify(event.metadata) : "—"}
                    </code>
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
