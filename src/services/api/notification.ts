import api from "./api";

// Interfaces from backend schemas
export interface Notification {
  notification_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  sent_at: string;
  type: "payroll" | "tuition" | "schedule" | "warning" | "others";
}

export interface NotificationCreate {
  receiver_id: number;
  content: string;
  sender_id?: number; // Sẽ được tự động thêm vào ở backend
}

export interface NotificationUpdate {
  content?: string;
  is_read?: boolean;
  type?: "info" | "warning" | "alert";
}

// ===== API Functions =====

/**
 * Lấy danh sách thông báo.
 * Dựa vào quyền người dùng, API sẽ trả về tất cả thông báo (manager)
 * hoặc chỉ những thông báo gửi đến user hiện tại (các vai trò khác).
 */
export const getNotifications = async (): Promise<Notification[]> => {
  const res = await api.get("/notifications/");
  return res.data;
};

/**
 * Lấy chi tiết một thông báo theo ID.
 * Khi xem chi tiết, thông báo sẽ tự động được đánh dấu là đã đọc.
 */
export const getNotificationById = async (id: number): Promise<Notification> => {
  // Đồng thời gọi API để đánh dấu đã đọc
  await markNotificationAsRead(id);
  const res = await api.get(`/notifications/${id}`);
  return res.data;
};

/**
 * Tạo một thông báo mới.
 */
export const createNotification = async (payload: NotificationCreate): Promise<Notification> => {
  const res = await api.post("/notifications/", payload);
  return res.data;
};

/**
 * Cập nhật một thông báo (dành cho manager).
 */
export const updateNotification = async (
  id: number,
  payload: NotificationUpdate
): Promise<Notification> => {
  const res = await api.put(`/notifications/${id}`, payload);
  return res.data;
};

/**
 * Đánh dấu một thông báo là đã đọc.
 */
export const markNotificationAsRead = async (id: number): Promise<Notification> => {
  const res = await api.put(`/notifications/${id}/read?is_read=true`);
  return res.data;
};


/**
 * Xóa một thông báo.
 */
export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};