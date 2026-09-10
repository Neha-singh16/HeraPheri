import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";

import api from "../api/client.jsx";

export default function Reputation() {
  const { user } = useAuth();

  const [reputation, setReputation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function fetchReputation() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/ratings/me");

      setReputation(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load reputation.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReputation();
  }, []);

  if (loading) {
    return <div className="empty-state">Loading reputation...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const average = Number(reputation?.averageRating || 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">YOUR REPUTATION</p>

          <h1>Reputation</h1>

          <p className="page-description">
            See how people rate your work on HEREPHERI.
          </p>
        </div>
      </div>

      <section className="reputation-overview">
        <div className="reputation-score">
          <strong>{average.toFixed(1)}</strong>

          <div className="rating-stars-static">{"★★★★★"}</div>

          <span>{reputation?.ratingCount || 0} ratings</span>
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map((value) => {
            const count = reputation?.distribution?.[value] || 0;

            const total = reputation?.ratingCount || 0;

            const percentage = total === 0 ? 0 : (count / total) * 100;

            return (
              <div key={value} className="rating-row">
                <span>{value}</span>

                <div className="rating-bar">
                  <div
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <small>{count}</small>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
