

import * as React from "react";
// ✅ Fix 1: Xóa 'X' nếu không dùng, hoặc giữ lại để dùng cho nút Close (tôi đã dùng bên dưới)
import { Star, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { useTeacherReviews } from "../../../src/hooks/useTeacherReview";
import { useAuth } from "../../../src/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../../components/ui/input";

interface PopoverPosition { left: number; top: number; show: boolean }

interface TeacherReviewManagementProps {
    searchTerm: string;
    // ⚠️ Lưu ý: Hàm này chỉ hoạt động nếu component CHA cũng là Client Component
    updateSearchTerm: (section: string, value: string) => void;
}

export default function TeacherReviewManagement({ searchTerm, updateSearchTerm }: TeacherReviewManagementProps) {
    const { reviews, loading, error, fetchAllReviews } = useTeacherReviews();
    const { user } = useAuth();

    React.useEffect(() => { fetchAllReviews(); }, [fetchAllReviews]);

    const [localSearch, setLocalSearch] = React.useState(searchTerm ?? "");
    React.useEffect(() => setLocalSearch(searchTerm ?? ""), [searchTerm]);

    // ✅ Fix 2: Sửa lỗi "Property name does not exist on type never"
    // Bằng cách định nghĩa kiểu cho tham số 'r' là 'any'
    const roleNames = React.useMemo(() => {
        const roles = user?.roles;
        if (!roles) return [];
        if (Array.isArray(roles)) {
            // Ép kiểu (r: any) để TS không bắt lỗi r.name
            return roles.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
        }
        return [];
    }, [user?.roles]);

    const isTeacherRole = roleNames.includes("teacher");
    const isStudentRole = roleNames.includes("student");

    // ... (Giữ nguyên các state filter) ...
    const [filterTeacher, setFilterTeacher] = React.useState("");
    const [filterStudent, setFilterStudent] = React.useState("");
    const [filterRating, setFilterRating] = React.useState("");
    const [filterDate, setFilterDate] = React.useState("");
    const [openPopover, setOpenPopover] = React.useState<null | "teacher" | "student" | "rating" | "date">(null);

    const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    const teacherOptions = React.useMemo(() => Array.from(new Set(reviews.map(r => r.teacher_name).filter(Boolean))), [reviews]);
    const studentOptions = React.useMemo(() => Array.from(new Set(reviews.map(r => r.student_name).filter(Boolean))), [reviews]);

    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpenPopover(null);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // Logic Filter (Giữ nguyên bản đã fix date ở câu trước)
    const filteredReviews = React.useMemo(() => reviews.filter(review => {
        const matchesSearch = !localSearch ||
            (review.review_content ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
            (review.teacher_name ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
            (review.student_name ?? "").toLowerCase().includes(localSearch.toLowerCase());

        const matchesTeacher = filterTeacher ? review.teacher_name === filterTeacher : true;
        const matchesStudent = filterStudent ? review.student_name === filterStudent : true;
        const matchesRating = filterRating ? Math.round(review.rating) === Number(filterRating) : true;

        let matchesDate = true;
        if (filterDate) {
            if (!review.review_date) {
                matchesDate = false;
            } else {
                matchesDate = review.review_date.startsWith(filterDate);
            }
        }

        return matchesSearch && matchesTeacher && matchesStudent && matchesRating && matchesDate;
    }), [reviews, localSearch, filterTeacher, filterStudent, filterRating, filterDate]);

    const resetFilters = React.useCallback(() => {
        setFilterTeacher(""); setFilterStudent(""); setFilterRating(""); setFilterDate(""); setLocalSearch("");
        updateSearchTerm("teacherReview", ""); setOpenPopover(null);
    }, [updateSearchTerm]);

    const handleSearchChange = (value: string) => { setLocalSearch(value); updateSearchTerm("teacherReview", value); };

    const showStudentCol = !isStudentRole;
    const showTeacherCol = !isTeacherRole;
    const visibleCols = 1 + (showTeacherCol ? 1 : 0) + (showStudentCol ? 1 : 0) + 1 + 1 + 1;

    const getPopoverPosition = (filterName: "teacher" | "student" | "rating" | "date"): PopoverPosition => {
        const button = filterButtonRefs.current[filterName];
        if (!button || !rootRef.current) return { left: 0, top: 0, show: false };
        const buttonRect = button.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        return {
            left: buttonRect.left - rootRect.left,
            top: buttonRect.bottom - rootRect.top + 8,
            show: openPopover === filterName
        };
    };

    const formatDate = (d?: string | null) => {
        if (!d) return "";
        if (d.length === 10 && d.includes("-")) {
            const [y, m, day] = d.split("-");
            return `${day}/${m}/${y}`;
        }
        try {
            return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        } catch { return d; }
    };

    if (loading) return <div className="text-muted-foreground p-4">Loading reviews...</div>;
    if (error) return <div className="text-destructive p-4">Error: {error}</div>;

    return (
        <div className="space-y-6 relative p-4 bg-card rounded-lg shadow-lg" ref={rootRef}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Teacher Review Management</h2>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search reviews..."
                        value={localSearch}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground bg-background"
                    />
                    <Star className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                {/* Nút Clear Filters */}
                <button
                    onClick={resetFilters}
                    className="px-3 py-2 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors text-sm font-medium flex items-center gap-2"
                >
                    {/* ✅ Fix 3: Sử dụng icon X ở đây cho hợp lý */}
                    <X className="w-4 h-4" />
                    Reset Filters
                </button>
            </div>

            {/* ... (Phần Table giữ nguyên như cũ) ... */}
            <div className="overflow-x-auto bg-background rounded-lg border border-border shadow-sm">
                <table className="w-full table-auto">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase border-r border-border w-16">ID</th>

                            {showTeacherCol && (
                                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase border-r border-border min-w-[150px]">
                                    <div className="flex items-center gap-2 justify-between">
                                        TEACHER
                                        <button
                                            ref={el => { filterButtonRefs.current.teacher = el; }}
                                            onClick={() => setOpenPopover(openPopover === "teacher" ? null : "teacher")}
                                            className={`p-1 rounded hover:bg-background/50 ${filterTeacher ? "text-primary" : "text-muted-foreground"}`}
                                        >
                                            <Filter className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                            )}

                            {showStudentCol && (
                                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase border-r border-border min-w-[150px]">
                                    <div className="flex items-center gap-2 justify-between">
                                        STUDENT
                                        <button
                                            ref={el => { filterButtonRefs.current.student = el; }}
                                            onClick={() => setOpenPopover(openPopover === "student" ? null : "student")}
                                            className={`p-1 rounded hover:bg-background/50 ${filterStudent ? "text-primary" : "text-muted-foreground"}`}
                                        >
                                            <Filter className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                            )}

                            <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase border-r border-border w-28">
                                <div className="flex items-center gap-2 justify-between">
                                    RATING
                                    <button
                                        ref={el => { filterButtonRefs.current.rating = el; }}
                                        onClick={() => setOpenPopover(openPopover === "rating" ? null : "rating")}
                                        className={`p-1 rounded hover:bg-background/50 ${filterRating ? "text-primary" : "text-muted-foreground"}`}
                                    >
                                        <Filter className="h-4 w-4" />
                                    </button>
                                </div>
                            </th>

                            <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase border-r border-border">REVIEW</th>

                            <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase w-32">
                                <div className="flex items-center gap-2 justify-between">
                                    DATE
                                    <button
                                        ref={el => { filterButtonRefs.current.date = el; }}
                                        onClick={() => setOpenPopover(openPopover === "date" ? null : "date")}
                                        className={`p-1 rounded hover:bg-background/50 ${filterDate ? "text-primary" : "text-muted-foreground"}`}
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredReviews.length > 0 ? filteredReviews.map(r => (
                            <tr key={r.id} className="hover:bg-muted/50 transition-colors group">
                                <td className="px-3 py-3 text-sm text-foreground border-r border-border font-mono">{r.id}</td>
                                {showTeacherCol && <td className="px-3 py-3 text-sm text-foreground border-r border-border">{r.teacher_name}</td>}
                                {showStudentCol && <td className="px-3 py-3 text-sm text-foreground border-r border-border">{r.student_name}</td>}
                                <td className="px-3 py-3 text-sm border-r border-border">
                                    <div className="flex text-yellow-500">
                                        {"★".repeat(Math.round(r.rating))}
                                        <span className="text-gray-300">{"★".repeat(5 - Math.round(r.rating))}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-foreground border-r border-border break-words min-w-[200px]">{r.review_content}</td>
                                <td className="px-3 py-3 text-sm text-foreground whitespace-nowrap">{formatDate(r.review_date)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={visibleCols} className="py-12 text-center text-muted-foreground bg-background">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Filter className="h-8 w-8 opacity-20" />
                                        <p>No reviews found matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popovers */}
            <AnimatePresence>
                {["teacher", "student", "rating", "date"].map(filterName => {
                    const pos = getPopoverPosition(filterName as any);
                    if (!pos.show) return null;

                    let options: string[] = [];
                    let value = "";
                    let label = "";

                    switch (filterName) {
                        case "teacher": options = teacherOptions; value = filterTeacher; label = "Filter by Teacher"; break;
                        case "student": options = studentOptions; value = filterStudent; label = "Filter by Student"; break;
                        case "rating": options = ["5", "4", "3", "2", "1"]; value = filterRating; label = "Filter by Rating"; break;
                        case "date": options = []; value = filterDate; label = "Filter by Date"; break;
                    }

                    return (
                        <motion.div
                            key={filterName}
                            initial={{ opacity: 0, y: -6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            style={{ position: 'absolute', top: pos.top, left: pos.left, minWidth: '220px' }}
                            className="z-50 bg-popover border border-border rounded-lg shadow-xl p-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">{label}</label>
                                {value && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (filterName === "teacher") setFilterTeacher("");
                                            if (filterName === "student") setFilterStudent("");
                                            if (filterName === "rating") setFilterRating("");
                                            if (filterName === "date") setFilterDate("");
                                        }}
                                        className="text-xs text-destructive hover:text-destructive/80"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {filterName === "date" ? (
                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={e => setFilterDate(e.target.value)}
                                    className="w-full border-border bg-background"
                                />
                            ) : (
                                <div className="max-h-[200px] overflow-y-auto space-y-1">
                                    <button
                                        onClick={() => {
                                            if (filterName === "teacher") setFilterTeacher("");
                                            if (filterName === "student") setFilterStudent("");
                                            if (filterName === "rating") setFilterRating("");
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-sm ${!value ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}
                                    >
                                        All
                                    </button>
                                    {options.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                if (filterName === "teacher") setFilterTeacher(opt);
                                                if (filterName === "student") setFilterStudent(opt);
                                                if (filterName === "rating") setFilterRating(opt);
                                            }}
                                            className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${value === opt ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}
                                        >
                                            {filterName === "rating" ? (
                                                <span className="flex text-yellow-500">
                                                    {"★".repeat(Number(opt))}<span className="text-gray-300">{"★".repeat(5 - Number(opt))}</span>
                                                </span>
                                            ) : opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    );
}