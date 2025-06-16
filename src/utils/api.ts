import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/",
  withCredentials: true, // Enable cookies to be sent with requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add an interceptor to dynamically add the token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
