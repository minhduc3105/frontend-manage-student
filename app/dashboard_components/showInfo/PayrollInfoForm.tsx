"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Payroll } from "../../../src/services/api/payroll";
import { Hash, User, Calendar, DollarSign, Gift, Calculator, CheckCircle } from "lucide-react";

interface PayrollInfoFormProps {
  data: Payroll;
  onInputChange: (field: string, value: string | number) => void;
  disabled?: boolean;
}

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || num === 0) return "";
  return num.toLocaleString("en-US");
};

export function PayrollInfoForm({ data, onInputChange, disabled }: PayrollInfoFormProps) {
  const currentMonthValue = data.month ?? new Date(data.sent_at).getMonth() + 1;
  const calculatedTotal = (data.base_salary || 0) + (data.bonus || 0);

  const [baseSalaryDisplay, setBaseSalaryDisplay] = useState<string>(
    formatNumber(data.base_salary)
  );
  const [bonusDisplay, setBonusDisplay] = useState<string>(
    formatNumber(data.bonus)
  );

  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "base_salary" | "bonus",
    setDisplay: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(rawValue) || rawValue === "") {
      setDisplay(rawValue);
      onInputChange(field, Number(rawValue || 0));
    }
  };

  const handleNumberBlur = (
    displayValue: string,
    setDisplay: React.Dispatch<React.SetStateAction<string>>,
    field: "base_salary" | "bonus"
  ) => {
    const rawValue = displayValue.replace(/,/g, "");
    const numValue = Number(rawValue);

    if (!isNaN(numValue) && numValue > 0) {
      setDisplay(numValue.toLocaleString("en-US"));
    } else {
      setDisplay("");
      onInputChange(field, 0);
    }
  };

  const inputClasses = `w-48 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent
    ${disabled ? "cursor-not-allowed bg-gray-100 text-muted-foreground" : "bg-background text-foreground"}`;

  const labelClasses = "flex items-center w-32 shrink-0 text-foreground font-medium";

  return (
    <div className="space-y-5 bg-background p-6 rounded-lg shadow-md">
      {/* ID */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <Hash className="h-5 w-5 text-cyan-600 mr-2" /> ID
        </div>
        <span className="w-48 text-center text-foreground">{data.id}</span>
      </div>

      {/* Teacher */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <User className="h-5 w-5 text-orange-600 mr-2" /> Teacher
        </div>
        <span className="w-48 text-center text-foreground">{data.teacher}</span>
      </div>

      {/* Month */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <Calendar className="h-5 w-5 text-green-600 mr-2" /> Month
        </div>
        <select
          value={currentMonthValue}
          onChange={(e) => onInputChange("month", Number(e.target.value))}
          disabled={disabled}
          className={`${inputClasses}`}
          aria-label="Select month"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Base Salary */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <DollarSign className="h-5 w-5 text-blue-600 mr-2" /> Base Salary
        </div>
        <Input
          type="text"
          value={baseSalaryDisplay}
          onChange={(e) => handleNumberChange(e, "base_salary", setBaseSalaryDisplay)}
          onBlur={() => handleNumberBlur(baseSalaryDisplay, setBaseSalaryDisplay, "base_salary")}
          disabled={disabled}
          className={inputClasses}
        />
      </div>

      {/* Bonus */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <Gift className="h-5 w-5 text-pink-600 mr-2" /> Bonus
        </div>
        <Input
          type="text"
          value={bonusDisplay}
          onChange={(e) => handleNumberChange(e, "bonus", setBonusDisplay)}
          onBlur={() => handleNumberBlur(bonusDisplay, setBonusDisplay, "bonus")}
          disabled={disabled}
          className={inputClasses}
        />
      </div>

      {/* Total */}
      <div className="flex items-center space-x-4">
        <div className={labelClasses}>
          <Calculator className="h-5 w-5 text-purple-600 mr-2" /> Total
        </div>
        <Input
          type="text"
          value={formatNumber(calculatedTotal)}
          readOnly
          className={`${inputClasses} font-semibold`}
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
          disabled={disabled}
          className={inputClasses}
          aria-label="Select status"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>
    </div>
  );
}
