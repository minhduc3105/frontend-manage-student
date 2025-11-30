"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { BookOpen, Star, Users, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { useClasses } from "../../../../../src/contexts/ClassContext";
import { useEnrollment } from "../../../../../src/hooks/useEnrollment";
import { useTeacherReviews } from "../../../../../src/hooks/useTeacherReview";
import { useEvaluations } from "../../../../../src/hooks/useEvaluation";
import { Enrollment } from "../../../../../src/services/api/enrollment";

interface User {
  user_id: number;
  username: string;
  roles: string[];
  full_name: string;
  email: string;
}

interface StudentRoleProps {
  user: User;
}

export function StudentRole({ user }: StudentRoleProps) {
  const { classes, fetchClasses } = useClasses();
  const { addEnrollment, getEnrollmentsByStudentId } = useEnrollment();
  const { fetchTotalScore, fetchEvaluationsOfStudent } = useEvaluations();
  const { reviews: studentReviews, fetchReviewsByStudentId } = useTeacherReviews();

  const [studentEvaluations, setStudentEvaluations] = useState<any[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  const [summary, setSummary] = useState({ study_points: 0, discipline_points: 0 });
  const [activeTab, setActiveTab] = useState("add-class");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const loadInitialData = useCallback(async () => {
    const userId = user.user_id;
    try {
      const [enrolls, evals, total] = await Promise.all([
        getEnrollmentsByStudentId(userId),
        fetchEvaluationsOfStudent(userId),
        fetchTotalScore(userId),
        fetchReviewsByStudentId(userId),
      ]);

      if (enrolls) {
        setStudentEnrollments(
          enrolls.map((e: any) => ({
            ...e,
            enrollment_status: (e.enrollment_status ?? "").toString().trim().toLowerCase(),
            enrollment_date: e.enrollment_date,
          }))
        );
      } else {
        setStudentEnrollments([]);
      }

      if (evals) {
        // evals: EvaluationView[] { id, class_name, student, teacher, type, content, date }
        setStudentEvaluations(
          evals.map((ev: any) => ({
            ...ev,
            date: formatDate(ev.date),
          }))
        );
      } else {
        setStudentEvaluations([]);
      }

      if (total) {
        // total: EvaluationSummary from backend: final_study_point, final_discipline_point ...
        setSummary({
          study_points: (total.final_study_point ?? 0),
          discipline_points: (total.final_discipline_point ?? 0),
        });
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
      toast.error("Không thể tải dữ liệu sinh viên.");
    }
  }, [user.user_id, getEnrollmentsByStudentId, fetchEvaluationsOfStudent, fetchReviewsByStudentId, fetchTotalScore]);

  useEffect(() => {
    fetchClasses();
    loadInitialData();
  }, [fetchClasses, loadInitialData]);

  const handleEnrollInClass = async (classId: number) => {
    try {
      const created = await addEnrollment({
        student_user_id: user.user_id,
        class_id: classId,
        enrollment_date: new Date().toISOString().split("T")[0],
      });

      toast.success("Đăng ký lớp học thành công!");
      // reload data
      await loadInitialData();
      return created;
    } catch (error: any) {
      console.error("Enroll failed:", error);
      toast.error(error?.message || "Đăng ký lớp học thất bại.");
      throw error;
    }
  };

  const enrolledClassIds = useMemo(() => {
    return new Set(studentEnrollments.map(e => Number(e.class_id)));
  }, [studentEnrollments]);

  const availableClasses = useMemo(() => {
    return classes.filter(cls => !enrolledClassIds.has(Number((cls as any).class_id)));
  }, [classes, enrolledClassIds]);

  return (
    <div className="space-y-6 bg-background text-foreground p-6 rounded-md">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Study Points", icon: Award, value: 100 + summary.study_points, border: "border-blue-200", iconColor: "text-blue-600" },
          { title: "Discipline Points", icon: Star, value: 100 + summary.discipline_points, border: "border-yellow-200", iconColor: "text-yellow-600" },
          { title: "Enrolled Classes", icon: BookOpen, value: studentEnrollments.length, border: "border-green-200", iconColor: "text-green-600" },
          { title: "Teacher Reviews", icon: Users, value: studentReviews.length, border: "border-purple-200", iconColor: "text-purple-600" },
        ].map((card) => (
          <motion.div key={card.title} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className={`bg-background border-2 ${card.border} min-w-[200px] shadow-sm flex flex-col`}>
              <CardHeader className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  <CardTitle className="text-sm font-medium text-foreground">{card.title}</CardTitle>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex justify-center items-center flex-1">
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background border-b border-gray-200">
          <TabsTrigger
            value="add-class"
            className="cursor-pointer data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-muted-foreground hover:text-foreground border-r"
          >
            <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Add to Class</div>
          </TabsTrigger>
          <TabsTrigger
            value="enrollments"
            className="cursor-pointer data-[state=active]:bg-green-50 data-[state=active]:text-green-700 text-muted-foreground hover:text-foreground border-r"
          >
            <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Enrollments</div>
          </TabsTrigger>
          <TabsTrigger
            value="evaluations"
            className="cursor-pointer data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 text-muted-foreground hover:text-foreground border-r"
          >
            <div className="flex items-center gap-2"><Star className="w-4 h-4" /> Evaluations</div>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="cursor-pointer data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Teacher Reviews</div>
          </TabsTrigger>
        </TabsList>

        {/* Add class */}
        <TabsContent value="add-class" className="space-y-4">
          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Available Classes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Select a class to enroll in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableClasses.length > 0 ? (
                  availableClasses.map((cls) => (
                    <motion.div
                      key={(cls as any).class_id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-background"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {(cls as any).class_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Teacher: {(cls as any).teacher_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {(cls as any).capacity}
                        </p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleEnrollInClass((cls as any).class_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Enroll
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">Không có lớp học nào để đăng ký.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollments */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">My Enrollments</CardTitle>
              <CardDescription className="text-muted-foreground">Your enrolled classes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-foreground">Class Name</TableHead>
                    <TableHead className="text-foreground">Enrollment Date</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEnrollments.map((enr) => (
                    <TableRow key={enr.enrollment_id} className="border-b">
                      <TableCell className="text-foreground">{enr.class_name}</TableCell>
                      <TableCell className="text-foreground">{enr.enrollment_date}</TableCell>
                      <TableCell>
                        <Badge variant={enr.enrollment_status === "active" ? "default" : "secondary"}>
                          {enr.enrollment_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluations */}
        <TabsContent value="evaluations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="bg-background border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-center text-foreground">Total Study Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-4xl font-bold text-blue-600">{100 + summary.study_points}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="bg-background border-2 border-yellow-100">
                <CardHeader>
                  <CardTitle className="text-center text-foreground">Total Discipline Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-4xl font-bold text-yellow-600">{100 + summary.discipline_points}</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Individual Evaluations</CardTitle>
              <CardDescription className="text-muted-foreground">Detailed evaluation history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-foreground">ID</TableHead>
                    <TableHead className="text-foreground">Class</TableHead>
                    <TableHead className="text-foreground">Teacher</TableHead>
                    <TableHead className="text-foreground">Type</TableHead>
                    <TableHead className="text-foreground">Content</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEvaluations.map((ev) => (
                    <TableRow key={ev.id} className="border-b">
                      <TableCell className="text-foreground">{ev.id}</TableCell>
                      <TableCell className="text-foreground">{ev.class_name}</TableCell>
                      <TableCell className="text-foreground">{ev.teacher}</TableCell>
                      <TableCell className="text-foreground">{ev.type}</TableCell>
                      <TableCell className="text-foreground">{ev.content}</TableCell>
                      <TableCell className="text-foreground">{ev.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-background border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Teacher Reviews</CardTitle>
              <CardDescription className="text-muted-foreground">Reviews from your teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-foreground">Teacher Name</TableHead>
                    <TableHead className="text-foreground">Rating</TableHead>
                    <TableHead className="text-foreground">Review Date</TableHead>
                    <TableHead className="text-foreground">Review Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentReviews.map((r) => (
                    <TableRow key={r.id} className="border-b">
                      <TableCell className="text-foreground">{r.teacher_name}</TableCell>
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
      </Tabs>
    </div>
  );
}
