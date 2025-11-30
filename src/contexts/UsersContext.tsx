"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  importUsers,
  updateUserPassword,
  UserViewDetails,
  UserCreate as UserCreateType,
  UserUpdate as UserUpdateType,
  UpdatePasswordRequest,
  ImportUsersResponse,
} from "../services/api/users";
import { useAuth } from "./AuthContext";

// Local (provider) user shape -- keep minimal fields used by consuming components
export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  roles?: string[];
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  getUserDetails: (id: number) => Promise<(UserViewDetails & { roles: string[] }) | null>;
  addUser: (newUser: UserCreateType) => Promise<User | null>;
  editUser: (id: number, data: UserUpdateType) => Promise<User | null>;
  updatePassword: (id: number, data: UpdatePasswordRequest) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  importFromFile: (file: File) => Promise<ImportUsersResponse | null>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

/**
 * Helper: normalize user object so UI can always use `.roles: string[]`
 * The API sometimes returns `roles` and sometimes `user_roles`. This makes them consistent.
 * Also handles:
 * - roles: string ("manager,teacher")
 * - roles: array of objects like [{ name: 'manager' }] or [{ role: 'teacher' }]
 */
const normalizeUser = (u: any) => {
  if (!u) return u;

  const extractNamesFromArray = (arr: any[]) =>
    arr
      .map((it) => {
        if (!it) return null;
        if (typeof it === "string") return it;
        if (typeof it === "object") {
          return (it.name ?? it.role ?? it.role_name ?? it.key ?? null);
        }
        return null;
      })
      .filter(Boolean);

  let roles: string[] = [];

  if (Array.isArray(u.roles) && u.roles.length > 0) {
    roles = extractNamesFromArray(u.roles);
  } else if (typeof u.roles === "string" && u.roles.trim()) {
    roles = u.roles.split(",").map((s: string) => s.trim()).filter(Boolean);
  } else if (Array.isArray(u.user_roles) && u.user_roles.length > 0) {
    roles = extractNamesFromArray(u.user_roles);
  } else if (typeof u.user_roles === "string" && u.user_roles.trim()) {
    roles = u.user_roles.split(",").map((s: string) => s.trim()).filter(Boolean);
  } else {
    roles = [];
  }

  return { ...u, roles };
};

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // auth guard and helpers from AuthContext
  const {
    loading: authLoading,
    isAuthenticated,
    refresh,
    user: authUser,
    setAuthUser,
  } = useAuth();

  // Fetch all users (safe only when authenticated)
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const res = await getUsers();
      // Normalize roles để tránh undefined
      const normalized = (res ?? []).map((u: any) => normalizeUser(u));
      setUsers(normalized);
    } catch (err: any) {
      console.error("fetchUsers error:", err);
      setError(err?.message || "Failed to fetch users");
      toast.error("Không thể tải danh sách users ❌");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get user details by id (no state change, returns data)
  const getUserDetails = useCallback(
    async (id: number) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để xem thông tin user.");
        return null;
      }
      setLoading(true);
      try {
        const res = await getUserById(id);
        // normalize before returning
        const normalized = normalizeUser(res);
        return normalized as UserViewDetails & { roles: string[] };
      } catch (err: any) {
        console.error("getUserDetails error:", err);
        setError(err?.message || "Failed to fetch user details");
        toast.error("Không thể tải thông tin user ❌");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Create user
  const addUser = useCallback(
    async (newUser: UserCreateType) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      setLoading(true);
      try {
        const res = await createUser(newUser);
        const normalized = normalizeUser(res);
        setUsers((prev) => [...prev, normalized]);
        toast.success("Thêm user thành công 🎉");
        return normalized;
      } catch (err: any) {
        console.error("addUser error:", err);
        setError(err?.message || "Failed to create user");
        toast.error("Thêm user thất bại ❌");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Update user
  const editUser = useCallback(
    async (id: number, data: UserUpdateType) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      setLoading(true);
      try {
        // remember previous roles from current state (if any)
        const existing = users.find((u) => u.user_id === id);
        const previousRoles = Array.isArray(existing?.roles) ? existing!.roles! : [];

        const res = await updateUser(id, data);
        const normalized = normalizeUser(res);

        // Determine final roles: prefer API-provided if non-empty, otherwise keep previous
        const finalRoles = (Array.isArray(normalized?.roles) && normalized.roles.length > 0)
          ? normalized.roles
          : previousRoles;

        const finalNormalized = { ...normalized, roles: finalRoles };

        // Update local users list (merge/replace)
        setUsers((prev) => {
          const found = prev.some((u) => u.user_id === id);
          if (found) {
            return prev.map((u) => (u.user_id === id ? finalNormalized : u));
          }
          // if not found, append
          return [...prev, finalNormalized as any];
        });

        // If updated user is the currently authenticated user, update AuthContext immediately
        try {
          if (authUser && authUser.user_id === finalNormalized.user_id) {
            if (typeof setAuthUser === "function") {
              setAuthUser(finalNormalized as any);
            } else if (typeof refresh === "function") {
              // fallback
              await refresh();
            }
          } else {
            // Optionally: refetch list for full sync
            // await fetchUsers();
          }
        } catch (innerErr) {
          console.warn("Failed to sync auth user after edit:", innerErr);
        }

        toast.success("Cập nhật user thành công ✅");
        return finalNormalized;
      } catch (err: any) {
        console.error("editUser error:", err);
        setError(err?.message || "Failed to update user");
        toast.error("Cập nhật user thất bại ❌");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, authUser, refresh, setAuthUser, users]
  );

  // Update password
  const updatePassword = useCallback(
    async (id: number, data: UpdatePasswordRequest) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      setLoading(true);
      try {
        await updateUserPassword(id, data);
        toast.success("Cập nhật mật khẩu thành công ✅");
      } catch (err: any) {
        console.error("updatePassword error:", err);
        setError(err?.message || "Failed to update password");
        toast.error("Cập nhật mật khẩu thất bại ❌");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Delete user
  const removeUser = useCallback(
    async (id: number) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      setLoading(true);
      try {
        await deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
        toast.success("Xóa user thành công 🗑️");
      } catch (err: any) {
        console.error("removeUser error:", err);
        setError(err?.message || "Failed to delete user");
        toast.error("Xóa user thất bại ❌");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Import users from file
  const importFromFile = useCallback(
    async (file: File): Promise<ImportUsersResponse | null> => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        return null;
      }
      setLoading(true);
      try {
        const res = await importUsers(file);
        const importedCount = res?.imported ? Object.keys(res.imported).length : 0;

        if (importedCount > 0) {
          try {
            await fetchUsers();
          } catch (e) {
            console.warn("fetchUsers failed after import:", e);
          }
          toast.success(`Import thành công (${importedCount} user)! 🎉`);
        } else {
          toast.error("Import thành công nhưng không có user mới ⚠️");
        }

        return res;
      } catch (err: any) {
        console.error("importFromFile error:", err);
        setError(err?.message || "Failed to import users");
        toast.error("Import users thất bại ❌");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers, isAuthenticated]
  );

  // ---------- AUTH GUARD: fetch users when auth ready ----------
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setUsers([]);
      setError(null);
      setLoading(false);
      return;
    }
    void fetchUsers();
  }, [authLoading, isAuthenticated, fetchUsers]);

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        getUserDetails,
        addUser,
        editUser,
        updatePassword,
        removeUser,
        importFromFile,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within a UsersProvider");
  return context;
};
