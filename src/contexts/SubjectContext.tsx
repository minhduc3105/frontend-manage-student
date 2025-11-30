"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  Subject,
  SubjectCreate,
  SubjectUpdate,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../services/api/subject";

interface SubjectsContextType {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: () => Promise<void>;
  addSubject: (data: SubjectCreate) => Promise<Subject>;
  editSubject: (id: number, data: SubjectUpdate) => Promise<Subject>;
  removeSubject: (id: number) => Promise<void>;
}

const SubjectsContext = createContext<SubjectsContextType | null>(null);

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async (data: SubjectCreate) => {
    try {
      const newSubject = await createSubject(data);
      setSubjects((prev) => [...prev, newSubject]);
      return newSubject;
    } catch (err: any) {
      throw new Error(err.message || "Không thể tạo môn học");
    }
  };

  const editSubject = async (id: number, data: SubjectUpdate) => {
    try {
      const updated = await updateSubject(id, data);
      setSubjects((prev) =>
        prev.map((s) => (s.subject_id === id ? updated : s))
      );
      return updated;
    } catch (err: any) {
      throw new Error(err.message || "Không thể cập nhật môn học");
    }
  };

  const removeSubject = async (id: number) => {
    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.subject_id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Không thể xóa môn học");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <SubjectsContext.Provider
      value={{
        subjects,
        loading,
        error,
        fetchSubjects,
        addSubject,
        editSubject,
        removeSubject,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
};

export const useSubjects = (): SubjectsContextType => {
  const context = useContext(SubjectsContext);
  if (!context)
    throw new Error("useSubjects must be used within <SubjectsProvider>");
  return context;
};
