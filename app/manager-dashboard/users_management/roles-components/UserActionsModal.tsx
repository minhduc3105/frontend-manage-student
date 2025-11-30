"use client"

import { useState } from "react"
import { RoleModal } from "./RoleModal"
import { Button } from "../../../../components/ui/button"

interface User {
  user_id: number
  username: string
  roles: string[]
  full_name: string
  email: string
}

interface UserActionModalProps {
  users: User[]
  onShowUserInfo: (user: User) => void
}

export function UserActionModal({ users, onShowUserInfo }: UserActionModalProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.user_id}
          onClick={() => setSelectedUser(user)}
          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 cursor-pointer"
        >
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Roles: {user.roles.join(", ")}</p>
          </div>
          {/* Nút delete giờ bỏ → chỉ còn ở trong modal */}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onShowUserInfo(user)
            }}
          >
            Info
          </Button>
        </div>
      ))}

      {selectedUser && (
        <RoleModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onShowInfo={() => onShowUserInfo(selectedUser)}
        />
      )}
    </div>
  )
}
