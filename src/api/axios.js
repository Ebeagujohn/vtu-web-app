import axios from "axios";

// 1. Define base server address
const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// 2. Request Interceptor: Automatically attach DRF Auth Token to EVERY request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("noha_user_token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;