"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Award } from "lucide-react";
import { useAuth } from "../../../src/contexts/AuthContext";
import { getTeacherOverview } from "../../../src/services/api/report";
import { getTeacherClasses } from "../../../src/services/api/class";
import { ClassDetailsModal } from "./ClassDetailsModal";
import TeacherReportModal from "./teacherReportModal";
import { useClasses } from "../../../src/contexts/ClassContext";

export default function TeacherPage() {
    const [overview, setOverview] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<"class-performance" | "salary-info">("class-performance");
    const [studentsCount, setStudentsCount] = useState<Record<number, number>>({});

    const { user } = useAuth();
    const teacherId = user?.user_id;
    const id = teacherId as number;

    const { fetchStudentsInClass } = useClasses();

    useEffect(() => {
        if (!teacherId) return;

        async function fetchData() {
            setLoading(true);
            try {
                const [overviewData, classData] = await Promise.all([
                    getTeacherOverview(id),
                    getTeacherClasses(id),
                ]);
                setOverview(overviewData);
                setClasses(classData);

                const counts: Record<number, number> = {};
                for (const cls of classData) {
                    try {
                        const students = await fetchStudentsInClass(cls.class_id);
                        counts[cls.class_id] = students.length;
                    } catch {
                        counts[cls.class_id] = 0;
                    }
                }
                setStudentsCount(counts);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [teacherId, fetchStudentsInClass, id]);

    const openClassModal = (cls: any) => {
        setReportModalOpen(false);
        setSelectedClass(cls);
        setModalOpen(true);
    };

    const closeClassModal = () => {
        setModalOpen(false);
        setSelectedClass(null);
    };

    const openReportModal = () => {
        setModalOpen(false);
        setReportModalOpen(true);
    };

    const closeReportModal = () => {
        setReportModalOpen(false);
    };

    return (
        <div className="flex h-full bg-background text-foreground">
            {/* SIDEBAR */}
            {/* 🎨 SỬA GIAO DIỆN SIDEBAR:
                - m-4: Tạo khoảng cách với lề (floating effect)
                - rounded-2xl: Bo tròn góc mạnh
                - border border-border: Viền bao quanh
                - shadow-xl: Đổ bóng đậm để nổi bật trên nền
                - bg-card: Màu nền card (khác màu nền chính)
            */}
            <aside className="w-64 m-4 mr-0 flex-shrink-0 flex flex-col bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 flex-1 overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4 text-foreground">Academic</h3>

                    {/* Class Performance */}
                    <motion.div
                        layout
                        initial={false}
                        animate={{ x: activeItem === "class-performance" ? 4 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`w-full text-left p-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors duration-200 ${activeItem === "class-performance"
                                ? "bg-primary text-primary-foreground shadow-md" // Thêm shadow khi active
                                : "text-foreground hover:bg-muted"
                            }`}
                        onClick={() => setActiveItem("class-performance")}
                    >
                        <Award className="w-5 h-5 text-yellow-500" />
                        Class Performance
                    </motion.div>

                    <h3 className="text-lg font-bold mt-6 mb-2 text-foreground">Personal</h3>

                    {/* Salary & Info */}
                    <motion.button
                        onClick={() => {
                            setActiveItem("salary-info");
                            openReportModal();
                        }}
                        layout
                        className={`w-full text-left p-2 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 ${activeItem === "salary-info"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-foreground hover:bg-muted"
                            }`}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Award className="w-5 h-5 text-green-500" />
                        Salary & Info
                    </motion.button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 overflow-auto bg-background">
                <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-4">
                    Class Performance
                </h1>

                {/* STATS */}
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="animate-spin text-muted-foreground" size={28} />
                    </div>
                ) : overview ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 shadow-sm rounded-2xl text-center border border-primary bg-card">
                            <h2 className="text-sm text-muted-foreground uppercase">Total Students</h2>
                            <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                                {overview.total_students ?? "-"}
                            </p>
                        </Card>
                        <Card className="p-4 shadow-sm rounded-2xl text-center border border-primary bg-card">
                            <h2 className="text-sm text-muted-foreground uppercase">Average GPA</h2>
                            <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
                                {overview.avg_gpa?.toFixed(2) ?? "-"}
                            </p>
                        </Card>
                        <Card className="p-4 shadow-sm rounded-2xl text-center border border-primary bg-card">
                            <h2 className="text-sm text-muted-foreground uppercase">Avg Study Point</h2>
                            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                {overview.avg_study_point?.toFixed(2) ?? "-"}
                            </p>
                        </Card>
                        <Card className="p-4 shadow-sm rounded-2xl text-center border border-primary bg-card">
                            <h2 className="text-sm text-muted-foreground uppercase">Avg Discipline Point</h2>
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                                {overview.avg_discipline_point?.toFixed(2) ?? "-"}
                            </p>
                        </Card>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center mb-6">Không có dữ liệu thống kê</p>
                )}

                {/* CLASS LIST */}
                <h2 className="text-lg font-bold mt-2 mb-4 uppercase tracking-wide text-foreground">
                    List of Classes
                </h2>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="animate-spin text-muted-foreground" size={28} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {classes.length > 0 ? (
                            classes.map((cls) => {
                                const gradientColors = [
                                    ["#f87171", "#fca5a5"],
                                    ["#60a5fa", "#93c5fd"],
                                    ["#34d399", "#6ee7b7"],
                                    ["#fbbf24", "#fde68a"],
                                    ["#a78bfa", "#c4b5fd"],
                                ];
                                const colors = gradientColors[Math.floor(Math.random() * gradientColors.length)];

                                return (
                                    <motion.div
                                        key={cls.class_id}
                                        whileHover={{ scale: 1.01 }}
                                        className="cursor-pointer"
                                        onClick={() => openClassModal(cls)}
                                    >
                                        <Card className="p-4 rounded-2xl shadow-sm border border-border bg-card hover:bg-muted/50 transition-all duration-200">
                                            <div className="flex flex-col gap-3">
                                                {/* Hàng 1 */}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground font-medium">
                                                        Class Name
                                                    </span>
                                                    <span className="font-semibold text-foreground text-lg">
                                                        {cls.class_name}
                                                    </span>
                                                </div>

                                                {/* Hàng 2 */}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground font-medium">
                                                        Number of Students
                                                    </span>
                                                    <span
                                                        className="px-4 py-1 rounded-full text-white font-semibold text-sm shadow-sm"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                                                        }}
                                                    >
                                                        {studentsCount[cls.class_id] ?? "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground text-center">Không có lớp nào</p>
                        )}
                    </div>
                )}

                {/* MODALS */}
                <AnimatePresence>
                    {modalOpen && selectedClass && !reportModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 px-4">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeClassModal} />
                            <div className="relative w-full max-w-5xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-xl shadow-2xl">
                                <ClassDetailsModal
                                    classId={selectedClass.class_id}
                                    onClose={closeClassModal}
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {reportModalOpen && !modalOpen && (
                        <TeacherReportModal
                            teacherId={teacherId ?? 0}
                            onClose={closeReportModal}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}