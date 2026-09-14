import { useEffect, useState } from "react";

import api from "../api/client.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState("");

  const [error, setError] = useState("");

  async function fetchUsers() {
    setLoading(true);

    try {
      const response = await api.get("/admin/users", {
        params: {
          search,
          status,
          page: 1,
          limit: 50,
        },
      });

      setUsers(response.data.data?.users || []);

      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [status]);

  async function updateStatus(userId, accountStatus) {
    setUpdating(userId);

    try {
      await api.patch(`/admin/users/${userId}/status`, {
        accountStatus,
      });

      await fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to update user.");
    } finally {
      setUpdating("");
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">PLATFORM</p>

          <h1>User management</h1>

          <p className="page-description">
            Inspect accounts, access status, executor capability and
            verification.
          </p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              fetchUsers();
            }
          }}
          placeholder="Search name or email..."
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>

          <option value="ACTIVE">Active</option>

          <option value="SUSPENDED">Suspended</option>

          <option value="BANNED">Banned</option>
        </select>

        <button className="secondary-button" onClick={fetchUsers}>
          Search
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <h3>No users found</h3>

          <p>Try changing your filters.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>

                <th>Role</th>

                <th>Account</th>

                <th>Executor</th>

                <th>Verification</th>

                <th>Joined</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const isUpdating = updating === user.id;

                const executor = user.executorProfile;

                const verification = user.verification;

                return (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>

                      <small>{user.email}</small>
                    </td>

                    <td>
                      <span className="table-badge">{user.role}</span>
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${user.account_status.toLowerCase()}`}
                      >
                        {user.account_status}
                      </span>
                    </td>

                    <td>
                      {executor ? (
                        <div>
                          <strong>Yes</strong>

                          <small>
                            Trust {Number(executor.trust_score).toFixed(0)}
                          </small>
                        </div>
                      ) : (
                        "No"
                      )}
                    </td>

                    <td>{verification?.status || "—"}</td>

                    <td>
                      {new Date(user.created_at).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      {user.role !== "ADMIN" && (
                        <button
                          className="table-action-button"
                          disabled={isUpdating}
                          onClick={() =>
                            updateStatus(
                              user.id,
                              user.account_status === "SUSPENDED"
                                ? "ACTIVE"
                                : "SUSPENDED",
                            )
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : user.account_status === "SUSPENDED"
                              ? "Reactivate"
                              : "Suspend"}
                        </button>
                      )}
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
