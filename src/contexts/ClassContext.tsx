"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  Class,
  ClassCreate,
  ClassUpdate,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getTeacherClasses as getTeacherClassesApi,
  exportClass,
  getStudentsInClass,
  Student,
} from "../services/api/class";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext"; // <-- guard auth

interface ClassContextType {
  classes: Class[];
  loading: boolean;
  error: string | null;
  fetchClasses: () => Promise<void>;
  addClass: (data: ClassCreate) => Promise<Class>;
  editClass: (id: number, data: ClassUpdate) => Promise<Class>;
  removeClass: (id: number) => Promise<void>;
  getTeacherClasses: (teacherUserId: number) => Promise<Class[]>;
  exportClassData: (id: number) => Promise<void>;
  fetchStudentsInClass: (classId: number) => Promise<Student[]>;
}

const ClassContext = createContext<ClassContextType | null>(null);

export const ClassesProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // auth guard
  const { loading: authLoading, isAuthenticated } = useAuth();

  const fetchStudentsInClass = useCallback(async (classId: number) => {
    setLoading(true);
    setError(null);
    try {
      const students = await getStudentsInClass(classId);
      setLoading(false);
      return students;
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || "Không thể tải danh sách học sinh của lớp.";
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    console.log("[ClassesProvider] fetchClasses called", new Date().toISOString());
    setLoading(true);
    setError(null);
    try {
      const data = await getClasses();
      setClasses(data ?? []);
    } catch (err: any) {
      const msg = err?.message || "Không thể tải danh sách lớp học";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addClass = useCallback(async (data: ClassCreate) => {
    try {
      const newClass = await createClass(data);
      setClasses((prev) => [...prev, newClass]);
      toast.success("Tạo lớp học thành công 🎉");
      return newClass;
    } catch (err: any) {
      const msg = err?.message || "Không thể tạo lớp học";
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  const editClass = useCallback(async (id: number, data: ClassUpdate) => {
    try {
      const updated = await updateClass(id, data);
      setClasses((prev) => prev.map((c) => (c.class_id === id ? updated : c)));
      toast.success("Cập nhật lớp học thành công ✅");
      return updated;
    } catch (err: any) {
      const msg = err?.message || "Không thể cập nhật lớp học";
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  const removeClass = useCallback(async (id: number) => {
    try {
      await deleteClass(id);
      setClasses((prev) => prev.filter((c) => c.class_id !== id));
      toast.success("Xóa lớp học thành công 🗑️");
    } catch (err: any) {
      const msg = err?.message || "Không thể xóa lớp học";
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  const getTeacherClasses = useCallback(async (teacherUserId: number) => {
  console.log(
    "[ClassesProvider] getTeacherClasses called for teacher:",
    teacherUserId,
    new Date().toISOString()
  );
  setLoading(true);
  setError(null);
  try {
    const data = await getTeacherClassesApi(teacherUserId);
    setClasses(data ?? []); // ✅ thêm dòng này để cập nhật state
    setLoading(false);
    return data;
  } catch (err: any) {
    setLoading(false);
    const msg = err?.message || "Không thể tải danh sách lớp học của giáo viên.";
    setError(msg);
    toast.error(msg);
    throw new Error(msg);
  }
}, []);

  const exportClassData = useCallback(async (id: number) => {
    try {
      await exportClass(id);
      toast.success("Xuất danh sách lớp thành công 📂");
    } catch (err: any) {
      const msg = err?.message || "Không thể xuất danh sách lớp";
      toast.error(msg);
      throw new Error(msg);
    }
  }, []);

  // ---------- AUTH GUARD ----------
  // Chỉ fetch classes khi auth đã init xong (authLoading === false)
  // và user đã authenticated.
  // Nếu auth init xong nhưng chưa authenticated -> clear classes & don't fetch.
  useEffect(() => {
    // nếu auth còn đang init, không làm gì
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      // nếu chưa login thì clear data tránh hiển thị cũ / gọi API
      setClasses([]);
      setError(null);
      setLoading(false);
      return;
    }

    // auth sẵn sàng và có user -> an toàn để fetch
    fetchClasses();
  }, [authLoading, isAuthenticated, fetchClasses]);

  const value = useMemo(
    () => ({
      classes,
      loading,
      error,
      fetchClasses,
      addClass,
      editClass,
      removeClass,
      getTeacherClasses,
      exportClassData,
      fetchStudentsInClass,
    }),
    [
      classes,
      loading,
      error,
      fetchClasses,
      addClass,
      editClass,
      removeClass,
      getTeacherClasses,
      exportClassData,
      fetchStudentsInClass,
    ]
  );

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
};

export const useClasses = (): ClassContextType => {
  const context = useContext(ClassContext);
  if (!context) throw new Error("useClasses must be used within <ClassesProvider>");
  return context;
};
