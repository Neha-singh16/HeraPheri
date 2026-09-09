import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token automatically
// to protected API requests.
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.endsWith("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= api
      .post("/auth/refresh", { refreshToken })
      .then((response) => {
        const accessToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
      })
      .catch((refreshError) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });

    try {
      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default api;

