"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../src/contexts/AuthContext";
import type { LoginResponse } from "../../src/services/api/auth";
import { toast } from "react-hot-toast";
import NotificationManagement from "../dashboard_components/notification/NotificationManagement";
import PersonalScheduleModal from "../dashboard_components/personalschedule/PersonalScheduleModal";
import { UserAccountModal } from "../user_account";
import { Button } from "../../components/ui/button";
import { useTeacher } from "../../src/hooks/useTeacher";
import type { TeacherStats } from "../../src/services/api/teacher";

// ⚡ 1. Import ProtectedRoute, Hook và Icons cho Theme
import ProtectedRoute from "../../components/ProtectedRoute";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import { Sidebar, TeacherDashboardContent } from "./DashboardComponents";

// dynamic imports
const ScheduleManagement = dynamic(
  () => import("../dashboard_components/schedule/ScheduleManagement"),
  { ssr: false }
);
const ClassManagement = dynamic(
  () => import("../dashboard_components/class/ClassManagement"),
  { ssr: false }
);
const EvaluationModal = dynamic(
  () => import("../dashboard_components/evaluation/StudentEvaluationModal"),
  { ssr: false }
);
const PayrollManagement = dynamic(
  () => import("../dashboard_components/payroll/PayrollManagement"),
  { ssr: false }
);
const TeacherReviewManagement = dynamic(
  () => import("../dashboard_components/teacherReview/TeacherReviewManagement"),
  { ssr: false }
);
const AttendanceManagement = dynamic(
  () => import("../dashboard_components/attendance/AttendanceManagement"),
  { ssr: false }
);
const TestManagement = dynamic(
  () => import("../dashboard_components/test/TestManagement"),
  { ssr: false }
);
const ReportManagement = dynamic(
  () => import("../dashboard_components/report/ReportManagement"),
  { ssr: false }
);

export default function TeacherDashboard() {
  const { user, logout } = useAuth() as {
    user: LoginResponse | null;
    logout: () => void;
  };
  const router = useRouter();

  // ⚡ 2. Gọi Theme Hook
  const { resolvedTheme, setTheme } = useTheme();

  // ⚡ 3. State mounted để tránh hydration error
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "academic",
  ]);
  const [visitedSections, setVisitedSections] = useState<string[]>([
    "dashboard",
  ]);

  const [searchTerms] = useState({
    attendance: "",
    schedule: "",
    classes: "",
    evaluation: "",
    payroll: "",
    reviews: "",
    report: "",
    tests: "",
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPersonalSchedule, setShowPersonalSchedule] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { teacherStats, fetchTeacherStats, loading, error } = useTeacher();

  useEffect(() => {
    if (user) fetchTeacherStats(user.user_id).catch(() => {});
  }, [fetchTeacherStats, user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const setSection = (id: string) => {
    if (id === "report") {
      setShowReportModal(true);
      return;
    }

    setActiveSection(id);
    if (!visitedSections.includes(id))
      setVisitedSections((prev) => [...prev, id]);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const stats: TeacherStats = {
    class_taught: teacherStats?.class_taught ?? 0,
    schedules: teacherStats?.schedules ?? 0,
    reviews: teacherStats?.reviews ?? 0,
    rate: teacherStats?.rate ?? 0,
  };

  return (
    // ⚡ 4. Bọc trong ProtectedRoute (yêu cầu role teacher hoặc manager)
    <ProtectedRoute requiredRoles={["teacher", "manager"]}>
      {/* 🎨 SỬA: bg-gray-100... -> bg-background, text-gray-900... -> text-foreground */}
      <div className="flex min-h-screen bg-background text-foreground relative">
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setSection={setSection}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          onLogout={handleLogout}
          onOpenAccount={() => setShowAccountModal(true)}
          user={user}
        />

        {/* Main content */}
        <div className="left-64 flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPersonalSchedule(true)}
                // 🎨 SỬA: Thay class cứng bg-slate-600 bằng variant="secondary"
                variant="secondary"
              >
                My Schedule
              </Button>
              <NotificationManagement />

              {/* ⚡ 5. Nút Theme Toggle */}
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
            </div>
          </div>

          {/* Dashboard view */}
          <div className={activeSection === "dashboard" ? "block" : "hidden"}>
            <TeacherDashboardContent
              stats={stats}
              onOpenSchedule={() => setShowPersonalSchedule(true)}
              setSection={setSection}
            />
          </div>

          {/* Attendance */}
          {visitedSections.includes("attendance") && (
            <div
              className={activeSection === "attendance" ? "block" : "hidden"}
            >
              <AttendanceManagement />
            </div>
          )}

          {/* Schedule */}
          {visitedSections.includes("schedule") && (
            <div className={activeSection === "schedule" ? "block" : "hidden"}>
              <ScheduleManagement />
            </div>
          )}

          {/* Class */}
          {visitedSections.includes("class") && (
            <div className={activeSection === "class" ? "block" : "hidden"}>
              <ClassManagement />
            </div>
          )}

          {/* Evaluation */}
          {visitedSections.includes("evaluation") && (
            <div
              className={activeSection === "evaluation" ? "block" : "hidden"}
            >
              <EvaluationModal
                userRole="teacher"
                teacherUserId={user ? user.user_id : undefined}
              />
            </div>
          )}

          {/* Test Management */}
          {visitedSections.includes("tests") && (
            <div className={activeSection === "tests" ? "block" : "hidden"}>
              <TestManagement />
            </div>
          )}

          {/* Payroll */}
          {visitedSections.includes("payroll") && (
            <div className={activeSection === "payroll" ? "block" : "hidden"}>
              <PayrollManagement />
            </div>
          )}

          {/* Teacher Review */}
          {visitedSections.includes("teacher-review") && (
            <div
              className={
                activeSection === "teacher-review" ? "block" : "hidden"
              }
            >
              <TeacherReviewManagement
                searchTerm={searchTerms.reviews}
                updateSearchTerm={() => {}}
              />
            </div>
          )}

          {/* Report modal */}
          <AnimatePresence>
            {showReportModal && (
              <motion.div
                key="report-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center left-64"
              >
                <motion.button
                  onClick={() => setShowReportModal(false)}
                  // 🎨 SỬA: opacity-40 -> bg-black/40
                  className="absolute inset-0 bg-black/40"
                />
                <motion.div
                  initial={{ y: 12, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 12, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="relative w-[90vw] max-w-4xl mx-4"
                >
                  <ReportManagement
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    userRole={"teacher"}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Personal Schedule modal */}
          <PersonalScheduleModal
            open={showPersonalSchedule}
            onClose={() => setShowPersonalSchedule(false)}
          />

          {/* Account modal */}
          <AnimatePresence>
            {showAccountModal && (
              <motion.div
                key="useraccount-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center"
              >
                <motion.button
                  aria-label="close"
                  onClick={() => setShowAccountModal(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  // 🎨 SỬA: bg-black -> bg-black/45
                  className="absolute inset-0 bg-black/45"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                />
                <motion.div
                  initial={{ y: 12, opacity: 0, scale: 0.995 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 12, opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.18 }}
                  className="relative w-[90vw] max-w-4xl mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {user && (
                    <UserAccountModal
                      user={user}
                      onClose={() => setShowAccountModal(false)}
                    />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spinner */}
        {loading && (
          // 🎨 SỬA: bg-opacity-40 -> bg-black/40
          <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40">
            {/* 🎨 SỬA: border-cyan-400 -> border-primary */}
            <div className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
