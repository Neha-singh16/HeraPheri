import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/client.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useMode } from "../context/ModeContext.jsx";

function getInitials(name) {
  return (
    name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "HP"
  );
}

function formatRole(role) {
  if (role === "ADMIN") return "Administrator";
  return role === "EXECUTOR" ? "Executor" : "Requester";
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { isAdmin, hasExecutorProfile } = useMode();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/users/me");
        setProfile(response.data.data);
        setForm({ name: response.data.data.name || "", phone: response.data.data.phone || "" });
        updateUser(response.data.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
    setSaved(false);
  }

  function cancelEditing() {
    setForm({ name: profile?.name || "", phone: profile?.phone || "" });
    setEditing(false);
    setError("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await api.patch("/users/me", { name: form.name, phone: form.phone });
      setProfile(response.data.data);
      updateUser(response.data.data);
      setEditing(false);
      setSaved(true);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = isAdmin
    ? "Administrator"
    : hasExecutorProfile
      ? "Requester and Executor"
      : formatRole(profile?.role);

  if (loading) return <div className="empty-state">Loading your profile...</div>;

  return (
    <div className="page-container account-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">YOUR ACCOUNT</p>
          <h1>Profile</h1>
          <p className="page-description">Keep your account details and marketplace identity in view.</p>
        </div>
        {!editing && <button className="primary-button" type="button" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>

      {error && <div className="error-message">{error}</div>}
      {saved && <div className="success-message">Profile changes saved.</div>}

      <div className="account-layout">
        <section className="profile-card account-identity-card">
          <div className="account-profile-heading">
            <div className="account-avatar" aria-hidden="true">{getInitials(profile?.name)}</div>
            <div>
              <p className="eyebrow">MEMBER</p>
              <h2>{profile?.name || "HeraPheri member"}</h2>
              <p>{roleLabel}</p>
            </div>
          </div>

          {editing ? (
            <form className="account-edit-form" onSubmit={saveProfile}>
              <label>Full name<input name="name" value={form.name} onChange={handleChange} maxLength={100} required /></label>
              <label>Phone number<input name="phone" value={form.phone} onChange={handleChange} inputMode="tel" placeholder="Optional" /></label>
              <div className="account-edit-note"><strong>Email</strong><span>{profile?.email}</span><small>Managed by your login account and cannot be changed here.</small></div>
              <div className="form-actions account-edit-actions">
                <button className="secondary-button" type="button" onClick={cancelEditing} disabled={saving}>Cancel</button>
                <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          ) : (
            <div className="account-details">
              <div><span>Full name</span><strong>{profile?.name}</strong></div>
              <div><span>Email</span><strong>{profile?.email}</strong><small>Managed by your login account</small></div>
              <div><span>Phone</span><strong>{profile?.phone || "Not added"}</strong></div>
              <div><span>Account status</span><strong>{profile?.account_status || "Active"}</strong></div>
            </div>
          )}
        </section>

        <aside className="account-side-column">
          <section className="account-link-card">
            <p className="eyebrow">MARKETPLACE IDENTITY</p>
            <h2>Build trust through every task.</h2>
            <p>Your reputation and Executor profile help other members decide who to work with.</p>
            <div className="account-link-actions">
              <Link to="/reputation" className="secondary-button">View reputation</Link>
              {!isAdmin && <Link to="/executor-profile" className="secondary-button">{hasExecutorProfile ? "Manage Executor profile" : "Become an Executor"}</Link>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
