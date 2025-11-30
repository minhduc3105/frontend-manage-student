"use client";

import { useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Users, TrendingUp, AlertCircle, BookOpen } from "lucide-react";
import { useReports } from "../../../src/hooks/useReport";

interface ClassDetailsModalProps {
    classId: number;
    onClose: () => void;
}

export function ClassDetailsModal({ classId, onClose }: ClassDetailsModalProps) {
    const { classReport, loading, error, fetchClassReport } = useReports();

    useEffect(() => {
        if (classId) fetchClassReport(classId);
    }, [classId, fetchClassReport]);

    if (loading) return <div className="flex justify-center items-center p-10 text-muted-foreground">Đang tải dữ liệu lớp...</div>;
    if (error || !classReport) return <div className="p-10 text-center text-muted-foreground">Không có dữ liệu cho lớp này.</div>;

    const report = classReport;

    const gradeData = Array.from({ length: 10 }, (_, i) => ({
        grade: (i + 1).toString(),
        students: report.grade_distribution?.[i + 1] || 0,
    }));

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-4 pb-16 px-4 overflow-y-auto">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-card rounded-lg shadow-lg border border-border overflow-hidden">
                {/* Close X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl font-bold"
                    aria-label="Close"
                >
                    ×
                </button>

                {/* Header với gradient xanh nước biển */}
                <div className="px-8 py-6 border-b border-border/20 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                    <h1 className="text-2xl font-bold">{report.class_name}</h1>
                </div>

                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {/* Stats Section */}
                    <section className="px-8 py-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Class Statistics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard label="Total Students" value={report.total_students} icon={<Users className="text-green-500" />} />
                            <StatCard label="Average GPA" value={report.avg_gpa?.toFixed(2)} icon={<BookOpen className="text-yellow-500" />} />
                            <StatCard label="Discipline Point" value={report.avg_discipline_point?.toFixed(2)} icon={<AlertCircle className="text-red-500" />} />
                            <StatCard label="Study Point" value={report.avg_study_point?.toFixed(2)} icon={<TrendingUp className="text-blue-500" />} />
                        </div>
                    </section>

                    {/* Grade Distribution */}
                    <section className="px-8 py-6 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <BookOpen className="text-purple-500" />
                            Grade Distribution (1–10)
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gradeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="grade" stroke="var(--muted-foreground)" />
                                <YAxis stroke="var(--muted-foreground)" />
                                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} />
                                <Bar dataKey="students" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </section>

                    {/* Students List */}
                    <section className="px-8 py-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Users className="text-green-500" />
                            Student List
                        </h2>
                        <div className="space-y-3">
                            {report.students?.map((s) => (
                                <div key={s.id} className="bg-secondary border border-border rounded-lg p-4 hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground group-hover:text-accent-foreground">{s.name}</p>
                                            <div className="mt-2 flex items-center gap-6">
                                                <span className="text-sm text-muted-foreground group-hover:text-accent-foreground/80">
                                                    GPA: <span className="font-semibold">{s.gpa}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-foreground group-hover:text-accent-foreground">{s.attendance}%</div>
                                            <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 mt-1">Attendance</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: any; icon: JSX.Element }) {
    return (
        <div className="bg-secondary border border-border rounded-lg p-4 hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold mt-2">{value ?? "-"}</p>
                </div>
                <div className="w-8 h-8 opacity-80">{icon}</div>
            </div>
        </div>
    );
}
