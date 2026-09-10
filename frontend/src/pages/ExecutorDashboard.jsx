import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../api/client.jsx";

import { useAuth } from "../context/AuthContext.jsx";

export default function ExecutorDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);

  async function fetchDashboard() {
    setLoading(true);

    try {
      const [profileResponse, assignmentResponse] = await Promise.all([
        api.get("/executor-profile"),

        api.get("/task-assignments/mine"),
      ]);

      setProfile(profileResponse.data.data);

      setAssignments(assignmentResponse.data.data || []);
    } catch (error) {
      /*
        A missing Executor profile is okay.
        The dashboard will guide the user
        to create one.
      */
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        console.error("Executor dashboard error:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "ACTIVE",
  );

  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === "COMPLETED",
  );

  return (
    <div className="mode-dashboard">
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">EXECUTOR</p>

          <h1>Ready to earn, {user?.name?.split(" ")[0]}?</h1>

          <p>Find useful tasks and make your free time count.</p>
        </div>

        <Link to="/find-tasks" className="primary-button">
          Find Tasks
        </Link>
      </div>

      {!profile ? (
        <section className="executor-setup-card">
          <div>
            <p className="eyebrow">GET STARTED</p>

            <h2>Set up your Executor profile</h2>

            <p>
              Add your profile, turn on availability and update your location
              before accepting tasks.
            </p>
          </div>

          <Link to="/executor-profile" className="primary-button">
            Set Up Profile
          </Link>
        </section>
      ) : (
        <section className="executor-status-card">
          <div>
            <span>Availability</span>

            <strong>
              {profile.is_available ? "Available" : "Unavailable"}
            </strong>
          </div>

          <div>
            <span>Trust</span>

            <strong>{Number(profile.trust_score || 0).toFixed(0)}</strong>
          </div>

          <div>
            <span>Completed</span>

            <strong>{profile.completed_tasks || 0}</strong>
          </div>

          <Link to="/executor-profile" className="secondary-button">
            Manage Profile
          </Link>
        </section>
      )}

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Active Tasks</span>

          <strong>{loading ? "—" : activeAssignments.length}</strong>

          <small>Tasks assigned to you</small>
        </div>

        <div className="stat-card">
          <span>Completed</span>

          <strong>{loading ? "—" : completedAssignments.length}</strong>

          <small>Successfully completed</small>
        </div>

        <div className="stat-card">
          <span>Trust Score</span>

          <strong>
            {profile ? Number(profile.trust_score || 0).toFixed(0) : "—"}
          </strong>

          <small>Your marketplace reputation</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Your assigned tasks</h2>

            <p>Work you've accepted.</p>
          </div>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="empty-state">
            <h3>No active assignments</h3>

            <p>Find a nearby task and start earning.</p>

            <Link to="/find-tasks" className="primary-button">
              Find Tasks
            </Link>
          </div>
        ) : (
          <div className="task-grid">
            {activeAssignments.map((assignment) => {
              const task = assignment.task;

              return (
                <Link
                  key={assignment.id}
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

                    <span>{task.task_mode}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
