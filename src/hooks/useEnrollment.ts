// src/hooks/useEnrollment.ts
"use client";

import { useState } from "react";
import {
  createEnrollment,
  updateEnrollment,
  setEnrollmentInactive,
  EnrollmentCreate,
  EnrollmentUpdate,
  getEnrollmentById,
  getEnrollmentsByStudentId,
  getEnrollmentsByClassId,
} from "../services/api/enrollment";

export function useEnrollment() {
  const [loading, setLoading] = useState(false);

  const addEnrollment = async (payload: EnrollmentCreate) => {
    setLoading(true);
    try {
      const newEnrollment = await createEnrollment(payload);
      return newEnrollment;
    } catch (err: any) {
      console.error("Failed to create enrollment:", err);
      const errorMessage = err.message || "Không thể đăng ký lớp học";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const editEnrollment = async (id: number, payload: EnrollmentUpdate) => {
    setLoading(true);
    try {
      await updateEnrollment(id, payload);
      // Logic đã được chuyển về component
    } catch (err: any) {
      console.error("Failed to update enrollment:", err);
      const errorMessage = err.message || "Failed to update enrollment";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeEnrollment = async (studentId: number, classId: number) => {
    setLoading(true);
    try {
      await setEnrollmentInactive(studentId, classId);
      // Logic đã được chuyển về component
    } catch (err: any) {
      console.error("Failed to remove enrollment:", err);
      const errorMessage = err.message || "Failed to remove enrollment";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addEnrollment,
    editEnrollment,
    removeEnrollment,
    getEnrollmentById,
    getEnrollmentsByStudentId,
    getEnrollmentsByClassId,
  };
}