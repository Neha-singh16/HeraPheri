import { useState } from "react";

import api from "../api/client.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const DEFAULT_PREFERENCES = {
  activityNotifications: true,
  paymentUpdates: true,
  deadlineReminders: true,
  soundFeedback: true,
};

function PreferenceRow({ name, title, description, checked, saving, onChange }) {
  return (
    <label className="settings-row">
      <span><strong>{title}</strong><small>{description}</small></span>
      <input type="checkbox" role="switch" checked={checked} disabled={saving} onChange={() => onChange(name)} />
    </label>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [preferences, setPreferences] = useState({ ...DEFAULT_PREFERENCES, ...(user?.notification_preferences || {}) });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPreference, setSavingPreference] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function updatePreference(name) {
    const next = { ...preferences, [name]: !preferences[name] };
    setPreferences(next);
    setSavingPreference(name);
    setMessage("");
    setError("");

    try {
      await api.patch("/users/me/preferences", { preferences: { [name]: next[name] } });
      updateUser({ ...user, notification_preferences: next });
      setMessage("Notification preferences saved.");
    } catch (saveError) {
      setPreferences(preferences);
      setError(saveError.response?.data?.message || "Unable to save this preference.");
    } finally {
      setSavingPreference("");
    }
  }

  function handlePasswordChange(event) {
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
    setMessage("");
  }

  async function changePassword(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setPasswordSaving(true);
    setError("");
    setMessage("");
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Password changed successfully.");
    } catch (passwordError) {
      setError(passwordError.response?.data?.message || "Unable to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  const isGoogleAccount = user?.auth_provider === "GOOGLE";

  return (
    <div className="page-container account-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Settings</h1>
          <p className="page-description">Control notifications and secure your HeraPheri account.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="settings-layout">
        <section className="profile-card settings-section">
          <div className="settings-section-heading">
            <p className="eyebrow">NOTIFICATIONS</p>
            <h2>Stay in the loop</h2>
            <p>Choose the activity updates that matter to you.</p>
          </div>
          <div className="settings-list">
            <PreferenceRow name="activityNotifications" title="Task activity" description="Assignments, task acceptance, proof, and approvals." checked={preferences.activityNotifications} saving={savingPreference === "activityNotifications"} onChange={updatePreference} />
            <PreferenceRow name="paymentUpdates" title="Payment updates" description="Payment holds, releases, refunds, and reward updates." checked={preferences.paymentUpdates} saving={savingPreference === "paymentUpdates"} onChange={updatePreference} />
            <PreferenceRow name="deadlineReminders" title="Deadline reminders" description="Helpful reminders when active tasks are approaching their deadline." checked={preferences.deadlineReminders} saving={savingPreference === "deadlineReminders"} onChange={updatePreference} />
            <PreferenceRow name="soundFeedback" title="Sound feedback" description="Allow notification sounds when supported by your device." checked={preferences.soundFeedback} saving={savingPreference === "soundFeedback"} onChange={updatePreference} />
          </div>
        </section>

        <section className="profile-card settings-section">
          <div className="settings-section-heading">
            <p className="eyebrow">SECURITY</p>
            <h2>Protect your account</h2>
            <p>{isGoogleAccount ? "This account uses Google Sign-In. Password changes are managed by Google." : "Change your password regularly to keep your account secure."}</p>
          </div>
          {!isGoogleAccount && (
            <form className="settings-password-form" onSubmit={changePassword}>
              <label>Current password<input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} autoComplete="current-password" required /></label>
              <label>New password<input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} minLength={8} autoComplete="new-password" required /><small>Use at least 8 characters.</small></label>
              <label>Confirm new password<input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} minLength={8} autoComplete="new-password" required /></label>
              <button className="primary-button" type="submit" disabled={passwordSaving}>{passwordSaving ? "Saving..." : "Change password"}</button>
            </form>
          )}
        </section>

        <section className="profile-card settings-section settings-info-card">
          <p className="eyebrow">ACCOUNT</p>
          <h2>Account information</h2>
          <div className="account-details">
            <div><span>Email</span><strong>{user?.email}</strong><small>Managed by your login account</small></div>
            <div><span>Status</span><strong>{user?.account_status || "Active"}</strong></div>
            <div><span>Authentication</span><strong>{isGoogleAccount ? "Google Sign-In" : "Email and password"}</strong></div>
          </div>
        </section>

        <section className="account-danger-card settings-danger-card">
          <div><p className="eyebrow">SESSION</p><h2>Current session</h2><p>This device is signed in to your HeraPheri account.</p></div>
          <button className="secondary-button" type="button" onClick={logout}>Sign out</button>
        </section>
      </div>
    </div>
  );
}
