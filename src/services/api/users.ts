import api from "./api";

// Interfaces từ các schemas backend
export interface User {
  user_id: number;
  username: string;
  roles: string[];
  full_name: string;
  email: string;
}

export interface UserViewDetails {
  user_id: number;
  username: string;
  user_roles: string[];
  full_name: string;
  email: string;
  phone_number: string;
  password_changed: boolean;
  date_of_birth: string;
  gender: string;
}

export interface UserCreate {
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  password?: string;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  password?: string;
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ImportUsersResponse {
  status: string;
  imported: { [key: string]: any }; // Sử dụng kiểu này để phù hợp với Dict[str, dict] của Python
}

// Lấy tất cả người dùng
export const getUsers = async (options?: { signal?: AbortSignal }): Promise<User[]> => {
  const res = await api.get<User[]>("/users", { signal: options?.signal });
  return res.data;
};


// Lấy thông tin người dùng theo ID
export const getUserById = async (id: number): Promise<UserViewDetails> => {
  const res = await api.get<UserViewDetails>(`/users/${id}`);
  return res.data;
};

// Tạo người dùng mới
export const createUser = async (data: UserCreate): Promise<User> => {
  const res = await api.post<User>("/users/", data);
  return res.data;
};

// Cập nhật thông tin người dùng
export const updateUser = async (
  id: number,
  data: UserUpdate
): Promise<User> => {
  const res = await api.put<User>(`/users/${id}`, data);
  return res.data;
};

// Xóa người dùng
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

// Import người dùng từ file Excel
export const importUsers = async (file: File): Promise<ImportUsersResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/users/import-users", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Cập nhật mật khẩu người dùng
export const updateUserPassword = async (
  id: number,
  payload: UpdatePasswordRequest
): Promise<any> => {
  const res = await api.put(`/users/${id}/password`, payload);
  return res.data;
};
