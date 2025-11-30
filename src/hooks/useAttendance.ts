// hooks/useAttendance.ts
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
    getAttendances,
    getAttendanceById,
    getAttendancesBySchedule,
    createAttendance,
    createBatchAttendance,
    updateLateAttendance,
    deleteAttendance,
    Attendance,
    AttendanceCreate,
    AttendanceBatchCreate,
    AttendanceUpdateLate,
    // import mới
    getAllAttendances
} from "../services/api/attendance";

/**
 * useAttendance hook
 * - fetch attendances
 * - create / batch create
 * - update late attendance
 * - update / delete
 */
export function useAttendance() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const errorToMessage = (err: any) => {
        try {
            if (!err) return "Lỗi không xác định.";
            const respData = err?.response?.data ?? err?.response ?? err;
            if (respData) {
                if (typeof respData === "string") return respData;
                if (Array.isArray(respData)) {
                    return respData.map((e: any) => (e?.msg ? e.msg : JSON.stringify(e))).join(", ");
                }
                if (typeof respData === "object") {
                    if (Array.isArray(respData.detail)) {
                        return respData.detail.map((e: any) => (e?.msg ? e.msg : JSON.stringify(e))).join(", ");
                    }
                    if (typeof respData.detail === "string") return respData.detail;
                    if (respData.message) return respData.message;
                    if (respData.detail && typeof respData.detail === "string") return respData.detail;
                    return JSON.stringify(respData);
                }
            }
            if (err.message) return err.message;
            return String(err);
        } catch (e) {
            return "Lỗi không xác định.";
        }
    };

    const handleFetch = useCallback(async <T,>(apiFn: () => Promise<T>, successMsg?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFn();
            if (successMsg) toast.success(successMsg);
            return data;
        } catch (err: any) {
            const msg = errorToMessage(err) || "Lỗi khi tải dữ liệu điểm danh.";
            toast.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAttendances = useCallback(async () => {
        const data = await handleFetch(() => getAttendances());
        if (data) setAttendances(data);
    }, [handleFetch]);

    const fetchAllAttendances = useCallback(async () => {
        const data = await handleFetch(() => getAllAttendances());
        if (data) setAttendances(data);
        return data;
    }, [handleFetch]);

    const fetchAttendanceById = useCallback(async (id: number) => {
        const data = await handleFetch(() => getAttendanceById(id));
        return data;
    }, [handleFetch]);

    const fetchAttendancesBySchedule = useCallback(async (schedule_id: number) => {
        const data = await handleFetch(() => getAttendancesBySchedule(schedule_id));
        if (data) setAttendances(data);
        return data;
    }, [handleFetch]);

    const addAttendance = useCallback(async (payload: AttendanceCreate) => {
        const created = await handleFetch(() => createAttendance(payload), "Tạo điểm danh thành công!");
        if (created) setAttendances((prev) => [...prev, created]);
        return created;
    }, [handleFetch]);

    const addBatchAttendance = useCallback(async (payload: AttendanceBatchCreate) => {
        const created = await handleFetch(() => createBatchAttendance(payload), "Tạo điểm danh hàng loạt thành công!");
        if (created) setAttendances((prev) => [...prev, ...created]);
        return created;
    }, [handleFetch]);

    const removeAttendance = useCallback(async (id: number) => {
        const ok = await handleFetch(() => deleteAttendance(id), "Xóa điểm danh thành công!");
        if (ok !== null) setAttendances((prev) => prev.filter((a) => a.attendance_id !== id));
    }, [handleFetch]);

    const editLateAttendance = useCallback(async (student_user_id: number, schedule_id: number, payload: AttendanceUpdateLate) => {
        const updated = await handleFetch(() => updateLateAttendance(student_user_id, schedule_id, payload), "Cập nhật check-in muộn thành công!");
        if (updated) {
            setAttendances((prev) => {
                const idx = prev.findIndex((p) => p.student_user_id === updated.student_user_id && p.schedule_id === updated.schedule_id && p.attendance_date === updated.attendance_date);
                if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = updated;
                    return copy;
                }
                return [...prev, updated];
            });
        }
        return updated;
    }, [handleFetch]);

    return {
        attendances,
        loading,
        error,
        fetchAttendances,
        fetchAllAttendances, // mới
        fetchAttendanceById,
        fetchAttendancesBySchedule,
        addAttendance,
        addBatchAttendance,
        editLateAttendance,
        removeAttendance,
    };
}
