// Simpan token ke localStorage
export const setToken = (token) => {
    localStorage.setItem("token", token);
};

// Ambil token dari localStorage
export const getToken = () => {
    return localStorage.getItem("token");
};

// Logout + redirect ke halaman login
export const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // redirect otomatis
};