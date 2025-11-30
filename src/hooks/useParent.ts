import { useEffect, useState, useCallback } from "react";
import {
  Parent,
  ParentCreate,
  ParentUpdate,
  Child,
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getParentChildren
} from "../services/api/parent"; 

export function useParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      setParents(await getParents());
    } catch (err: any) {
      setError("Failed to fetch parents");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParentChildren = useCallback(async (parentUserId: number) => {
    setLoading(true);
    try {
      const data = await getParentChildren(parentUserId);
      setChildren(data);
      return data;
    } catch (err: any) {
      setError(`Failed to fetch children for parent ID ${parentUserId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => { fetchParents(); }, [fetchParents]);

  const getParentDetails = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const data = await getParentById(userId);
      return data;
    } catch (err) {
      console.error(`Failed to fetch parent with ID ${userId}:`, err);
      setError(`Failed to fetch parent with ID ${userId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addParent = async (payload: ParentCreate) => {
    setLoading(true);
    try {
      const newParent = await createParent(payload);
      setParents(prev => [...prev, newParent]);
    } catch (err) {
      console.error("Failed to create parent:", err);
      setError("Failed to create parent");
    } finally {
      setLoading(false);
    }
  };

  const editParent = async (userId: number, payload: ParentUpdate) => {
    setLoading(true);
    try {
      const updated = await updateParent(userId, payload);
      setParents(prev => prev.map(p => (p.user_id === userId ? updated : p)));
    } catch (err) {
      console.error("Failed to update parent:", err);
      setError("Failed to update parent");
    } finally {
      setLoading(false);
    }
  };

  const removeParent = async (userId: number) => {
    setLoading(true);
    try {
      await deleteParent(userId);
      setParents(prev => prev.filter(p => p.user_id !== userId));
    } catch (err) {
      console.error("Failed to delete parent:", err);
      setError("Failed to delete parent");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchParents(); }, [fetchParents]);

  return {
    parents,
    children,
    loading,
    error,
    fetchParents,
    getParentDetails,
    fetchParentChildren,
    addParent,
    editParent,
    removeParent
  };
}