import { useState, useCallback } from "react"
import {
  Notification,
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
} from "../services/api/notification"

/**
 * Một custom hook để quản lý trạng thái và các tác vụ liên quan đến thông báo.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Lấy danh sách tất cả thông báo cho người dùng hiện tại.
   * Danh sách này sẽ tự động được lọc ở backend dựa trên vai trò của user.
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNotifications()
      setNotifications(data)
      return data
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err)
      setError("Failed to fetch notifications.")
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Lấy thông tin chi tiết một thông báo theo ID và tự động đánh dấu là đã đọc.
   */
  const fetchNotificationById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNotificationById(id)
      
      // Cập nhật trạng thái 'is_read' của thông báo trong state.
      // Vì API getNotificationById() đã tự động gọi markNotificationAsRead() rồi,
      // nên ta chỉ cần cập nhật lại state notifications.
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === id ? { ...notif, is_read: true } : notif
        )
      );
      
      return data
    } catch (err: any) {
      console.error("Failed to fetch notification details:", err)
      setError("Failed to fetch notification details.")
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Đánh dấu một thông báo là đã đọc, chỉ cập nhật state sau khi gọi API thành công.
   */
  const markAsRead = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const updatedNotif = await markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === id ? updatedNotif : notif
        )
      )
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err)
      setError("Failed to mark notification as read.")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    fetchNotificationById,
    markAsRead,
  }
}