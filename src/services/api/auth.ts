// services/api/auth.ts (updated)

import api from "./api";

// Cập nhật tên interface để khớp với `useAuth`
// This name matches the one expected by the `useAuth` hook.
export interface LoginResponse {
  access_token: string;
  username: string;
  user_id: number;
  email: string;
  full_name: string;
  gender: string;
  dob: string;
  phone: string;
  roles: string[];
  password?: string;
}

// Kiểu dữ liệu người dùng chuẩn để dùng trong app
export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  roles: string[];
  gender?: string;
  phone?: string;
  dob?: string;
}

// Gọi API đăng nhập
export interface LoginRequest {
  username: string;
  password: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export interface GoogleLoginRequest {
  code: string; // mã code nhận từ frontend (Google OAuth2)
}

export async function loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/google", data);
  return res.data;
}
