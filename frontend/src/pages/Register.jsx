import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext.jsx";


export default function Register() {
  const navigate =
    useNavigate();

  const {
    register,
    loading,
  } = useAuth();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

  const [error, setError] =
    useState("");


  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    try {
      await register(form);

      navigate(
        "/dashboard"
      );

    } catch (error) {
      setError(
        error.response?.data
          ?.message ||
        "Registration failed."
      );
    }
  }


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="brand">
          <span>HERE</span>
          <strong>PHERI</strong>
        </div>

        <h1>
          Create your account
        </h1>

        <p className="subtitle">
          One account.
          Request tasks or execute them.
        </p>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
        >

          <label>
            Name

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="Your name"
              required
            />
          </label>


          <label>
            Email

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={
                handleChange
              }
              placeholder="you@example.com"
              required
            />
          </label>


          <label>
            Phone

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={
                handleChange
              }
              placeholder="Your phone number"
              required
            />
          </label>


          <label>
            Password

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={
                handleChange
              }
              placeholder="••••••••"
              required
            />
          </label>


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create account"}
          </button>

        </form>


        <p className="auth-footer">
          Already have an account?  
          <Link to="/login">
            Sign in
          </Link>
        </p>

      </div>

    </div>
  );
}

