"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
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

interface CalendarDayViewProps {
  schedules: ScheduleItem[];
  onEventClick?: (event: ScheduleItem) => void;
  /**
   * Optional date (yyyy-mm-dd). If provided, the view will show that date.
   */
  date?: string;
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

const normTime = (t?: string) => {
  if (!t) return undefined;
  const parts = t.split(":");
  if (parts.length >= 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  return t;
};

/* ----- component ----- */
export function CalendarDayView({ schedules, onEventClick, date }: CalendarDayViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // if parent passes date prop, sync currentDate
  useEffect(() => {
    if (date) {
      const parsed = parseYMD(date);
      if (parsed) setCurrentDate(parsed);
    }
  }, [date]);

  const timeSlots: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getScheduleDateYmd = (s: ScheduleItem) => {
    if (!s.date) return undefined;
    const parsed = parseYMD(s.date);
    return parsed ? toYMD(parsed) : undefined;
  };

  const eventsForDay = schedules.filter((s) => getScheduleDateYmd(s) === toYMD(currentDate));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Day View</h2>
          <p className="text-muted-foreground">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BaseButton variant="outline" size="sm" onClick={() => navigateDay("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={() => navigateDay("next")}>
            <ChevronRight className="h-4 w-4" />
          </BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <BaseCard variant="glass" className="overflow-hidden">
            <div className="flex">
              {/* Time column */}
              <div className="w-20 border-r border-border/50">
                {Array.from({ length: 17 }, (_, i) => i + 6).map((hour) => (
                  <div key={hour} className="h-16 p-2 text-xs text-muted-foreground border-b border-border/20">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Events column */}
              <div className="flex-1 relative">
                {/* Time grid lines */}
                {Array.from({ length: 17 }, (_, i) => i + 6).map((hour) => (
                  <div key={hour} className="h-16 border-b border-border/20" />
                ))}

                {/* Events */}
                <div className="absolute inset-0 p-2">
                  {eventsForDay.map((event, index) => {
                    const startHour = Number.parseInt((normTime(event.start) ?? "09:00").split(":")[0]);
                    const startMin = Number.parseInt((normTime(event.start) ?? "09:00").split(":")[1]);
                    const endHour = Number.parseInt((normTime(event.end) ?? "10:00").split(":")[0]);
                    const endMin = Number.parseInt((normTime(event.end) ?? "10:00").split(":")[1]);

                    const startMinutes = (startHour - 6) * 60 + startMin;
                    const duration = endHour * 60 + endMin - (startHour * 60 + startMin);

                    const colors = [
                      "from-blue-500 to-blue-600",
                      "from-purple-500 to-purple-600",
                      "from-green-500 to-green-600",
                      "from-orange-500 to-orange-600",
                      "from-pink-500 to-pink-600",
                    ];
                    const colorClass = colors[index % colors.length];

                    return (
                      <div
                        key={index + "-" + (event.id ?? index)}
                        className={cn(
                          "absolute left-2 right-2 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                          `bg-gradient-to-br ${colorClass} text-white`,
                        )}
                        style={{
                          top: `${(startMinutes / 60) * 64}px`,
                          height: `${(duration / 60) * 64}px`,
                        }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="font-semibold text-sm mb-1">{event.title}</div>
                        <div className="text-xs opacity-90 flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          {normTime(event.start)} - {normTime(event.end)}
                        </div>
                        {event.room && (
                          <div className="text-xs opacity-90 flex items-center gap-1 mb-1">
                            <MapPin className="h-3 w-3" />
                            {event.room}
                          </div>
                        )}
                        {event.students && (
                          <div className="text-xs opacity-90 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.students} students
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <BaseCard variant="glass" className="p-4">
            <h3 className="font-semibold mb-3">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Classes</span>
                <span className="font-medium">{eventsForDay.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Teaching Hours</span>
                <span className="font-medium">
                  {eventsForDay.reduce((total, event) => {
                    const s = normTime(event.start ?? "00:00")!.split(":").map(Number);
                    const e = normTime(event.end ?? "00:00")!.split(":").map(Number);
                    const hours = e[0] - s[0] + (e[1] - s[1]) / 60;
                    return total + hours;
                  }, 0)}
                  h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students</span>
                <span className="font-medium">{eventsForDay.reduce((total, event) => total + (event.students || 0), 0)}</span>
              </div>
            </div>
          </BaseCard>

          <BaseCard variant="glass" className="p-4">
            <h3 className="font-semibold mb-3">Upcoming Classes</h3>
            <div className="space-y-2">
              {eventsForDay.slice(0, 3).map((event, index) => (
                <div key={index} className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {normTime(event.start)} - {normTime(event.end)}
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  );
}
