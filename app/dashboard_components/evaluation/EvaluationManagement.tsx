"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { useEvaluations } from "src/hooks/useEvaluation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "src/contexts/AuthContext";
import { Input } from "components/ui/input";

interface EvaluationManagementProps {
    searchTerm: string;
    updateSearchTerm: (section: string, value: string) => void;
}

// Format date for display: YYYY-MM-DD → dd/mm/yyyy
const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
};

// Normalize to YYYY-MM-DD for filtering
const normalizeDate = (dateString: string) => {
    if (!dateString) return "";
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
};

export default function EvaluationManagement({
    searchTerm,
    updateSearchTerm,
}: EvaluationManagementProps) {
    const { evaluations, loading, error, fetchAllEvaluations } = useEvaluations();
    const { user } = useAuth();

    React.useEffect(() => {
        fetchAllEvaluations().catch(console.error);
    }, [fetchAllEvaluations]);

    const [localSearch, setLocalSearch] = React.useState<string>(searchTerm ?? "");
    React.useEffect(() => {
        setLocalSearch(searchTerm ?? "");
    }, [searchTerm]);

    const getRoleNames = React.useCallback((roles: any): string[] => {
        if (!roles) return [];
        if (Array.isArray(roles)) return roles.map(r => typeof r === "string" ? r : r?.name ?? r?.role ?? "").filter(Boolean).map(String);
        if (typeof roles === "string") return [roles];
        if (typeof roles === "object" && roles !== null) return roles.name ? [String(roles.name)] : roles.role ? [String(roles.role)] : [];
        return [];
    }, []);

    const roleNames = React.useMemo(() => getRoleNames(user?.roles), [user?.roles, getRoleNames]);
    const isTeacherRole = roleNames.includes("teacher");
    const isStudentRole = roleNames.includes("student");

    const [filterStudent, setFilterStudent] = React.useState("");
    const [filterTeacher, setFilterTeacher] = React.useState("");
    const [filterType, setFilterType] = React.useState("");
    const [filterDate, setFilterDate] = React.useState("");

    const [openPopover, setOpenPopover] = React.useState<null | "student" | "teacher" | "type" | "date">(null);
    const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    const studentOptions = React.useMemo(() => Array.from(new Set(evaluations.map((e) => e.student).filter(Boolean))), [evaluations]);
    const teacherOptions = React.useMemo(() => Array.from(new Set(evaluations.map((e) => e.teacher).filter(Boolean))), [evaluations]);
    const typeOptions = React.useMemo(() => Array.from(new Set(evaluations.map((e) => e.type).filter(Boolean))), [evaluations]);

    React.useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenPopover(null);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const filteredEvaluations = React.useMemo(() => {
        return evaluations.filter((evaluation) => {
            const matchesSearch =
                !localSearch ||
                (evaluation.student ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
                (evaluation.teacher ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
                (evaluation.type ?? "").toLowerCase().includes(localSearch.toLowerCase());

            const matchesStudent = filterStudent ? evaluation.student === filterStudent : true;
            const matchesTeacher = filterTeacher ? evaluation.teacher === filterTeacher : true;
            const matchesType = filterType ? evaluation.type === filterType : true;
            const matchesDate = filterDate ? normalizeDate(evaluation.date) === filterDate : true;

            return matchesSearch && matchesStudent && matchesTeacher && matchesType && matchesDate;
        });
    }, [evaluations, localSearch, filterStudent, filterTeacher, filterType, filterDate]);

    const resetFilters = React.useCallback(() => {
        setFilterStudent(""); setFilterTeacher(""); setFilterType(""); setFilterDate("");
        setLocalSearch(""); updateSearchTerm("evaluation", ""); setOpenPopover(null);
    }, [updateSearchTerm]);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value); updateSearchTerm("evaluation", value);
    };

    if (loading) return <div className="text-muted-foreground">Loading...</div>;
    // 🎨 SỬA: text-red-500 -> text-destructive
    if (error) return <div className="text-destructive">{error}</div>;

    const showStudentCol = !isStudentRole;
    const showTeacherCol = !isTeacherRole;
    const visibleCols = 1 + (showStudentCol ? 1 : 0) + (showTeacherCol ? 1 : 0) + 1 + 1;

    const getPopoverPosition = (filterName: "student" | "teacher" | "type" | "date") => {
        const button = filterButtonRefs.current[filterName];
        if (!button || !rootRef.current) return { left: 0, top: 0, show: false };
        const buttonRect = button.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        return { left: buttonRect.left - rootRect.left, top: buttonRect.bottom - rootRect.top + 5, show: openPopover === filterName };
    };

    return (
        // 🎨 SỬA: bg-background -> bg-card (để "nổi" trên nền)
        <div className="space-y-4 relative p-4 bg-card rounded-lg shadow-lg" ref={rootRef}>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Evaluation Management</h2>
            </div>

            <div className="flex items-center gap-4 text-foreground">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search evaluations..."
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        // 🎨 SỬA: border-gray-300 -> border-border, focus:ring-cyan-500 -> focus:ring-primary
                        className="w-full px-4 py-2 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Filter className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground Filter cursor-pointer" />
                </div>
                <button
                    onClick={resetFilters}
                    // 🎨 SỬA: bg-red-500 -> bg-destructive, text-white -> text-destructive-foreground, hover:bg-red-600 -> hover:bg-destructive/90
                    className="px-3 py-1 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
                >
                    Reset filter
                </button>
            </div>

            {/* Table */}
            {/* 🎨 SỬA: bg-gray-50 -> bg-background, border-gray-200 -> border-border */}
            <div className="overflow-x-auto bg-background rounded-lg border border-border shadow-sm">
                <table className="w-full table-auto">
                    {/* 🎨 SỬA: bg-gray-100 -> bg-muted, border-gray-200 -> border-border */}
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">ID</th>
                            {showStudentCol && (
                                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                                    <div className="flex items-center gap-1">
                                        STUDENT
                                        <button
                                            ref={el => { filterButtonRefs.current.student = el; }}
                                            onClick={() => setOpenPopover(openPopover === "student" ? null : "student")}
                                            aria-label="Filter by student"
                                            title="Filter by student"
                                        >
                                            <Filter className="h-4 w-4 text-foreground Filter cursor-pointer" />
                                        </button>
                                    </div>
                                </th>
                            )}
                            {showTeacherCol && (
                                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                                    <div className="flex items-center gap-1">
                                        TEACHER
                                        <button
                                            ref={el => { filterButtonRefs.current.teacher = el; }}
                                            onClick={() => setOpenPopover(openPopover === "teacher" ? null : "teacher")}
                                            aria-label="Filter by teacher"
                                            title="Filter by teacher"
                                        >
                                            <Filter className="h-4 w-4 text-foreground Filter cursor-pointer" />
                                        </button>
                                    </div>
                                </th>
                            )}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                                <div className="flex items-center gap-1">
                                    TYPE
                                    <button
                                        ref={el => { filterButtonRefs.current.type = el; }}
                                        onClick={() => setOpenPopover(openPopover === "type" ? null : "type")}
                                        aria-label="Filter by type"
                                        title="Filter by type"
                                    >
                                        <Filter className="h-4 w-4 text-foreground Filter cursor-pointer " />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                                <div className="flex items-center gap-1">
                                    DATE
                                    <button
                                        ref={el => { filterButtonRefs.current.date = el; }}
                                        onClick={() => setOpenPopover(openPopover === "date" ? null : "date")}
                                        aria-label="Filter by date"
                                        title="Filter by date"
                                    >
                                        <Filter className="h-4 w-4 text-foreground Filter cursor-pointer" />
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    {/* 🎨 SỬA: divide-gray-200 -> divide-border */}
                    <tbody className="divide-y divide-border">
                        {filteredEvaluations.length > 0 ? filteredEvaluations.map(e => (
                            // 🎨 SỬA: hover:bg-gray-100 -> hover:bg-muted/50
                            <tr key={e.id} className="hover:bg-muted/50 cursor-pointer">
                                <td className="px-4 py-3 text-sm text-foreground">{e.id}</td>
                                {showStudentCol && <td className="px-4 py-3 text-sm text-foreground">{e.student}</td>}
                                {showTeacherCol && <td className="px-4 py-3 text-sm text-foreground">{e.teacher}</td>}
                                <td className="px-4 py-3 text-sm">
                                    {/* (Giữ nguyên, đây là màu ngữ nghĩa) */}
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${e.type === "discipline" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                                        {e.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-foreground">{formatDate(e.date)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={visibleCols} className="py-8 text-center text-muted-foreground">No evaluations found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popovers */}
            <AnimatePresence>
                {["student", "teacher", "type", "date"].map(filter => {
                    const options = filter === "student" ? studentOptions : filter === "teacher" ? teacherOptions : filter === "type" ? typeOptions : [];
                    const value = filter === "student" ? filterStudent : filter === "teacher" ? filterTeacher : filter === "type" ? filterType : filterDate;
                    const setter = filter === "student" ? setFilterStudent : filter === "teacher" ? setFilterTeacher : filter === "type" ? setFilterType : setFilterDate;
                    return getPopoverPosition(filter as any).show ? (
                        <motion.div
                            key={filter}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            style={{
                                position: 'absolute',
                                top: getPopoverPosition(filter as any).top,
                                left: getPopoverPosition(filter as any).left,
                                transform: 'translateX(calc(-100% + 40px))'
                            }}
                            // 🎨 SỬA: bg-background -> bg-popover, border -> border-border
                            className="z-50 mt-2 w-48 bg-popover border border-border rounded shadow-lg p-3"
                        >
                            <label className="text-sm font-medium text-popover-foreground mb-1 block">{filter.charAt(0).toUpperCase() + filter.slice(1)}</label>
                            {filter === "date" ? (
                                // 🎨 SỬA: Thêm bg-input, border-border
                                <Input type="date" value={value} onChange={(e) => setter(e.target.value)} className="w-full border border-border bg-input p-2 rounded text-foreground" />
                            ) : (
                                <select
                                    id={`filter-select-${filter}`}
                                    value={value}
                                    onChange={(e) => setter(e.target.value)}
                                    // 🎨 SỬA: Thêm bg-input, border-border
                                    className="w-full border border-border bg-input p-2 rounded text-foreground"
                                    aria-label={`Filter by ${filter}`}
                                >
                                    <option value="">All</option>
                                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            )}
                        </motion.div>
                    ) : null;
                })}
            </AnimatePresence>
        </div>
    );
}