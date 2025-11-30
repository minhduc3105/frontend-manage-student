"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, BookOpen, Calendar, Clock, Home } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { useClasses } from "../../../src/contexts/ClassContext";
import { useSchedules } from "../../../src/contexts/ScheduleContext";
import { ScheduleCreate } from "../../../src/services/api/schedule";

interface CreateScheduleFormProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export function CreateScheduleForm({ onClose, onCreated }: CreateScheduleFormProps) {
  const { classes, loading: classesLoading } = useClasses();
  const { addSchedule } = useSchedules();

  const [classId, setClassId] = useState<number | null>(null);
  const [day, setDay] = useState("");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState(""); // dd/mm/yyyy
  const [type, setType] = useState<"WEEKLY" | "ONCE" | "">("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dayOptions = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
  const typeOptions = ["WEEKLY", "ONCE"];

  const handleCreate = async () => {
    const scheduleType = type as "WEEKLY" | "ONCE";

    if (
      !classId ||
      !room ||
      !scheduleType ||
      !startTime ||
      !endTime ||
      (scheduleType === "WEEKLY" && !day) ||
      (scheduleType === "ONCE" && !date)
    ) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      let finalDate: string | undefined = undefined;
      let finalDay: string | undefined = undefined;

      if (scheduleType === "ONCE") {
        const [d, m, y] = date.split("/");
        if (!d || !m || !y) {
          setErrorMessage("Ngày không hợp lệ. Định dạng: dd/mm/yyyy");
          return;
        }
        finalDate = `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
        const jsDate = new Date(`${y}-${m}-${d}`);
        const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
        finalDay = days[jsDate.getDay()];
      } else {
        finalDay = day;
      }

      const payload: ScheduleCreate = {
        class_id: classId,
        room,
        schedule_type: scheduleType,
        day_of_week: finalDay,
        date: finalDate,
        start_time: startTime,
        end_time: endTime,
      };

      await addSchedule(payload);
      onClose();
      await onCreated();
    } catch (error: any) {
      console.error("Failed to create schedule:", error);
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage("Có lỗi xảy ra khi tạo lịch học.");
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 flex justify-center items-center z-50 cursor-pointer bg-black/40"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background rounded-lg shadow-xl w-96 p-6 text-foreground relative cursor-default"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">📅 Create new schedule </h2>

        <div className="space-y-4">
          {/* Select lớp học */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-500" /> Class
            </label>
            {classesLoading ? (
              <p className="text-muted-foreground">Loading class list...</p>
            ) : (
              <select
                aria-label="Select class"
                value={classId ?? ""}
                onChange={(e) => setClassId(Number(e.target.value))}
                className="border border-gray-300 rounded-md p-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">-- Select class --</option>
                {classes.map((c) => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Phòng học */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2">
              <Home className="h-4 w-4 text-green-500" /> Room
            </label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="border border-gray-300 rounded-md focus:border-cyan-500"
            />
          </div>

          {/* Loại lịch */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" /> Schedule Type
            </label>
            <select
              aria-label="Select schedule type"
              value={type}
              onChange={(e) => setType(e.target.value as "WEEKLY" | "ONCE")}
              className="border border-gray-300 rounded-md p-2 focus:border-cyan-500"
            >
              <option value="">-- Select type --</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {type === "WEEKLY" && (
            <div className="flex flex-col">
              <label className="font-medium mb-1">Day of week</label>
              <select
                aria-label="Select day of week"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:border-cyan-500"
              >
                <option value="">-- Select day of week --</option>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {type === "ONCE" && (
            <div className="flex flex-col">
              <label className="font-medium mb-1">Date (dd/mm/yyyy)</label>
              <Input
                type="text"
                placeholder="dd/mm/yyyy"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded-md focus:border-cyan-500"
              />
            </div>
          )}

          {/* Giờ bắt đầu */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" /> Start Time
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border border-gray-300 rounded-md focus:border-cyan-500"
            />
          </div>

          {/* Giờ kết thúc */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" /> End Time
            </label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border border-gray-300 rounded-md focus:border-cyan-500"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-medium"
          >
            Tạo mới
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
