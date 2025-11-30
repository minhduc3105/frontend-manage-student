"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Loader2,
  BookOpen,
  User,
  Star,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  Edit2,
  Plus,
  Zap,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useClasses } from "../../../src/contexts/ClassContext";
import { useEvaluations } from "../../../src/hooks/useEvaluation";
import {
  EvaluationCreate,
  EvaluationType,
} from "../../../src/services/api/evaluation";
import { Student } from "../../../src/services/api/class";
import toast from "react-hot-toast";

interface CreateEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultStudentId?: number;
  defaultClassId?: number;
  teacherUserId?: number;
}

type QuickAction = {
  id: string;
  name: string;
  study_point: number;
  discipline_point: number;
  evaluation_type: EvaluationType;
  evaluation_content: string;
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "phat-bieu",
    name: "Phát biểu",
    study_point: 2,
    discipline_point: 0,
    evaluation_type: "study",
    evaluation_content: "Phát biểu xây dựng bài",
  },
  {
    id: "phat-bieu-dung",
    name: "Phát biểu đúng",
    study_point: 3,
    discipline_point: 0,
    evaluation_type: "study",
    evaluation_content: "Phát biểu tốt xây dựng bài",
  },
  {
    id: "noi-tu-do",
    name: "Nói tự do",
    study_point: 0,
    discipline_point: -2,
    evaluation_type: "discipline",
    evaluation_content: "Nói tự do trong giờ học",
  },
  {
    id: "noi-chuyen-rieng",
    name: "Nói chuyện riêng",
    study_point: -1,
    discipline_point: -2,
    evaluation_type: "discipline",
    evaluation_content: "Nói tự do trong giờ học",
  },
  {
    id: "ngu-trong-gio",
    name: "Ngủ trong giờ",
    study_point: -2,
    discipline_point: -2,
    evaluation_type: "discipline",
    evaluation_content: "Ngủ gật trong giờ học",
  },
];

