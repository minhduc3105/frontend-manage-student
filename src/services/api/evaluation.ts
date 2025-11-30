// services/api/evaluation.ts
import api from "./api";

// Enum tương ứng với backend (theo app.models.evaluation_model.EvaluationType)
export type EvaluationType = "initial" | "study" | "discipline";

// Interface đại diện cho dữ liệu Evaluation từ backend
export interface EvaluationRecord {
  evaluation_id: number;
  teacher_user_id: number;
  student_user_id: number;
  class_id: number;
  study_point: number;
  discipline_point: number;
  evaluation_type: EvaluationType;
  evaluation_content?: string;
  evaluation_date: string; // ISO date string
}

// Payload để tạo một bản ghi đánh giá mới (frontend chỉ gửi những field cần thiết; teacher_user_id lấy từ token trên backend)
export interface EvaluationCreate {
  student_user_id: number;
  class_id: number;
  study_point: number;
  discipline_point: number;
  evaluation_type: EvaluationType;
  evaluation_content?: string;
  evaluation_date?: string; // optional ISO date string; backend sẽ mặc định nếu không gửi
}

// Dữ liệu tóm tắt điểm cho 1 học sinh trong toàn bộ lớp (hoặc per-class nếu endpoint trả về)
export interface EvaluationSummary {
  student_user_id: number;
  class_name?: string;         // cho trường hợp per-class summary (endpoint mới trả về)
  subject?: string;            // cho summary theo lớp
  final_study_point: number;
  final_discipline_point: number;
  study_plus_count: number;
  study_minus_count: number;
  discipline_plus_count: number;
  discipline_minus_count: number;
}

// Dữ liệu đánh giá dạng view, có tên thay vì id (dùng cho list hiển thị)
export interface EvaluationView {
  id: number;
  class_name?: string;
  student_user_id: number;
  student: string;
  teacher: string;
  type: EvaluationType;
  date: string;    // ISO date string
  content?: string;
}

// --- Endpoints ---


// Lấy danh sách tất cả các đánh giá (cho manager và teacher)
export async function getEvaluations(skip = 0, limit = 100): Promise<EvaluationView[]> {
  const res = await api.get<EvaluationView[]>("/evaluations", { params: { skip, limit } });
  return res.data;
}

// Tạo bản ghi đánh giá mới
export async function createEvaluation(payload: EvaluationCreate): Promise<EvaluationRecord> {
  const res = await api.post<EvaluationRecord>("/evaluations/", payload);
  return res.data;
}

// Lấy điểm tổng của một học sinh (tất cả lớp)
export async function getTotalScoreByStudent(studentUserId: number): Promise<EvaluationSummary> {
  const res = await api.get<EvaluationSummary>(`/evaluations/total_score/${studentUserId}`);
  return res.data;
}

// Lấy một bản ghi đánh giá cụ thể bằng ID
export async function getEvaluationRecord(evaluationId: number): Promise<EvaluationRecord> {
  const res = await api.get<EvaluationRecord>(`/evaluations/${evaluationId}`);
  return res.data;
}

// Lấy danh sách đánh giá của một học sinh (tất cả lớp)
export async function getEvaluationsOfStudent(studentUserId: number, skip = 0, limit = 100): Promise<EvaluationView[]> {
  const res = await api.get<EvaluationView[]>(`/evaluations/student/${studentUserId}`, { params: { skip, limit } });
  return res.data;
}

// Lấy danh sách đánh giá của một giáo viên
export async function getEvaluationsOfTeacher(teacherUserId: number, skip = 0, limit = 100): Promise<EvaluationView[]> {
  const res = await api.get<EvaluationView[]>(`/evaluations/teacher/${teacherUserId}`, { params: { skip, limit } });
  return res.data;
}

// Lấy danh sách evaluations của 1 học sinh trong 1 lớp (cần cho modal theo lớp)
export async function getEvaluationsOfStudentInClass(
  studentUserId: number,
  classId: number,
  skip = 0,
  limit = 100
): Promise<EvaluationView[]> {
  const res = await api.get<EvaluationView[]>(`/evaluations/student/${studentUserId}/class/${classId}`, {
    params: { skip, limit },
  });
  return res.data;
}

// Lấy summary (tổng & counts) của 1 học sinh trong 1 lớp (endpoint mới)
export async function getEvaluationsSummaryOfStudentInClass(
  studentUserId: number,
  classId: number
): Promise<EvaluationSummary> {
  const res = await api.get<EvaluationSummary>(`/evaluations/student/${studentUserId}/class/${classId}/summary`);
  return res.data;
}

// Xóa một bản ghi đánh giá (teacher only)
export async function deleteEvaluation(evaluationId: number): Promise<void> {
  await api.delete(`/evaluations/${evaluationId}`);
}
