import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getTests,
    getTestsForStudent,
    getTestsForTeacher,
    Test,
    TestCreate,
    TestUpdate,
    createTest,
    updateTest,
    deleteTest,
    importTests,
} from "../services/api/test"; // Import từ file test.ts trong thư mục services/api

/**
 * Custom hook để quản lý các bản ghi bài kiểm tra (Test records).
 * Bao gồm các thao tác fetch, create, update, delete và import.
 */
export function useTest() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- HÀM FETCH DỮ LIỆU ---

    /**
     * Lấy tất cả bài kiểm tra (áp dụng phân quyền).
     */
    const fetchTests = useCallback(async (skip: number = 0, limit: number = 100) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTests(skip, limit);
            setTests(data);
            return data;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi tải tất cả bài kiểm tra.";
            toast.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy bài kiểm tra theo ID học sinh.
     */
    const fetchTestsForStudent = useCallback(async (student_user_id: number, skip: number = 0, limit: number = 100) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTestsForStudent(student_user_id, skip, limit);
            setTests(data);
            return data;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi tải bài kiểm tra theo ID học sinh.";
            toast.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy bài kiểm tra theo ID giáo viên (các lớp giáo viên đó dạy).
     */
    const fetchTestsForTeacher = useCallback(async (teacher_user_id: number, skip: number = 0, limit: number = 100) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTestsForTeacher(teacher_user_id, skip, limit);
            setTests(data);
            return data;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi tải bài kiểm tra theo ID giáo viên.";
            toast.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);


    // --- HÀM THAO TÁC DỮ LIỆU (TOAST THÀNH CÔNG VÀ LỖI) ---

    /**
     * Tạo mới một bài kiểm tra.
     */
    const addTest = useCallback(async (newData: TestCreate) => {
        setLoading(true);
        setError(null);
        try {
            const created = await createTest(newData);
            // Cập nhật state cục bộ (Giả định rằng API trả về Test đầy đủ)
            setTests((prev) => [...prev, created]);
            toast.success("Thêm bài kiểm tra thành công!");
            return created;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi khi thêm bài kiểm tra.";
            toast.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Cập nhật thông tin bài kiểm tra.
     */
    const editTest = useCallback(async (test_id: number, updatedData: TestUpdate) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await updateTest(test_id, updatedData);
            // Cập nhật state cục bộ
            setTests((prev) => prev.map((t) => (t.test_id === test_id ? updated : t)));
            toast.success("Cập nhật bài kiểm tra thành công!");
            return updated;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi khi cập nhật bài kiểm tra.";
            toast.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Xóa một bài kiểm tra.
     */
    const removeTest = useCallback(async (test_id: number) => {
        setLoading(true);
        setError(null);
        try {
            await deleteTest(test_id);
            // Xóa khỏi state cục bộ
            setTests((prev) => prev.filter((t) => t.test_id !== test_id));
            toast.success("Xóa bài kiểm tra thành công!");
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Lỗi khi xóa bài kiểm tra.";
            toast.error(msg);
            setError(msg);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Import danh sách điểm kiểm tra từ file Excel.
     */
    const importTestRecords = useCallback(async (class_id: number, file: File) => {
        setLoading(true);
        setError(null);
        try {
            const result = await importTests(class_id, file);
            // Có thể cần fetchTests lại sau khi import để cập nhật danh sách
            // Hoặc xử lý kết quả trả về từ result.
            toast.success(result.message || "Import điểm thành công!");
            return result;
        } catch (err: any) {
            // Lỗi từ backend thường là chuỗi chi tiết
            const msg = err.response?.data?.detail || "Lỗi khi import file Excel.";
            toast.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);


    return {
        tests,
        loading,
        error,
        addTest,
        editTest,
        removeTest,
        importTestRecords,
        fetchTests,
        fetchTestsForStudent,
        fetchTestsForTeacher,
    };
}
