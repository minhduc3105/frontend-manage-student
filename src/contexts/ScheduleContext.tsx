"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from "react";
import toast from "react-hot-toast";
import {
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/api/schedule";
import { useAuth } from "./AuthContext"; // 👈 guard auth

interface ScheduleContextType {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: () => Promise<void>;
  addSchedule: (data: ScheduleCreate) => Promise<Schedule>;
  editSchedule: (id: number, data: ScheduleUpdate) => Promise<Schedule>;
  removeSchedule: (id: number) => Promise<void>;
  resetSchedules: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔐 auth guard
  const { loading: authLoading, isAuthenticated } = useAuth();

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchedules();
      setSchedules(data ?? []);
    } catch (err: any) {
      const msg = err?.message || "Không thể tải danh sách lịch học";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSchedules = useCallback(() => {
    setSchedules([]);
    setLoading(true);
    setError(null);
  }, []);

  const addSchedule = useCallback(
    async (data: ScheduleCreate) => {
      try {
        const newItem = await createSchedule(data);
        setSchedules((prev) => [...prev, newItem]);

        try {
          await fetchSchedules();
        } catch (fetchErr: any) {
          toast.error("Tạo lịch thành công nhưng cập nhật danh sách thất bại.");
          console.error("fetchSchedules after create failed:", fetchErr);
        }

        toast.success("Tạo lịch học thành công!");
        return newItem;
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Không thể tạo lịch học";
        toast.error(msg);
        throw new Error(msg);
      }
    },
    [fetchSchedules]
  );

  const editSchedule = useCallback(
    async (id: number, data: ScheduleUpdate) => {
      try {
        const updated = await updateSchedule(id, data);
        setSchedules((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
        );

        try {
          await fetchSchedules();
        } catch (fetchErr: any) {
          console.warn("fetchSchedules after update failed:", fetchErr);
        }

        toast.success("Cập nhật lịch học thành công!");
        return updated;
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Không thể cập nhật lịch học";
        toast.error(msg);
        throw new Error(msg);
      }
    },
    [fetchSchedules]
  );

  const removeSchedule = useCallback(async (id: number) => {
    try {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success("Xoá lịch học thành công!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Không thể xóa lịch học";
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  // 🔐 chỉ fetch khi auth init xong
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setSchedules([]);
      setError(null);
      setLoading(false);
      return;
    }

    fetchSchedules();
  }, [authLoading, isAuthenticated, fetchSchedules]);

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        error,
        fetchSchedules,
        addSchedule,
        editSchedule,
        removeSchedule,
        resetSchedules,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedules() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedules phải dùng bên trong ScheduleProvider");
  return ctx;
}
