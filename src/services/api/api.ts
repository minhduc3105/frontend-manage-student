// src/services/api.ts
import axios from "axios";

const BASE_HOST =
  process.env.NEXT_PUBLIC_API_URL || "https://api.dbdb-team.site";

const API_BASE_URL = `${BASE_HOST.replace(/\/+$/, "")}/api/v1`;

// Lấy access token từ localStorage
function getAccessToken() {
  return localStorage.getItem("access_token");
}

// Tạo instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // gửi cookie refresh_token
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: tự động gắn token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    // Nếu headers là AxiosHeaders thì dùng .set()
    if ("set" in config.headers) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      // Nếu headers là object thuần
      (config.headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: refresh token khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ BỘ NGẮT MẠCH (CIRCUIT BREAKER)
    // Nếu chính request REFRESH bị 401, hãy dừng lại ngay
    if (
      error.response?.status === 401 &&
      originalRequest.url.includes("/auth/refresh")
    ) {
      console.error("🔴 Auth: Refresh token failed or expired. Logging out.");

      // Logout (vì refresh đã hỏng)
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.setItem("logout", Date.now().toString());
      window.location.href = "/login"; // Hoặc nơi bạn xử lý logout

      return Promise.reject(error); // Ngắt vòng lặp
    }

    // ✅ LOGIC THỬ REFRESH MỘT LẦN (Cho các request khác)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử

      try {
        console.log("Interceptor: Access token expired. Attempting refresh...");

        // Gọi refresh token
        const res = await api.post("/auth/refresh");
        const newToken = res.data.access_token;

        // Lưu token mới
        localStorage.setItem("access_token", newToken);

        // Cập nhật header cho 'api' (Axios) và request gốc
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return api(originalRequest); // Thử lại request gốc
      } catch (refreshError) {
        // Nếu refresh thất bại, cũng logout
        console.error(
          "🔴 Auth: Refresh attempt failed. Logging out.",
          refreshError
        );

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.setItem("logout", Date.now().toString());
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default api;
