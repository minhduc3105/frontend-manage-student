"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

import { useSchedules } from "../../../src/contexts/ScheduleContext";
import { useClasses } from "../../../src/contexts/ClassContext";
import { useTuitions } from "../../../src/hooks/useTuition";
import { usePayrolls } from "../../../src/hooks/usePayroll";
import { useTest } from "../../../src/hooks/useTest";

import { Tuition } from "../../../src/services/api/tuition";
import { Payroll } from "../../../src/services/api/payroll";
import { Class, ClassUpdate } from "../../../src/services/api/class";
import { Schedule, ScheduleUpdate } from "../../../src/services/api/schedule";
import { Test, TestUpdate } from "../../../src/services/api/test";

import { PayrollInfoForm } from "./PayrollInfoForm";
import { TuitionInfoForm } from "./TuitionInfoForm";
import { ClassInfoForm } from "./ClassInfoForm";
import { ScheduleInfoForm } from "./ScheduleInfoForm";
import { TestInfoForm } from "./TestInfoForm";

export type ModalDataType = Tuition | Payroll | Class | Schedule | Test;
export type ModalType = "tuition" | "payroll" | "class" | "schedule" | "test";

interface ShowInfoModalProps {
  type: ModalType;
  data: ModalDataType;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  extraActions?: React.ReactNode;
  userRoles?: string[];
}

export function ShowInfoModal({
  type,
  data,
  onClose,
  onUpdated,
  userRoles,
  extraActions,
}: ShowInfoModalProps) {
  const [editedData, setEditedData] = useState<ModalDataType>(data);
  const [isSaving, setIsSaving] = useState(false);

  const { editSchedule } = useSchedules();
  const { editClass } = useClasses();
  const { editTuition } = useTuitions();
  const { editPayroll } = usePayrolls();
  const { editTest } = useTest();

  const isManager = !!userRoles?.includes("manager");
  const isTeacher = !!userRoles?.includes("teacher");
  const isStudent = !!userRoles?.includes("student");

  // --- convert date trước khi render form ---
  useEffect(() => {
    if (type === "schedule") {
      const s = data as Schedule;
      if (s.date && s.date.includes("-")) {
        const [y, m, d] = s.date.split("-");
        setEditedData({ ...s, date: `${d}/${m}/${y}` });
      }
    } else if (type === "tuition") {
      const t = data as Tuition;
      if (t.due_date && t.due_date.includes("-")) {
        const [y, m, d] = t.due_date.split("-");
        setEditedData({ ...t, due_date: `${d}/${m}/${y}` });
      }
    } else if (type === "test") {
      const t = data as Test;
      if (t.exam_date) {
        const parts = t.exam_date.includes("-") ? t.exam_date.split("-") : t.exam_date.split("/");
        if (parts.length === 3) {
          const [y, m, d] = parts;
          setEditedData({ ...t, exam_date: `${d}/${m}/${y}` });
        } else {
          setEditedData(t);
        }
      } else {
        setEditedData(t);
      }
    }
  }, [type, data]);

  const handleInputChange = useCallback(
    (field: string, value: string | number | undefined) => {
      setEditedData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (type === "tuition") {
        const t = editedData as Tuition;
        const [d, m, y] = (t.due_date as string).split("/");
        await editTuition(t.id, {
          amount: Number(t.amount),
          term: Number(t.term),
          due_date: `${y}-${m}-${d}`,
          status: t.status,
        });
      } else if (type === "payroll") {
        const p = editedData as Payroll;
        const updatedMonth =
          p.month !== undefined && p.month !== null
            ? Number(p.month)
            : new Date(p.sent_at).getMonth() + 1;

        let sentAtISO: string;
        try {
          const dateObj = new Date(p.sent_at);
          sentAtISO = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
        } catch {
          sentAtISO = new Date().toISOString();
        }

        await editPayroll(p.id, {
          month: updatedMonth,
          total_base_salary: Number(p.base_salary ?? 0),
          reward_bonus: Number(p.bonus ?? 0),
          sent_at: sentAtISO,
          status: p.status,
        });
      } else if (type === "class") {
        const c = editedData as Class;
        const classPayload: ClassUpdate = {
          class_name: c.class_name,
          capacity: c.capacity,
          fee: c.fee,
        };
        if ((editedData as any).teacher_user_id !== undefined) {
          (classPayload as any).teacher_user_id = (editedData as any).teacher_user_id;
        }
        await editClass(c.class_id, classPayload);
      } else if (type === "schedule") {
        const s = editedData as Schedule;
        const payload: ScheduleUpdate = {
          class_id: s.class_id,
          room: s.room,
          schedule_type: s.schedule_type,
          start_time: s.start_time,
          end_time: s.end_time,
        };
        if (s.schedule_type === "ONCE" && s.date) {
          const parts = s.date.includes("/") ? s.date.split("/") : null;
          const formattedDate = parts ? `${parts[2]}-${parts[1]}-${parts[0]}` : s.date;
          payload.date = formattedDate;
          payload.day_of_week = new Date(formattedDate)
            .toLocaleDateString("en-US", { weekday: "long" })
            .toUpperCase() as any;
        } else if (s.schedule_type === "WEEKLY" && s.day_of_week) {
          payload.day_of_week = s.day_of_week;
        }
        await editSchedule(s.id, payload);
      } else if (type === "test") {
        const t = editedData as Test;
        const payload: TestUpdate = {
          test_name: t.test_name,
          score: Number(t.score),
          exam_date: t.exam_date
            ? (() => {
                const [d, m, y] = t.exam_date.split("/");
                return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
              })()
            : undefined,
        };

        console.log("Test payload:", payload, "Test ID:", t.test_id);
        await editTest(t.test_id, payload);
        console.log("API call completed");
      }

      await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to save data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    let disabled = false;
    let canEditTuition = isManager;

    if (isStudent) {
      disabled = true;
    } else if (isTeacher) {
      disabled = type !== "schedule" && type !== "test";
    }

    if (type === "tuition") {
      return (
        <TuitionInfoForm
          data={editedData as Tuition}
          onInputChange={handleInputChange}
          canEdit={canEditTuition}
        />
      );
    }
    if (type === "payroll")
      return <PayrollInfoForm data={editedData as Payroll} onInputChange={handleInputChange} disabled={disabled} />;
    if (type === "class")
      return <ClassInfoForm data={editedData as Class} onInputChange={handleInputChange} disabled={disabled} />;
    if (type === "schedule")
      return <ScheduleInfoForm data={editedData as Schedule} onInputChange={handleInputChange} disabled={disabled} />;
    if (type === "test")
      return <TestInfoForm data={editedData as Test} onInputChange={handleInputChange} disabled={disabled} />;

    return <div className="text-muted-foreground">No information to display.</div>;
  };

  const showSaveButton =
    (isManager && ["class", "tuition", "payroll", "test"].includes(type)) ||
    (isTeacher && ["schedule", "test"].includes(type));

  return (
    <motion.div
      className="bg-background text-foreground rounded-xl shadow-xl w-96 p-6 relative border border-gray-200"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-red-600 cursor-pointer"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>

      <h2 className="text-xl font-bold mb-4 text-center text-foreground">
        {type === "tuition"
          ? "Tuition "
          : type === "payroll"
          ? "Payroll "
          : type === "class"
          ? "Class "
          : type === "schedule"
          ? "Schedule "
          : "Test "}
        details
      </h2>

      {renderContent()}

      {showSaveButton && (
        <div className="flex justify-center mt-6 space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {extraActions && (isManager || isTeacher) && <div className="mt-3 text-center">{extraActions}</div>}
    </motion.div>
  );
}
