import api from "./api"

// Interface đại diện cho dữ liệu enrollment nhận từ backend
export interface Enrollment {
  enrollment_id: number
  student_user_id: number
  class_id: number
  student_name: string
  class_name: string
  enrollment_date: string // Định dạng string vì đã được format ở backend
  enrollment_status: "active" | "inactive"
}

// Payload để tạo một enrollment mới
export interface EnrollmentCreate {
  student_user_id: number
  class_id: number
  enrollment_date: string // Sử dụng string để đơn giản hóa, có thể là Date object
}

// Payload để cập nhật một enrollment
export interface EnrollmentUpdate {
  student_user_id?: number
  class_id?: number
  enrollment_date?: string
  enrollment_status?: "active" | "inactive"
}

// Lấy tất cả enrollment
export const getEnrollments = async (): Promise<Enrollment[]> => {
  const res = await api.get("/enrollments/")
  return res.data
}

// Lấy enrollment theo ID
export const getEnrollmentById = async (id: number): Promise<Enrollment> => {
  const res = await api.get(`/enrollments/${id}`)
  return res.data
}

// Lấy danh sách enrollment theo student_user_id
export const getEnrollmentsByStudentId = async (studentId: number): Promise<Enrollment[]> => {
  const res = await api.get(`/enrollments/student/${studentId}`)
  return res.data
}

// Lấy danh sách enrollment theo class_id
export const getEnrollmentsByClassId = async (classId: number): Promise<Enrollment[]> => {
  const res = await api.get(`/enrollments/class/${classId}`)
  return res.data
}

// Tạo enrollment mới
export const createEnrollment = async (payload: EnrollmentCreate): Promise<Enrollment> => {
  const res = await api.post("/enrollments/", payload)
  return res.data
}

// Cập nhật enrollment
export const updateEnrollment = async (id: number, payload: EnrollmentUpdate): Promise<Enrollment> => {
  const res = await api.put(`/enrollments/${id}`, payload)
  return res.data
}

// Xoá enrollment (cập nhật status thành 'inactive')
export const setEnrollmentInactive = async (studentId: number, classId: number): Promise<void> => {
  await api.delete(`/enrollments/${studentId}/${classId}`)
}