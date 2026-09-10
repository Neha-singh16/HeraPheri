import { createContext, useContext, useEffect, useState } from "react";

import api from "../api/client.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleAuthLogout() {
      setUser(null);
    }

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  // LOGIN
  async function login(email, password) {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem("accessToken", accessToken);

      localStorage.setItem("refreshToken", refreshToken);

      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return response.data;
    } finally {
      setLoading(false);
    }
  }

  // REGISTER
  async function register({ name, email, phone, password }) {
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        phone,
        password,
      });

      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem("accessToken", accessToken);

      localStorage.setItem("refreshToken", refreshToken);

      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return response.data;
    } finally {
      setLoading(false);
    }
  }

  // LOGOUT

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");

    const currentUser = user;

    try {
      await api.post("/auth/logout", {
        refreshToken,
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("accessToken");

      localStorage.removeItem("refreshToken");

      localStorage.removeItem("user");

      /*
      Clear only this user's marketplace mode.
    */
      if (currentUser?.id) {
        localStorage.removeItem(`activeMode:${currentUser.id}`);
      }

      setUser(null);
    }
  }

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
