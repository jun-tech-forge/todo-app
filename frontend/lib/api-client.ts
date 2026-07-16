import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("API request failed", error?.response?.data ?? error);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
