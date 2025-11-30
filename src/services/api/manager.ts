import api from "./api";

export interface ManagerStats {
  total_classes: number;
  total_teachers: number;
  total_students: number;
  total_schedules: number;
}

export async function getManagerStats(): Promise<ManagerStats> {
  const res = await api.get<ManagerStats>("/managers/stats");
  return res.data;
}
