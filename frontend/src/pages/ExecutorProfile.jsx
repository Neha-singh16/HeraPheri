import { useEffect, useState } from "react";

import api from "../api/client.jsx";
import { useMode } from "../context/ModeContext.jsx";

const { setMode, refreshExecutorCapability } = useMode();
const emptyForm = {
  bio: "",
};

export default function ExecutorProfile() {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  async function fetchProfile() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/executor-profile");

      const data = response.data.data;

      setProfile(data);

      setForm({
        bio: data.bio || "",
      });
    } catch (error) {
      /*
        404 means this user has not
        created an Executor profile yet.
      */
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        setError(
          error.response?.data?.message || "Unable to load Executor profile.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function createProfile(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/executor-profile", {
        bio: form.bio.trim(),
      });

      setProfile(response.data.data);

      await refreshExecutorCapability();

      setMode("EXECUTOR");

      setMessage("Executor profile created successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to create Executor profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability() {
    if (!profile) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.patch("/executor-profile/availability", {
        isAvailable: !profile.is_available,
      });

      setProfile(response.data.data);

      setMessage(response.data.message || "Availability updated.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to update availability.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");

      return;
    }

    setLocationLoading(true);
    setError("");
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await api.patch("/executor-profile/location", {
            latitude,
            longitude,
          });

          setProfile(response.data.data);

          setMessage("Location updated successfully.");
        } catch (error) {
          setError(
            error.response?.data?.message || "Unable to update location.",
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (geoError) => {
        console.error("Geolocation error:", geoError);

        setError(
          "Please allow location access to update your Executor location.",
        );

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  if (loading) {
    return <div className="empty-state">Loading Executor profile...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">EXECUTOR</p>

          <h1>Executor Profile</h1>

          <p className="page-description">
            Manage your availability, location and execution profile.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {message && <div className="success-message">{message}</div>}

      {!profile ? (
        <section className="profile-card">
          <div className="profile-card-header">
            <div>
              <h2>Become an Executor</h2>

              <p>Create your Executor profile before accepting tasks.</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={createProfile}>
            <label>
              About you
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="6"
                maxLength="1000"
                placeholder="Tell Requesters what kind of tasks you can handle..."
                required
              />
            </label>

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Creating..." : "Create Executor Profile"}
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Your Executor profile</h2>

                <p>
                  This information helps HEREPHERI match you with suitable
                  tasks.
                </p>
              </div>

              <span
                className={
                  profile.is_available
                    ? "availability-badge available"
                    : "availability-badge unavailable"
                }
              >
                {profile.is_available ? "Available" : "Unavailable"}
              </span>
            </div>

            <div className="profile-bio">
              <small>About</small>

              <p>{profile.bio || "No bio added yet."}</p>
            </div>

            <div className="profile-actions">
              <button
                className="primary-button"
                onClick={toggleAvailability}
                disabled={saving}
              >
                {profile.is_available ? "Go Offline" : "Go Available"}
              </button>

              <button
                className="secondary-button"
                onClick={updateLocation}
                disabled={locationLoading}
              >
                {locationLoading
                  ? "Updating location..."
                  : "Update My Location"}
              </button>
            </div>
          </section>

          <section className="profile-stats">
            <div className="profile-stat">
              <span>Trust Score</span>

              <strong>{Number(profile.trust_score || 0).toFixed(0)}</strong>
            </div>

            <div className="profile-stat">
              <span>Completion Rate</span>

              <strong>
                {Number(profile.completion_rate || 0).toFixed(0)}%
              </strong>
            </div>

            <div className="profile-stat">
              <span>On-time Rate</span>

              <strong>{Number(profile.on_time_rate || 0).toFixed(0)}%</strong>
            </div>

            <div className="profile-stat">
              <span>Completed Tasks</span>

              <strong>{profile.completed_tasks || 0}</strong>
            </div>
          </section>

          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Current location</h2>

                <p>Required for physical and hybrid task matching.</p>
              </div>
            </div>

            <div className="location-status">
              <div>
                <small>Last updated</small>

                <strong>
                  {profile.last_location_at
                    ? new Date(profile.last_location_at).toLocaleString("en-IN")
                    : "Location not set"}
                </strong>
              </div>

              <button
                className="secondary-button"
                onClick={updateLocation}
                disabled={locationLoading}
              >
                {locationLoading ? "Updating..." : "Refresh Location"}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
