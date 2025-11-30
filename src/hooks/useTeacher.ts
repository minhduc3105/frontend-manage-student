"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";  
import {
  Teacher,
  TeacherCreate,
  TeacherUpdate,
  ClassTaught,
  TeacherStats,
  getAllTeachers,
  getTeacherByUserId,
  getTeacherStats,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getClassesByTeacherId,
} from "../services/api/teacher";

export function useTeacher() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // helper để vừa setError vừa toast
  const handleError = (message: string, err?: any) => {
    console.error(message, err);
    setError(message);
    toast.error(message); 
  };

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (err) {
      handleError("Failed to fetch teachers", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeacherDetails = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const data = await getTeacherByUserId(userId);
      return data;
    } catch (err) {
      handleError(`Failed to fetch teacher with ID ${userId}`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacherStats = useCallback(async (teacherUserId: number) => {
    setLoading(true);
    try {
      const stats = await getTeacherStats(teacherUserId);
      setTeacherStats(stats);
      return stats;
    } catch (err) {
      handleError(`Failed to fetch stats for teacher ID ${teacherUserId}`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClassesTaught = useCallback(async (teacherUserId: number): Promise<ClassTaught[] | null> => {
    setLoading(true);
    try {
      const classes = await getClassesByTeacherId(teacherUserId);
      return classes;
    } catch (err) {
      handleError(`Failed to fetch classes for teacher ID ${teacherUserId}`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTeacher = async (payload: TeacherCreate) => {
    setLoading(true);
    try {
      const newTeacher = await createTeacher(payload);
      setTeachers((prev) => [...prev, newTeacher]);
      toast.success("Teacher created successfully ✅");
    } catch (err) {
      handleError("Failed to create teacher", err);
    } finally {
      setLoading(false);
    }
  };

  const editTeacher = async (userId: number, payload: TeacherUpdate) => {
    setLoading(true);
    try {
      const updated = await updateTeacher(userId, payload);
      setTeachers((prev) => prev.map((t) => (t.user_id === userId ? updated : t)));
      toast.success("Teacher updated successfully ✅");
    } catch (err) {
      handleError("Failed to update teacher", err);
    } finally {
      setLoading(false);
    }
  };

  const removeTeacher = async (userId: number) => {
    setLoading(true);
    try {
      await deleteTeacher(userId);
      setTeachers((prev) => prev.filter((t) => t.user_id !== userId));
      toast.success("Teacher deleted successfully 🗑️");
    } catch (err) {
      handleError("Failed to delete teacher", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    loading,
    error,
    teacherStats,
    fetchTeachers,
    getTeacherDetails,
    fetchClassesTaught,
    fetchTeacherStats,
    addTeacher,
    editTeacher,
    removeTeacher,
  };
}
