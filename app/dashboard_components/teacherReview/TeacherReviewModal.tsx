"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Star,
  Mail,
  Calendar,
  BookOpen,
  Send,
  MessageCircle,
  User,
  ChevronLeft,
  History,
  StarOff,
  Edit2,
  Trash2,
  Award,
  CheckCircle,
  X as XIcon,
  Eye,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import { useTeacherReviews } from "../../../src/hooks/useTeacherReview";
import { useStudent } from "../../../src/hooks/useStudent";
import { toast } from "react-hot-toast";

import { ConfirmModal } from "../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../src/hooks/useConfirmDialog";

interface TeacherViewLite {
  teacher_user_id: number;
  full_name?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  class_taught?: string[] | null;
  subject?: string | null;
}

interface TeacherReviewPageProps {
  userRole?: "student" | "parent" | "teacher" | "manager";
  studentUserId?: number;
}

export default function TeacherReviewPage({ studentUserId }: TeacherReviewPageProps) {
  const {
    reviews,
    loading: reviewsLoading,
    fetchAllReviews,
    fetchReviewsByStudentId,
    fetchReviewsByTeacherId,
    createReview,
    updateReview,
    deleteReview,
  } = useTeacherReviews();

  const { fetchTeachersByStudentId } = useStudent();

  // confirm dialog hook
  const {
    isOpen: confirmIsOpen,
    message: confirmMessage,
    onConfirm: confirmOnConfirm,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog();

  const [view, setView] = useState<"list" | "review" | "history">("list");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherViewLite | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState<string>("");

  const [teachers, setTeachers] = useState<TeacherViewLite[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  // Modal for "View All Reviews"
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [teacherReviews, setTeacherReviews] = useState<any[]>([]);
  const [loadingTeacherReviews, setLoadingTeacherReviews] = useState(false);

  // Load reviews / teachers on mount or when studentUserId changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (studentUserId) {
        try {
          setLoadingTeachers(true);
          const t = await fetchTeachersByStudentId(studentUserId);
          if (mounted) setTeachers(t ?? []);
        } catch (err) {
          console.error("fetchTeachersByStudentId failed:", err);
          toast.error("Không thể tải danh sách giáo viên cho học sinh.");
        } finally {
          if (mounted) setLoadingTeachers(false);
        }

        try {
          await fetchReviewsByStudentId(studentUserId);
        } catch (err) {
          console.error("fetchReviewsByStudentId failed:", err);
        }
      } else {
        try {
          await fetchAllReviews();
          // derive teacher list from reviews if possible
          if (mounted && reviews) {
            const map = new Map<number, TeacherViewLite>();
            reviews.forEach((r: any) => {
              if (r.teacher_user_id) {
                map.set(r.teacher_user_id, {
                  teacher_user_id: r.teacher_user_id,
                  full_name: r.teacher_name ?? r.teacher_full_name ?? `#${r.teacher_user_id}`,
                  email: r.teacher_email ?? null,
                  subject: r.subject ?? null,
                  class_taught: r.class_name ? [r.class_name] : null,
                });
              }
            });
            setTeachers(Array.from(map.values()));
          }
        } catch (err) {
          console.error("fetchAllReviews failed:", err);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentUserId]);

  // derived reviews list
  const myReviews = useMemo(() => reviews ?? [], [reviews]);

  // compute stats for a teacher (avg rating + count)
  const teacherStats = useMemo(() => {
    const stats = new Map<number, { avg: number; count: number }>();
    (reviews || []).forEach((r: any) => {
      const id = r.teacher_user_id;
      if (!id) return;
      const existing = stats.get(id) ?? { avg: 0, count: 0 };
      existing.avg = existing.avg + (r.rating || 0);
      existing.count = existing.count + 1;
      stats.set(id, existing);
    });
    // finalize avg
    stats.forEach((v) => {
      v.avg = v.count ? +(v.avg / v.count).toFixed(1) : 0;
    });
    return stats;
  }, [reviews]);

  const handleTeacherClick = async (teacher: TeacherViewLite) => {
    setSelectedTeacher(teacher);
    setView("review");
    setRating(0);
    setHoveredRating(0);
    setReviewContent("");
    setEditingReviewId(null);
    try {
      await fetchReviewsByTeacherId(teacher.teacher_user_id);
    } catch (err) {
      console.error("fetchReviewsByTeacherId failed:", err);
    }
  };

  const handleStartEdit = (r: any) => {
    // prepare edit: set selectedTeacher from review info, populate fields
    const teacherData: TeacherViewLite = {
      teacher_user_id: r.teacher_user_id,
      full_name: r.teacher_name ?? r.teacher_full_name,
      subject: r.subject ?? undefined,
    };
    setSelectedTeacher(teacherData);
    setRating(r.rating ?? 0);
    setReviewContent(r.review_content ?? r.review_text ?? "");
    setEditingReviewId(r.id);
    setView("review");
  };

  // delete using ConfirmModal (openConfirm)
  const handleDeleteConfirmed = async (id?: number) => {
    if (!id) return;
    try {
      const ok = await deleteReview(id);
      if (ok) {
        if (studentUserId) await fetchReviewsByStudentId(studentUserId);
        else await fetchAllReviews();
      } else {
        toast.error("Xóa thất bại");
      }
      closeConfirm();
    } catch (err) {
      console.error("deleteReview failed:", err);
      toast.error("Xóa thất bại");
      closeConfirm();
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedTeacher) {
      toast.error("Vui lòng chọn giáo viên");
      return;
    }
    if (rating === 0 || !reviewContent.trim()) {
      toast.error("Vui lòng cho điểm và viết nhận xét");
      return;
    }

    const payload: any = {
      teacher_user_id: selectedTeacher.teacher_user_id,
      rating,
      // prefer review_content
      review_content: reviewContent.trim(),
      student_user_id: studentUserId ?? undefined,
      subject: selectedTeacher.subject ?? undefined,
    };

    try {
      if (editingReviewId) {
        const ok = await updateReview(editingReviewId, payload);
        if (ok) {
          setEditingReviewId(null);
        }
      } else {
        const ok = await createReview(payload);
        if (ok) {
          toast.success("Đánh giá đã được gửi");
        }
      }
      // refresh
      if (studentUserId) await fetchReviewsByStudentId(studentUserId);
      else await fetchAllReviews();

      // reset
      setView("list");
      setSelectedTeacher(null);
      setRating(0);
      setReviewContent("");
    } catch (err) {
      console.error("submit review failed:", err);
      toast.error("Gửi/Cập nhật thất bại");
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedTeacher(null);
    setRating(0);
    setReviewContent("");
    setEditingReviewId(null);
  };

  const formatDate = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  };

  // helper to render review text
  const getReviewText = (r: any) => r.review_content ?? r.review_text ?? r.review ?? "";

  // --- NEW: open "View All Reviews" modal for specific teacher
  const openAllReviewsForTeacher = async (teacher: TeacherViewLite) => {
    setLoadingTeacherReviews(true);
    setShowAllReviewsModal(true); // optimistic open
    setSelectedTeacher(teacher); // ensure header shows teacher
    try {
      const list = await fetchReviewsByTeacherId(teacher.teacher_user_id);
      setTeacherReviews(list ?? []);
    } catch (err) {
      console.error("fetchReviewsByTeacherId for modal failed:", err);
      toast.error("Không thể tải đánh giá của giáo viên này.");
      setTeacherReviews([]);
    } finally {
      setLoadingTeacherReviews(false);
    }
  };

  const closeAllReviewsModal = () => {
    setShowAllReviewsModal(false);
    setTeacherReviews([]);
    setLoadingTeacherReviews(false);
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header with blue theme */}
        <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-6">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teacher Reviews</h1>
              <p className="text-sm opacity-90 mt-1">
                {view === "list" && "Share your experience with your teachers"}
                {view === "review" && (editingReviewId ? "Edit your review" : "Help others by sharing your honest feedback")}
                {view === "history" && "Your submitted reviews"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView(view === "history" ? "list" : "history")}
                className="text-white"
              >
                <History className="w-4 h-4 mr-2" />
                {view === "history" ? "Teachers" : "My Reviews"}
              </Button>
              {view !== "list" && (
                <Button variant="ghost" size="sm" onClick={handleBackToList} className="text-white">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto p-6">
          {/* Teacher cards */}
          {view === "list" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingTeachers ? (
                <div className="col-span-full text-center p-8 text-muted-foreground">Loading teachers...</div>
              ) : teachers.length === 0 ? (
                <div className="col-span-full text-center p-8 text-muted-foreground">No teachers found.</div>
              ) : (
                teachers.map((teacher) => {
                  const stat = teacherStats.get(teacher.teacher_user_id);
                  const isTop = stat && stat.avg >= 4.6;
                  return (
                    <Card
                      key={teacher.teacher_user_id}
                      className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                      onClick={() => handleTeacherClick(teacher)}
                    >
                      {/* decorative header (more colors + small components) */}
                      <div className="relative overflow-hidden h-28">
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500" />
                        {/* decorative diagonal accent */}
                        <div className="absolute -bottom-6 -left-8 w-32 h-32 rounded-full bg-gradient-to-tr from-pink-400 to-yellow-300 opacity-30 transform rotate-12" />
                        {/* small medals / award on top-left */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <div className="bg-background/90 rounded-full p-1 shadow">
                            <Award className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="bg-background/90 rounded-full p-1 shadow">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>

                        {/* top rated badge */}
                        {isTop && (
                          <div className="absolute top-3 right-3 bg-background/95 text-foreground rounded-full px-3 py-1 text-sm font-medium shadow flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>Top</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6 -mt-12 relative text-center">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg"
                          style={{
                            background: "conic-gradient(from 180deg at 50% 50%, #3b82f6, #06b6d4, #60a5fa)",
                          }}
                        >
                          {/* colorful multi-layer avatar circle with white inner ring */}
                          <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center">
                            <User className="w-8 h-8 text-white drop-shadow" />
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-1">{teacher.full_name ?? `#${teacher.teacher_user_id}`}</h3>

                        {teacher.subject && <Badge className="bg-gradient-to-r from-sky-100 to-cyan-50 text-sky-700 mb-3">{teacher.subject}</Badge>}

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <div className="inline-flex items-center gap-2 bg-background/60 px-2 py-1 rounded-full">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <span className="text-xs">{(teacher.class_taught && teacher.class_taught.join(", ")) ?? "Classes: —"}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <div className="inline-flex items-center gap-2 bg-background/60 px-2 py-1 rounded-full">
                              <Mail className="w-4 h-4 text-rose-500" />
                              <span className="truncate text-xs">{teacher.email ?? "—"}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <div className="inline-flex items-center gap-2 bg-background/60 px-2 py-1 rounded-full">
                              <Calendar className="w-4 h-4 text-amber-500" />
                              <span className="text-xs">{teacher.date_of_birth ? formatDate(teacher.date_of_birth) : "—"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <Button
                            onClick={() => handleTeacherClick(teacher)}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>

                          <Button
                            variant="outline"
                            onClick={(e) => {
                              // prevent triggering the outer card onClick
                              e.stopPropagation();
                              openAllReviewsForTeacher(teacher);
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View All Reviews
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Review / Edit form */}
          {view === "review" && selectedTeacher && (
            <div className="max-w-3xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  {/* enriched header: avatar + multi-color chips + small icon group */}
                  <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg p-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg,#3b82f6 0%,#06b6d4 40%,#60a5fa 70%)",
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                        <User className="w-7 h-7 text-sky-700" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{selectedTeacher.full_name ?? `#${selectedTeacher.teacher_user_id}`}</h3>
                          <p className="text-sm text-muted-foreground">{selectedTeacher.subject ?? ""}</p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="inline-flex items-center gap-2 bg-background rounded-md px-3 py-1 shadow-sm">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold text-foreground">{teacherStats.get(selectedTeacher.teacher_user_id)?.avg ?? "—"}</span>
                            <span className="text-xs text-muted-foreground">({teacherStats.get(selectedTeacher.teacher_user_id)?.count ?? 0})</span>
                          </div>

                          {/* verified or award chip */}
                          <div className="inline-flex items-center gap-2 text-xs">
                            <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              <span>Verified</span>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                              <Award className="w-4 h-4 text-amber-500" />
                              <span>Awarded</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedTeacher.class_taught && (
                        <div className="mt-2">
                          <Badge className="bg-sky-100 text-sky-700">Classes: {selectedTeacher.class_taught.join(", ")}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-foreground mb-4">Rate your experience</label>
                    <div className="flex items-center justify-center space-x-3 p-6 bg-slate-50 rounded-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          aria-label={`${star} Star`}
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-12 h-12 transition-colors ${
                              star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && <p className="text-center mt-3 text-muted-foreground">You rated: <span className="font-semibold text-blue-600">{rating} stars</span></p>}
                  </div>

                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-foreground mb-4">Share your thoughts</label>
                    <Textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Tell us about your experience..."
                      className="min-h-[160px] text-base resize-none border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2">{reviewContent.length} characters</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={rating === 0 || !reviewContent.trim()}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 text-lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {editingReviewId ? "Update Review" : "Submit Review"}
                    </Button>
                    <Button variant="outline" onClick={handleBackToList} className="h-12 px-6">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History (list of reviews) */}
          {view === "history" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {reviewsLoading || loadingTeachers ? (
                <div className="text-center p-8 text-muted-foreground">Loading reviews...</div>
              ) : myReviews.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <StarOff className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground mb-6">Start sharing your experience with your teachers!</p>
                    <Button onClick={() => setView("list")} className="bg-gradient-to-r from-blue-600 to-cyan-500">Write Your First Review</Button>
                  </CardContent>
                </Card>
              ) : (
                myReviews.map((r: any) => (
                  <Card key={r.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center"
                               style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{r.teacher_name ?? r.teacher_full_name ?? `#${r.teacher_user_id}`}</h3>
                            {r.subject && <Badge className="bg-sky-100 text-sky-700 mt-1">{r.subject}</Badge>}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-1 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-4 h-4 ${s <= (r.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{formatDate(r.created_at ?? r.review_date)}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-foreground leading-relaxed">{getReviewText(r)}</p>
                      </div>

                      {/* Edit / Delete controls (Delete uses ConfirmModal) */}
                      <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(r)}
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openConfirm(`Bạn có chắc chắn muốn xoá đánh giá này?`, () => handleDeleteConfirmed(r.id))}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>

                        <button className="flex items-center space-x-2 text-muted-foreground hover:text-sky-500 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">Comment</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal (shared) */}
      <ConfirmModal isOpen={confirmIsOpen} message={confirmMessage} onConfirm={confirmOnConfirm} onCancel={closeConfirm} />

      {/* --- Modal: View All Reviews for a teacher (reduced height + inner scroll) --- */}
      {showAllReviewsModal && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/50" onClick={closeAllReviewsModal} />

          {/* modal box: reduced height + internal scroll */}
          <div
            className="relative w-full max-w-3xl mx-auto rounded-lg shadow-xl bg-background text-foreground overflow-hidden"
            style={{ maxHeight: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header (sticky) */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}
                >
                  <User className="w-6 h-6 text-white " />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTeacher?.full_name ?? "Teacher"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTeacher?.subject ?? ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={closeAllReviewsModal} className="text-foreground bg-red-500 bg-red-500 hover :bg-red-700 text-white">
                  <XIcon className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>

            {/* content area with scrollbar */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(70vh - 80px)" }}>
              {loadingTeacherReviews ? (
                <div className="text-center py-8">Loading reviews...</div>
              ) : teacherReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No reviews for this teacher yet.</div>
              ) : (
                <div className="space-y-4">
                  {teacherReviews.map((r: any) => {
                    const mine = !!(studentUserId && r.student_user_id && Number(r.student_user_id) === Number(studentUserId));
                    return (
                      <Card key={r.id} className={`border-0 shadow-sm ${mine ? "ring-2 ring-sky-300 bg-sky-50" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                  background: mine ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : "linear-gradient(135deg,#e2e8f0,#f8fafc)",
                                }}
                              >
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-foreground">{r.student_name ?? `Student #${r.student_user_id ?? "?"}`}</h4>
                                  {mine && <span className="text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">Your review</span>}
                                </div>
                                <div className="text-sm text-muted-foreground">{formatDate(r.created_at ?? r.review_date)}</div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-4 h-4 ${s <= (r.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg p-3 bg-background">
                            <p className="text-foreground">{getReviewText(r)}</p>
                          </div>

                          {/* small action row (edit/delete for owner if available) */}
                          <div className="flex items-center justify-end gap-2 mt-3">
                            {mine && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEdit(r)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openConfirm(`Bạn có chắc chắn muốn xoá đánh giá này?`, () => handleDeleteConfirmed(r.id))}
                                  className="flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
