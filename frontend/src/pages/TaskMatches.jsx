import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/client.jsx";

function formatDistance(meters) {
  if (meters === null || meters === undefined) {
    return "Digital";
  }

  const km = Number(meters) / 1000;

  if (km < 1) {
    return `${Math.round(Number(meters))} m away`;
  }

  return `${km.toFixed(1)} km away`;
}

function formatScore(score) {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(0);
}

function formatPercentage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${number.toFixed(0)}%`;
}

export default function TaskMatches() {
  const { taskId } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState(null);

  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [radiusKm, setRadiusKm] = useState(10);

  async function fetchMatches() {
    setLoading(true);
    setError("");

    try {
      const [taskResponse, matchResponse] = await Promise.all([
        api.get(`/tasks/${taskId}`),

        api.get(`/matching/tasks/${taskId}/candidates`, {
          params: {
            radiusKm,
            limit: 10,
          },
        }),
      ]);

      setTask(taskResponse.data.data);

      setMatches(matchResponse.data.data || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load matching Executors.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();
  }, [taskId, radiusKm]);

  if (loading) {
    return <div className="empty-state">Finding the best Executors...</div>;
  }

  if (error && !task) {
    return (
      <div className="empty-state">
        <h3>Matching unavailable</h3>

        <p>{error}</p>

        <button
          className="secondary-button"
          onClick={() => navigate(`/tasks/${taskId}`)}
        >
          Back to task
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to={`/tasks/${taskId}`} className="back-link">
        ← Back to task
      </Link>

      <div className="page-header">
        <div>
          <p className="eyebrow">MATCHING</p>

          <h1>Best Executors</h1>

          <p className="page-description">
            Suitable Executors ranked by reliability, trust and proximity.
          </p>
        </div>

        <select
          value={radiusKm}
          onChange={(event) => setRadiusKm(Number(event.target.value))}
          className="match-radius-select"
        >
          <option value="2">Within 2 km</option>

          <option value="5">Within 5 km</option>

          <option value="10">Within 10 km</option>

          <option value="20">Within 20 km</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {task && (
        <div className="matching-task-summary">
          <div>
            <span>Task</span>

            <strong>{task.title}</strong>
          </div>

          <div>
            <span>Reward</span>

            <strong>₹{task.reward_amount}</strong>
          </div>

          <div>
            <span>Risk</span>

            <strong>{task.risk_level}</strong>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="empty-state">
          <h3>No suitable Executors found</h3>

          <p>Try expanding the search radius or check again later.</p>
        </div>
      ) : (
        <div className="match-list">
          {matches.map((executor, index) => (
            <article key={executor.executor_id} className="executor-match-card">
              <div className="match-rank">#{index + 1}</div>

              <div className="executor-match-content">
                <div className="executor-match-header">
                  <div>
                    <h2>{executor.name || "Executor"}</h2>

                    {executor.bio && <p>{executor.bio}</p>}
                  </div>

                  <div className="match-score">
                    <small>Match</small>

                    <strong>{formatScore(executor.match_score)}</strong>
                  </div>
                </div>

                <div className="executor-metrics">
                  <div>
                    <span>Trust</span>

                    <strong>{Number(executor.trust_score).toFixed(0)}</strong>
                  </div>

                  <div>
                    <span>Completion</span>

                    <strong>
                      {formatPercentage(executor.completion_rate)}
                    </strong>
                  </div>

                  <div>
                    <span>On-time</span>

                    <strong>{formatPercentage(executor.on_time_rate)}</strong>
                  </div>

                  <div>
                    <span>Tasks</span>

                    <strong>{executor.completed_tasks || 0}</strong>
                  </div>

                  <div>
                    <span>Distance</span>

                    <strong>{formatDistance(executor.distance_meters)}</strong>
                  </div>
                </div>

                <div className="executor-match-footer">
                  <span className="verification-label">
                    {Number(executor.trust_score) >= 60
                      ? "Reliable Executor"
                      : "New Executor"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
