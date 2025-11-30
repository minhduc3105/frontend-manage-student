"use client";

import * as React from "react";
import { FileText, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../showInfo/action_modal";
import { ShowInfoModal } from "../showInfo/ShowInfoModal";
import { ConfirmModal } from "../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../src/hooks/useConfirmDialog";
import { usePayrolls } from "../../../src/hooks/usePayroll";
import { CreatePayrollForm } from "./CreatePayrollForm";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../src/contexts/AuthContext";

type FilterKey = "teacher" | "status" | "base" | "bonus" | "total";
interface PopoverPosition { left: number; top: number; show: boolean }

interface FilterPopoverProps {
    name: string;
    position: PopoverPosition;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}

const FilterPopover: React.FC<FilterPopoverProps> = ({ name, position, value, onChange, options }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        style={{ position: "absolute", top: position.top, left: position.left }}
        // 🎨 SỬA: Thêm border-border
        className="z-50 mt-2 w-48 bg-background border border-border rounded shadow-lg p-3 text-foreground"
    >
        <label className="text-sm font-medium text-foreground mb-1 block capitalize">{name}</label>
        <select
            aria-label={`Select ${name} to filter`}
            value={value}
            onChange={onChange}
            // 🎨 SỬA: Thêm border-border và bg-background (cho Dark mode)
            className="w-full border border-border bg-background p-2 text-sm rounded text-foreground"
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

const RangeFilterPopover: React.FC<RangeFilterPopoverProps> = ({ name, position, min, max, setMin, setMax, onApply }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        style={{ position: "absolute", top: position.top, left: position.left }}
        // 🎨 SỬA: Thêm border-border
        className="z-50 mt-2 w-52 bg-background border border-border rounded shadow-lg p-3 text-foreground space-y-2"
    >
        <label className="text-sm font-medium text-foreground block capitalize">{name}</label>
        <Input
            type="number" placeholder="Min"
            value={min} onChange={(e) => setMin(e.target.value)}
            // 🎨 SỬA: Thêm border-border (Input component đã có sẵn, nhưng để chắc)
            className="w-full border border-border p-2 text-sm rounded text-foreground"
        />
        <Input
            type="number" placeholder="Max"
            value={max} onChange={(e) => setMax(e.target.value)}
            // 🎨 SỬA: Thêm border-border
            className="w-full border border-border p-2 text-sm rounded text-foreground"
        />
        <button
            onClick={onApply}
            // 🎨 SỬA: bg-cyan-500 -> bg-primary, text-white -> text-primary-foreground
            className="w-full mt-2 px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
            Apply
        </button>
    </motion.div>
);

export default function PayrollManagement() {
    const { user } = useAuth();
    const { payrolls, fetchPayrolls, removePayroll } = usePayrolls();
    const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog();

    React.useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [showAction, setShowAction] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);
    const [showCreateModal, setShowCreateModal] = React.useState(false);

    const [openPopover, setOpenPopover] = React.useState<FilterKey | null>(null);
    const [filterTeacher, setFilterTeacher] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("");
    const [baseMin, setBaseMin] = React.useState("");
    const [baseMax, setBaseMax] = React.useState("");
    const [bonusMin, setBonusMin] = React.useState("");
    const [bonusMax, setBonusMax] = React.useState("");
    const [totalMin, setTotalMin] = React.useState("");
    const [totalMax, setTotalMax] = React.useState("");

    const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    const teacherOptions = React.useMemo(() => Array.from(new Set(payrolls.map((p) => p.teacher).filter(Boolean))), [payrolls]);
    const statusOptions = ["paid", "pending"];

    const filteredPayrolls = payrolls.filter((p) => {
        const matchesSearch = (p.teacher ?? "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeacher = filterTeacher ? p.teacher === filterTeacher : true;
        const matchesStatus = filterStatus ? p.status === filterStatus : true;
        const matchesBase = (!baseMin || p.base_salary >= Number(baseMin)) && (!baseMax || p.base_salary <= Number(baseMax));
        const matchesBonus = (!bonusMin || p.bonus >= Number(bonusMin)) && (!bonusMax || p.bonus <= Number(bonusMax));
        const matchesTotal = (!totalMin || p.total >= Number(totalMin)) && (!totalMax || p.total <= Number(totalMax));
        return matchesSearch && matchesTeacher && matchesStatus && matchesBase && matchesBonus && matchesTotal;
    });

    const formatCurrency = (amount: number) => `${amount?.toLocaleString("en-US") || ""} vnđ`;

    const handleRowClick = (row: any) => {
        setSelectedRow(row);
        if (user?.roles.includes("manager") || user?.roles.includes("teacher")) setShowAction(true);
        else setShowInfo(true);
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        try {
            await removePayroll(selectedRow.id);
            closeConfirm();
            setShowAction(false);
            await fetchPayrolls();
        } catch (err) {
            console.error(err);
            alert("Xoá thất bại!");
        }
    };

    const handleCreated = async (): Promise<void> => { await fetchPayrolls(); };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>, close: () => void) => {
        if (e.target === e.currentTarget) close();
    };

    const resetFilters = React.useCallback(() => {
        setFilterTeacher("");
        setFilterStatus("");
        setBaseMin("");
        setBaseMax("");
        setBonusMin("");
        setBonusMax("");
        setTotalMin("");
        setTotalMax("");
        setSearchTerm("");
        setOpenPopover(null);
    }, []);

    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpenPopover(null);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const getPopoverPosition = (filterName: FilterKey): PopoverPosition => {
        const button = filterButtonRefs.current[filterName];
        if (!button || !rootRef.current) return { left: 0, top: 0, show: false };
        const buttonRect = button.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        const top = buttonRect.bottom - rootRect.top + 5;
        const left = buttonRect.left - rootRect.left;
        const popoverWidth = 208;
        let finalLeft = left;
        if (left + popoverWidth > rootRect.width) finalLeft = rootRect.width - popoverWidth;
        if (finalLeft < 0) finalLeft = 0;
        return { left: finalLeft, top, show: openPopover === filterName };
    };

    const headerItems: { label: string, key: FilterKey | "ID" | "SENT AT" }[] = [
        { label: "ID", key: "ID" },
        { label: "TEACHER", key: "teacher" },
        { label: "BASE", key: "base" },
        { label: "BONUS", key: "bonus" },
        { label: "TOTAL", key: "total" },
        { label: "STATUS", key: "status" },
        { label: "SENT AT", key: "SENT AT" },
    ];

    return (
        <div className="space-y-4 relative bg-background p-4 rounded shadow" ref={rootRef}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Payroll Management</h2>
                {(user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        // 🎨 SỬA: bg-cyan-500 -> bg-primary, text-white -> text-primary-foreground
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors cursor-pointer"
                    >
                        Create New Payroll
                    </button>
                )}
            </div>

            {/* Search + Reset */}
            <div className="flex items-center gap-4 mb-2 text-foreground">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search payrolls by teacher name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // 🎨 SỬA: border-gray-300 -> border-border, focus:ring-cyan-500 -> focus:ring-primary
                        className="w-full px-4 py-2 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    />
                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <button
                    onClick={resetFilters}
                    // 🎨 SỬA: bg-red-500 -> bg-destructive, text-white -> text-destructive-foreground
                    className="px-3 py-2 bg-destructive rounded-lg hover:bg-destructive/90 text-destructive-foreground transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table with column dividers */}
            {/* 🎨 SỬA: Thêm border-border */}
            <div className="bg-background rounded-lg overflow-x-auto border border-border">
                <table className="w-full min-w-[650px] table-auto border-collapse">
                    {/* 🎨 SỬA: bg-gray-100 -> bg-muted */}
                    <thead className="bg-muted">
                        <tr>
                            {headerItems.map((item, index) => (
                                <th
                                    key={item.key}
                                    // 🎨 SỬA: border-gray-200 -> border-border
                                    className={`px-3 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider text-center ${index !== headerItems.length - 1 ? "border-r border-border" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3 font-semibold">
                                        <span>{item.label}</span>
                                        {["teacher", "status", "base", "bonus", "total"].includes(item.key as string) && (
                                            <button
                                                ref={(el) => { filterButtonRefs.current[item.key] = el; }}
                                                aria-label={`Filter by ${item.label}`}
                                                onClick={() => setOpenPopover(openPopover === item.key ? null : item.key as FilterKey)}
                                                className="cursor-pointer"
                                            >
                                                {/* 🎨 SỬA: text-cyan-500 -> text-primary */}
                                                <Filter className={`h-4 w-4 ${openPopover === item.key ? 'text-primary' : 'text-foreground'}`} />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayrolls.length > 0 ? filteredPayrolls.map((p) => (
                            // 🎨 SỬA: hover:bg-gray-50 -> hover:bg-muted/50
                            <tr key={p.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleRowClick(p)}>
                                {/* 🎨 SỬA: border-gray-200 -> border-border */}
                                <td className="px-3 py-3 text-sm text-foreground border-r border-border">{p.id}</td>
                                <td className="px-3 py-3 text-sm text-foreground border-r border-border">{p.teacher}</td>
                                <td className="px-3 py-3 text-sm text-foreground border-r border-border">{formatCurrency(p.base_salary)}</td>
                                <td className="px-3 py-3 text-sm text-foreground border-r border-border">{formatCurrency(p.bonus)}</td>
                                <td className="px-3 py-3 text-sm text-foreground border-r border-border">{formatCurrency(p.total)}</td>
                                <td className="px-3 py-3 border-r border-border">
                                    {/* (Giữ nguyên các class này, vì chúng là semantic (success/warning) chứ không phải theme) */}
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${p.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{p.status}</span>
                                </td>
                                <td className="px-3 py-3 text-sm text-foreground">{p.sent_at}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                    No payrolls found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popovers */}
            <AnimatePresence>
                {getPopoverPosition("teacher").show && (
                    <FilterPopover
                        name="Teacher"
                        position={getPopoverPosition("teacher")}
                        value={filterTeacher}
                        onChange={(e) => { setFilterTeacher(e.target.value); setOpenPopover(null); }}
                        options={teacherOptions}
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
                {getPopoverPosition("base").show && (
                    <RangeFilterPopover
                        name="Base Salary"
                        position={getPopoverPosition("base")}
                        min={baseMin}
                        max={baseMax}
                        setMin={setBaseMin}
                        setMax={setBaseMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}
                {getPopoverPosition("bonus").show && (
                    <RangeFilterPopover
                        name="Bonus"
                        position={getPopoverPosition("bonus")}
                        min={bonusMin}
                        max={bonusMax}
                        setMin={setBonusMin}
                        setMax={setBonusMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}
                {getPopoverPosition("total").show && (
                    <RangeFilterPopover
                        name="Total Salary"
                        position={getPopoverPosition("total")}
                        min={totalMin}
                        max={totalMax}
                        setMin={setTotalMin}
                        setMax={setTotalMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}
            </AnimatePresence>

            {/* Modals */}
            {/* (Lưu ý: Các modal được import (ActionModal, ShowInfoModal, v.v.) 
                 cũng cần được refactor bên trong file của chúng 
                 để có thể đổi màu theo theme) */}
            <AnimatePresence>
                {showAction && selectedRow && (
                    <motion.div
                        // 🎨 SỬA: bg-black/50 là ok, nhưng có thể tạo biến --overlay nếu muốn
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowAction(false))}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <ActionModal
                            onClose={() => setShowAction(false)}
                            onShowInfo={() => { setShowAction(false); setShowInfo(true); }}
                            onDelete={user?.roles.includes("manager") ? () => {
                                setShowAction(false);
                                openConfirm(`Bạn có chắc chắn muốn xoá payroll ${selectedRow.id}?`, handleDelete);
                            } : undefined}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <ConfirmModal isOpen={isOpen} message={message} onConfirm={onConfirm} onCancel={closeConfirm} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showInfo && selectedRow && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowInfo(false))}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <ShowInfoModal
                            type="payroll"
                            data={selectedRow}
                            onClose={() => setShowInfo(false)}
                            onUpdated={async () => { await fetchPayrolls(); }}
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
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <CreatePayrollForm onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}