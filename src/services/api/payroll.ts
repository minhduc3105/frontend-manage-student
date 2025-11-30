import api from "./api"

// Interface hiện tại từ backend
export interface Payroll {
  id: number
  month: number
  teacher: string
  base_salary: number
  bonus: number
  total: number
  status: "paid" | "pending" | "overdue"
  sent_at: string
}

export interface PayrollCreate {
  teacher_user_id: number
  month: number
  total_base_salary: number
  reward_bonus: number
  sent_at: string
}

// Payload gửi lên backend khi tạo hoặc update payroll
export interface PayrollUpdate {
  month: number;
  total_base_salary: number;
  reward_bonus: number;
  sent_at: string;
  status: "pending" | "paid" | "overdue";
}


// Lấy tất cả payrolls
export const getPayrolls = async (): Promise<Payroll[]> => {
  const res = await api.get("/payrolls/")
  return res.data
}

// Lấy payroll theo id
export const getPayrollById = async (id: number): Promise<Payroll> => {
  const res = await api.get(`/payrolls/${id}`)
  return res.data
}

// Tạo payroll mới
export const createPayroll = async (payload: PayrollCreate): Promise<Payroll> => {
  const res = await api.post("/payrolls/", payload)
  return res.data
}

// Cập nhật payroll
export const updatePayroll = async (id: number, payload: PayrollUpdate): Promise<Payroll> => {
  const res = await api.put(`/payrolls/${id}`, payload)
  return res.data
}

// Xoá payroll
export const deletePayroll = async (id: number): Promise<void> => {
  await api.delete(`/payrolls/${id}`)
}

export const getTeacherPayrolls = async (teacherUserId: number): Promise<Payroll[]> => {
    const res = await api.get(`/payrolls/teacher/${teacherUserId}`)
    return res.data
}