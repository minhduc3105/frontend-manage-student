"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { BookOpen, Star, Users, DollarSign, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { useClasses } from "../../../../../src/contexts/ClassContext";
import { ClassUpdate } from "../../../../../src/services/api/class";
import { useEvaluations } from "../../../../../src/hooks/useEvaluation";
import { useTeacherReviews } from "../../../../../src/hooks/useTeacherReview";
import { usePayrolls } from "../../../../../src/hooks/usePayroll";
import { EvaluationView } from "../../../../../src/services/api/evaluation";
import { TeacherReviewView } from "../../../../../src/services/api/teacherReview";
import { Payroll } from "../../../../../src/services/api/payroll";

interface User {
  user_id: number;
  username: string;
  roles: string[];
  full_name: string;
  email: string;
}

interface TeacherRoleProps {
  user: User;
}

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export function TeacherRole({ user }: TeacherRoleProps) {
  // lấy thêm editClass và getTeacherClasses từ context
  const { classes, fetchClasses, editClass, getTeacherClasses } = useClasses();
  const { fetchEvaluationsOfTeacher } = useEvaluations();
  const { fetchReviewsByTeacherId } = useTeacherReviews();
  const { fetchTeacherPayrolls } = usePayrolls();

  const [teacherEvaluations, setTeacherEvaluations] = useState<EvaluationView[]>([]);
  const [teacherReviews, setTeacherReviews] = useState<TeacherReviewView[]>([]);
  const [teacherPayrolls, setTeacherPayrolls] = useState<Payroll[]>([]);
  const [activeTab, setActiveTab] = useState("assign-class");

  const [assigningId, setAssigningId] = useState<number | null>(null);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const userId = user.user_id;

  const loadInitialData = useCallback(async () => {
    try {
      const [evals, reviews, payrolls] = await Promise.all([
        fetchEvaluationsOfTeacher(userId),
        fetchReviewsByTeacherId(userId),
        fetchTeacherPayrolls(userId),
      ]);
      await fetchClasses(); // cập nhật global classes

      if (evals) setTeacherEvaluations(evals);
      if (reviews) setTeacherReviews(reviews);
      if (payrolls) setTeacherPayrolls(payrolls);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      toast.error("Không thể tải dữ liệu ban đầu.");
    }
  }, [userId, fetchEvaluationsOfTeacher, fetchReviewsByTeacherId, fetchTeacherPayrolls, fetchClasses]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Manager dashboard: show class chưa có teacher hoặc đã gán cho teacher khác
  const availableAssignClasses = useMemo(() => {
    return (classes || []).filter((c: any) => {
      // nếu chưa có teacher
      if (!c.teacher_user_id) return true;

      // nếu teacher hiện tại khác teacher đang click
      return c.teacher_user_id !== userId;
    });
  }, [classes, userId]);

  const handleAssignClass = async (classId: number) => {
    try {
      setAssigningId(classId);

      // build payload typed as ClassUpdate
      const payload: ClassUpdate = {
        teacher_user_id: userId,
      };

      // gọi editClass từ context (editClass = async (id:number, data: ClassUpdate))
      await editClass(classId, payload);

      toast.success("Gán lớp thành công!");

      // reload dữ liệu
      await fetchClasses();
      try { await getTeacherClasses(userId); } catch (err) { /* non-blocking */ }
      await loadInitialData();
    } catch (err: any) {
      console.error("Assign failed:", err);
      toast.error(err?.message || "Gán lớp thất bại");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6 bg-background text-foreground p-6 rounded-md">
    {/* --- Stats --- */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: "Available to Assign", icon: BookOpen, value: availableAssignClasses.length, border: "border-blue-200", textColor: "text-foreground", valueColor: "text-foreground" },
        { title: "Evaluations Given", icon: Star, value: teacherEvaluations.length, border: "border-yellow-200", textColor: "text-foreground", valueColor: "text-foreground" },
        { title: "Student Reviews", icon: Users, value: teacherReviews.length, border: "border-green-200", textColor: "text-foreground", valueColor: "text-foreground" },
        { title: "Monthly Salary", icon: DollarSign, value: formatVND(teacherPayrolls[0]?.total || 0), border: "border-purple-200", textColor: "text-foreground", valueColor: "text-green-700" },
      ].map((card) => (
        <motion.div key={card.title} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className={`bg-background border-2 ${card.border} shadow-sm h-full flex flex-col`}>
            <CardHeader className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <card.icon className="h-5 w-5 text-current" />
                <CardTitle className={`text-sm font-medium ${card.textColor}`}>{card.title}</CardTitle>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex justify-center items-center flex-1">
              <div className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

      {/* --- Tabs --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background border-b border-gray-200">
          <TabsTrigger
            value="assign-class"
            className="cursor-pointer data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-muted-foreground hover:text-foreground border-r"
          >
            <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Assign Class</div>
          </TabsTrigger>

          <TabsTrigger
            value="evaluations"
            className="cursor-pointer data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 text-muted-foreground hover:text-foreground border-r"
          >
            <div className="flex items-center gap-2"><Star className="w-4 h-4" /> Evaluations</div>
          </TabsTrigger>

          <TabsTrigger
            value="reviews"
            className="cursor-pointer data-[state=active]:bg-green-50 data-[state=active]:text-green-700 text-muted-foreground hover:text-foreground border-r"
          >
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Reviews</div>
          </TabsTrigger>

          <TabsTrigger
            value="payroll"
            className="cursor-pointer data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Payroll</div>
          </TabsTrigger>
        </TabsList>

        {/* Assign Class tab */}
        <TabsContent value="assign-class" className="space-y-4">
          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Available Classes</CardTitle>
              <CardDescription className="text-muted-foreground">Select a class to assign yourself to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableAssignClasses.length > 0 ? (
                  availableAssignClasses.map((cls: any) => (
                    <motion.div
                      key={cls.class_id ?? cls.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-background"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">{cls.class_name}</h3>
                        <p className="text-sm text-muted-foreground">Capacity: {cls.capacity}</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleAssignClass(Number(cls.class_id ?? cls.id))}
                          disabled={assigningId === Number(cls.class_id ?? cls.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {assigningId === Number(cls.class_id ?? cls.id) ? "Assigning..." : "Assign to Me"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">Không có lớp nào có thể gán.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluations tab */}
        <TabsContent value="evaluations" className="space-y-4">
          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Evaluations</CardTitle>
              <CardDescription className="text-muted-foreground">Danh sách các đánh giá bạn đã tạo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-foreground">ID</TableHead>
                    <TableHead className="text-foreground">Student</TableHead>
                    <TableHead className="text-foreground">Type</TableHead>
                    <TableHead className="text-foreground">Content</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherEvaluations.map((ev) => (
                    <TableRow key={ev.id} className="border-b">
                      <TableCell className="text-foreground">{ev.id}</TableCell>
                      <TableCell className="text-foreground">{ev.student}</TableCell>
                      <TableCell className="text-foreground">{ev.type}</TableCell>
                      <TableCell className="text-foreground">{ev.content}</TableCell>
                      <TableCell className="text-foreground">{formatDate(ev.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Student Reviews</CardTitle>
              <CardDescription className="text-muted-foreground">Nhận xét từ sinh viên</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-foreground">Student</TableHead>
                    <TableHead className="text-foreground">Rating</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherReviews.map((r) => (
                    <TableRow key={r.id} className="border-b">
                      <TableCell className="text-foreground">{r.student_name}</TableCell>
                      <TableCell>
                        <div className="flex">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{formatDate(r.review_date)}</TableCell>
                      <TableCell className="text-foreground">{r.review_content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Payroll Information</CardTitle>
              <CardDescription className="text-muted-foreground">Thông tin lương hàng tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-foreground">ID</TableHead>
                    <TableHead className="text-foreground">Month</TableHead>
                    <TableHead className="text-foreground">Base Salary</TableHead>
                    <TableHead className="text-foreground">Reward Bonus</TableHead>
                    <TableHead className="text-foreground">Total</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherPayrolls.map((p) => (
                    <TableRow key={p.id} className="border-b">
                      <TableCell className="text-foreground">{p.id}</TableCell>
                      <TableCell className="text-foreground">{p.month}</TableCell>
                      <TableCell className="text-foreground">{formatVND(p.base_salary)}</TableCell>
                      <TableCell className="text-foreground">{formatVND(p.bonus)}</TableCell>
                      <TableCell className="font-semibold text-green-700">{formatVND(p.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === "paid" ? "default" : "secondary"}
                          className={p.status === "pending" ? "bg-yellow-500 text-white hover:bg-yellow-400" : ""}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">{p.sent_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
