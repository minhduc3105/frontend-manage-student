import api from "./api"

export interface Class {
  class_id: number
  class_name: string
  teacher_name?: string
  teacher_user_id?: number
  subject_id?: number
  subject_name?: string
  class_size?: number
  capacity?: number
  fee?: number
}

export interface ClassCreate {
  class_name: string
  teacher_user_id?: number
  subject_id?: number
  capacity?: number
  fee?: number
}

export interface ClassUpdate {
  class_name?: string
  teacher_user_id?: number
  subject_id?: number
  capacity?: number
  fee?: number
}

export interface Student {
  student_user_id: number;
  full_name?: string;
  email?: string;
  date_of_birth?: string; 
  phone_number?: string;
  gender?: string;
}

export async function getClasses(): Promise<Class[]> {
  const res = await api.get<Class[]>("/classes")
  return res.data
}

export async function getClassById(id: number): Promise<Class> {
  const res = await api.get<Class>(`/classes/${id}`)
  return res.data
}

export async function createClass(data: ClassCreate): Promise<Class> {
  const res = await api.post<Class>("/classes", data)
  return res.data
}

export async function updateClass(id: number, data: ClassUpdate): Promise<Class> {
  const res = await api.put<Class>(`/classes/${id}`, data)
  return res.data
}

export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/classes/${id}`)
}

export async function getTeacherClasses(teacherUserId: number): Promise<Class[]> {
  const res = await api.get<Class[]>(`/teachers/${teacherUserId}/classes`)
  return res.data
}

export async function exportClass(classId: number): Promise<void> {
  const res = await api.get(`/classes/export/${classId}`, {
    responseType: "blob",
  })

  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `danh_sach_lop_${classId}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function getStudentsInClass(classId: number): Promise<Student[]> {
  const res = await api.get<Student[]>(`/classes/${classId}/students`);
  return res.data;
}
