"use client";

import * as React from "react";
import { Input } from "../../../components/ui/input";
import { useSchedules } from "../../../src/contexts/ScheduleContext";
import { useAttendance } from "../../../src/hooks/useAttendance";
import { Attendance } from "../../../src/services/api/attendance";
import toast from "react-hot-toast";
import StudentsAttendanceModal from "./StudentsAttendanceModal";

/** helper: format YYYY-MM-DD */
const todayISO = () => new Date().toISOString().split("T")[0];

/** helper: map weekday (0=Sun..6=Sat) to server day string */
const weekdayToServer = (d: Date) => {
  const map = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return map[d.getDay()];
};

export default function AttendanceManagement() {
  const { schedules, loading: loadingSchedules } = useSchedules();
  const {
    attendances,
    loading: loadingAttendances,
    fetchAttendances,
    fetchAttendancesBySchedule,
  } = useAttendance();

  const [selectedDate, setSelectedDate] = React.useState<string>(todayISO());
  const [openModal, setOpenModal] = React.useState<
    null | { schedule: any; mode: "take" | "edit" }
  >(null);

  React.useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const toISODate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const [d, m, y] = dateStr.split("/");
    if (!d || !m || !y) return null;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  };

  const scheduleOccursOn = React.useCallback(
    (sch: any, dateIso: string) => {
      if ((sch.schedule_type ?? "").toUpperCase() === "ONCE") {
        const normalized = toISODate(sch.date);
        return normalized === dateIso;
      }
      if ((sch.schedule_type ?? "").toUpperCase() === "WEEKLY") {
        return (
          (sch.day_of_week ?? "").toUpperCase() ===
          weekdayToServer(new Date(dateIso))
        );
      }
      return false;
    },
    []
  );

  const availableClasses = React.useMemo(
    () => schedules.filter((s) => scheduleOccursOn(s, selectedDate)),
    [schedules, selectedDate, scheduleOccursOn]
  );

  const submittedBySchedule = React.useMemo(() => {
    const map = new Map<number, Attendance[]>();
    attendances
      .filter((a) => a.attendance_date === selectedDate)
      .forEach((a) => {
        const list = map.get(a.schedule_id) ?? [];
        list.push(a);
        map.set(a.schedule_id, list);
      });
    return map;
  }, [attendances, selectedDate]);

  const handleOpenForSchedule = async (schedule: any) => {
    const existing = submittedBySchedule.get(schedule.id) ?? [];
    setOpenModal({ schedule, mode: existing.length > 0 ? "edit" : "take" });
    await fetchAttendancesBySchedule(schedule.id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Attendance Management
        </h2>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border"
          />
          <div className="text-sm text-muted-foreground">Selected date</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available classes */}
        <div className="bg-background/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Classes available on {formatDate(selectedDate)}</h3>
            <div className="text-sm text-muted-foreground">
              {availableClasses.length} found
            </div>
          </div>
          {loadingSchedules ? (
            <div className="text-muted-foreground">Loading schedules...</div>
          ) : availableClasses.length === 0 ? (
            <div className="text-muted-foreground">
              No classes scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {availableClasses.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-md border border-blue-500 night:border-primary bg-primary  transition cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {s.class_name}
                    </div>
                    <div className="text-xs text-white ">
                      {s.start_time} — {s.end_time} • {s.room ?? "-"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenForSchedule(s)}
                    className="px-3 py-1 bg-white text-black rounded cursor-pointer transition-transform duration-200 hover:scale-105"
                  >
                    Take attendance
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submitted Attendance */}
        <div className="bg-background/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">
              Submitted on {formatDate(selectedDate)}
            </h3>
            <div className="text-sm text-muted-foreground">
              {submittedBySchedule.size} batches
            </div>
          </div>
          {loadingAttendances ? (
            <div className="text-muted-foreground">Loading attendance...</div>
          ) : submittedBySchedule.size === 0 ? (
            <div className="text-muted-foreground">No submissions yet.</div>
          ) : (
            <div className="space-y-3">
              {Array.from(submittedBySchedule.entries()).map(
                ([schedule_id, records]) => {
                  const schedule = schedules.find((s) => s.id === schedule_id);
                  return (
                    <div
                      key={schedule_id}
                      className="flex items-center justify-between p-3 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {schedule?.class_name ?? `Schedule ${schedule_id}`}
                        </div>
                        <div className="text-xs text-foreground">
                          {records.length} records
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (schedule) {
                            setOpenModal({ schedule, mode: "edit" });
                            fetchAttendancesBySchedule(schedule.id);
                          } else toast.error("Schedule info missing.");
                        }}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      <StudentsAttendanceModal
        open={!!openModal}
        onClose={() => setOpenModal(null)}
        modalData={openModal}
        date={selectedDate}
        onSubmitted={async () => {
          await fetchAttendances();
        }}
      />
    </div>
  );
}
