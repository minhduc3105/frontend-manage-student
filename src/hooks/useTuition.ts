import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getTuitions,
  getTuitionsByStudentId,
  getTuitionsByParentId,
  Tuition,
  createTuition,
  updateTuition,
  deleteTuition,
} from "../services/api/tuition";

// Giả định các kiểu dữ liệu cho create/update giống như trong payroll hook
// Nếu bạn có các kiểu TuitionCreate, TuitionUpdate, hãy thay thế 'any'
type TuitionCreate = any; 
type TuitionUpdate = any;

export function useTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HÀM FETCH DỮ LIỆU (CHỈ TOAST LỖI) ---

  const fetchTuitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTuitions();
      setTuitions(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi tải tất cả học phí.";
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTuitionsByStudentId = useCallback(async (student_user_id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTuitionsByStudentId(student_user_id);
      setTuitions(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi tải học phí theo ID học sinh.";
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTuitionsByParentId = useCallback(async (parent_id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTuitionsByParentId(parent_id);
      setTuitions(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi tải học phí theo ID phụ huynh.";
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- HÀM THAO TÁC DỮ LIỆU (TOAST THÀNH CÔNG VÀ LỖI) ---

  const addTuition = useCallback(async (newData: TuitionCreate) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createTuition(newData);
      setTuitions((prev) => [...prev, created]);
      toast.success("Thêm học phí thành công!");
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi khi thêm học phí.";
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const editTuition = useCallback(async (id: number, updatedData: TuitionUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateTuition(id, updatedData);
      setTuitions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Cập nhật học phí thành công!");
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi khi cập nhật học phí.";
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTuition = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTuition(id);
      setTuitions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Xóa học phí thành công!");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi khi xóa học phí.";
      toast.error(msg);
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tuitions,
    loading,
    error,
    addTuition,
    editTuition,
    removeTuition,
    fetchTuitions,
    fetchTuitionsByStudentId,
    fetchTuitionsByParentId,
  };
}