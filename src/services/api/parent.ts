import api from "./api";

// Enum cho giới tính
export type GenderEnum = "male" | "female" | "other";

// Interfaces đại diện cho các schema của Phụ huynh và Học sinh
export interface ParentBase {
  user_id: number;
}

export interface Parent extends ParentBase {
  // Thêm các trường khác nếu có trong response của API
}

export interface ParentUpdate extends ParentBase {
  // Các trường có thể cập nhật
}

export interface ParentCreate extends ParentBase {
  // Các trường cần thiết để tạo mới
}

export interface Child {
  name: string;
  email: string;
  gender: GenderEnum;
  phone_number: string;
  date_of_birth: string; // Sử dụng string vì đã được format ở backend
}

// Hàm lấy danh sách tất cả phụ huynh
export const getParents = async (): Promise<Parent[]> => {
  const res = await api.get("/parents/");
  return res.data;
};

// Hàm lấy thông tin phụ huynh bằng user_id
export const getParentById = async (userId: number): Promise<Parent> => {
  const res = await api.get(`/parents/${userId}`);
  return res.data;
};

// Hàm lấy danh sách con của một phụ huynh
export const getParentChildren = async (parentUserId: number): Promise<Child[]> => {
  const res = await api.get(`/parents/${parentUserId}/children`);
  return res.data;
};

// Hàm tạo mới một phụ huynh
export const createParent = async (payload: ParentCreate): Promise<Parent> => {
  const res = await api.post("/parents/", payload);
  return res.data;
};

// Hàm cập nhật thông tin phụ huynh
export const updateParent = async (userId: number, payload: ParentUpdate): Promise<Parent> => {
  const res = await api.put(`/parents/${userId}`, payload);
  return res.data;
};

// Hàm xóa một phụ huynh
export const deleteParent = async (userId: number): Promise<void> => {
  await api.delete(`/parents/${userId}`);
};