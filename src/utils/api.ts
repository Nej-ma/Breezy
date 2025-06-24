// src/utils/api.ts - Version debug
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/",  // ✅ Utilise les API routes Next.js
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Debug intercepteur (à commenter en production)
/*
apiClient.interceptors.request.use((config) => {
  console.log("🔍 API Request:", {
    url: config.url,
    fullURL: (config.baseURL || '') + (config.url || ''),
    method: config.method,
    cookies: document.cookie,
    withCredentials: config.withCredentials
  });
  return config;
});
*/
// Intercepteur pour gérer les erreurs 401 et refresh automatique
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
   
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
     
      try {
        // Essayer de rafraîchir le token via votre API route Next.js
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: 'include'
        });
       
        if (refreshResponse.ok) {
          // Token rafraîchi avec succès, réessayer la requête originale
          return apiClient(originalRequest);
        } else {
          // Refresh échoué - rediriger vers login
          window.location.href = "/sign-in";
        }
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        window.location.href = "/sign-in";
      }
    }
   
    return Promise.reject(error);
  }
);

export default apiClient;