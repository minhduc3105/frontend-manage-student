// services/api/subject.ts
import api from "./api"

export interface Subject {
  subject_id: number
  name: string
  description?: string
}

export interface SubjectCreate {
  name: string
  description?: string
}

export interface SubjectUpdate {
  name?: string
  description?: string
}

// Lấy danh sách tất cả môn học
export async function getSubjects(): Promise<Subject[]> {
  const res = await api.get<Subject[]>("/subjects")
  return res.data
}

// Lấy thông tin môn học theo ID
export async function getSubjectById(id: number): Promise<Subject> {
  const res = await api.get<Subject>(`/subjects/${id}`)
  return res.data
}

// Tạo mới môn học
export async function createSubject(data: SubjectCreate): Promise<Subject> {
  const res = await api.post<Subject>("/subjects", data)
  return res.data
}

// Cập nhật môn học
export async function updateSubject(id: number, data: SubjectUpdate): Promise<Subject> {
  const res = await api.put<Subject>(`/subjects/${id}`, data)
  return res.data
}

// Xoá môn học
export async function deleteSubject(id: number): Promise<void> {
  await api.delete(`/subjects/${id}`)
}
