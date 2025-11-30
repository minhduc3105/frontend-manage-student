"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { BaseCard } from "../ui/base-card";
import { BaseButton } from "../ui/base-button";
import { cn } from "../../src/lib/utils";

interface ScheduleItem {
  id?: string;
  date?: string; // yyyy-mm-dd
  start?: string;
  end?: string;
  title?: string;
  room?: string;
  subject?: string;
  students?: number;
  color?: string;
}

interface CalendarWeekViewProps {
  schedules: ScheduleItem[];
  onEventClick?: (event: ScheduleItem) => void;
  weekStart?: string; // yyyy-mm-dd (optional parent-driven week start)
  onDayClick?: (dateYmd: string) => void; // called when user clicks a header day
}

/* ----- helpers ----- */
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseYMD = (s?: string) => {
  if (!s) return null;
  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length >= 3) {
      const [dd, mm, yy] = parts;
      const y = yy.length === 2 ? `20${yy}` : yy;
      return new Date(Number(y), Number(mm) - 1, Number(dd));
    }
    return null;
  }
  const parts = s.split("-");
  if (parts.length >= 3) {
    const [y, m, d] = parts;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return null;
};

const addDays = (d: Date, days: number) => {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
};

const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  // Điều chỉnh để tuần bắt đầu từ Thứ Hai (1)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(d, diffToMonday);
};

// Hàm lấy giờ từ chuỗi "HH:MM"
const getHour = (timeString?: string) => {
  if (!timeString) return null;
  const parts = timeString.split(":");
  return parts.length > 0 ? Number(parts[0]) : null;
};

