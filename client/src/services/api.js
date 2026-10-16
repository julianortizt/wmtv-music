import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Opcional: redirigir a login desde aquí o dejar que el componente lo maneje
    }
    return Promise.reject(err);
  }
);

export default api;
