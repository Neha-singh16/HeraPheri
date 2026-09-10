import { useState } from "react";

import api from "../api/client.jsx";

export default function RatingForm({ taskId, onSuccess }) {
  const [rating, setRating] = useState(0);

  const [review, setReview] = useState("");

  const [hoveredRating, setHoveredRating] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (rating < 1) {
      setError("Please select a rating.");

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/ratings/tasks/${taskId}`, {
        rating,
        review: review.trim() || null,
      });

      if (onSuccess) {
        onSuccess(response.data.data);
      }

      setRating(0);
      setReview("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to submit rating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rating-form" onSubmit={handleSubmit}>
      <h3>How was your experience?</h3>

      <div className="rating-stars" onMouseLeave={() => setHoveredRating(0)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={
              value <= (hoveredRating || rating) ? "star active" : "star"
            }
            onMouseEnter={() => setHoveredRating(value)}
            onClick={() => setRating(value)}
            aria-label={`${value} star`}
          >
            ★
          </button>
        ))}
      </div>

      <label>
        Review
        <span className="optional-label">Optional</span>
        <textarea
          value={review}
          onChange={(event) => setReview(event.target.value)}
          rows="4"
          maxLength="1000"
          placeholder="Tell the other person about your experience..."
        />
      </label>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
}
