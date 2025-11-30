// File: components/DashboardContent.tsx
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useState, useEffect } from "react";
import { ManagerStats, getManagerStats } from "../../src/services/api/manager";
import { Users, BookOpen, GraduationCap, Calendar } from "lucide-react";

export default function DashboardContent() {
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = getManagerStats();

        setStats(await response);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calendar logic
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Điều chỉnh để Thứ Hai là 0, Thứ Ba là 1, ...
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    today
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-600">Error fetching stats: {error}</p>
      </div>
    );
  }
  return (
    <>
      <style>{`
      .stat-card-emerald {
        background: #10b981 !important;
        color: white !important;
      }
      .stat-card-orange {
        background: #f97316 !important;
        color: white !important;
      }
      .stat-card-cyan {
        background: #06b6d4 !important;
        color: white !important;
      }
      .stat-card-red {
        background: #ef4444 !important;
        color: white !important;
      }
      .stat-card-emerald *,
      .stat-card-orange *,
      .stat-card-cyan *,
      .stat-card-red * {
        color: white !important;
      }
    `}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Class */}
        <div className="stat-card-emerald rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-6 w-6" />
            <h3 className="text-xl font-bold">Class</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats?.total_classes}</div>
            <p className="text-sm font-semibold mt-1">Active classes</p>
          </div>
        </div>

        {/* Card 2: Teacher */}
        <div className="stat-card-orange rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-6 w-6" />
            <h3 className="text-xl font-bold">Teacher</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats?.total_teachers}</div>
            <p className="text-sm font-semibold mt-1">Active teachers</p>
          </div>
        </div>

        {/* Card 3: Student */}
        <div className="stat-card-cyan rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6" />
            <h3 className="text-xl font-bold">Student</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats?.total_students}</div>
            <p className="text-sm font-semibold mt-1">Enrolled students</p>
          </div>
        </div>

        {/* Card 4: Schedule */}
        <div className="stat-card-red rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-6 w-6" />
            <h3 className="text-xl font-bold">Schedule</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats?.total_schedules}</div>
            <p className="text-sm font-semibold mt-1">Today's classes</p>
          </div>
        </div>
      </div>

      {/* Calendar Widget */}
      <div className="mt-8">
        {" "}
        {/* 👈 thêm margin top để tách ra */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-emerald-700">
              <div className="text-lg font-semibold mb-2">
                {monthName} {currentYear}
              </div>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {daysOfWeek.map((day) => (
                  <div key={day} className="font-medium p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: startDayIndex }, (_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded cursor-pointer ${
                      i + 1 === currentDay
                        ? "bg-emerald-500 text-white font-bold"
                        : "hover:bg-emerald-200"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