/* ----- component ----- */
export function CalendarWeekView({ schedules, onEventClick, weekStart, onDayClick }: CalendarWeekViewProps) {
  // Biến cố định cho chiều cao: 45px/giờ
  const PX_PER_HOUR = 45;
  // Giờ mặc định nếu không có lịch (06:00)
  const DEFAULT_START_HOUR = 6;
  // Giờ mặc định nếu không có lịch (22:00)
  const DEFAULT_END_HOUR = 22;

  const [currentWeek, setCurrentWeek] = useState<Date>(() => getStartOfWeek(new Date()));

  // if parent provides weekStart, sync to that week
  useEffect(() => {
    if (weekStart) {
      const parsed = parseYMD(weekStart);
      if (parsed) setCurrentWeek(getStartOfWeek(parsed));
    }
  }, [weekStart]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  // normalize schedule.date to yyyy-mm-dd for comparisons
  const getScheduleDateYmd = (s: ScheduleItem) => {
    if (!s.date) return undefined;
    const parsed = parseYMD(s.date);
    return parsed ? toYMD(parsed) : undefined;
  };

  const getEventsForDate = (date: Date) => {
    const ymd = toYMD(date);
    // schedules should already be occurrences with explicit date; match by normalized ymd
    return schedules.filter((sch) => getScheduleDateYmd(sch) === ymd);
  };

  // ----- LOGIC ẨN CỘT GIỜ TRỐNG -----
  const { START_HOUR, END_HOUR } = useMemo(() => {
    // Lấy tất cả các sự kiện trong tuần đang xem
    const eventsInWeek = weekDays.flatMap(getEventsForDate);

    let minEventHour = 24; // Giờ bắt đầu sớm nhất
    let maxEventHour = 0; // Giờ kết thúc muộn nhất

    if (eventsInWeek.length === 0) {
      // Nếu không có lịch, dùng giờ mặc định
      return { START_HOUR: DEFAULT_START_HOUR, END_HOUR: DEFAULT_END_HOUR };
    }

    eventsInWeek.forEach((event) => {
      const startHour = getHour(event.start);
      const endHour = getHour(event.end);

      if (startHour !== null) {
        minEventHour = Math.min(minEventHour, startHour);
      }
      // Dùng giờ của end: "16:00" => 16h, nên cần max(endHour)
      if (endHour !== null) {
        maxEventHour = Math.max(maxEventHour, endHour);
      }
    });

    // Thêm 1 giờ buffer ở đầu và cuối để dễ nhìn hơn
    const finalStartHour = Math.max(0, minEventHour > 24 ? DEFAULT_START_HOUR : minEventHour - 1);
    // Giờ kết thúc là giờ cuối cùng, nên END_HOUR phải bao gồm cả giờ đó.
    const finalEndHour = Math.min(23, maxEventHour < 0 ? DEFAULT_END_HOUR : maxEventHour);

    // Đảm bảo tối thiểu là 4 tiếng hiển thị
    if (finalEndHour - finalStartHour < 4) {
        // Cố gắng mở rộng cả hai phía nếu có thể
        let newEnd = Math.min(23, finalStartHour + 4);
        let newStart = finalStartHour;
        if (newEnd - newStart < 4) {
             newStart = Math.max(0, newEnd - 4);
        }
        return { START_HOUR: newStart, END_HOUR: newEnd };
    }


    // Nếu không có lịch trong tuần, dùng giờ mặc định để lịch luôn có khung giờ cố định
    return { START_HOUR: finalStartHour, END_HOUR: finalEndHour };
  }, [weekDays, schedules]);
  // ------------------------------------

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((cw) => addDays(cw, direction === "next" ? 7 : -7));
  };

  // Sử dụng PX_PER_HOUR = 45
  const getEventTopHeight = (startTime?: string, endTime?: string) => {
    const start = (startTime ?? "09:00").split(":").map(Number);
    const end = (endTime ?? "10:00").split(":").map(Number);
    const startMinutes = start[0] * 60 + (start[1] ?? 0);
    const endMinutes = end[0] * 60 + (end[1] ?? 0);

    // Tính toán vị trí top: (Tổng số phút từ 00:00 - Số phút từ giờ bắt đầu hiển thị) / 60 * PX_PER_HOUR
    // Bắt đầu từ START_HOUR
    const topPx = ((startMinutes - START_HOUR * 60) / 60) * PX_PER_HOUR; // 45px per hour
    
    // Tính toán chiều cao: (Tổng số phút của sự kiện) / 60 * PX_PER_HOUR
    const heightPx = ((endMinutes - startMinutes) / 60) * PX_PER_HOUR;

    return { topPx, heightPx };
  };

  // Tính toán chiều cao tối thiểu cho container lịch
  const calendarMinHeight = (END_HOUR - START_HOUR + 1) * PX_PER_HOUR; // (+1 để bao gồm cả giờ cuối cùng)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1 md:order-2 text-center my-4 md:my-0">
          {/* Căn giữa tiêu đề */}
          <h2 className="text-2xl font-bold text-center mx-auto">Week View</h2>
          <p className="text-muted-foreground text-center">
            {weekDays[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} -{" "}
            {weekDays[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 justify-center md:justify-start md:order-1">
          <BaseButton variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={() => setCurrentWeek(getStartOfWeek(new Date()))}>
            Today
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </BaseButton>
        </div>
        <div className="md:order-3 md:w-20 hidden md:block" /> {/* Dummy div for spacing on the right */}
      </div>
      {/* --- */}

      <BaseCard variant="glass" className="overflow-hidden">
        <div className="grid grid-cols-8 border-b border-border/50">
          <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
          {weekDays.map((day, index) => {
            const ymd = toYMD(day);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={index} className="p-4 text-center border-l border-border/50">
                <button
                  onClick={() => onDayClick?.(ymd)}
                  className="w-full focus:outline-none"
                  aria-label={`Open day ${ymd}`}
                >
                  <div className="text-sm font-medium text-foreground">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div
                    className={cn(
                      "text-lg font-semibold mt-1",
                      isToday ? "text-primary" : "text-foreground" 
                    )}
                  >
                    {day.getDate()}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="relative">
          {/* Cập nhật min-h dựa trên START_HOUR và END_HOUR mới */}
          <div className="grid grid-cols-8" style={{ minHeight: `${calendarMinHeight}px` }}>
            {/* Time column */}
            <div className="border-r border-border/50">
              {timeSlots
                .filter((_, i) => i >= START_HOUR && i <= END_HOUR) // Lọc theo giờ START/END mới
                .map((time) => (
                  // Chiều cao ô thời gian là 45px
                  <div key={time} className="h-[45px] p-2 text-xs text-muted-foreground border-b border-border/20">
                    {time}
                  </div>
                ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="relative border-r border-border/50">
                {/* Time grid lines */}
                {timeSlots
                  .filter((_, i) => i >= START_HOUR && i <= END_HOUR) // Lọc theo giờ START/END mới
                  .map((time) => (
                    // Chiều cao dòng lưới là 45px
                    <div key={time} className="h-[45px] border-b border-border/20" />
                  ))}

                {/* Events */}
                <div className="absolute inset-0 p-1">
                  {getEventsForDate(day).map((event, eventIndex) => {
                    const { topPx, heightPx } = getEventTopHeight(event.start, event.end);
                    const colors = [
                      "from-blue-500 to-blue-600",
                      "from-purple-500 to-purple-600",
                      "from-green-500 to-green-600",
                      "from-orange-500 to-orange-600",
                      "from-pink-500 to-pink-600",
                    ];
                    const colorClass = colors[eventIndex % colors.length];

                    return (
                      <div
                        key={`${dayIndex}-${eventIndex}-${event.id}`}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                          `bg-gradient-to-br ${colorClass} text-white`
                        )}
                        style={{
                          top: `${Math.max(0, topPx) + 8}px`, // +8px là khoảng padding/margin nhẹ
                          height: `${Math.max(24, heightPx - 4)}px`,
                        }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="text-xs font-semibold truncate">{event.title}</div>
                        <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {event.start} - {event.end}
                        </div>
                        {event.room && (
                          <div className="text-xs opacity-90 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.room}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BaseCard>
    </div>
  );
}