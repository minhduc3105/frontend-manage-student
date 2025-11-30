"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  AlertTriangle,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { useEvaluations } from "../../../src/hooks/useEvaluation";
import { toast } from "react-hot-toast";

import { ConfirmModal } from "../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../src/hooks/useConfirmDialog";
import { CreateEvaluationModal } from "./CreateEvaluationModal";

interface StudentEvaluationPageProps {
  userRole: "student" | "parent" | "teacher" | "manager";
  studentUserId?: number;
  teacherUserId?: number;
  classId?: number;
}

const formatDateDMY = (ymd?: string) => {
  if (!ymd) return "";
  const datePart = (ymd || "").split("T")[0];
  const [y, m, d] = datePart.split("-");
  if (!d || !m || !y) return ymd;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

const getTypeIcon = (type: string | undefined) => {
  switch (type) {
    case "initial":
    case "exam":
      return <BookOpen className="w-4 h-4" />;
    case "study":
    case "assignment":
      return <Star className="w-4 h-4" />;
    case "quiz":
    case "progress":
      return <TrendingUp className="w-4 h-4" />;
    case "discipline":
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string | undefined) => {
  switch (type) {
    case "initial":
      return "bg-purple-100 text-purple-800";
    case "study":
      return "bg-blue-100 text-blue-800";
    case "discipline":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-foreground";
  }
};

export default function StudentEvaluationPage({
  userRole,
  studentUserId,
  teacherUserId,
  classId,
}: StudentEvaluationPageProps) {
  const {
    evaluations,
    loading,
    fetchAllEvaluations,
    fetchEvaluationsOfStudent,
    fetchEvaluationsOfStudentInClass,
    fetchEvaluationRecord,
    fetchEvaluationsSummaryOfStudentInClass,
    fetchTotalScore,
    removeEvaluation,
  } = useEvaluations();

  // confirm dialog hook
  const {
    isOpen: confirmIsOpen,
    message: confirmMessage,
    onConfirm: confirmOnConfirm,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStudent, setFilterStudent] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [localList, setLocalList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [fetching, setFetching] = useState(false);

  // create modal state
  const [createOpen, setCreateOpen] = useState(false);

  // fetch on mount / when studentUserId or classId change
  useEffect(() => {
    let active = true;
    (async () => {
      setFetching(true);
      try {
        if (studentUserId && classId) {
          const list = await fetchEvaluationsOfStudentInClass(studentUserId, classId);
          if (active && list) setLocalList(list);
          try {
            const s = await fetchEvaluationsSummaryOfStudentInClass(studentUserId, classId);
            if (active) setSummary(s);
          } catch {}
        } else if (studentUserId) {
          const list = await fetchEvaluationsOfStudent(studentUserId);
          if (active && list) setLocalList(list);
          try {
            const s = await fetchTotalScore(studentUserId);
            if (active) setSummary(s);
          } catch {}
        } else {
          await fetchAllEvaluations();
          // copied to localList by the next effect
        }
      } catch (err) {
        console.error("Failed to fetch evaluations:", err);
      } finally {
        setFetching(false);
      }
    })();

    return () => {
      active = false;
      setSelectedEvaluation(null);
      setLocalList([]);
      setFilterStudent("all");
      setSummary(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentUserId, classId]);

  // copy global evaluations into localList when available and no student filter was used
  useEffect(() => {
    if (!studentUserId && evaluations && evaluations.length) {
      setLocalList(evaluations);
    }
  }, [evaluations, studentUserId]);

  // derive lists for filters
  const subjects = useMemo(
    () => ["all", ...Array.from(new Set(localList.map((l) => l.class_name || l.subject || "Unknown")))],
    [localList]
  );
  const types = useMemo(
    () => ["all", ...Array.from(new Set(localList.map((l) => l.type || "other")))],
    [localList]
  );
  const students = useMemo(() => {
    const map = new Map<string, string>();
    localList.forEach((l) => {
      const id = l.student_user_id != null ? String(l.student_user_id) : null;
      const label = l.student || (id ? `#${id}` : "Unknown");
      const key = id || label;
      if (!map.has(key)) map.set(key, label);
    });
    return [{ value: "all", label: "All Students" }, ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))];
  }, [localList]);

  const filteredEvaluations = useMemo(() => {
    const sTerm = searchTerm?.trim().toLowerCase();
    return (localList || []).filter((ev: any) => {
      const matchesSearch =
        !sTerm ||
        (ev.content && String(ev.content).toLowerCase().includes(sTerm)) ||
        (ev.teacher && String(ev.teacher).toLowerCase().includes(sTerm)) ||
        (ev.class_name && String(ev.class_name).toLowerCase().includes(sTerm));
      const matchesSubject = filterSubject === "all" || (ev.class_name || ev.subject) === filterSubject;
      const matchesType = filterType === "all" || (ev.type || "other") === filterType;
      const matchesStudent =
        filterStudent === "all" ||
        (ev.student_user_id != null && String(ev.student_user_id) === filterStudent) ||
        (ev.student != null && ev.student === filterStudent);

      return matchesSearch && matchesSubject && matchesType && matchesStudent;
    });
  }, [localList, searchTerm, filterSubject, filterType, filterStudent]);

  const handleSelect = async (ev: any) => {
    if (!ev) {
      setSelectedEvaluation(null);
      return;
    }
    if (ev.id && fetchEvaluationRecord) {
      try {
        const rec = await fetchEvaluationRecord(ev.id);
        setSelectedEvaluation({ ...ev, ...rec });
      } catch {
        setSelectedEvaluation(ev);
      }
    } else {
      setSelectedEvaluation(ev);
    }
  };

  // delete confirmed handler
  const handleDeleteConfirmed = async (id?: number) => {
    if (!id) return;
    try {
      await removeEvaluation(id);
      toast.success("Deleted evaluation");
      setLocalList((prev) => prev.filter((p) => p.id !== id));
      setSelectedEvaluation(null);
      closeConfirm();
    } catch (err) {
      toast.error("Failed to delete");
      console.error(err);
    }
  };

  const handleExport = async () => {
    if (!selectedEvaluation) return;
    let payload = selectedEvaluation;
    if (selectedEvaluation.id && fetchEvaluationRecord) {
      try {
        const rec = await fetchEvaluationRecord(selectedEvaluation.id);
        if (rec) payload = { ...selectedEvaluation, record: rec };
      } catch {}
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-${selectedEvaluation.id || "export"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // callback used when a new evaluation is created to refresh the list
  const handleCreated = async () => {
    try {
      if (studentUserId && classId) {
        const list = await fetchEvaluationsOfStudentInClass(studentUserId, classId);
        setLocalList(list || []);
        try {
          const s = await fetchEvaluationsSummaryOfStudentInClass(studentUserId, classId);
          setSummary(s);
        } catch {}
      } else if (studentUserId) {
        const list = await fetchEvaluationsOfStudent(studentUserId);
        setLocalList(list || []);
        try {
          const s = await fetchTotalScore(studentUserId);
          setSummary(s);
        } catch {}
      } else {
        await fetchAllEvaluations();
      }
      toast.success("Evaluation created and list refreshed");
    } catch (err) {
      console.error("Failed to refresh after create:", err);
    }
  };

  // ---------- RENDER ----------
  return (
    <>
      <div className="w-full min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto py-8 px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Evaluation History</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {userRole === "student" && "View your academic evaluations and content"}
                {userRole === "parent" && "Monitor your children's academic progress"}
                {userRole === "teacher" && "Manage student evaluations and grades"}
                {userRole === "manager" && "Overview of all evaluations and performance metrics"}
              </p>
            </div>
          {userRole === "teacher" && (
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Evaluation
            </Button>
          )}
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search evaluations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {userRole !== "student" && (
                <Select value={filterStudent} onValueChange={(v) => setFilterStudent(v)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "all" ? "All Classes" : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={(v) => setFilterType(v)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "all" ? "All Types" : ("" + t).charAt(0).toUpperCase() + ("" + t).slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content: list + detail */}
          <div className="flex gap-6">
            {/* List (left) */}
            <div className="w-1/2 max-h-[70vh] overflow-auto">
              <div className="space-y-3">
                {loading || fetching ? (
                  <div className="text-muted-foreground p-4">Loading evaluations...</div>
                ) : filteredEvaluations.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">No evaluations found.</div>
                ) : (
                  filteredEvaluations.map((evaluation: any) => (
                    <Card
                      key={evaluation.id || `${evaluation.student}-${evaluation.date}`}
                      className={`cursor-pointer transition-all duration-150 ${selectedEvaluation?.id === evaluation.id ? "ring-2 ring-blue-500 shadow" : "hover:shadow"}`}
                      onClick={() => handleSelect(evaluation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${getTypeColor(evaluation.type)}`}>
                              {getTypeIcon(evaluation.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{evaluation.class_name || evaluation.subject || "Class"}</h3>
                              {/* hide teacher in list if user is teacher */}
                              {userRole !== "teacher" && (
                                <p className="text-sm text-muted-foreground">{evaluation.teacher}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-foreground mb-3 line-clamp-2">{evaluation.content}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDateDMY(evaluation.date)}</span>
                          <div className="flex items-center space-x-3">
                            {evaluation.study_point > 0 && <span className="text-green-600">{evaluation.study_point} SP</span>}
                            {evaluation.discipline_point > 0 && <span className="text-red-600">{evaluation.discipline_point} DP</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Detail (right) */}
            <div className="w-1/2 max-h-[70vh] overflow-auto">
              {selectedEvaluation ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getTypeColor(selectedEvaluation.type)}`}>
                        {getTypeIcon(selectedEvaluation.type)}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{selectedEvaluation.class_name || selectedEvaluation.subject || "Class"}</h2>
                        <p className="text-sm text-muted-foreground">{selectedEvaluation.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      {
                        label: "Study Points",
                        value: selectedEvaluation.study_point ?? selectedEvaluation.studyPoints ?? 0,
                        icon: <Award />,
                      },
                      {
                        label: "Discipline Points",
                        value: selectedEvaluation.discipline_point ?? selectedEvaluation.disciplinePoints ?? 0,
                        icon: <AlertTriangle />,
                      },
                    ].map((p) => {
                      const isPositive = p.value >= 0;
                      const colorBg = isPositive ? "bg-green-100" : "bg-red-100";
                      const colorText = isPositive ? "text-green-600" : "text-red-600";
                      return (
                        <Card key={p.label} className="text-center">
                          <CardContent className="p-2 text-center">
                            <div className={`p-3 rounded-lg inline-flex items-center justify-center mb-1 ${colorBg}`}>
                              {React.cloneElement(p.icon, { className: `${colorText} w-5 h-5` })}
                            </div>
                            <div className={`text-lg font-bold ${colorText}`}>{p.value}</div>
                            <div className="text-sm text-muted-foreground">{p.label}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Details Card (delete button placed at bottom of the card) */}
                  <Card className="flex-1 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">Evaluation Details</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 flex-1">
                      {/* hide Teacher row for teacher role */}
                      {userRole !== "teacher" && (
                        <div className="text-sm flex justify-between">
                          <span className="font-medium text-muted-foreground">Teacher:</span>
                          <span className="text-foreground">{selectedEvaluation.teacher}</span>
                        </div>
                      )}

                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-muted-foreground">Date:</span>
                        <span className="text-foreground">{formatDateDMY(selectedEvaluation.date)}</span>
                      </div>

                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-muted-foreground">Type:</span>
                        <span className="text-foreground capitalize">{selectedEvaluation.type}</span>
                      </div>

                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-muted-foreground">Class:</span>
                        <span className="text-foreground">{selectedEvaluation.class_name}</span>
                      </div>

                      {/* hide Student info for student role */}
                      {userRole !== "student" && (
                        <div className="text-sm flex justify-between">
                          <span className="font-medium text-muted-foreground">Student:</span>
                          <span className="text-foreground">
                            {selectedEvaluation.student} {selectedEvaluation.student_user_id ? `(ID: ${selectedEvaluation.student_user_id})` : ""}
                          </span>
                        </div>
                      )}

                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-muted-foreground">Content:</span>
                        <span className="text-foreground">{selectedEvaluation.content || "N/A"}</span>
                      </div>
                    </CardContent>

                    {/* Delete button area placed at the bottom of the card (teacher only) */}
                    {userRole === "teacher" && (
                      <div className="p-4 border-t border-gray-100 flex justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() =>
                            openConfirm(
                              `Bạn có chắc chắn muốn xoá evaluation ${selectedEvaluation.id}?`,
                              () => handleDeleteConfirmed(selectedEvaluation.id)
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select an Evaluation</h3>
                    <p className="text-muted-foreground">Choose an evaluation from the list to view details</p>
                    {summary && (
                      <div className="mt-4 text-sm text-foreground">
                        <div>Final Study Points: <strong>{summary.final_study_point ?? summary.finalStudyPoint ?? 0}</strong></div>
                        <div>Final Discipline Points: <strong>{summary.final_discipline_point ?? summary.finalDisciplinePoint ?? 0}</strong></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal isOpen={confirmIsOpen} message={confirmMessage} onConfirm={confirmOnConfirm} onCancel={closeConfirm} />

      {/* Create Evaluation Modal */}
      <CreateEvaluationModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        defaultStudentId={studentUserId}
        defaultClassId={classId}
        teacherUserId={teacherUserId}
      />
    </>
  );
}
