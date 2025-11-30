// src/components/SidebarNav.tsx
import * as React from "react"
import {
  Users,
  BookOpen,
  Wallet,
  GraduationCap,
  BookMarked,
  Calendar,
  ClipboardList,
  Star,
} from "lucide-react"
import { EntityType } from "../../../src/types/types"

interface SidebarNavProps {
  activeSection: EntityType
  onSectionChange: (section: EntityType) => void
}

export default function SidebarNav({
  activeSection,
  onSectionChange,
}: SidebarNavProps) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    general: true,
    academics: false,
    finance: false,
    feedback: false,
  })

  const toggleGroup = (g: string) =>
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }))

  const itemClass = (t: EntityType) =>
    `flex items-center gap-2 w-full px-2 py-1 rounded ${
      activeSection === t ? "bg-gray-700" : ""
    }`

  return (
    <nav className="bg-gray-900 text-muted-foreground w-64 h-screen p-4 space-y-4">
      {/* General */}
      <div>
        <button
          onClick={() => toggleGroup("general")}
          className="w-full text-left font-semibold mb-2"
        >
          General
        </button>
        {openGroups.general && (
          <div className="pl-4 space-y-2">
            <button onClick={() => onSectionChange("user")} className={itemClass("user")}>
              <Users className="h-4 w-4" /> Users
            </button>
            <button onClick={() => onSectionChange("class")} className={itemClass("class")}>
              <BookOpen className="h-4 w-4" /> Classes
            </button>
          </div>
        )}
      </div>

      {/* Academics */}
      <div>
        <button
          onClick={() => toggleGroup("academics")}
          className="w-full text-left font-semibold mb-2"
        >
          Academics
        </button>
        {openGroups.academics && (
          <div className="pl-4 space-y-2">
            <button
              onClick={() => onSectionChange("subject")}
              className={itemClass("subject")}
            >
              <BookMarked className="h-4 w-4" /> Subjects
            </button>
            <button
              onClick={() => onSectionChange("schedule")}
              className={itemClass("schedule")}
            >
              <Calendar className="h-4 w-4" /> Schedules
            </button>
            <button
              onClick={() => onSectionChange("evaluation")}
              className={itemClass("evaluation")}
            >
              <ClipboardList className="h-4 w-4" /> Evaluations
            </button>
          </div>
        )}
      </div>

      {/* Finance */}
      <div>
        <button
          onClick={() => toggleGroup("finance")}
          className="w-full text-left font-semibold mb-2"
        >
          Finance
        </button>
        {openGroups.finance && (
          <div className="pl-4 space-y-2">
            <button
              onClick={() => onSectionChange("payroll")}
              className={itemClass("payroll")}
            >
              <Wallet className="h-4 w-4" /> Payroll
            </button>
            <button
              onClick={() => onSectionChange("tuition")}
              className={itemClass("tuition")}
            >
              <GraduationCap className="h-4 w-4" /> Tuition
            </button>
          </div>
        )}
      </div>

      {/* Feedback */}
      <div>
        <button
          onClick={() => toggleGroup("feedback")}
          className="w-full text-left font-semibold mb-2"
        >
          Feedback
        </button>
        {openGroups.feedback && (
          <div className="pl-4 space-y-2">
            <button
              onClick={() => onSectionChange("teacherReview")}
              className={itemClass("teacherReview")}
            >
              <Star className="h-4 w-4" /> Teacher Reviews
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
