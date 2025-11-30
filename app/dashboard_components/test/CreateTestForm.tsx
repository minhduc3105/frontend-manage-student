"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTest } from "../../../src/hooks/useTest";
import { Test, TestCreate, TestUpdate } from "../../../src/services/api/test";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useClasses } from "../../../src/contexts/ClassContext";
import { Student } from "../../../src/services/api/class";
import { ClassTaught } from "../../../src/services/api/teacher";
import {
  User,
  School,
  Calendar,
  FileText,
  Award,
  ClipboardCheck,
} from "lucide-react";

interface CreateTestFormProps {
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  initialData?: Test | null;
  isEdit?: boolean;
  disableStudentClassEdit?: boolean;
}

const TEST_TYPE_OPTIONS = [
  { value: "Midterm", label: "Midterm", color: "text-blue-500" },
  { value: "Final", label: "Final", color: "text-red-500" },
  { value: "Other", label: "Other", color: "text-muted-foreground" },
  { value: "15-minute", label: "15-minute", color: "text-green-500" },
];

const emptyState: TestCreate = {
  test_name: "",
  student_user_id: 0,
  class_id: 0,
  score: 0,
  exam_date: "",
  test_type: "",
};

const CreateTestForm: React.FC<CreateTestFormProps> = ({
  onClose,
  onCreated,
  onUpdated,
  initialData,
  isEdit = false,
  disableStudentClassEdit = false,
}) => {
  const initialForm = initialData
    ? {
        test_name: initialData.test_name ?? "",
        student_user_id: initialData.student_user_id ?? 0,
        class_id: initialData.class_id ?? 0,
        score: initialData.score ?? 0,
        exam_date: initialData.exam_date ?? "",
        test_type: initialData.test_type ?? "",
      }
    : emptyState;

  const [formData, setFormData] = useState<TestCreate>(initialForm);
  const { addTest, editTest, loading } = useTest();
  const [classes, setClasses] = useState<ClassTaught[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const { fetchStudentsInClass, getTeacherClasses } = useClasses();
  const { user } = useAuth();

  // Fetch classes & students
  useEffect(() => {
    if (user?.user_id) {
      getTeacherClasses(user.user_id)
        .then((data) => {
          const normalized: ClassTaught[] = (data || []).map((c) => ({
            ...c,
            teacher_user_id: c.teacher_user_id ?? user.user_id ?? 0,
          }));
          setClasses(normalized);
        })
        .catch((err) => console.error("Fetch classes error:", err));
    }

    if (initialForm.class_id) {
      fetchStudentsInClass(initialForm.class_id)
        .then((res) => res && setStudents(res))
        .catch((err) => console.error("Fetch students error:", err));
    }
  }, [user, getTeacherClasses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let processed: any = value;
    if (type === "number") processed = value === "" ? 0 : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: processed }));
  };

  const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = parseInt(e.target.value || "0", 10);
    setFormData((prev) => ({ ...prev, class_id: classId, student_user_id: 0 }));
    if (classId) {
      try {
        const res = await fetchStudentsInClass(classId);
        if (res) setStudents(res);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    } else setStudents([]);
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = parseInt(e.target.value || "0", 10);
    setFormData((prev) => ({ ...prev, student_user_id: studentId }));
  };

  const handleTestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, test_type: value }));
  };

  const handleCancel = () => {
    setFormData(initialData ? initialForm : emptyState);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.test_name || !formData.exam_date) {
      toast.error("Vui lòng điền tên bài kiểm tra và ngày thi.");
      return;
    }

    if (!isEdit && (!formData.class_id || !formData.student_user_id)) {
      toast.error("Vui lòng chọn lớp và học sinh để tạo điểm.");
      return;
    }

    try {
      if (isEdit && initialData) {
        const payload: TestUpdate = {
          test_name: formData.test_name,
          score: formData.score,
          exam_date: formData.exam_date,
        };
        await editTest(initialData.test_id, payload);
        onUpdated && onUpdated();
      } else {
        const payload: TestCreate = {
          test_name: formData.test_name,
          student_user_id: formData.student_user_id,
          class_id: formData.class_id,
          score: formData.score,
          exam_date: formData.exam_date,
          test_type: formData.test_type || "Other",
        };
        await addTest(payload);
        onCreated && onCreated();
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving test:", err);
      const msg = err?.response?.data?.detail || "Lỗi khi lưu bài kiểm tra.";
      toast.error(msg);
    }
  };

  const selectedClass = classes.find((c) => c.class_id === formData.class_id);
  const selectedStudent = students.find(
    (s) => s.student_user_id === formData.student_user_id
  );

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="bg-background p-6 rounded-lg shadow-xl w-full max-w-lg cursor-default text-foreground"
    >
      <h3 className="text-xl font-bold mb-6 text-center">
        {isEdit ? "✏️ Edit Test" : "🧾 Create New Test"}
      </h3>

      <div className="space-y-4">
        {/* Class */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 mb-1 font-semibold">
            <School className="text-blue-500" size={18} /> Class
          </label>
          {isEdit && disableStudentClassEdit ? (
            <p className="px-3 py-2 border rounded-md">
              {selectedClass?.class_name ?? "—"}
            </p>
          ) : (
            <select
              aria-label="Select Class"
              name="class_id"
              value={formData.class_id || ""}
              onChange={handleClassChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Student */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 mb-1 font-semibold">
            <User className="text-emerald-500" size={18} /> Student
          </label>
          {isEdit && disableStudentClassEdit ? (
            <p className="px-3 py-2 border rounded-md">
              {selectedStudent?.full_name ??
                initialData?.student_name ??
                "—"}
            </p>
          ) : (
            <select
              aria-label="Select Student"
              name="student_user_id"
              value={formData.student_user_id || ""}
              onChange={handleStudentChange}
              disabled={!students.length}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.student_user_id} value={s.student_user_id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Test Name */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 mb-1 font-semibold">
            <FileText className="text-indigo-500" size={18} /> Test Name
          </label>
          <Input
            name="test_name"
            value={formData.test_name}
            onChange={handleChange}
            placeholder="Ex: Midterm 1"
            className="focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* SCORE */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 mb-1 font-semibold">
            <Award className="text-yellow-500" size={18} /> Score
          </label>
          <Input
            name="score"
            type="text"
            inputMode="decimal" // gợi ý bàn phím số trên mobile
            value={formData.score === 0 ? "" : formData.score}
            onChange={(e) => {
              const value = e.target.value.trim();

              // Cho phép xóa hết (trống)
              if (value === "") {
                setFormData((prev) => ({ ...prev, score: 0 }));
                return;
              }

              // Chỉ cho phép số và dấu chấm
              if (!/^\d*\.?\d*$/.test(value)) {
                toast.error("Chỉ được nhập số hoặc dấu chấm thập phân.");
                return;
              }

              const num = parseFloat(value);
              if (isNaN(num)) return;

              // Validate khoảng điểm
              if (num < 0 || num > 10) {
                toast.error("Điểm phải nằm trong khoảng từ 0 đến 10.");
                return;
              }

              setFormData((prev) => ({ ...prev, score: num }));
            }}
            placeholder="Nhập điểm (0–10)"
            className="focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Exam Date */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 mb-1 font-semibold">
            <Calendar className="text-rose-500" size={18} /> Exam Date
          </label>
          <Input
            name="exam_date"
            type="date"
            value={formData.exam_date}
            onChange={handleChange}
            className="focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Test Type */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 mb-1 font-semibold">
            <ClipboardCheck className="text-purple-500" size={18} /> Test Type
          </label>
          {isEdit ? (
            <p className="px-3 py-2 border rounded-md">
              {formData.test_type || "—"}
            </p>
          ) : (
            <select
              aria-label="Select Test Type"
              name="test_type"
              value={formData.test_type || ""}
              onChange={handleTestTypeChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-400"
            >
              <option value="">-- Select Type --</option>
              {TEST_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="hover:bg-gray-200 transition"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="hover:bg-blue-600 transition transform hover:scale-105"
        >
          {isEdit ? "Save Changes" : "Create Test"}
        </Button>
      </div>
    </form>
  );
};

export default CreateTestForm;
