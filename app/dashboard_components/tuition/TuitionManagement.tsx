"use client";

import * as React from "react";
import { FileText, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../showInfo/action_modal";
import { ShowInfoModal } from "../showInfo/ShowInfoModal";
import { ConfirmModal } from "../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../src/hooks/useConfirmDialog";
import { useTuitions } from "../../../src/hooks/useTuition";
import { CreateTuitionForm } from "./CreateTuitionForm";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../src/contexts/AuthContext";

type FilterKey = "student" | "status" | "amount" | "term";
interface PopoverPosition { left: number; top: number; show: boolean }

interface FilterPopoverProps {
    name: string;
    position: PopoverPosition;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
    name, position, value, onChange, options
}) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        style={{ position: "absolute", top: position.top, left: position.left }}
        // 🎨 SỬA: border-gray-300 -> border-border
        className="z-50 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg p-3 text-foreground"
    >
        <label className="text-sm font-semibold mb-2 block capitalize">{name}</label>
        <select
            aria-label={`Select ${name} to filter`}
            value={value}
            onChange={onChange}
            // 🎨 SỬA: Thêm border-border, bg-input, focus:ring-primary
            className="w-full border border-border bg-input p-2 text-sm rounded focus:ring-2 focus:ring-primary focus:border-transparent"
        >
            <option value="">All</option>
            {options.map((option) => (
                <option key={option} value={option}>{option || "(Empty)"}</option>
            ))}
        </select>
    </motion.div>
);

interface RangeFilterPopoverProps {
    name: string;
    position: PopoverPosition;
    min: string;
    max: string;
    setMin: (value: string) => void;
    setMax: (value: string) => void;
    onApply: () => void;
}

const RangeFilterPopover: React.FC<RangeFilterPopoverProps> = ({
    name, position, min, max, setMin, setMax, onApply
}) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        style={{ position: "absolute", top: position.top, left: position.left }}
        // 🎨 SỬA: border-gray-300 -> border-border
        className="z-50 mt-2 w-52 bg-background border border-border rounded-lg shadow-lg p-3 text-foreground space-y-2"
    >
        <label className="text-sm font-semibold block capitalize">{name}</label>
        <Input
            type="number" placeholder="Min"
            value={min} onChange={(e) => setMin(e.target.value)}
            // 🎨 SỬA: Thêm border-border (Component Input có thể đã có, nhưng để chắc)
            className="w-full border border-border p-2 text-sm rounded"
        />
        <Input
            type="number" placeholder="Max"
            value={max} onChange={(e) => setMax(e.target.value)}
            // 🎨 SỬA: Thêm border-border
            className="w-full border border-border p-2 text-sm rounded"
        />
        <button
            onClick={onApply}
            // 🎨 SỬA: bg-cyan-500 -> bg-primary, text-white -> text-primary-foreground, hover:bg-cyan-600 -> hover:bg-primary/90
            className="w-full mt-2 px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
            Apply
        </button>
    </motion.div>
);

