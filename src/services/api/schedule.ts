// services/api/schedule.ts
import api from "./api"

export interface Schedule {
  id: number;
  class_id?: number;
  class_name: string;
  room?: string | null; 
  schedule_type: "WEEKLY" | "ONCE";
  day_of_week?: string; // nếu WEEKLY
  date?: string; // nếu ONCE
  start_time: string;
  end_time: string;
}

export interface ScheduleCreate {
  class_id: number;
  room?: string | null; 
  schedule_type: "WEEKLY" | "ONCE";
  day_of_week?: string;
  date?: string;
  start_time: string;
  end_time: string;
}

export interface ScheduleUpdate {
  class_id?: number;
  room?: string | null; 
  schedule_type?: "WEEKLY" | "ONCE";
  day_of_week?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

// Lấy toàn bộ schedule
export async function getSchedules(): Promise<Schedule[]> {
  const res = await api.get<Schedule[]>("/schedules/search")
  return res.data
}

// Lấy 1 schedule theo ID
export async function getScheduleById(id: number): Promise<Schedule> {
  const res = await api.get<Schedule>(`/schedules/${id}`)
  return res.data
}

// Tạo mới
export async function createSchedule(data: ScheduleCreate): Promise<Schedule> {
  const res = await api.post<Schedule>("/schedules", data)
  return res.data
}

// Cập nhật
export async function updateSchedule(id: number, data: ScheduleUpdate): Promise<Schedule> {
  const res = await api.put<Schedule>(`/schedules/${id}`, data)
  return res.data
}

// Xoá
export async function deleteSchedule(id: number): Promise<void> {
  await api.delete(`/schedules/${id}`)
}
