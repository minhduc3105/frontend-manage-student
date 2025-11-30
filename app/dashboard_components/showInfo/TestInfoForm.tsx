"use client";

import { Input } from "../../../components/ui/input";
import { Test } from "../../../src/services/api/test";
import { BookOpen, CalendarDays, Star } from "lucide-react";

interface TestInfoFormProps {
  data: Test;
  onInputChange: (field: string, value: string | number | undefined) => void;
  onSave?: () => void; // callback khi nhấn Save
  disabled?: boolean;
}

export function TestInfoForm({ data, onInputChange, disabled }: TestInfoFormProps) {
  /**
   * Hàm chuyển từ DD/MM/YYYY -> YYYY-MM-DD để hiển thị input type=date
   */
  const getIsoDate = () => {
  if (!data.exam_date) return ""; // Nếu undefined => ""
  // Nếu đã có dấu "/" => DD/MM/YYYY
  if (data.exam_date.includes("/")) {
    const parts = data.exam_date.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // Nếu đã là YYYY-MM-DD
  if (data.exam_date.includes("-")) return data.exam_date;
  return "";
};

  return (
    <div className="space-y-4 bg-background text-foreground p-4 rounded-lg border border-gray-200">
      {/* Test name */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <BookOpen className="h-4 w-4 text-blue-500" /> Test name
        </label>
        <Input
          className="border border-gray-300 rounded-md p-2"
          value={data.test_name ?? ""}
          onChange={(e) => onInputChange("test_name", e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Score */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <Star className="h-4 w-4 text-yellow-500" /> Score
        </label>
        <Input
          type="number"
          className="border border-gray-300 rounded-md p-2"
          value={data.score ?? ""}
          onChange={(e) => onInputChange("score", Number(e.target.value))}
          disabled={disabled}
          min={0}
          max={100}
        />
      </div>

      {/* Exam date */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
          <CalendarDays className="h-4 w-4 text-green-500" /> Exam date
        </label>
       <input
          type="date"
          value={getIsoDate()} // Luôn hợp lệ
          onChange={(e) => {
            const [y, m, d] = e.target.value.split("-");
            onInputChange("exam_date", `${d}/${m}/${y}`);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