export default function TuitionManagement() {
    const { user } = useAuth();
    const { tuitions, fetchTuitions, removeTuition } = useTuitions();
    const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog();

    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [showAction, setShowAction] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);
    const [showCreateModal, setShowCreateModal] = React.useState(false);

    const [filterStudent, setFilterStudent] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("");
    const [amountMin, setAmountMin] = React.useState("");
    const [amountMax, setAmountMax] = React.useState("");
    const [termMin, setTermMin] = React.useState("");
    const [termMax, setTermMax] = React.useState("");
    const [openPopover, setOpenPopover] = React.useState<FilterKey | null>(null);

    const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => { fetchTuitions(); }, [fetchTuitions]);

    const studentOptions = Array.from(new Set(tuitions.map((t) => t.student).filter(Boolean)));
    const statusOptions = ["paid", "unpaid"];

    const filteredTuitions = tuitions.filter((t) => {
        const matchesSearch = (t.student ?? "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStudent = filterStudent ? t.student === filterStudent : true;
        const matchesStatus = filterStatus ? t.status === filterStatus : true;
        const matchesAmount =
            (!amountMin || t.amount >= Number(amountMin)) &&
            (!amountMax || t.amount <= Number(amountMax));
        const matchesTerm =
            (!termMin || t.term >= Number(termMin)) &&
            (!termMax || t.term <= Number(termMax));

        return matchesSearch && matchesStudent && matchesStatus && matchesAmount && matchesTerm;
    });

    const formatCurrency = (amount: number) => `${amount?.toLocaleString("en-US") || ""} vnđ`;

    const handleRowClick = (row: any) => {
        setSelectedRow(row);
        if (user?.roles.includes("manager") || user?.roles.includes("teacher")) {
            setShowAction(true);
        } else {
            setShowInfo(true);
        }
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        try {
            await removeTuition(selectedRow.id);
            closeConfirm();
            setShowAction(false);
            await fetchTuitions();
        } catch {
            alert("Xoá thất bại!");
        }
    };

    const resetFilters = React.useCallback(() => {
        setFilterStudent(""); setFilterStatus("");
        setAmountMin(""); setAmountMax("");
        setTermMin(""); setTermMax("");
        setSearchTerm(""); setOpenPopover(null);
    }, []);

    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpenPopover(null);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const getPopoverPosition = (filterName: FilterKey) => {
        const button = filterButtonRefs.current[filterName];
        if (!button || !rootRef.current) return { left: 0, top: 0, show: false };

        const buttonRect = button.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        const top = buttonRect.bottom - rootRect.top + 5;
        let left = buttonRect.left - rootRect.left;

        const popoverWidth = 208;
        if (left + popoverWidth > rootRect.width) left = rootRect.width - popoverWidth;
        if (left < 0) left = 0;

        return { left, top, show: openPopover === filterName };
    };

    const headerItems: { label: string, key: FilterKey | "ID" | "DUE DATE" }[] = [
        { label: "ID", key: "ID" },
        { label: "STUDENT", key: "student" },
        { label: "AMOUNT", key: "amount" },
        { label: "TERM", key: "term" },
        { label: "STATUS", key: "status" },
        { label: "DUE DATE", key: "DUE DATE" },
    ];

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>, close: () => void) => {
        if (e.target === e.currentTarget) close();
    };

    return (
        // 🎨 SỬA: Thêm bg-card (vì đây là component "nổi" trên nền)
        <div className="space-y-6 relative p-4 bg-card rounded-lg shadow-lg" ref={rootRef}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Tuition Management</h2>
                {user?.roles.includes("manager") && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        // 🎨 SỬA: bg-cyan-500 -> bg-primary, text-white -> text-primary-foreground, hover:bg-cyan-600 -> hover:bg-primary/90
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                    >
                        Create New Tuition
                    </button>
                )}
            </div>

            {/* Search + Reset */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search tuitions by student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // 🎨 SỬA: border-gray-300 -> border-border, focus:ring-cyan-500 -> focus:ring-primary
                        className="w-full px-4 py-2 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    />
                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <button
                    onClick={resetFilters}
                    // 🎨 SỬA: bg-red-500 -> bg-destructive, text-white -> text-destructive-foreground, hover:bg-red-600 -> hover:bg-destructive/90
                    className="px-3 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors text-sm"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table */}
            {/* 🎨 SỬA: bg-gray-50 -> bg-background, border-gray-200 -> border-border */}
            <div className="overflow-x-auto bg-background rounded-lg border border-border shadow-sm mt-4">
                <table className="w-full min-w-[650px] table-auto border-collapse">
                    {/* 🎨 SỬA: bg-gray-100 -> bg-muted, border-gray-200 -> border-border */}
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            {headerItems.map((item, index) => (
                                <th
                                    key={item.key}
                                    // 🎨 SỬA: border-gray-200 -> border-border
                                    className={`px-3 py-3 text-sm font-semibold text-foreground uppercase tracking-wider text-center ${index !== headerItems.length - 1 ? "border-r border-border" : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span>{item.label}</span>
                                        {["student", "status", "amount", "term"].includes(item.key as string) && (
                                            <button
                                                ref={(el) => { filterButtonRefs.current[item.key as FilterKey] = el; }}
                                                onClick={() => setOpenPopover(openPopover === item.key ? null : item.key as FilterKey)}
                                                className="cursor-pointer"
                                                aria-label={`Filter by ${item.label}`}
                                                title={`Filter by ${item.label}`}
                                            >
                                                {/* 🎨 SỬA: text-cyan-500 -> text-primary */}
                                                <Filter className={`h-4 w-4 ${openPopover === item.key ? "text-primary" : "text-foreground"}`} />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTuitions.length > 0 ? filteredTuitions.map((t: any) => (
                            <tr
                                key={t.id}
                                // 🎨 SỬA: hover:bg-gray-100 -> hover:bg-muted/50
                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => handleRowClick(t)}
                            >
                                {/* 🎨 SỬA: border-gray-200 -> border-border */}
                                <td className="px-3 py-3 text-sm text-center border-r border-border">{t.id}</td>
                                <td className="px-3 py-3 text-sm text-center border-r border-border">{t.student}</td>
                                <td className="px-3 py-3 text-sm text-center border-r border-border">{formatCurrency(t.amount)}</td>
                                <td className="px-3 py-3 text-sm text-center border-r border-border">{t.term}</td>
                                <td className="px-3 py-3 text-center border-r border-border">
                                    {/* (Giữ nguyên class status, chúng là semantic) */}
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${t.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                        }`}>{t.status}</span>
                                </td>
                                <td className="px-3 py-3 text-sm text-center">{t.due_date}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-muted-foreground">No tuitions found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Filter Popovers */}
            <AnimatePresence>
                {getPopoverPosition("student").show && (
                    <FilterPopover
                        name="Student"
                        position={getPopoverPosition("student")}
                        value={filterStudent}
                        onChange={(e) => { setFilterStudent(e.target.value); setOpenPopover(null); }}
                        options={studentOptions}
                    />
                )}
                {getPopoverPosition("status").show && (
                    <FilterPopover
                        name="Status"
                        position={getPopoverPosition("status")}
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setOpenPopover(null); }}
                        options={statusOptions}
                    />
                )}
                {getPopoverPosition("amount").show && (
                    <RangeFilterPopover
                        name="Amount"
                        position={getPopoverPosition("amount")}
                        min={amountMin} max={amountMax}
                        setMin={setAmountMin} setMax={setAmountMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}
                {getPopoverPosition("term").show && (
                    <RangeFilterPopover
                        name="Term"
                        position={getPopoverPosition("term")}
                        min={termMin} max={termMax}
                        setMin={setTermMin} setMax={setTermMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}
            </AnimatePresence>

            {/* Modals */}
            {/* (Giống như trước, các component Modal được import 
                 (ConfirmModal, ActionModal, v.v.) cũng cần được refactor 
                 trong file của chính chúng) */}
            <AnimatePresence>
                {showAction && selectedRow && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowAction(false))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ActionModal
                            onClose={() => setShowAction(false)}
                            onShowInfo={() => { setShowAction(false); setShowInfo(true); }}
                            onDelete={user?.roles.includes("manager") ? () => openConfirm(
                                `Bạn có chắc chắn muốn xoá tuition ${selectedRow.id}?`, handleDelete
                            ) : undefined}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showInfo && selectedRow && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowInfo(false))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ShowInfoModal
                            type="tuition"
                            data={selectedRow}
                            onClose={() => setShowInfo(false)}
                            onUpdated={async () => { await fetchTuitions(); }}
                            userRoles={user?.roles}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowCreateModal(false))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <CreateTuitionForm
                            onClose={() => setShowCreateModal(false)}
                            onCreated={async () => { await fetchTuitions(); }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal isOpen={isOpen} message={message} onConfirm={onConfirm} onCancel={closeConfirm} />
        </div>
    );
}