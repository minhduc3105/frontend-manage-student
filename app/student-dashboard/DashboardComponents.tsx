"use client";

import React from "react";
import {
  BookOpen,
  Calendar,
  Users,
  Star,
  FileText,
  GraduationCap,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  BookA
  
} from "lucide-react";



import type { StudentStats } from "../../src/services/api/student";

/* ---------------- StudentDashboardContent ---------------- */
export function StudentDashboardContent({ stats, onOpenSchedule }: { stats: StudentStats, onOpenSchedule: () => void }) {
  return (
    <div className="space-y-8">
      {/* Hero / quick summary */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Overview</h2>
            <p className="text-indigo-100 mt-1">Summary of your study activity</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-background/20 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Classes Enrolled" value={String(stats.classes_enrolled ?? 0)} icon={BookOpen} />
        <StatCard title="GPA" value={String(stats.gpa ?? 0)} icon={TrendingUpIcon} />
        <StatCard title="Study Points" value={String(stats.study_point ?? 0)} icon={AwardIcon} />
        <StatCard title="Discipline Points" value={String(stats.discipline_point ?? 0)} icon={AlertIcon} />
      </div>

      {/* Quick actions & recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={onOpenSchedule} className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-black">View Schedule</div>
                  <div className="text-sm text-muted-foreground">Open your upcoming classes</div>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-black">Study Materials</div>
                  <div className="text-sm text-muted-foreground">Open course resources</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-background rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-foreground">Assignment graded</div>
                <div className="text-sm text-muted-foreground">Math - 2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-foreground">New announcement</div>
                <div className="text-sm text-muted-foreground">Course updates - Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
type SidebarProps = {
  activeSection: string;
  setSection: (id: string) => void;
  onOpenAccount: () => void;
  onLogout: () => void;
  user?: any;
  mounted?: boolean;
};

export function Sidebar({ activeSection, setSection, onOpenAccount, onLogout, user, mounted }: SidebarProps) {
  return (
    <aside className="w-64 bg-background shadow-lg p-4 flex flex-col justify-between border-r border-gray-200">
      <div>
        <div className="flex items-center gap-3 font-bold text-xl text-blue-600 mb-6">
          <BookOpen className="h-8 w-8" />
          <span className="tracking-wide">Student Management</span>
        </div>

        <div className="border-t border-gray-200 my-4" />

        <div
          className="flex flex-col items-center gap-2 mb-6 text-center cursor-pointer"
          onClick={onOpenAccount}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div className="text-sm text-muted-foreground hover:text-blue-600 transition-colors">
            {mounted ? (user?.username ?? "Student") : "Student"}
          </div>
        </div>

        <div className="border-t border-gray-200 my-4" />

        <nav className="space-y-1">
          <SidebarLink id="overview" activeSection={activeSection} setSection={setSection} icon={LayoutDashboard} text="Dashboard" />
          <SidebarLink id="evaluation" activeSection={activeSection} setSection={setSection} icon={Star} text="Evaluation" />
          <SidebarLink id="schedule" activeSection={activeSection} setSection={setSection} icon={Calendar} text="Schedule" />
          <SidebarLink id="classes" activeSection={activeSection} setSection={setSection} icon={Users} text="Classes" />
          <SidebarLink id="teacher-review" activeSection={activeSection} setSection={setSection} icon={GraduationCap} text="Teacher Review" />
          <SidebarLink id="report" activeSection={activeSection} setSection={setSection} icon={FileText} text="Report" />
          <SidebarLink id="test" activeSection={activeSection} setSection={setSection} icon={BookA} text="Test" />

        </nav>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button onClick={onLogout} className="w-full text-left px-3 py-2 mt-2 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}

/* ----------------- Helper components ----------------- */
function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="rounded-xl p-5 shadow-sm bg-background border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">{title}</div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function SidebarLink({ id, activeSection, setSection, icon: Icon, text }: any) {
  const isActive = activeSection === id;
  return (
    <button
      onClick={() => setSection(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive ? "bg-blue-500 text-white" : "text-foreground hover:bg-gray-50 hover:text-blue-600"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{text}</span>
    </button>
  );
}

/* ---------- Small icon aliases to avoid missing imports ---------- */
function TrendingUpIcon(props: any) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 17l6-6 4 4 8-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AwardIcon(props: any) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="8" r="6" strokeWidth="2" />
      <path d="M8 14v6l4-2 4 2v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AlertIcon(props: any) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M10.29 3.86l-8.55 14.84A2 2 0 0 0 3.64 21h16.72a2 2 0 0 0 1.9-2.3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" />
    </svg>
  );
}
