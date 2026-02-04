import axiosInstance from "./axios";
import { setToken } from "../utils/auth";

// Login request
export const loginRequest = async(username, password) => {
    const response = await axiosInstance.post("/auth/login", { username, password });

    // Simpan token ke localStorage
    if (response.data.token) {
        setToken(response.data.token);
    }

    return response;
};