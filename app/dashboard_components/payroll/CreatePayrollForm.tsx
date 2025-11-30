"use client";

import { useState, ChangeEvent } from "react";
import { X, User, Calendar, DollarSign, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../../../components/ui/input";
import { useUsers, User as UserType } from "../../../src/contexts/UsersContext";
import { usePayrolls } from "../../../src/hooks/usePayroll"; 

interface CreatePayrollFormProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export function CreatePayrollForm({
  onClose,
  onCreated,
}: CreatePayrollFormProps) {
  const { users, loading } = useUsers();
  const { addPayroll } = usePayrolls();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [month, setMonth] = useState("");

  const [baseSalaryDisplay, setBaseSalaryDisplay] = useState("");
  const [baseSalaryValue, setBaseSalaryValue] = useState(0);

  const [bonusDisplay, setBonusDisplay] = useState("");
  const [bonusValue, setBonusValue] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");

  // Filter only teachers
  const teachers: UserType[] = users.filter((user) =>
    user.roles?.includes("teacher")
  );

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    setDisplay: (s: string) => void,
    setValue: (n: number) => void
  ) => {
    const raw = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(raw)) {
      setDisplay(raw);
      setValue(Number(raw || 0));
    }
  };

  const handleFormatOnBlur = (
    display: string,
    setDisplay: (s: string) => void
  ) => {
    const raw = display.replace(/,/g, "");
    const numValue = Number(raw || 0);
    if (!isNaN(numValue) && numValue > 0) {
      setDisplay(numValue.toLocaleString("en-US"));
    } else {
      setDisplay("");
    }
  };

  const handleCreatePayroll = async () => {
    if (!selectedTeacherId || !month || !baseSalaryValue) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      await addPayroll({
        teacher_user_id: Number(selectedTeacherId),
        month: Number(month),
        total_base_salary: baseSalaryValue,
        reward_bonus: bonusValue,
        sent_at: new Date().toISOString(),
      });

      onClose();
      await onCreated();
    } catch (error) {
      console.error("Failed to create payroll:", error);
      setErrorMessage("Có lỗi xảy ra khi tạo bảng lương.");
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center">Create new payroll</h2>

        <div className="space-y-4">
          {/* Teacher Select */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
              <User className="h-4 w-4 text-blue-500" />
              Teacher
            </label>
            {loading ? (
              <p className="text-muted-foreground">Loading teachers list...</p>
            ) : (
              <select
                aria-label="Select teacher"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((teacher: UserType) => (
                  <option key={teacher.user_id} value={teacher.user_id}>
                    {`ID: ${teacher.user_id} - ${teacher.full_name} (${teacher.email})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Month Input */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
              <Calendar className="h-4 w-4 text-purple-500" />
              Month
            </label>
            <Input
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              min="1"
              max="12"
            />
          </div>

          {/* Base Salary Input */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total base salary
            </label>
            <Input
              type="text"
              value={baseSalaryDisplay}
              onChange={(e) =>
                handleNumberInput(e, setBaseSalaryDisplay, setBaseSalaryValue)
              }
              onBlur={() =>
                handleFormatOnBlur(baseSalaryDisplay, setBaseSalaryDisplay)
              }
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Bonus Input */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 font-medium mb-1 text-foreground">
              <Gift className="h-4 w-4 text-pink-500" />
              Reward bonus
            </label>
            <Input
              type="text"
              value={bonusDisplay}
              onChange={(e) =>
                handleNumberInput(e, setBonusDisplay, setBonusValue)
              }
              onBlur={() => handleFormatOnBlur(bonusDisplay, setBonusDisplay)}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
        )}

        {/* Action button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleCreatePayroll}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer"
          >
            Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
