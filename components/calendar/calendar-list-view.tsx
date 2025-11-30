"use client";

import { useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Users, Search } from "lucide-react";
import { BaseCard } from "../ui/base-card";
import { BaseButton } from "../ui/base-button";
import { cn } from "../../src/lib/utils";

/* ---------- helpers ---------- */
const parseYMD = (s?: string) => {
  if (!s) return null;
  // accept dd/mm/yyyy or yyyy-mm-dd
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

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface ScheduleItem {
  id?: string;
  start?: string;
  end?: string;
  title?: string;
  room?: string;
  subject?: string;
  students?: number;
  color?: string;
  date?: string; // dd/mm/yyyy or yyyy-mm-dd (api could give either)
}

interface CalendarListViewProps {
  schedules: ScheduleItem[];
  onEventClick?: (event: ScheduleItem) => void;
}

export function CalendarListView({ schedules, onEventClick }: CalendarListViewProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [searchTerm, setSearchTerm] = useState("");

  // normalize & group by date (use schedule.date; do NOT generate artificial dates)
  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const s of schedules) {
      const parsed = parseYMD(s.date);
      if (!parsed) continue; // ignore entries with no valid date
      const key = toYMD(parsed);
      const arr = map.get(key) ?? [];
      // avoid duplicates by id+date
      const already = arr.some((x) => (x.id ?? "") === (s.id ?? "") && toYMD(parseYMD(x.date) ?? new Date()) === key);
      if (!already) arr.push({ ...s, date: key });
      map.set(key, arr);
    }

    // convert to sorted array of [date, items]
    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted;
  }, [schedules]);

  // apply search + filter
  const filteredGrouped = useMemo(() => {
    if (grouped.length === 0) return [] as [string, ScheduleItem[]][];
    const out: [string, ScheduleItem[]][] = [];
    for (const [date, arr] of grouped) {
      const filtered = arr.filter((schedule) => {
        const matchesSearch =
          !searchTerm ||
          schedule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.room?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
      if (filtered.length > 0) out.push([date, filtered.sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""))]);
    }
    return out;
  }, [grouped, searchTerm]);

  const todayYmd = toYMD(new Date());
  const formatDateLabel = (dateStr: string) => {
    const d = parseYMD(dateStr) ?? new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">List View</h2>
          <p className="text-muted-foreground">{viewMode === "week" ? "This week's" : "This month's"} schedule overview</p>
        </div>

        <div className="flex items-center gap-2">
          <BaseButton variant={viewMode === "week" ? "primary" : "outline"} size="sm" onClick={() => setViewMode("week")}>
            Week
          </BaseButton>
          <BaseButton variant={viewMode === "month" ? "primary" : "outline"} size="sm" onClick={() => setViewMode("month")}>
            Month
          </BaseButton>
        </div>
      </div>

      {/* Filters */}
      <BaseCard variant="glass" className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search classes, subjects, or rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </BaseCard>

      {/* Schedule List */}
      <div className="space-y-6">
        {filteredGrouped.map(([date, daySchedules]) => {
          const isToday = date === todayYmd;
          return (
            <div key={date}>
              <div className={cn("flex items-center gap-3 mb-4", isToday ? "bg-primary/5 p-2 rounded" : "")}>
                <Calendar className={cn("h-5 w-5", isToday ? "text-primary" : "text-primary/70")} />
                <h3 className={cn("text-lg font-semibold", isToday ? "text-primary" : "")}>{formatDateLabel(date)}</h3>
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">
                  {daySchedules.length} {daySchedules.length === 1 ? "class" : "classes"}
                </span>
              </div>

              <div className="grid gap-3">
                {daySchedules.map((schedule, index) => {
                  const colors = [
                    "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
                    "border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20",
                    "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
                    "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20",
                    "border-l-pink-500 bg-pink-50/50 dark:bg-pink-950/20",
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <BaseCard
                      key={`${schedule.id ?? index}-${date}`}
                      className={cn(
                        "p-4 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                        colorClass,
                      )}
                      onClick={() => onEventClick?.(schedule)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{schedule.title}</h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {schedule.start} - {schedule.end}
                              </span>
                            </div>

                            {schedule.room && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{schedule.room}</span>
                              </div>
                            )}

                            {schedule.students && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{schedule.students} students</span>
                              </div>
                            )}
                          </div>

                          {schedule.subject && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {schedule.subject}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {parseYMD(date)?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {parseYMD(date)?.toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                        </div>
                      </div>
                    </BaseCard>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredGrouped.length === 0 && (
          <BaseCard className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No classes found</h3>
            <p className="text-muted-foreground">{searchTerm ? "Try adjusting your search or filter criteria." : "No classes scheduled for this period."}</p>
          </BaseCard>
        )}
      </div>
    </div>
  );
}
