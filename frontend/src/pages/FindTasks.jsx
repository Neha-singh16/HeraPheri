import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.jsx";
function formatDistance(meters) {
  if (meters === null || meters === undefined) {
    return "Digital";
  }
  const km = Number(meters) / 1000;
  return `${km.toFixed(1)} km away`;
}
function formatCategory(category) {
  const labels = { GO: "Go", GET: "Get", CHECK: "Check", DIGITAL: "Digital" };
  return labels[category] || category;
}
export default function FindTasks() {
  const [tasks, setTasks] = useState([]);
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /* For V1 we ask the browser for location. The browser gives: latitude + longitude */ async function fetchNearbyTasks() {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const params = { latitude, longitude, radiusKm: radius };
          if (category) {
            params.category = category;
          }
          const response = await api.get("/tasks/nearby", { params });
          setTasks(response.data.data || []);
        } catch (error) {
          setError(
            error.response?.data?.message || "Unable to find nearby tasks.",
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(
          "Location permission is required to find nearby physical tasks.",
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }
  useEffect(() => {
    fetchNearbyTasks();
  }, []);
  return (
    <div className="page-container">
      {" "}
      <div className="page-header">
        {" "}
        <div>
          {" "}
          <p className="eyebrow"> EXECUTOR </p> <h1> Find Tasks </h1>{" "}
          <p className="page-description">
            {" "}
            Discover work around you and earn from your free time.{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="task-toolbar">
        {" "}
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {" "}
          <option value=""> All categories </option>{" "}
          <option value="GO"> Go </option> <option value="GET"> Get </option>{" "}
          <option value="CHECK"> Check </option>{" "}
          <option value="DIGITAL"> Digital </option>{" "}
        </select>{" "}
        <select
          value={radius}
          onChange={(event) => {
            const value = Number(event.target.value);
            setRadius(value);
          }}
        >
          {" "}
          <option value="2"> Within 2 km </option>{" "}
          <option value="5"> Within 5 km </option>{" "}
          <option value="10"> Within 10 km </option>{" "}
          <option value="20"> Within 20 km </option>{" "}
        </select>{" "}
        <button className="secondary-button" onClick={fetchNearbyTasks}>
          {" "}
          Refresh{" "}
        </button>{" "}
      </div>{" "}
      {error && <div className="error-message"> {error} </div>}{" "}
      {loading ? (
        <div className="empty-state"> Finding tasks near you... </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          {" "}
          <h3> No nearby tasks </h3>{" "}
          <p> Try expanding your search radius. </p>{" "}
        </div>
      ) : (
        <div className="task-grid">
          {" "}
          {tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="task-card">
              {" "}
              <div className="task-card-top">
                {" "}
                <span className="task-category">
                  {" "}
                  {formatCategory(task.category)}{" "}
                </span>{" "}
                <span className="distance-badge">
                  {" "}
                  {formatDistance(task.distance_meters)}{" "}
                </span>{" "}
              </div>{" "}
              <h3> {task.title} </h3>{" "}
              <p className="task-description"> {task.description} </p>{" "}
              <div className="task-card-footer">
                {" "}
                <div>
                  {" "}
                  <small> Reward </small>{" "}
                  <strong> ₹{task.reward_amount} </strong>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <small> Match score </small>{" "}
                  <strong> {Number(task.match_score).toFixed(0)} </strong>{" "}
                </div>{" "}
              </div>{" "}
            </Link>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
