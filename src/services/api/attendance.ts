// services/api/attendance.ts
import api from "./api";

export type AttendanceStatus = string; // giữ string để tương thích với backend (backend enum)

export interface Attendance {
  attendance_id: number;
  student_user_id: number;
  class_id: number;
  schedule_id: number;
  status: AttendanceStatus;
  checkin_time?: string | null; // "HH:MM:SS" hoặc "HH:MM"
  attendance_date: string; // "YYYY-MM-DD"
}

/** Create payload (the schema AttendanceCreate) */
export interface AttendanceCreate {
  student_user_id: number;
  schedule_id: number;
  class_id: number;
  status: AttendanceStatus;
  checkin_time?: string | null;
  attendance_date?: string | null; // optional: backend can set today if null
}

/** Initial record when doing batch create */
export interface AttendanceInitialRecord {
  student_user_id: number;
  status: AttendanceStatus;
  checkin_time?: string | null;
}

/** Batch create payload (AttendanceBatchCreate) */
export interface AttendanceBatchCreate {
  schedule_id: number;
  class_id: number;
  attendance_date: string; // "YYYY-MM-DD"
  records: AttendanceInitialRecord[];
}

/** Update late payload (AttendanceUpdateLate) */
export interface AttendanceUpdateLate {
  checkin_time: string | null; // "HH:MM:SS"
  attendance_date: string; // "YYYY-MM-DD"
}

/* ---------- API calls ---------- */

/** Get all attendances */
export async function getAttendances(): Promise<Attendance[]> {
  const res = await api.get<Attendance[]>("/attendances");
  return res.data;
}

/** Get attendance by id */
export async function getAttendanceById(id: number): Promise<Attendance> {
  const res = await api.get<Attendance>(`/attendances/${id}`);
  return res.data;
}

/** Get attendances by schedule id */
export async function getAttendancesBySchedule(schedule_id: number): Promise<Attendance[]> {
  try {
    const res = await api.get<Attendance[]>(`/attendances/${schedule_id}`);
    return res.data;
  } catch (err) {
    // fallback: query param
    const res = await api.get<Attendance[]>("/attendances", { params: { schedule_id } });
    return res.data;
  }
}

/** Create single attendance record */
export async function createAttendance(data: AttendanceCreate): Promise<Attendance> {
  const res = await api.post<Attendance>("/attendances", data);
  return res.data;
}

/** Batch create attendance records for a class (teacher only) */
export async function createBatchAttendance(data: AttendanceBatchCreate): Promise<Attendance[]> {
  const res = await api.post<Attendance[]>("/attendances/batch", data);
  return res.data;
}

/**
 * Update a student's late attendance.
 * Backend endpoint expects student_user_id and schedule_id as query params and AttendanceUpdateLate body.
 */
export async function updateLateAttendance(student_user_id: number, schedule_id: number, data: AttendanceUpdateLate): Promise<Attendance> {
  const res = await api.patch<Attendance>(
    `/attendances/update_late`,
    data,
    { params: { student_user_id, schedule_id } }
  );
  return res.data;
}

/** Update (replace) an attendance by id */
export async function updateAttendance(id: number, data: Partial<AttendanceCreate>): Promise<Attendance> {
  const res = await api.put<Attendance>(`/attendances/${id}`, data);
  return res.data;
}

/** Delete attendance by id */
export async function deleteAttendance(id: number): Promise<void> {
  await api.delete(`/attendances/${id}`);
}

/** Get all attendances (no filter by schedule or teacher) */
export async function getAllAttendances(): Promise<Attendance[]> {
    const res = await api.get<Attendance[]>("/attendances/all");
    return res.data;
}