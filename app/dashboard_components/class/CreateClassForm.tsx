"use client";

import React, { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { X, User, BookOpen, Users, DollarSign, ClipboardList } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { useUsers, User as UserType } from "../../../src/contexts/UsersContext";
import { useClasses } from "../../../src/contexts/ClassContext";
import { useSubjects } from "../../../src/contexts/SubjectContext";
import { ClassCreate } from "../../../src/services/api/class";

interface CreateClassFormProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export function CreateClassForm({ onClose, onCreated }: CreateClassFormProps) {
  const { users, loading: usersLoading } = useUsers();
  const { addClass } = useClasses();
  const { subjects, loading: subjectsLoading } = useSubjects();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [className, setClassName] = useState("");
  const [capacityDisplay, setCapacityDisplay] = useState("");
  const [capacityValue, setCapacityValue] = useState(0);
  const [feeDisplay, setFeeDisplay] = useState("");
  const [feeValue, setFeeValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // lọc giáo viên từ context users
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

  const handleCreate = async () => {
    if (
      !selectedTeacherId ||
      !selectedSubjectId ||
      !className ||
      !capacityValue ||
      !feeValue
    ) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const payload: ClassCreate = {
        class_name: className,
        teacher_user_id: Number(selectedTeacherId),
        subject_id: selectedSubjectId,
        capacity: capacityValue,
        fee: feeValue,
      };

      await addClass(payload);
      onClose();
      await onCreated();
    } catch (error) {
      console.error("Failed to create class:", error);
      setErrorMessage("Failed to create class.");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 flex justify-center items-center z-50 cursor-pointer bg-black/30"
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
          className="absolute top-4 right-4 text-muted-foreground hover:text-red-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600" />
          Create New Class
        </h2>

        <div className="space-y-4">
          {/* Class name */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Class Name
            </label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full border border-blue-300 focus:border-blue-500"
              placeholder="Enter class name..."
            />
          </div>

          {/* Teacher select */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-green-500" />
              Teacher
            </label>
            {usersLoading ? (
              <p className="text-muted-foreground text-sm">Loading teacher list...</p>
            ) : (
              <select
                aria-label="Chọn giáo viên"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="border border-green-300 focus:border-green-500 rounded-md p-2"
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.user_id} value={teacher.user_id}>
                    {`ID: ${teacher.user_id} - ${teacher.full_name}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subject select */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4 text-purple-500" />
              Subject
            </label>
            {subjectsLoading ? (
              <p className="text-muted-foreground text-sm">Loading subject list...</p>
            ) : (
              <select
                aria-label="Chọn môn học"
                value={selectedSubjectId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedSubjectId(id);
                }}
                className="border border-purple-300 focus:border-purple-500 rounded-md p-2"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Capacity input */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-orange-500" />
              Number of Students
            </label>
            <Input
              type="text"
              value={capacityDisplay}
              onChange={(e) => handleNumberInput(e, setCapacityDisplay, setCapacityValue)}
              onBlur={() => handleFormatOnBlur(capacityDisplay, setCapacityDisplay)}
              className="w-full border border-orange-300 focus:border-orange-500"
              placeholder="Example: 30"
            />
          </div>

          {/* Fee input */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 flex items-center gap-2 text-foreground">
              <DollarSign className="h-4 w-4 text-red-500" />
              Fee
            </label>
            <Input
              type="text"
              value={feeDisplay}
              onChange={(e) => handleNumberInput(e, setFeeDisplay, setFeeValue)}
              onBlur={() => handleFormatOnBlur(feeDisplay, setFeeDisplay)}
              className="w-full border border-red-300 focus:border-red-500"
              placeholder="Example: 1,500,000"
            />
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <p className="text-red-600 text-sm mt-4 text-center">{errorMessage}</p>
        )}

        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Create New Class
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
