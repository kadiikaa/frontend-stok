import axios from "axios";
import { getToken, logout } from "../utils/auth";

const instance = axios.create({
    baseURL: "http://localhost:3000/api",
});


//  token ke header setiap request
instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tambahkan interceptor response untuk handle token expired
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // token kadaluarsa atau salah → logout & redirect
            logout();
        }
        return Promise.reject(error);
    }
);

export default instance;