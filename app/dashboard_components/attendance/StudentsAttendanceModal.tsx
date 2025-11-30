"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAttendance } from "../../../src/hooks/useAttendance";
import { getStudentsInClass, Student } from "../../../src/services/api/class";
import { getScheduleById } from "../../../src/services/api/schedule";
import { Attendance, AttendanceBatchCreate } from "../../../src/services/api/attendance";
import toast from "react-hot-toast";

interface StudentsAttendanceModalProps {
    open: boolean;
    onClose: () => void;
    modalData: null | { schedule: any; mode: "take" | "edit" };
    date: string;
    onSubmitted?: () => Promise<void> | void;
}

type RecordValue = { status: string; checkin_time?: string | null; attendance_id?: number | null };

const StudentsAttendanceModalInner: React.FC<StudentsAttendanceModalProps> = ({
    open,
    onClose,
    modalData,
    date,
    onSubmitted,
}) => {
    const { addBatchAttendance, editLateAttendance, fetchAttendancesBySchedule } = useAttendance();
    const [students, setStudents] = React.useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const mountedRef = React.useRef(false);

    // Use string keys everywhere for object map
    const [recordsMap, setRecordsMap] = React.useState<Record<string, RecordValue>>({});
    const [originalRecords, setOriginalRecords] = React.useState<Record<string, RecordValue>>({});

    React.useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const nowTimeOnly = () => {
        const d = new Date();
        return d.toTimeString().split(" ")[0];
    };

    React.useEffect(() => {
        if (!open || !modalData) return;

        let cancelled = false;
        const load = async () => {
            setLoadingStudents(true);
            try {
                const schedule = modalData.schedule;

                const scheduleIdForFetch = Number(
                    schedule.originalScheduleId ?? schedule.schedule_id ?? schedule.id ?? NaN
                );

                let classId: number | undefined = undefined;
                if (schedule.class_id) classId = schedule.class_id;
                else if (schedule.classId) classId = schedule.classId;
                else if (schedule.class && (schedule.class.class_id || schedule.class.id)) {
                    classId = schedule.class.class_id ?? schedule.class.id;
                }

                if (!classId) {
                    if (!Number.isFinite(scheduleIdForFetch) || isNaN(scheduleIdForFetch)) {
                        throw new Error("Không tìm được class_id: schedule không có class_id và id hợp lệ");
                    }
                    const fullSchedule = await getScheduleById(scheduleIdForFetch);
                    classId = fullSchedule.class_id;
                    schedule.class_id = classId;
                    schedule.class_name = fullSchedule.class_name ?? schedule.class_name;
                }

                const studentsData = await getStudentsInClass(Number(classId));
                if (cancelled) return;
                setStudents(studentsData ?? []);

                let allForSchedule: Attendance[] = [];
                if (Number.isFinite(scheduleIdForFetch) && !isNaN(scheduleIdForFetch)) {
                    const resp = await fetchAttendancesBySchedule(scheduleIdForFetch);
                    allForSchedule = Array.isArray(resp) ? resp : [];
                }

                const forDate = allForSchedule.filter((a) => a.attendance_date === date);
                const map: Record<string, RecordValue> = {};
                const byStudent = new Map<number, Attendance>();
                for (const a of forDate) byStudent.set(a.student_user_id, a);

                for (const s of studentsData ?? []) {
                    const hv = byStudent.get(s.student_user_id);
                    if (hv) {
                        map[String(s.student_user_id)] = {
                            status: hv.status ?? "absent",
                            checkin_time: hv.checkin_time ?? null,
                            attendance_id: hv.attendance_id,
                        };
                    } else {
                        map[String(s.student_user_id)] = { status: "", checkin_time: null, attendance_id: null };
                    }
                }

                if (!cancelled && mountedRef.current) {
                    setRecordsMap(map);
                    // deep copy
                    const copy: Record<string, RecordValue> = {};
                    Object.keys(map).forEach((k) => {
                        copy[k] = { ...map[k] };
                    });
                    setOriginalRecords(copy);
                }
            } catch (err: any) {
                console.error("Load students/attendances failed", err);
                let msg = "Failed to load attendance data.";
                if (err) {
                    if (typeof err === "string") msg = err;
                    else if (err.message) msg = err.message;
                    else if (Array.isArray(err)) msg = err.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
                    else if (err.msg) msg = err.msg;
                    else msg = JSON.stringify(err);
                }
                toast.error(msg);
            } finally {
                if (!cancelled && mountedRef.current) setLoadingStudents(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [open, modalData, date, fetchAttendancesBySchedule]);

    const schedule = modalData?.schedule;

    // useCallback + string keys
    const setRecord = React.useCallback((student_user_id: number, patch: { status?: string; checkin_time?: string | null }) => {
        const key = String(student_user_id);
        setRecordsMap((prev) => {
            const cur = prev[key] ?? { status: "", checkin_time: null, attendance_id: null };
            const next = { ...prev, [key]: { ...cur, ...patch } };
            return next;
        });
    }, []);

    const allMarked = React.useMemo(() => {
        return students.length > 0 && students.every((s) => (recordsMap[String(s.student_user_id)]?.status ?? "") !== "");
    }, [students, recordsMap]);

    // ---------- Submit ----------
    const handleSubmit = async () => {
        if (!schedule) return;
        setSubmitting(true);
        try {
            const scheduleIdForFetch = Number(
                schedule.originalScheduleId ?? schedule.schedule_id ?? schedule.id ?? NaN
            );

            const entries = Object.entries(recordsMap).map(([k, v]) => ({
                student_user_id: Number(k),
                ...v,
            }));

            const toCreate = entries.filter((e) => !e.attendance_id && e.status);
            const toUpdate = entries.filter(
                (e) =>
                    e.attendance_id &&
                    e.status === "present" &&
                    originalRecords[String(e.student_user_id)]?.status === "absent"
            );

            if (toCreate.length > 0) {
                const payload: AttendanceBatchCreate = {
                    schedule_id: scheduleIdForFetch,
                    class_id: schedule.class_id ?? schedule.classId,
                    attendance_date: date,
                    records: toCreate.map((c) => ({
                        student_user_id: c.student_user_id,
                        status: c.status,
                        checkin_time: c.checkin_time ?? (c.status === "present" ? nowTimeOnly() : null),
                    })),
                };
                await addBatchAttendance(payload);
            }

            await Promise.all(
                toUpdate.map((upd) => {
                    const checkinTime = upd.checkin_time ?? nowTimeOnly();
                    return editLateAttendance(upd.student_user_id, scheduleIdForFetch, {
                        checkin_time: checkinTime,
                        attendance_date: date,
                    });
                })
            );

            await fetchAttendancesBySchedule(scheduleIdForFetch);
            if (onSubmitted) await onSubmitted();
            toast.success("Attendance submitted.");
            onClose();
        } catch (err: any) {
            console.error("Submit failed", err);
            let errMsg = "Submit attendance failed.";
            if (err) {
                if (typeof err === "string") errMsg = err;
                else if (err.message) errMsg = err.message;
                else if (err.msg) errMsg = err.msg;
                else if (typeof err === "object" && err !== null) {
                    if (Array.isArray(err.detail)) {
                        errMsg = err.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
                    } else if ("msg" in err && typeof err.msg === "string") {
                        errMsg = err.msg;
                    } else {
                        try {
                            errMsg = JSON.stringify(err);
                        } catch {
                            errMsg = "An unknown error occurred.";
                        }
                    }
                }
            }
            toast.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open || !modalData || !schedule) return null;
    if (typeof document === "undefined" || !document.body) return null;

    const safe = (v: any) =>
        v === null || v === undefined
            ? "—"
            : typeof v === "string" || typeof v === "number" || React.isValidElement(v)
                ? v
                : JSON.stringify(v);

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[12000] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.button
                    aria-label="close"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ y: 12, opacity: 0, scale: 0.995 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 12, opacity: 0, scale: 0.995 }}
                    transition={{ duration: 0.18 }}
                    // CHỈNH SỬA: Dùng class bg-background text-foreground để support Dark Mode
                    className="relative w-[95vw] max-w-4xl mx-4 rounded-lg shadow-xl p-4 overflow-auto bg-background text-foreground border border-border"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Attendance — {safe(schedule?.class_name)}</h3>
                        <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">Date: {safe(date)}</div>
                            {/* CHỈNH SỬA: Border và hover effect */}
                            <button
                                onClick={onClose}
                                className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {loadingStudents ? (
                        <div className="text-center py-8 text-muted-foreground">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No students enrolled.</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        {/* CHỈNH SỬA: Border color */}
                                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-3 py-2 font-medium text-muted-foreground">#</th>
                                            <th className="px-3 py-2 font-medium text-muted-foreground">ID</th>
                                            <th className="px-3 py-2 font-medium text-muted-foreground">Full name</th>
                                            <th className="px-3 py-2 font-medium text-muted-foreground">Email</th>
                                            <th className="px-3 py-2 font-medium text-muted-foreground">DOB</th>
                                            <th className="px-3 py-2 font-medium text-muted-foreground">Phone</th>
                                            <th className="px-3 py-2 font-medium text-muted-foreground">Gender</th>
                                            <th className="px-3 py-2 font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {students.map((s, idx) => {
                                            const key = String(s.student_user_id);
                                            const rec = recordsMap[key] ?? { status: "", checkin_time: null, attendance_id: null };
                                            const orig = originalRecords[key];

                                            return (
                                                <tr key={s.student_user_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                    <td className="px-3 py-2 align-top">{idx + 1}</td>
                                                    <td className="px-3 py-2 align-top">{safe(s.student_user_id)}</td>
                                                    <td className="px-3 py-2 align-top font-medium">{safe(s.full_name)}</td>
                                                    <td className="px-3 py-2 align-top text-muted-foreground text-sm">{safe(s.email)}</td>
                                                    <td className="px-3 py-2 align-top text-muted-foreground text-sm">{safe(s.date_of_birth)}</td>
                                                    <td className="px-3 py-2 align-top text-muted-foreground text-sm">{safe(s.phone_number)}</td>
                                                    <td className="px-3 py-2 align-top text-muted-foreground text-sm">{safe(s.gender)}</td>
                                                    <td className="px-3 py-2 align-top">
                                                        <div className="flex items-center gap-2">
                                                            {modalData.mode === "edit" ? (
                                                                rec.status === "present" ? (
                                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-600 text-white whitespace-nowrap text-sm font-medium">
                                                                        <span>Present</span>
                                                                        <span className="text-xs opacity-90">✓</span>
                                                                    </span>
                                                                ) : rec.attendance_id && orig?.status === "absent" ? (
                                                                    <button
                                                                        onClick={() =>
                                                                            setRecord(s.student_user_id, {
                                                                                status: "present",
                                                                                checkin_time: null,
                                                                            })
                                                                        }
                                                                        className="px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium whitespace-nowrap"
                                                                    >
                                                                        Late
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() =>
                                                                            setRecord(s.student_user_id, {
                                                                                status: "present",
                                                                                checkin_time: null,
                                                                            })
                                                                        }
                                                                        // CHỈNH SỬA: Inactive button color
                                                                        className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm whitespace-nowrap border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                                                    >
                                                                        Present
                                                                    </button>
                                                                )
                                                            ) : (
                                                                // TAKE MODE
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            setRecord(s.student_user_id, {
                                                                                status: "present",
                                                                                checkin_time: null,
                                                                            })
                                                                        }
                                                                        className={
                                                                            "px-3 py-1 rounded cursor-pointer whitespace-nowrap text-sm font-medium transition-all border " +
                                                                            (rec.status === "present"
                                                                                ? "bg-green-600 text-white border-green-600"
                                                                                : "bg-gray-100 dark:bg-gray-800 text-foreground border-transparent hover:bg-gray-200 dark:hover:bg-gray-700")
                                                                        }
                                                                    >
                                                                        <span className="inline-flex items-center gap-2">
                                                                            <span>Present</span>
                                                                            {rec.status === "present" && <span className="text-xs opacity-90">✓</span>}
                                                                        </span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setRecord(s.student_user_id, {
                                                                                status: "absent",
                                                                                checkin_time: null,
                                                                            })
                                                                        }
                                                                        className={
                                                                            "px-3 py-1 rounded cursor-pointer whitespace-nowrap text-sm font-medium transition-all border " +
                                                                            (rec.status === "absent"
                                                                                ? "bg-red-600 text-white border-red-600"
                                                                                : "bg-gray-100 dark:bg-gray-800 text-foreground border-transparent hover:bg-gray-200 dark:hover:bg-gray-700")
                                                                        }
                                                                    >
                                                                        <span className="inline-flex items-center gap-2">
                                                                            <span>Absent</span>
                                                                            {rec.status === "absent" && <span className="text-xs opacity-90">✕</span>}
                                                                        </span>
                                                                    </button>
                                                                </>
                                                            )}
                                                            {rec.attendance_id && <div className="text-xs text-muted-foreground ml-1 italic">saved</div>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="text-sm text-muted-foreground mr-auto">
                                    Marked: <span className="font-medium text-foreground">{Object.values(recordsMap).filter((r) => r.status).length}</span>/{students.length}
                                </div>
                                <button
                                    onClick={() => {
                                        const newMap: Record<string, RecordValue> = { ...recordsMap };
                                        for (const s of students) {
                                            const k = String(s.student_user_id);
                                            newMap[k] = {
                                                ...(newMap[k] ?? { attendance_id: null }),
                                                status: "present",
                                                checkin_time: null,
                                            };
                                        }
                                        setRecordsMap(newMap);
                                    }}
                                    // CHỈNH SỬA: Secondary button style
                                    className="px-3 py-2 rounded text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground transition-colors"
                                >
                                    Mark all present
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!allMarked || submitting}
                                    className={`px-6 py-2 rounded text-sm font-medium transition-all ${!allMarked || submitting
                                            // CHỈNH SỬA: Disabled state
                                            ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                            : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm hover:shadow"
                                        }`}
                                >
                                    {submitting ? "Submitting..." : "Submit Attendance"}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default React.memo(StudentsAttendanceModalInner);