// hooks/useSchedules.ts
import { useEffect, useState, useCallback } from "react"
import {
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/api/schedule"

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // === Fetch schedules ===
  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSchedules()
      setSchedules(data)
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lịch học")
    } finally {
      setLoading(false)
    }
  }, [])

    const resetSchedules = useCallback(() => {
    setSchedules([]);
    setLoading(true);
    setError(null);
  }, []);

  // === CRUD actions ===
  const addSchedule = useCallback(async (data: ScheduleCreate) => {
    try {
      const newItem = await createSchedule(data)
      setSchedules((prev) => [...prev, newItem])
      return newItem
    } catch (err: any) {
      throw new Error(err.message || "Không thể tạo lịch học")
    }
  }, [])

  const editSchedule = useCallback(async (id: number, data: ScheduleUpdate) => {
    try {
      const updated = await updateSchedule(id, data)
      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)))
      return updated
    } catch (err: any) {
      throw new Error(err.message || "Không thể cập nhật lịch học")
    }
  }, [])

  const removeSchedule = useCallback(async (id: number) => {
    try {
      await deleteSchedule(id)
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      throw new Error(err.message || "Không thể xóa lịch học")
    }
  }, [])

  const retryFetch = useCallback(async (maxRetries = 3) => {
    let attempts = 0
    while (attempts < maxRetries) {
      try {
        await fetchSchedules()
        break
      } catch (err) {
        attempts++
        if (attempts === maxRetries) {
          console.error("Max retry attempts reached for fetching schedules")
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts) * 1000)
          )
        }
      }
    }
  }, [fetchSchedules])

  // === Initial fetch only once ===
  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    resetSchedules,
    addSchedule,
    editSchedule,
    removeSchedule,
    retryFetch,
  }
}
