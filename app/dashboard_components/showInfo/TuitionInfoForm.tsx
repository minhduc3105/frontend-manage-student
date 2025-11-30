"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Tuition } from "../../../src/services/api/tuition";
import { User, Calendar, DollarSign, CheckCircle, BookOpen } from "lucide-react";

interface TuitionInfoFormProps {
  data: Tuition;
  onInputChange: (field: string, value: string | number) => void;
  canEdit?: boolean; // ✅ đổi từ disabled -> canEdit
}

// helper chuyển ngày
const toISODate = (dmy: string) => {
  if (!dmy || !dmy.includes("/")) return dmy;
  const [d, m, y] = dmy.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};
const fromISODate = (iso: string) => iso;

export function TuitionInfoForm({ data, onInputChange, canEdit = false }: TuitionInfoFormProps) {
  const [amountDisplay, setAmountDisplay] = useState<string>(
    data.amount?.toLocaleString("en-US") || ""
  );

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(rawValue) || rawValue === "") {
      setAmountDisplay(rawValue);
      onInputChange("amount", Number(rawValue || 0));
    }
  };

  const handleAmountBlur = () => {
    const rawValue = amountDisplay.replace(/,/g, "");
    const numValue = Number(rawValue);
    if (!isNaN(numValue) && numValue > 0) {
      setAmountDisplay(numValue.toLocaleString("en-US"));
    } else {
      setAmountDisplay("");
      onInputChange("amount", 0);
    }
  };

  const inputClasses = `w-48 text-center px-3 py-2 border border-gray-300 rounded-lg
    ${canEdit ? "bg-background text-foreground focus:ring-2 focus:ring-cyan-500" : "bg-gray-50 text-foreground cursor-default"}`;

  const labelClasses = "flex items-center w-32 shrink-0 text-foreground font-medium";

  return (
    <div className="space-y-5 bg-background p-6 rounded-lg shadow-md">
      {/* Student */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <User className="h-5 w-5 text-cyan-600 mr-2" /> Student
        </div>
        <span className="w-48 text-center text-foreground">{data.student}</span>
      </div>

      {/* Term */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <BookOpen className="h-5 w-5 text-orange-600 mr-2" /> Term
        </div>
        <Input
          type="number"
          value={data.term}
          onChange={(e) => onInputChange("term", Number(e.target.value))}
          readOnly={!canEdit} // ✅ thay disabled
          className={inputClasses}
        />
      </div>

      {/* Amount */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <DollarSign className="h-5 w-5 text-green-600 mr-2" /> Amount
        </div>
        <Input
          type="text"
          value={amountDisplay}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          readOnly={!canEdit} // ✅ thay disabled
          className={inputClasses}
        />
      </div>

      {/* Status */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <CheckCircle className="h-5 w-5 text-teal-600 mr-2" /> Status
        </div>
        <select
          value={data.status}
          onChange={(e) => onInputChange("status", e.target.value)}
          className={`${inputClasses} ${!canEdit ? "pointer-events-none" : ""}`}
          aria-label="Select status"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Due date */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <Calendar className="h-5 w-5 text-purple-600 mr-2" /> Due date
        </div>
        <Input
          type="date"
          value={data.due_date ? toISODate(data.due_date) : ""}
          onChange={(e) => onInputChange("due_date", fromISODate(e.target.value))}
          readOnly={!canEdit} // ✅ thay disabled
          className={inputClasses}
        />
      </div>
    </div>
  );
}
