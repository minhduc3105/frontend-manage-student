"use client";

import React, { useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import TeacherReport from "./TeacherReport";
import MangerReport from "./ManagerReport";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: "student" | "parent" | "teacher" | "manager";
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, userRole }) => {
    const [dateRange, setDateRange] = useState("semester");

    if (!isOpen) return null;

    // CHỈNH SỬA: Darkmode dùng tông màu 900/950 (Rất tối và trầm)
    const getRoleColor = () => {
        switch (userRole) {
            case "student":
                // Light: Blue-600 -> Purple-600
                // Dark: Blue-900 -> Purple-950 (Tối thẫm)
                return "from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-950";
            case "parent":
                return "from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-950";
            case "teacher":
                return "from-green-600 to-blue-600 dark:from-green-900 dark:to-blue-950";
            case "manager":
                return "from-orange-600 to-red-600 dark:from-orange-900 dark:to-red-950";
            default:
                return "from-gray-600 to-gray-700 dark:from-gray-800 dark:to-gray-950";
        }
    };

    const renderReportContent = () => {
        switch (userRole) {
            case "student":
                return <div>Student report content here</div>;
            case "parent":
                return <div>Parent report content here</div>;
            case "teacher":
                return <TeacherReport />;
            case "manager":
                return <MangerReport />;
            default:
                return null;
        }
    };

    const getReportLabel = () => {
        switch (userRole) {
            case "student":
                return "Student Report";
            case "parent":
                return "Parent Report";
            case "teacher":
                return "Teacher Report";
            case "manager":
                return "Manager Report";
            default:
                return "Report";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col border dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div
                    className={`bg-gradient-to-r ${getRoleColor()} text-white p-6 flex flex-col md:flex-row md:items-center md:justify-between transition-colors duration-300`}
                >
                    <div>
                        <h1 className="text-2xl font-bold">{getReportLabel()}</h1>
                        <p className="text-white/80 mt-1">
                            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard -{" "}
                            {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} Report
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            {/* SelectTrigger: Giữ hiệu ứng kính mờ (white/10) để nổi bật trên nền tối */}
                            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-white/50 hover:bg-white/20 transition-colors">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="semester">This Semester</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20 border shadow-none"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20 border shadow-none"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export Excel
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 hover:text-white rounded-full p-2"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-background text-foreground">
                    {renderReportContent()}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;