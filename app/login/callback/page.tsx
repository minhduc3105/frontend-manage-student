"use client";

import { useEffect, useRef } from "react"; // 1. Import useRef
import { useRouter } from "next/navigation";
import { useAuth } from "../../../src/contexts/AuthContext";
import authService from "../../../src/services/authService";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setAuthUser } = useAuth();

  // 2. Tạo ref để đánh dấu đã xử lý hay chưa
  const processedRef = useRef(false);

  useEffect(() => {
    // 3. Kiểm tra: Nếu đã xử lý rồi thì dừng ngay lập tức
    if (processedRef.current) {
      console.log("🚫 Bỏ qua lần gọi lặp lại do React StrictMode");
      return;
    }

    // 4. Đánh dấu là đã đang xử lý
    processedRef.current = true;

    const handleGoogleCallback = async () => {
      console.log("🔹 GoogleCallbackPage render");

      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          console.error("❌ Không có token trong URL");
          router.replace("/login?error=missing_token");
          return;
        }

        console.log("🔹 Nhận token từ URL:", token);

        // Hàm này chỉ được gọi 1 lần duy nhất nhờ cơ chế Ref ở trên
        const user = await authService.handleTokenAndFetchUser(token);

        if (!user) {
          console.error("❌ Không lấy được user info từ /auth/me");
          router.replace("/login?error=auth_failed");
          return;
        }

        setAuthUser(user);
        console.log("✅ Đã lưu user vào context:", user);

        let dashboardRoute = "/student-dashboard";
        if (user.roles?.includes("teacher"))
          dashboardRoute = "/teacher-dashboard";
        else if (user.roles?.includes("manager"))
          dashboardRoute = "/manager-dashboard";
        else if (user.roles?.includes("parent"))
          dashboardRoute = "/parent-dashboard";

        console.log("🔹 Chuyển hướng đến:", dashboardRoute);
        router.replace(dashboardRoute);
      } catch (error) {
        console.error("❌ Callback lỗi:", error);
        router.replace("/login?error=callback_failed");
      }
    };

    handleGoogleCallback();
  }, [router, setAuthUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600 text-lg animate-pulse">
        Đang xử lý đăng nhập Google...
      </p>
    </div>
  );
}
