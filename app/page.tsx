"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "src/contexts/AuthContext";
import authService from "src/services/authService";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setAuthUser } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // ✅ Lấy token từ URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          console.error("❌ Không có token trong URL");
          router.push("/login?error=missing_token");
          return;
        }

        // ✅ Lưu token + fetch user info từ backend
        const user = await authService.handleTokenAndFetchUser(token);

        // ✅ Debug: in ra toàn bộ user info
        console.log("🔹 Token đã xử lý:", token);
        console.log("🔹 User info nhận được từ handleTokenAndFetchUser:", user);
        if (user?.roles) console.log("🔹 Roles của user:", user.roles);

        if (!user) {
          console.error("❌ Không lấy được user info từ /auth/me");
          router.push("/login?error=auth_failed");
          return;
        }

        // ✅ Update context
        setAuthUser(user);

        // ✅ Chuyển hướng đến dashboard theo role
        const dashboardRoute = authService.getDashboardRoute();
        console.log("🔹 Chuyển hướng đến dashboard:", dashboardRoute);
        

        router.push(dashboardRoute);
      } catch (error) {
        console.error("❌ Callback lỗi:", error);
        router.push("/login?error=invalid_data");
      }
    };

    handleGoogleCallback();
  }, [router, setAuthUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Đang xử lý đăng nhập Google...</p>
    </div>
  );
}
