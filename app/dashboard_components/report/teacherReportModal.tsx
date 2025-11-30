"use client";

import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { Loader2 } from "lucide-react";
import { useReports } from "../../../src/hooks/useReport";

interface TeacherReportModalProps {
    teacherId: number;
    onClose: () => void;
}

interface ReviewData {
    name: string;
    value: number;
}

interface SalaryData {
    month: string;
    total: number;
}

const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#A28CFF"];

export default function TeacherReportModal({
    teacherId,
    onClose,
}: TeacherReportModalProps) {
    const { teacherReport, fetchTeacherReport } = useReports();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

    useEffect(() => {
        async function loadReport() {
            setLoading(true);
            try {
                await fetchTeacherReport(teacherId, selectedYear);
            } catch (err) {
                console.error("Error fetching teacher report:", err);
            } finally {
                setLoading(false);
            }
        }
        loadReport();
    }, [teacherId, selectedYear, fetchTeacherReport]);

    const reviewData: ReviewData[] = teacherReport
        ? Object.entries(teacherReport.review_distribution || {})
            .map(([rating, count]) => ({
                name: `${rating}★`,
                value: count as number,
            }))
            .filter((d) => d.value > 0)
        : [];

    const salaryData: SalaryData[] = teacherReport
        ? (teacherReport.salary_by_month || []).map((s: any) => ({
            month: s.month.toString(),
            total: +(s.total / 1_000_000).toFixed(2),
        }))
        : [];

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal content */}
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-xl p-6 sm:p-8">
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold mb-1 text-center">
                    Teacher Personal Report
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-4">
                    Performance and salary overview
                </p>

                {/* Year selector */}
                <div className="flex justify-end mb-6 gap-2 items-center">
                    <label className="text-sm font-medium">Select Year:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                        <p className="text-sm text-muted-foreground">Loading report...</p>
                    </div>
                ) : teacherReport ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                        {/* Pie chart - review */}
                        <div className="bg-background rounded-xl shadow p-4 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-1 text-center">
                                Review Distribution
                            </h3>
                            <p className="text-sm text-muted-foreground text-center mb-3">
                                Based on student feedback
                            </p>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={reviewData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={120} // tăng bán kính cho lớn hơn
                                        fill="#8884d8"
                                        label={({ name, percent }) =>
                                            percent > 0 ? `${name}: ${Math.round(percent * 100)}%` : ""
                                        }
                                    >
                                        {reviewData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(
                                            value: number,
                                            _name: string,
                                            entry?: { payload?: { name: string } }
                                        ) => {
                                            const label = entry?.payload?.name ?? _name;
                                            return [`${value} ${label}`, "Reviews"];
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar chart - salary */}
                        <div className="bg-background rounded-xl shadow p-4 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-1 text-center">
                                Salary by Month ({selectedYear})
                            </h3>
                            <p className="text-sm text-muted-foreground text-center mb-3">
                                Measured in million VND
                            </p>
                                <ResponsiveContainer width="100%" height={350} >
                                <BarChart
                                    data={salaryData}
                                    margin={{ top: 20, right: 15, left: 0, bottom: 30 }}
                                    barCategoryGap="15%"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        interval={0}
                                        tick={{ fontSize: 12 }}
                                        label={{
                                            value: "",
                                            position: "insideBottom",
                                            offset: -10,
                                            fontSize: 12,
                                        }}
                                    />
                                    <YAxis
                                        label={{
                                            value: "",
                                            angle: -90,
                                            position: "insideLeft",
                                            offset: 0,
                                            fontSize: 12,
                                        }}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip formatter={(value: number) => `${value} M VND`} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar
                                        dataKey="total"
                                        fill="#3492eb"
                                        name="Salary (M VND)"
                                        minPointSize={4}
                                    >
                                        <LabelList
                                            dataKey="total"
                                            position="top"
                                            formatter={(value: number) =>
                                                value > 1 ? `${value}M` : ""
                                            }
                                            style={{ fontSize: 10 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center mt-10">No data available</p>
                )}
            </div>
        </div>
    );
}
