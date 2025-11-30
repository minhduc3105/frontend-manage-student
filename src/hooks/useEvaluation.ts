import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getEvaluations,
  createEvaluation,
  deleteEvaluation,
  getEvaluationRecord,
  getEvaluationsOfStudent,
  getEvaluationsOfTeacher,
  // getSummaryAndCounts,
  getTotalScoreByStudent,
  getEvaluationsOfStudentInClass,
  getEvaluationsSummaryOfStudentInClass,
  EvaluationView,
  EvaluationRecord,
  EvaluationCreate,
  EvaluationSummary,
} from "../services/api/evaluation";

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<EvaluationView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- FETCH ALL ----------------
  const fetchAllEvaluations = useCallback(async (skip = 0, limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluations(skip, limit);
      setEvaluations(data);
    } catch (err: any) {
      const msg = err.message || "Failed to fetch evaluations";
      setError(msg);
      toast.error(msg);
      console.error("Failed to fetch evaluations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------- ADD ----------------
  const addEvaluation = useCallback(
    async (payload: EvaluationCreate): Promise<EvaluationRecord | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const newEvaluation = await createEvaluation(payload);
        // chuyển đổi record sang view nếu cần hoặc thêm trực tiếp
        setEvaluations((prev) => [
          ...prev,
          {
            id: newEvaluation.evaluation_id,
            student: "", // frontend sẽ fetch tên nếu cần
            teacher: "",
            type: newEvaluation.evaluation_type,
            date: newEvaluation.evaluation_date,
            content: newEvaluation.evaluation_content,
            class_name: "", // cần fetch class name nếu hiển thị
          } as EvaluationView,
        ]);
        toast.success("Evaluation created successfully");
        return newEvaluation;
      } catch (err: any) {
        const msg = err.message || "Failed to add evaluation";
        setError(msg);
        toast.error(msg);
        console.error("Failed to add evaluation:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ---------------- DELETE ----------------
  const removeEvaluation = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteEvaluation(id);
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
      toast.success("Evaluation deleted successfully");
    } catch (err: any) {
      const msg = err.message || "Failed to delete evaluation";
      setError(msg);
      toast.error(msg);
      console.error("Failed to delete evaluation:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------- FETCH SINGLE ----------------
  const fetchEvaluationRecord = useCallback(
    async (id: number): Promise<EvaluationRecord | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvaluationRecord(id);
        return data;
      } catch (err: any) {
        const msg = err.message || `Failed to fetch evaluation record with ID ${id}`;
        setError(msg);
        toast.error(msg);
        console.error(msg, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ---------------- FETCH STUDENT ----------------
  const fetchEvaluationsOfStudent = useCallback(
    async (studentUserId: number, skip = 0, limit = 100): Promise<EvaluationView[] | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvaluationsOfStudent(studentUserId, skip, limit);
        return data;
      } catch (err: any) {
        const msg = err.message || `Failed to fetch evaluations for student ${studentUserId}`;
        setError(msg);
        toast.error(msg);
        console.error(msg, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ---------------- FETCH TEACHER ----------------
  const fetchEvaluationsOfTeacher = useCallback(
    async (teacherUserId: number, skip = 0, limit = 100): Promise<EvaluationView[] | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvaluationsOfTeacher(teacherUserId, skip, limit);
        return data;
      } catch (err: any) {
        const msg = err.message || `Failed to fetch evaluations for teacher ${teacherUserId}`;
        setError(msg);
        toast.error(msg);
        console.error(msg, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTotalScore = useCallback(async (studentUserId: number): Promise<EvaluationSummary | undefined> => {
    setLoading(true);
    setError(null);
    try {
      return await getTotalScoreByStudent(studentUserId);
    } catch (err: any) {
      setError(err.message || `Failed to fetch total score for student ${studentUserId}`);
      toast.error(err.message || "Failed to fetch total score");
      console.error(`Failed to fetch total score for student ${studentUserId}:`, err);
    } finally {
      setLoading(false);
    }
  }, []); 

  // ---------------- FETCH STUDENT IN CLASS ----------------
  const fetchEvaluationsOfStudentInClass = useCallback(
    async (studentUserId: number, classId: number, skip = 0, limit = 100): Promise<EvaluationView[] | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvaluationsOfStudentInClass(studentUserId, classId, skip, limit);
        return data;
      } catch (err: any) {
        const msg =
          err.message || `Failed to fetch evaluations for student ${studentUserId} in class ${classId}`;
        setError(msg);
        toast.error(msg);
        console.error(msg, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ---------------- FETCH SUMMARY STUDENT IN CLASS ----------------
  const fetchEvaluationsSummaryOfStudentInClass = useCallback(
    async (studentUserId: number, classId: number): Promise<EvaluationSummary | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvaluationsSummaryOfStudentInClass(studentUserId, classId);
        return data;
      } catch (err: any) {
        const msg =
          err.message || `Failed to fetch summary for student ${studentUserId} in class ${classId}`;
        setError(msg);
        toast.error(msg);
        console.error(msg, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    evaluations,
    loading,
    error,
    fetchAllEvaluations,
    addEvaluation,
    removeEvaluation,
    fetchEvaluationRecord,
    fetchEvaluationsOfStudent,
    fetchEvaluationsOfTeacher,
    fetchTotalScore,
    fetchEvaluationsOfStudentInClass,
    fetchEvaluationsSummaryOfStudentInClass,
  };
}