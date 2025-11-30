"use client";

import { Schedule } from "../../../src/services/api/schedule";
import { Input } from "../../../components/ui/input";
import { useClasses } from "../../../src/contexts/ClassContext";
import { BookOpen, MapPin, CalendarDays, Clock, ListChecks } from "lucide-react";

interface ScheduleInfoFormProps {
  data: Schedule;
  onInputChange: (field: string, value: string | number | undefined) => void;
  disabled?: boolean;
}

export function ScheduleInfoForm({ data, onInputChange, disabled }: ScheduleInfoFormProps) {
  const { classes, loading: classesLoading } = useClasses();

  // helper format time về HH:mm:ss
  const formatTime = (t: string) => t.split("T")[1]?.split(".")[0] ?? t;

  return (
    <div className="space-y-4 bg-background text-foreground p-4 rounded-lg border border-gray-200">
      {/* Lớp */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <BookOpen className="h-4 w-4 text-blue-500" /> Class
        </label>
        {classesLoading ? (
          <p className="text-muted-foreground">Loading class list...</p>
        ) : (
          <select
            aria-label="Choose class"
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={data.class_id}
            onChange={(e) => {
              const id = Number(e.target.value);
              const cls = classes.find((c) => c.class_id === id);
              onInputChange("class_id", id);
              onInputChange("class_name", cls?.class_name);
            }}
            disabled={disabled}
          >
            {data.class_id == null && (
              <option value="" className="text-muted-foreground">
                -- Choose class --
              </option>
            )}
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Phòng */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <MapPin className="h-4 w-4 text-green-500" /> Room
        </label>
        <Input
          className="border border-gray-300 rounded-md p-2"
          value={data.room ?? ""}
          onChange={(e) => onInputChange("room", e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Schedule type */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <ListChecks className="h-4 w-4 text-purple-500" /> Schedule type
        </label>
        <select
          aria-label="Choose schedule type"
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-400 outline-none"
          value={data.schedule_type}
          onChange={(e) => onInputChange("schedule_type", e.target.value)}
          disabled={disabled}
        >
          <option value="WEEKLY">WEEKLY</option>
          <option value="ONCE">ONCE</option>
        </select>
      </div>

      {/* Thứ hoặc Ngày */}
      {data.schedule_type === "WEEKLY" && (
        <div className="flex flex-col">
          <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
            <CalendarDays className="h-4 w-4 text-orange-500" /> Day of week
          </label>
          <select
            aria-label="Choose day of week"
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-orange-400 outline-none"
            value={data.day_of_week ?? ""}
            onChange={(e) => onInputChange("day_of_week", e.target.value)}
          >
            {[
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      {data.schedule_type === "ONCE" && (
        <div className="flex flex-col">
          <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
            <CalendarDays className="h-4 w-4 text-red-500" /> Date
          </label>
          <Input
            type="date"
            className="border border-gray-300 rounded-md p-2"
            value={data.date ?? ""}
            onChange={(e) => onInputChange("date", e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Time */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <Clock className="h-4 w-4 text-indigo-500" /> Start time
        </label>
        <Input
          type="time"
          className="border border-gray-300 rounded-md p-2"
          value={formatTime(data.start_time)}
          onChange={(e) => onInputChange("start_time", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <Clock className="h-4 w-4 text-pink-500" /> End time
        </label>
        <Input
          type="time"
          className="border border-gray-300 rounded-md p-2"
          value={formatTime(data.end_time)}
          onChange={(e) => onInputChange("end_time", e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
