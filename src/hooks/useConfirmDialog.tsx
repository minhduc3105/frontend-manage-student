"use client";

import { useState, useCallback, useRef } from "react";

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Dùng ref để lưu callback luôn cập nhật
  const confirmCallbackRef = useRef<() => void>(() => {});

  const openConfirm = useCallback((msg: string, confirmAction: () => void) => {
    setMessage(msg);
    confirmCallbackRef.current = confirmAction; // ✅ luôn cập nhật callback mới
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    confirmCallbackRef.current(); // ✅ gọi hàm mới nhất
    setIsOpen(false);
  }, []);

  const closeConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    message,
    onConfirm: handleConfirm,
    openConfirm,
    closeConfirm,
  };
}
