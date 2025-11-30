"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-background rounded-xl shadow-2xl max-w-sm w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Căn giữa tiêu đề */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {/* Thêm flex-grow và text-center cho tiêu đề để căn giữa nó trong không gian */}
              <h3 className="text-xl font-bold text-foreground flex-grow text-center">
                Confirm Action
              </h3>
              <button
                onClick={onCancel}
                className="absolute right-4 top-4 text-muted-foreground hover:text-muted-foreground transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung modal: Thêm text-center để căn giữa chữ */}
            <div className="p-6 text-center">
              <p className="text-foreground text-base leading-relaxed font-semibold">{message}</p>
            </div>

            {/* Footer và các nút hành động: Thay justify-end thành justify-center */}
            <div className="flex justify-center gap-3 p-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
              {/* Nút Hủy */}
              <button
                onClick={onCancel}
                className="px-5 py-2 text-sm font-medium text-foreground bg-background border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              {/* Nút Xác nhận */}
              <button
                onClick={onConfirm}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}