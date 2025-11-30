"use client";

import * as React from "react";
import { Users, Filter, Upload } from "lucide-react";
import { useUsers } from "../../../src/contexts/UsersContext";
import ImportUsersModal from "./ImportUsersModal";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";

interface UserManagementProps {
    searchTerm: string;
    updateSearchTerm: (section: string, value: string) => void;
    handleCreateNew: (type: string) => void;
    handleTableRowClick: (type: string, data: any) => void;
}

const ALL_ROLES = ["student", "teacher", "parent", "manager"];

export default function UserManagement({
    searchTerm,
    updateSearchTerm,
    handleCreateNew,
    handleTableRowClick,
}: UserManagementProps) {
    const { users, loading, error } = useUsers();
    const [selectedRole, setSelectedRole] = React.useState<string>("");
    const [showImportModal, setShowImportModal] = React.useState(false);

    const [showRolePopover, setShowRolePopover] = React.useState(false);
    const roleButtonRef = React.useRef<HTMLButtonElement | null>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole ? user.roles?.includes(selectedRole) : true;
        return matchesSearch && matchesRole;
    });

    const capitalizeFirstLetter = (string: string) =>
        string ? string.charAt(0).toUpperCase() + string.slice(1) : "";

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        setShowRolePopover(false);
    };

    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node) && e.target !== roleButtonRef.current) {
                setShowRolePopover(false);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const getPopoverPosition = () => {
        const button = roleButtonRef.current;
        if (!button || !rootRef.current) return { left: 0, top: 0, show: false };
        const buttonRect = button.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        return { left: buttonRect.left - rootRect.left, top: buttonRect.bottom - rootRect.top + 5, show: showRolePopover };
    };

    return (
        // 🎨 SỬA: bg-background -> bg-card (để nó "nổi" trên nền)
        <div className="space-y-6 relative p-4 bg-card rounded-lg shadow-lg" ref={rootRef}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                <div className="flex items-center gap-2">
                    <Button
                        // (Giữ nguyên màu green, vì nó là màu ngữ nghĩa "success" cho Import)
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => setShowImportModal(true)}
                    >
                        <Upload className="w-4 h-4" /> Import from File
                    </Button>
                    <Button
                        // 🎨 SỬA: bg-cyan-500 -> bg-primary, text-white -> text-primary-foreground
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleCreateNew("user")}
                    >
                        Create New User
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search users by Username, Name, or Email..."
                        value={searchTerm}
                        onChange={(e) => updateSearchTerm("user", e.target.value)}
                        // 🎨 SỬA: border-gray-300 -> border-border, focus:ring-cyan-500 -> focus:ring-primary
                        className="w-full px-4 py-2 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    />
                    <Users className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                </div>
                {(selectedRole || searchTerm) && (
                    <Button
                        variant="destructive" // (Class này đã đúng, nó dùng biến --destructive)
                        className="px-3 py-1 text-sm"
                        onClick={() => {
                            setSelectedRole("");
                            updateSearchTerm("user", "");
                        }}
                    >
                        Reset filter
                    </Button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-muted-foreground">Loading users...</div>
            ) : error ? (
                // 🎨 SỬA: text-red-500 -> text-destructive
                <div className="text-destructive">{error}</div>
            ) : (
                // 🎨 SỬA: bg-gray-50 -> bg-background, border-gray-200 -> border-border
                <div className="overflow-x-auto bg-background rounded-lg border border-border shadow-sm">
                    <table className="w-full min-w-[600px] table-auto">
                        {/* 🎨 SỬA: bg-gray-100 -> bg-muted, border-gray-200 -> border-border */}
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-16">ID</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-24">USERNAME</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-20 relative">
                                    <div className="flex items-center gap-3">
                                        ROLE
                                        <button
                                            aria-label="Filter by Role"
                                            ref={roleButtonRef}
                                            onClick={(e) => { e.stopPropagation(); setShowRolePopover((s) => !s); }}
                                            className="cursor-pointer"
                                        >
                                            <Filter className="h-4 w-4 text-foreground" />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-32">FULL NAME</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-40">EMAIL</th>
                            </tr>
                        </thead>
                        {/* 🎨 SỬA: divide-gray-200 -> divide-border */}
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.user_id}
                                        onClick={() => handleTableRowClick("user", user)}
                                        // 🎨 SỬA: hover:bg-gray-100 -> hover:bg-muted/50
                                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                                    >
                                        {/* 🎨 SỬA: border-gray-200 -> border-border (cho 4 dòng) */}
                                        <td className="px-3 py-3 text-sm text-foreground border-r border-border">{user.user_id}</td>
                                        <td className="px-3 py-3 text-sm text-foreground break-words border-r border-border">{user.username}</td>
                                        <td className="px-3 py-3 border-r border-border">
                                            {user.roles && user.roles.length > 0 ? (
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    // (Đây là các màu ngữ nghĩa, giữ nguyên)
                                                    user.roles[0] === "teacher" ? "bg-orange-100 text-orange-800" :
                                                        user.roles[0] === "student" ? "bg-green-100 text-green-800" :
                                                            user.roles[0] === "parent" ? "bg-blue-100 text-blue-800" :
                                                                user.roles[0] === "manager" ? "bg-purple-100 text-purple-800" :
                                                                    "bg-gray-100 text-foreground" // 🎨 SỬA: bg-gray-100 -> bg-muted
                                                    }`}>
                                                    {user.roles.map(capitalizeFirstLetter).join(", ")}
                                                </span>
                                            ) : (
                                                // 🎨 SỬA: bg-gray-100 -> bg-muted
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-muted text-foreground">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-foreground break-words border-r border-border">{user.full_name}</td>
                                        <td className="px-3 py-3 text-sm text-foreground break-words">{user.email}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No users found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ROLE POPUP */}
            <AnimatePresence>
                {getPopoverPosition().show && (
                    <RoleFilterPopover
                        position={getPopoverPosition()}
                        selectedValue={selectedRole}
                        onSelect={handleRoleChange}
                    />
                )}
            </AnimatePresence>

            {/* Import Users Modal */}
            <ImportUsersModal open={showImportModal} onClose={() => setShowImportModal(false)} />
        </div>
    );
}

interface RoleFilterPopoverProps {
    position: { left: number; top: number; show: boolean };
    selectedValue: string;
    onSelect: (role: string) => void;
}

const RoleFilterPopover: React.FC<RoleFilterPopoverProps> = ({ position, selectedValue, onSelect }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ position: "absolute", top: position.top, left: position.left }}
            // 🎨 SỬA: bg-background -> bg-popover, text-foreground -> text-popover-foreground, border-gray-300 -> border-border
            className="z-50 mt-2 w-48 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3"
        >
            <h4 className="font-semibold mb-2 text-sm">Filter by Role</h4>
            <select
                aria-label="Filter by Role"
                value={selectedValue}
                onChange={(e) => onSelect(e.target.value)}
                // 🎨 SỬA: Thêm bg-input, border-border, focus:ring-primary, focus:border-primary
                className="w-full px-2 py-1 border border-border bg-input rounded-md mb-2 focus:ring-primary focus:border-primary"
            >
                <option value="">All Roles</option>
                {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
            </select>
            <Button
                variant="destructive" // (Đã đúng)
                className="w-full px-2 py-1 text-sm mt-1"
                onClick={() => onSelect("")}
            >
                Clear Filter
            </Button>
        </motion.div>
    );
};