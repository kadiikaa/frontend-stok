import axios from "axios";
import { getToken, logout } from "../utils/auth";

// ambil base URL dari environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const instance = axios.create({
    baseURL: `${API_URL}/api`, // otomatis pakai backend live
});

// token ke header setiap request
instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// interceptor response untuk handle token expired
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            logout();
        }
        return Promise.reject(error);
    }
);

export default instance;