import api from "./api"

// ===== Interfaces =====
export interface TeacherReview {
  id: number
  rating: number
  review_text: string
  review_date?: string
  student_user_id?: number
  teacher_user_id: number
}

// Interfaces cho các request/response
export interface TeacherReviewCreate {
  rating: number
  review_text: string
  teacher_user_id: number
}

export interface TeacherReviewUpdate {
  rating?: number
  review_text?: string
}

export interface TeacherReviewView {
  id: number
  rating: number
  review_content: string
  review_date: string
  student_name: string
  teacher_name: string
  student_user_id: number
  teacher_user_id: number
}

// ===== API Functions =====

// Endpoint: POST /teacher-reviews/
// Tạo một đánh giá giáo viên mới
export const createTeacherReview = async (payload: TeacherReviewCreate): Promise<TeacherReview> => {
  const res = await api.post("/teacher_reviews/", payload)
  return res.data
}

// Endpoint: GET /teacher-reviews/
// Lấy tất cả các đánh giá
export const getTeacherReviews = async (): Promise<TeacherReviewView[]> => {
  const res = await api.get("/teacher_reviews")
  return res.data
}

// Endpoint: GET /teacher-reviews/{review_id}
// Lấy một đánh giá theo ID
export const getTeacherReviewById = async (reviewId: number): Promise<TeacherReviewView> => {
  const res = await api.get(`/teacher_reviews/${reviewId}`)
  return res.data
}

// Endpoint: GET /teacher-reviews/by_teacher/{user_id}
// Lấy tất cả đánh giá của một giáo viên
export const getTeacherReviewsByTeacherId = async (teacherUserId: number): Promise<TeacherReviewView[]> => {
  const res = await api.get(`/teacher_reviews/by_teacher/${teacherUserId}`)
  return res.data
}

// Endpoint: GET /teacher-reviews/by_student/{user_id}
// Lấy tất cả đánh giá mà một học sinh đã tạo
export const getTeacherReviewsByStudentId = async (studentUserId: number): Promise<TeacherReviewView[]> => {
  const res = await api.get(`/teacher_reviews/by_student/${studentUserId}`)
  return res.data
}

// Endpoint: PUT /teacher-reviews/{review_id}
// Cập nhật một đánh giá
export const updateTeacherReview = async (reviewId: number, payload: TeacherReviewUpdate): Promise<TeacherReview> => {
  const res = await api.put(`/teacher_reviews/${reviewId}`, payload)
  return res.data
}

// Endpoint: DELETE /teacher-reviews/{review_id}
// Xóa một đánh giá
export const deleteTeacherReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/teacher_reviews/${reviewId}`)
}