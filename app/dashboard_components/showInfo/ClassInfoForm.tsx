"use client";

import { Input } from "../../../components/ui/input";
import { Class } from "../../../src/services/api/class";
import { BookOpen, User, Users, DollarSign } from "lucide-react";

interface ClassInfoFormProps {
  data: Class;
  onInputChange: (field: string, value: string | number) => void;
  disabled?: boolean;
}

export function ClassInfoForm({ data, onInputChange, disabled }: ClassInfoFormProps) {
  const inputClasses = `w-48 ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
    ${disabled ? "cursor-not-allowed bg-gray-100 text-muted-foreground" : "bg-background text-foreground"}`;

  return (
    <div className="space-y-5 bg-background p-6 rounded-lg shadow-md">
      {/* Class Name */}
      <div className="flex items-center">
        <div className="flex items-center w-40 shrink-0 text-foreground font-medium">
          <BookOpen className="h-5 w-5 text-cyan-600 mr-2" />
          Class Name
        </div>
        <Input
          type="text"
          value={data.class_name}
          onChange={(e) => onInputChange("class_name", e.target.value)}
          disabled={disabled}
          className={inputClasses}
        />
      </div>

      {/* Teacher */}
      <div className="flex items-center">
        <div className="flex items-center w-40 shrink-0 text-foreground font-medium">
          <User className="h-5 w-5 text-orange-600 mr-2" />
          Teacher
        </div>
        <span className="ml-4 text-foreground">{data.teacher_name}</span>
      </div>

      {/* Capacity */}
      <div className="flex items-center">
        <div className="flex items-center w-40 shrink-0 text-foreground font-medium">
          <Users className="h-5 w-5 text-green-600 mr-2" />
          Capacity
        </div>
        <Input
          type="number"
          value={data.capacity}
          onChange={(e) => onInputChange("capacity", Number(e.target.value))}
          disabled={disabled}
          className={inputClasses}
        />
      </div>

      {/* Fee */}
      <div className="flex items-center">
        <div className="flex items-center w-40 shrink-0 text-foreground font-medium">
          <DollarSign className="h-5 w-5 text-red-600 mr-2" />
          Fee
        </div>
        <Input
          type="number"
          value={data.fee}
          onChange={(e) => onInputChange("fee", Number(e.target.value))}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
    </div>
  );
}
