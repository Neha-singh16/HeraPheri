import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/client.jsx";


const initialForm = {
  title: "",
  description: "",
  category: "",
  taskMode: "PHYSICAL",
  rewardAmount: "",
  currency: "INR",
  deadlineAt: "",
  riskLevel: "LOW",
  proofType: "PHOTO",
  addressText: "",
  latitude: "",
  longitude: "",
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

export default function CreateTask() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [locationQuery, setLocationQuery] = useState("");

  const [locationResults, setLocationResults] = useState([]);

  const [locationSearching, setLocationSearching] = useState(false);

  const [locationError, setLocationError] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const query = locationQuery.trim();

    if (query.length < 3 || form.addressText === query) {
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLocationSearching(true);
      setLocationError("");

      try {
        const response = await fetch(
          `${NOMINATIM_URL}/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Location search failed.");
        }

        setLocationResults(await response.json());
      } catch (error) {
        if (error.name !== "AbortError") {
          setLocationError("Unable to search for that place.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLocationSearching(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [form.addressText, locationQuery]);

  function selectLocation(location) {
    setForm({
      ...form,
      addressText: location.display_name,
      latitude: location.lat,
      longitude: location.lon,
    });
    setLocationQuery(location.display_name);
    setLocationResults([]);
    setLocationSearching(false);
    setLocationError("");
  }

  function handleLocationQueryChange(event) {
    const value = event.target.value;

    setLocationQuery(value);
    setLocationResults([]);
    setLocationSearching(false);

    if (value !== form.addressText) {
      setForm({
        ...form,
        addressText: "",
        latitude: "",
        longitude: "",
      });
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed.");
          }

          const location = await response.json();

          setForm({
            ...form,
            addressText: location.display_name || "Current location",
            latitude,
            longitude,
          });
          setLocationQuery(location.display_name || "Current location");
        } catch {
          setForm({
            ...form,
            addressText: "Current location",
            latitude,
            longitude,
          });
          setLocationQuery("Current location");
          setLocationError(
            "Coordinates were found, but the address could not be loaded.",
          );
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Please allow location access to use your location.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),

        description: form.description.trim(),

        category: form.category,

        taskMode: form.taskMode,

        rewardAmount: Number(form.rewardAmount),

        currency: form.currency,

        deadlineAt: form.deadlineAt,

        riskLevel: form.riskLevel,

        proofType: form.proofType,

        addressText: form.addressText.trim(),
      };

      // Physical and Hybrid tasks need location.
      if (form.taskMode === "PHYSICAL" || form.taskMode === "HYBRID") {
        if (
          !form.addressText.trim() ||
          form.latitude === "" ||
          form.longitude === ""
        ) {
          setError("Select a location before creating this task.");
          setLoading(false);
          return;
        }

        payload.latitude = Number(form.latitude);

        payload.longitude = Number(form.longitude);
      }

      const response = await api.post("/tasks", payload);

      const createdTask = response.data.data;

      navigate(`/tasks/${createdTask.id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">NEW TASK</p>

          <h1>Create a task</h1>

          <p className="page-description">
            Tell an Executor exactly what needs to be done.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="task-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Task details</h2>

          <label>
            Task title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Collect my certificate from college"
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Explain exactly what the Executor needs to do..."
              rows="5"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>

                <option value="GO">Go</option>

                <option value="GET">Get / Pickup / Delivery</option>

                <option value="CHECK">Check / Inspect</option>

                <option value="DIGITAL">Digital / Research</option>
              </select>
            </label>

            <label>
              Task mode
              <select
                name="taskMode"
                value={form.taskMode}
                onChange={handleChange}
              >
                <option value="PHYSICAL">Physical</option>

                <option value="DIGITAL">Digital</option>

                <option value="HYBRID">Hybrid</option>
              </select>
            </label>
          </div>
        </section>

        <section className="form-section">
          <h2>Reward & deadline</h2>

          <div className="form-grid">
            <label>
              Reward
              <input
                type="number"
                name="rewardAmount"
                value={form.rewardAmount}
                onChange={handleChange}
                placeholder="300"
                min="1"
                step="1"
                required
              />
            </label>

            <label>
              Currency
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
              >
                <option value="INR">INR</option>
              </select>
            </label>
          </div>

          <label>
            Deadline
            <input
              type="datetime-local"
              name="deadlineAt"
              value={form.deadlineAt}
              onChange={handleChange}
              required
            />
          </label>
        </section>

        <section className="form-section">
          <h2>Safety & proof</h2>

          <div className="form-grid">
            <label>
              Risk level
              <select
                name="riskLevel"
                value={form.riskLevel}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>

                <option value="MEDIUM">Medium</option>

                <option value="HIGH">High</option>
              </select>
              <small>High-risk tasks are not automatically matched.</small>
            </label>

            <label>
              Proof required
              <select
                name="proofType"
                value={form.proofType}
                onChange={handleChange}
              >
                <option value="PHOTO">Photo</option>

                <option value="TEXT">Text</option>

                <option value="SCREENSHOT">Screenshot</option>
              </select>
            </label>
          </div>
        </section>

        {(form.taskMode === "PHYSICAL" || form.taskMode === "HYBRID") && (
          <section className="form-section">
            <h2>Location</h2>

            <label className="location-picker-label">
              <span>Search for a place</span>
              <input
                value={locationQuery}
                onChange={handleLocationQueryChange}
                placeholder="Kasturba DSEU, Pitampura"
                required
              />
            </label>

            {locationSearching && (
              <small className="location-hint">Searching places...</small>
            )}

            {locationResults.length > 0 && (
              <div className="location-results">
                {locationResults.map((location) => (
                  <button
                    type="button"
                    className="location-result"
                    key={location.place_id}
                    onClick={() => selectLocation(location)}
                  >
                    {location.display_name}
                  </button>
                ))}
              </div>
            )}

            {form.addressText && (
              <div className="selected-location">
                <span aria-hidden="true">✓</span>
                <strong>{form.addressText}</strong>
              </div>
            )}

            <button
              type="button"
              className="secondary-button location-button"
              onClick={useCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? "Finding your location..." : "Use my current location"}
            </button>

            {locationError && (
              <small className="location-error">{locationError}</small>
            )}

            <div className="location-coordinates" aria-hidden="true">
              {form.latitude}, {form.longitude}
            </div>
          </section>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
