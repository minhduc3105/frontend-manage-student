import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getTeachersByStudentId,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getEnrollmentsByStudentId,
  getStudentStats,
  getClassesByStudent,
  Student,
  StudentCreate,
  StudentUpdate,
  Enrollment,
  StudentStats,
  TeacherView,
} from "../services/api/student"; 
import { Class } from "../services/api/class"; 

// Hook để quản lý trạng thái và thao tác với dữ liệu Học sinh (Student)
export function useStudent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HÀM FETCH DỮ LIỆU CƠ BẢN ---

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      setStudents(data);
      return data;
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || "Lỗi tải danh sách tất cả học sinh.";
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentById = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentById(userId);
      setStudent(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || `Lỗi tải thông tin học sinh ID ${userId}.`;
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- HÀM THAO TÁC DỮ LIỆU CRUD ---

  const addStudent = useCallback(async (newData: StudentCreate) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createStudent(newData);
      setStudents((prev) => [...prev, created]);
      toast.success("Thêm học sinh thành công!");
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi khi thêm học sinh.";
      toast.error(msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const editStudent = useCallback(
    async (userId: number, updatedData: StudentUpdate) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await updateStudent(userId, updatedData);
        // Cập nhật state students (danh sách)
        setStudents((prev) =>
          prev.map((s) => (s.user_id === userId ? updated : s))
        );
        // Cập nhật state student (nếu đang xem chi tiết)
        setStudent((prev) => (prev?.user_id === userId ? updated : prev));

        toast.success(`Cập nhật học sinh ID ${userId} thành công!`);
        return updated;
      } catch (err: any) {
        const msg = err.response?.data?.detail || "Lỗi khi cập nhật học sinh.";
        toast.error(msg);
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeStudent = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteStudent(userId);
      setStudents((prev) => prev.filter((s) => s.user_id !== userId));
      toast.success(`Xóa học sinh ID ${userId} thành công!`);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Lỗi khi xóa học sinh.";
      toast.error(msg);
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- HÀM FETCH DỮ LIỆU CUSTOM (CHỈ TOAST LỖI) ---
  
  const fetchStudentStats = useCallback(
    async (studentUserId: number): Promise<StudentStats | null> => {
      setLoading(true);
      setError(null);
      try {
        return await getStudentStats(studentUserId);
      } catch (err: any) {
        const msg = err.response?.data?.detail || "Lỗi tải thống kê học sinh.";
        toast.error(msg);
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchClassesByStudent = useCallback(
    async (studentUserId: number): Promise<Class[] | null> => {
      setLoading(true);
      setError(null);
      try {
        return await getClassesByStudent(studentUserId);
      } catch (err: any) {
        const msg = err.response?.data?.detail || "Lỗi tải lớp học đang hoạt động.";
        toast.error(msg);
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Thêm các hàm fetch custom khác theo yêu cầu
  const fetchEnrollments = useCallback(
    async (studentUserId: number): Promise<Enrollment[] | null> => {
      setLoading(true);
      setError(null);
      try {
        return await getEnrollmentsByStudentId(studentUserId);
      } catch (err: any) {
        const msg = err.response?.data?.detail || "Lỗi tải danh sách đăng ký.";
        toast.error(msg);
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  
  const fetchTeachersByStudentId = useCallback(
      async (studentUserId: number): Promise<TeacherView[] | null> => {
          setLoading(true);
          setError(null);
          try {
              return await getTeachersByStudentId(studentUserId);
          } catch (err: any) {
              const msg = err.response?.data?.detail || "Lỗi tải danh sách giáo viên của học sinh.";
              toast.error(msg);
              setError(msg);
              return null;
          } finally {
              setLoading(false);
          }
      },
      []
  );  

  return {
    // Trạng thái
    students,
    student,
    loading,
    error,

    // Thao tác CRUD
    addStudent,
    editStudent,
    removeStudent,

    // Fetch cơ bản
    fetchStudents,
    fetchStudentById,

    // Fetch custom
    fetchStudentStats,
    fetchClassesByStudent,
    fetchEnrollments,
    fetchTeachersByStudentId,
  };
}