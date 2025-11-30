"use client"

import { X, User, Calendar, Mail, Phone } from "lucide-react"

interface UserInfoModalProps {
  user: any
  onClose: () => void
  onChangeRole: (newRole: string) => void
}

export function UserInfoModal({ user, onClose }: UserInfoModalProps) {
  const roleColors: Record<string, string> = {
    parent: "#3B82F6",
    teacher: "#F97316",
    student: "#22C55E",
    manager: "#A855F7",
  }

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.role].filter(Boolean)
  
  const bgStyle =
    userRoles.length > 1
      ? `linear-gradient(135deg, ${userRoles.map((r: string | number) => roleColors[r] || "#6B7280").join(", ")})`
      : (roleColors[userRoles[0]] || "#6B7280")

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-140 overflow-hidden relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-red-500 hover:text-red-700 transition-colors"
        aria-label="Close user information modal"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex">
        {/* Left panel */}
        <div
          className="text-white p-6 flex flex-col items-center justify-center w-40"
          style={{ background: bgStyle }}
        >
          <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center mb-3">
            <User className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{user.username}</h3>
          <p className="text-xs opacity-90 mb-3">
            {userRoles.length > 0 ? userRoles.map(capitalizeFirstLetter).join(", ") : "No role"}
          </p>
        </div>

        {/* Right panel */}
        <div className="p-8 flex-1 bg-background">
          <h2 className="text-lg font-semibold text-foreground mb-4">Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-cyan-500 mb-1">
                <span className="text-xs">📋</span>
                <span className="font-medium">ID</span>
              </div>
              <p className="text-muted-foreground">{user.user_id?.toString().padStart(2, "0")}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-pink-500 mb-1">
                <span className="text-xs">⚥</span>
                <span className="font-medium">Gender</span>
              </div>
              <p className="text-muted-foreground">{user.gender || "Male"}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Date of birth</span>
              </div>
              <p className="text-muted-foreground">{user.dob || ""}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-purple-500 mb-1">
                <User className="h-3 w-3" />
                <span className="font-medium">Full name</span>
              </div>
              <p className="text-muted-foreground">{user.full_name}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-green-500 mb-1">
                <Mail className="h-3 w-3" />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Phone className="h-3 w-3" />
                <span className="font-medium">Phone</span>
              </div>
              <p className="text-muted-foreground">{user.phone || "0123456789"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}