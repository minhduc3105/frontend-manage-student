import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getTeacherOverview, getClassReport, getTeacherReport } from "../services/api/report";

/** Overview của giáo viên */
export interface TeacherOverview {
    total_students: number;
    avg_gpa: number;
    avg_study_point: number;
    avg_discipline_point: number;
}

/** Thông tin sinh viên trong lớp */
export interface StudentReport {
    id: number;
    name: string;
    gpa: number;
    study_point: number;
    discipline_point: number;
    attendance: number;
}

/** Báo cáo chi tiết lớp */
export interface ClassReport {
    class_id: number;
    class_name: string;
    total_students: number;
    avg_gpa: number;
    avg_study_point: number;
    avg_discipline_point: number;
    grade_distribution: Record<number, number>; // 1–10
    students: StudentReport[];
}

/** Báo cáo cá nhân giáo viên */
export interface SalaryByMonth {
    month: string;
    total: number;
}

export interface TeacherReport {
    teacher_id: number;
    teacher_name: string;
    review_distribution: Record<number, number>; // ví dụ: {1: 2, 2: 5, 3: 10, 4: 25, 5: 18}
    salary_by_month: SalaryByMonth[];
}

export function useReports() {
    const [teacherOverview, setTeacherOverview] = useState<TeacherOverview | null>(null);
    const [classReport, setClassReport] = useState<ClassReport | null>(null);
    const [teacherReport, setTeacherReport] = useState<TeacherReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /** Tổng quan các lớp giáo viên phụ trách */
    const fetchTeacherOverview = useCallback(async (teacherId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTeacherOverview(teacherId);
            setTeacherOverview(data);
        } catch (err: any) {
            const message = err.message || "Failed to fetch teacher overview";
            setError(message);
            toast.error(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    /** Báo cáo chi tiết lớp */
    const fetchClassReport = useCallback(async (classId: number, teacherId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getClassReport(classId, teacherId);
            setClassReport(data);
        } catch (err: any) {
            const message = err.message || "Failed to fetch class report";
            setError(message);
            toast.error(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    /** Báo cáo cá nhân của giáo viên (bao gồm đánh giá & lương) */
    const fetchTeacherReport = useCallback(async (teacherId: number, year: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTeacherReport(teacherId, year);
            setTeacherReport(data);
        } catch (err: any) {
            const message = err.message || "Failed to fetch teacher report";
            setError(message);
            toast.error(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        teacherOverview,
        classReport,
        teacherReport,
        loading,
        error,
        fetchTeacherOverview,
        fetchClassReport,
        fetchTeacherReport,
    };
}
