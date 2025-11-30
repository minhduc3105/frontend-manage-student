"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface CreateModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  widthClass?: string; // mặc định w-96, có thể truyền w-[600px], w-[800px]...
}

export function CreateModalBase({
  isOpen,
  onClose,
  title,
  children,
  widthClass = "w-96",
}: CreateModalBaseProps) {
  if (!isOpen) return null;

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
        className={`bg-background rounded-lg shadow-xl p-6 text-foreground relative cursor-default ${widthClass}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {/* Nút đóng */}
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tiêu đề */}
        {title && (
          <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
        )}

        {children}
      </motion.div>
    </motion.div>
  );
}
export default CreateModalBase;