export function CreateEvaluationModal({
  isOpen,
  onClose,
  onCreated,
  defaultStudentId,
  defaultClassId,
  teacherUserId,
}: CreateEvaluationModalProps) {
  const { getTeacherClasses, fetchStudentsInClass } = useClasses();
  const { addEvaluation, loading: isSubmitting } = useEvaluations();

  const EVALUATION_TYPES: { value: EvaluationType; label: string }[] = [
    { value: "study", label: "Học tập" },
    { value: "discipline", label: "Kỷ luật" },
  ];

  const [classId, setClassId] = useState<number | undefined>(defaultClassId);
  const [studentUserId, setStudentUserId] = useState<number | undefined>(
    defaultStudentId
  );
  const [evaluationType, setEvaluationType] = useState<
    EvaluationType | undefined
  >(undefined);
  const [studyPoint, setStudyPoint] = useState<string>("");
  const [disciplinePoint, setDisciplinePoint] = useState<string>("");
  const [evaluationContent, setEvaluationContent] = useState<string>("");

  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // quick actions
  const [quickActions, setQuickActions] = useState<QuickAction[]>(
    DEFAULT_QUICK_ACTIONS
  );
  const [editingQuick, setEditingQuick] = useState<QuickAction | null>(null);
  const [showEditQuickModal, setShowEditQuickModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadClasses = async () => {
      setDataLoading(true);
      try {
        if (!teacherUserId) {
          setTeacherClasses([]);
          return;
        }
        const data = await getTeacherClasses(teacherUserId);
        setTeacherClasses(data ?? []);
      } catch {
        toast.error("Không thể tải danh sách lớp học.");
      } finally {
        setDataLoading(false);
      }
    };
    loadClasses();
  }, [isOpen, teacherUserId, getTeacherClasses]);

  useEffect(() => {
    if (!classId) {
      setStudentsInClass([]);
      return;
    }
    const loadStudents = async () => {
      setStudentsLoading(true);
      try {
        const students = await fetchStudentsInClass(classId);
        setStudentsInClass(students ?? []);
        if (
          studentUserId &&
          !students?.some((s) => s.student_user_id === studentUserId)
        ) {
          setStudentUserId(undefined);
        }
      } catch {
        toast.error("Không thể tải danh sách học sinh trong lớp.");
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, [classId, fetchStudentsInClass, studentUserId]);

  // reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // optionally prefill class/student if defaults provided
      setClassId(defaultClassId);
      setStudentUserId(defaultStudentId);
      // clear other fields
      setEvaluationType(undefined);
      setStudyPoint("");
      setDisciplinePoint("");
      setEvaluationContent("");
    }
  }, [isOpen, defaultClassId, defaultStudentId]);

  // === Fix focus/scrollbar jitter: lock body scroll when modal open ===
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = prevOverflow || "";
    };
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent, payloadOverride?: Partial<EvaluationCreate>) => {
    if (e) e.preventDefault();

    // If payloadOverride provided, use it (for quick-create)
    const payload: EvaluationCreate = {
      student_user_id: (payloadOverride?.student_user_id as number) ?? studentUserId!,
      class_id: (payloadOverride?.class_id as number) ?? classId!,
      evaluation_type: (payloadOverride?.evaluation_type as EvaluationType) ?? (evaluationType as EvaluationType),
      study_point: Number(payloadOverride?.study_point ?? Number(studyPoint || 0)),
      discipline_point: Number(payloadOverride?.discipline_point ?? Number(disciplinePoint || 0)),
      evaluation_content: payloadOverride?.evaluation_content ?? evaluationContent,
    };

    if (!payload.class_id || !payload.student_user_id || !payload.evaluation_type) {
      toast.error("Vui lòng chọn Lớp, Học sinh và Loại đánh giá trước khi tạo.");
      return;
    }

    try {
      await addEvaluation(payload);
      toast.success("Tạo đánh giá thành công");
      onCreated();
      onClose();
    } catch (err) {
      // addEvaluation hook should show errors
    }
  };

  const applyQuickAction = (qa: QuickAction) => {
    setEvaluationType(qa.evaluation_type);
    setStudyPoint(String(qa.study_point));
    setDisciplinePoint(String(qa.discipline_point));
    setEvaluationContent(qa.evaluation_content);
  };

  const quickCreate = async (qa: QuickAction) => {
    if (!classId || !studentUserId) {
      toast.error("Vui lòng chọn Lớp và Học sinh trước khi Quick Create.");
      return;
    }
    await handleSubmit(undefined, {
      student_user_id: studentUserId,
      class_id: classId,
      evaluation_type: qa.evaluation_type,
      study_point: qa.study_point,
      discipline_point: qa.discipline_point,
      evaluation_content: qa.evaluation_content,
    });
  };

  const openEditQuick = (qa?: QuickAction) => {
    if (qa) {
      setEditingQuick({ ...qa });
    } else {
      // new quick action template
      setEditingQuick({
        id: `quick-${Date.now()}`,
        name: "New action",
        study_point: 0,
        discipline_point: 0,
        evaluation_type: "study",
        evaluation_content: "",
      });
    }
    setShowEditQuickModal(true);
  };

  const saveEditingQuick = () => {
    if (!editingQuick) return;
    setQuickActions((prev) => {
      const idx = prev.findIndex((p) => p.id === editingQuick.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = editingQuick;
        return copy;
      } else {
        return [editingQuick, ...prev];
      }
    });
    setShowEditQuickModal(false);
    setEditingQuick(null);
  };

  const deleteQuick = (id: string) => {
    setQuickActions((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // added scrollbarGutter to reduce layout shifts; locking body overflow (above) is main fix
          style={{ scrollbarGutter: "stable" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background p-6 rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
          >
            {/* Header: title centered using flex (not left:50% transform) */}
            <div className="relative flex items-center justify-center border-b pb-3 mb-4">
              <h2
                className="text-xl font-bold flex items-center gap-2 text-cyan-700"
                aria-label="modal-title"
              >
                <ClipboardList className="w-5 h-5 text-cyan-500" />
                Create New Evaluation
              </h2>

              {/* Close button positioned absolute to the right */}
              <div className="absolute right-3 top-3">
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5 text-muted-foreground hover:text-red-600 transition-colors" />
                </Button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-foreground flex items-center gap-2">
                  Quick Create
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditQuick(undefined)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuickActions(DEFAULT_QUICK_ACTIONS);
                      toast.success("Reset quick actions");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickActions.map((qa) => (
                  <div
                    key={qa.id}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 whitespace-nowrap"
                  >
                    <button
                      type="button"
                      onClick={() => applyQuickAction(qa)}
                      className="text-sm font-medium hover:underline"
                      title="Apply to form"
                    >
                      {qa.name}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => quickCreate(qa)}
                        title="Quick create (apply + submit)"
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditQuick(qa)}
                        title="Edit quick action"
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4 text-cyan-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteQuick(qa.id)}
                        title="Delete quick action"
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-5 text-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lớp học */}
                <div>
                  <label className="font-medium mb-1 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-cyan-500" /> Lớp học *
                  </label>
                  <Select
                    value={classId ? String(classId) : ""}
                    onValueChange={(v) => setClassId(Number(v))}
                    disabled={dataLoading || isSubmitting}
                  >
                    <SelectTrigger className="focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
                      <SelectValue
                        placeholder={
                          dataLoading
                            ? "Đang tải lớp học..."
                            : "Chọn lớp học..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((c) => (
                        <SelectItem key={c.class_id} value={String(c.class_id)}>
                          {c.class_name} ({c.subject_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Học sinh */}
                <div>
                  <label className="font-medium mb-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" /> Học sinh *
                  </label>
                  <Select
                    value={studentUserId ? String(studentUserId) : ""}
                    onValueChange={(v) => setStudentUserId(Number(v))}
                    disabled={
                      !classId ||
                      studentsLoading ||
                      studentsInClass.length === 0 ||
                      isSubmitting
                    }
                  >
                    <SelectTrigger className="focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
                      <SelectValue
                        placeholder={
                          !classId
                            ? "Chọn lớp trước"
                            : studentsLoading
                            ? "Đang tải học sinh..."
                            : "Chọn học sinh..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {studentsInClass.map((s) => (
                        <SelectItem
                          key={s.student_user_id}
                          value={String(s.student_user_id)}
                        >
                          {s.full_name} (ID: {s.student_user_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Loại đánh giá */}
                <div>
                  <label className="font-medium mb-1 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" /> Loại đánh giá *
                  </label>
                  <Select
                    value={evaluationType || ""}
                    onValueChange={(v) => setEvaluationType(v as EvaluationType)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
                      <SelectValue placeholder="Chọn loại đánh giá..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EVALUATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Điểm học tập */}
                <div>
                  <label className="font-medium mb-1 flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" /> Điểm học tập
                  </label>
                  <Input
                    type="number"
                    value={studyPoint}
                    onChange={(e) => setStudyPoint(e.target.value)}
                    placeholder="Nhập điểm học tập..."
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Điểm kỷ luật */}
                <div>
                  <label className="font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" /> Điểm kỷ luật
                  </label>
                  <Input
                    type="number"
                    value={disciplinePoint}
                    onChange={(e) => setDisciplinePoint(e.target.value)}
                    placeholder="Nhập điểm kỷ luật..."
                    className="focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Nội dung */}
                <div className="md:col-span-2">
                  <label className="font-medium mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" /> Nội dung đánh giá
                  </label>
                  <Textarea
                    value={evaluationContent}
                    onChange={(e) => setEvaluationContent(e.target.value)}
                    placeholder="Nhập nội dung chi tiết..."
                    className="focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Đang tạo..." : "Tạo đánh giá"}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Edit Quick Action Modal */}
          <AnimatePresence>
            {showEditQuickModal && editingQuick && (
              <motion.div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowEditQuickModal(false);
                  setEditingQuick(null);
                }}
              >
                <motion.div
                  className="bg-background rounded-xl shadow-xl p-4 w-full max-w-lg"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Edit Quick Action</h3>
                    <Button variant="ghost" size="icon" onClick={() => { setShowEditQuickModal(false); setEditingQuick(null); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input value={editingQuick.name} onChange={(e) => setEditingQuick({ ...editingQuick, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Study point</label>
                        <Input type="number" value={String(editingQuick.study_point)} onChange={(e) => setEditingQuick({ ...editingQuick, study_point: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Discipline point</label>
                        <Input type="number" value={String(editingQuick.discipline_point)} onChange={(e) => setEditingQuick({ ...editingQuick, discipline_point: Number(e.target.value) })} />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={editingQuick.evaluation_type} onValueChange={(v) => setEditingQuick({ ...editingQuick, evaluation_type: v as EvaluationType })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVALUATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Content</label>
                      <Textarea value={editingQuick.evaluation_content} onChange={(e) => setEditingQuick({ ...editingQuick, evaluation_content: e.target.value })} />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setShowEditQuickModal(false); setEditingQuick(null); }}>Cancel</Button>
                      <Button onClick={saveEditingQuick}>Save</Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
