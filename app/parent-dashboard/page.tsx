"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../src/contexts/AuthContext";

import NotificationManagement from "../dashboard_components/notification/NotificationManagement";
import PersonalScheduleModal from "../dashboard_components/personalschedule/PersonalScheduleModal";
import { UserAccountModal } from "../user_account";

import { Sidebar, ParentDashboardContent } from "./DashboardComponents";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "../../components/ProtectedRoute";

// ⚡ 1. Import hook và icons cho Theme
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// dynamic subpages
const ChildrenManagement = dynamic(
  () => import("./ChildrenManagement").then((mod) => mod.default),
  { ssr: false }
);
const ChildrenEvaluationModal = dynamic(
  () => import("../dashboard_components/evaluation/StudentEvaluationModal"),
  { ssr: false }
);
const TuitionManagement = dynamic(
  () => import("../dashboard_components/tuition/TuitionManagement"),
  { ssr: false }
);
const ReportManagement = dynamic(
  () => import("../dashboard_components/report/ReportManagement"),
  { ssr: false }
);

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth() as { user: any; logout: () => void };

  // ⚡ 2. Gọi hook useTheme
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []); // State 'mounted' đã có sẵn

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [visitedSections, setVisitedSections] = useState<string[]>([
    "overview",
  ]);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPersonalSchedule, setShowPersonalSchedule] = useState(false);

  // Hàm chuyển đổi section chính
  const setSection = (id: string) => {
    setActiveSection(id);
    if (!visitedSections.includes(id))
      setVisitedSections((prev) => [...prev, id]);
  };

  // Hàm xử lý Quick Actions
  const quickActions = {
    onViewSchedule: () => setShowPersonalSchedule(true),
    onGoToEvaluation: () => setSection("evaluation"),
    onGoToChildren: () => setSection("children"),
    onGoToTuition: () => setSection("tuition"),
    onGoToReport: () => setSection("report"),
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <ProtectedRoute requiredRoles={["parent"]}>
      {/* 🎨 SỬA: bg-gray-50 -> bg-background, text-foreground */}
      <div className="flex min-h-screen bg-background text-foreground cursor-pointer">
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setSection={setSection}
          onOpenAccount={() => setShowAccountModal(true)}
          onLogout={handleLogout}
          user={user}
          mounted={mounted}
        />

        {/* Main */}
        <main className="ml-64 flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              {/* 🎨 SỬA: text-gray-900 -> text-foreground */}
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back
                {mounted && user?.username ? `, ${user.username} !` : "!"}
              </h1>
              {/* 🎨 SỬA: text-gray-600 -> text-muted-foreground */}
              <p className="text-muted-foreground mt-1">
                Monitor your children's study progress
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* 🎨 SỬA: Thay class cứng bg-slate-700 bằng variant="secondary" */}
              <Button onClick={quickActions.onViewSchedule} variant="secondary">
                <Calendar className="h-4 w-4 mr-2 inline-block" />
                My Schedule
              </Button>

              <NotificationManagement />

              {/* ⚡ 3. Thêm Nút Bấm Theme Toggle */}
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

          {/* Dynamic Content */}
          {activeSection === "overview" && (
            <ParentDashboardContent
              onOpenSchedule={quickActions.onViewSchedule}
              onGoToEvaluation={quickActions.onGoToEvaluation}
              onGoToTuition={quickActions.onGoToTuition}
              onGoToChildren={quickActions.onGoToChildren}
            />
          )}

          {/* Children */}
          {visitedSections.includes("children") && (
            <div className={activeSection === "children" ? "block" : "hidden"}>
              {user && <ChildrenManagement parent={user} />}
            </div>
          )}

          {/* Evaluation */}
          {visitedSections.includes("evaluation") && (
            <div
              className={activeSection === "evaluation" ? "block" : "hidden"}
            >
              <ChildrenEvaluationModal userRole="parent" />
            </div>
          )}

          {/* Tuitions */}
          {visitedSections.includes("tuition") && (
            <div className={activeSection === "tuition" ? "block" : "hidden"}>
              <TuitionManagement />
            </div>
          )}

          {/* Report */}
          {visitedSections.includes("report") && (
            <div className={activeSection === "report" ? "block" : "hidden"}>
              <ReportManagement
                isOpen={activeSection === "report"}
                onClose={() => setSection("overview")}
                userRole="student" // Lưu ý: userRole ở đây có thể cần xem lại logic backend
              />
            </div>
          )}

          {/* Modals */}
          <PersonalScheduleModal
            open={showPersonalSchedule}
            onClose={() => setShowPersonalSchedule(false)}
          />
        </main>

        <AnimatePresence>
          {showAccountModal && (
            <motion.div
              key="useraccount-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center left-64"
            >
              {/* backdrop */}
              <motion.button
                aria-label="close"
                onClick={() => setShowAccountModal(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 bg-black/45"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />

              {/* modal content */}
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
    </ProtectedRoute>
  );
}
