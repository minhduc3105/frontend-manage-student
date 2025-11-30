"use client";

import { useState, ChangeEvent } from "react";
import { X, User as UserIcon, Calendar, DollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../../../components/ui/input";
import { useUsers, User } from "../../../src/contexts/UsersContext";
import { useTuitions } from "../../../src/hooks/useTuition"; 

interface CreateTuitionFormProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export function CreateTuitionForm({
  onClose,
  onCreated,
}: CreateTuitionFormProps) {
  const { users, loading } = useUsers();
  const { addTuition } = useTuitions(); 

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [term, setTerm] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [amountValue, setAmountValue] = useState(0);

  const [dueDate, setDueDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Filter only students
  const students: User[] = users.filter((user) =>
    user.roles?.includes("student")
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

  const handleCreateTuition = async () => {
    if (!selectedStudentId || !term || !amountValue || !dueDate) {
      setErrorMessage("Vui lòng điền đầy đủ các trường.");
      return;
    }
    
    // Xóa thông báo lỗi cũ
    setErrorMessage("");

    try {
      const tuitionPayload = {
        student_user_id: Number(selectedStudentId),
        amount: amountValue,
        term: Number(term),
        due_date: dueDate,
      };

      // ✅ Gọi hàm addTuition từ hook (có tích hợp toast)
      const createdTuition = await addTuition(tuitionPayload);

      // addTuition trả về đối tượng nếu thành công, hoặc null nếu thất bại
      if (createdTuition) {
        onClose(); // Đóng form
        await onCreated(); // Cập nhật danh sách bên ngoài
      }
      // KHÔNG cần xử lý lỗi ở đây, vì addTuition đã hiển thị toast.error và set state error.
      
    } catch (error) {
      // Bắt lỗi ngoài tầm kiểm soát của hook (nếu có)
      console.error("An unexpected error occurred:", error);
      // setErrorMessage("Đã xảy ra lỗi không mong muốn."); // Có thể bật lại nếu cần thông báo cục bộ
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-red-600 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-center text-foreground">
          Create New Tuition
        </h2>

        <div className="space-y-4">
          {/* Student Select */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-foreground font-medium mb-1">
              <UserIcon className="w-4 h-4 text-blue-500" />
              Student
            </label>
            {loading ? (
              <p className="text-muted-foreground">Loading student list...</p>
            ) : (
              <select
                aria-label="Select student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="border border-blue-400 rounded-md p-2 cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select student --</option>
                {students.map((student: User) => (
                  <option key={student.user_id} value={student.user_id}>
                    {`ID: ${student.user_id} - ${student.full_name} (${student.email})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Term Input */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-foreground font-medium mb-1">
              <Calendar className="w-4 h-4 text-green-500" />
              Term
            </label>
            <Input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full border border-green-400"
            />
          </div>

          {/* Amount Input */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-foreground font-medium mb-1">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              Amount
            </label>
            <Input
              type="text"
              value={amountDisplay}
              onChange={(e) =>
                handleNumberInput(e, setAmountDisplay, setAmountValue)
              }
              onBlur={() => handleFormatOnBlur(amountDisplay, setAmountDisplay)}
              className="w-full border border-yellow-400"
            />
          </div>

          {/* Due Date Input */}
          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-foreground font-medium mb-1">
              <Clock className="w-4 h-4 text-red-500" />
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-red-400"
            />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-600 text-sm mt-4 text-center">
            {errorMessage}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleCreateTuition}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer"
          >
            Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}