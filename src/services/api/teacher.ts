import api from './api';

export interface TeacherBase {
    user_id: number;
    base_salary_per_class?: number;
    reward_bonus?: number;
}

export interface Teacher extends TeacherBase {
    // Các trường khác nếu backend trả về, ví dụ:
    // user_name: string;
}

export interface TeacherCreate extends TeacherBase {}

export interface TeacherUpdate {
    base_salary_per_class?: number;
    reward_bonus?: number;
}

export interface ClassTaught {
    class_id: number;
    teacher_user_id: number;
    class_name: string;
    teacher_name?: string;
    subject_name?: string;
    capacity?: number;
    fee?: number;
}

export interface TeacherStats {
    class_taught: number;
    schedules: number;
    reviews: number;
    rate: number;
}

// ===== CRUD Teachers =====
export const getAllTeachers = async (): Promise<Teacher[]> => {
    const res = await api.get("/teachers/");
    return res.data;
};

export const getTeacherByUserId = async (userId: number): Promise<Teacher> => {
    const res = await api.get(`/teachers/${userId}`);
    return res.data;
};

export const createTeacher = async (payload: TeacherCreate): Promise<Teacher> => {
    const res = await api.post("/teachers/", payload);
    return res.data;
};

export const updateTeacher = async (userId: number, payload: TeacherUpdate): Promise<Teacher> => {
    const res = await api.put(`/teachers/${userId}`, payload);
    return res.data;
};

export const deleteTeacher = async (userId: number): Promise<void> => {
    await api.delete(`/teachers/${userId}`);
};

// ===== Custom APIs =====
// Hàm này lấy danh sách các lớp học của một giáo viên
export const getClassesByTeacherId = async (teacherUserId: number): Promise<ClassTaught[]> => {
    // Giả định endpoint là `/teachers/{teacherUserId}/classes`
    const res = await api.get(`/teachers/${teacherUserId}/classes`);
    return res.data;
};

export const getTeacherStats = async (teacherUserId: number): Promise<TeacherStats> => {
    const res = await api.get(`/teachers/${teacherUserId}/stats`);
    return res.data;
}