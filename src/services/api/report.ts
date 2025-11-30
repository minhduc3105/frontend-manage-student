import api from "./api";

/** Overview của giáo viên */
export interface TeacherOverview {
    total_students: number;
    avg_gpa: number;
    avg_study_point: number;
    avg_discipline_point: number;
}

/** Gọi API lấy tổng quan tất cả các lớp mà giáo viên phụ trách */
export async function getTeacherOverview(teacher_id?: number): Promise<TeacherOverview> {
    const res = await api.get("/reports/teacher-overview", {
        params: { teacher_id },
    });
    return res.data;
}

/** Gọi API lấy báo cáo chi tiết lớp */
export async function getClassReport(class_id: number, teacher_id?: number): Promise<any> {
    const res = await api.get("/reports/class-report", {
        params: { class_id, teacher_id },
    });
    return res.data;
}

/** Gọi API lấy báo cáo cá nhân của giáo viên (đánh giá + lương theo năm) */
export async function getTeacherReport(teacher_id: number, year: number): Promise<any> {
    const res = await api.get("/reports/teacher-report", {
        params: { teacher_id, year }, // ✅ thêm year vào params
    });
    return res.data;
}
