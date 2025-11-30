"use client"

import {
  X,
  BookOpen,
  User,
  GraduationCap,
  ClipboardList,
  Award,
  Calendar,
  Trash2,
  Pencil,
} from "lucide-react"
import { Button } from "../../../components/ui/button"

type Test = {
  test_id: number
  test_name: string
  student_name?: string | null
  student_user_id?: string | number | null
  class_name?: string | null
  test_type?: string | null
  score: number
  exam_date?: string | null
}

interface TestDetailPanelProps {
  test: Test | null
  isOpen: boolean
  onClose: () => void
  onEdit: (test: Test) => void
  onDelete: (id: number) => void
}

export function TestDetailPanel({
  test,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TestDetailPanelProps) {
  if (!test) return null

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 border-green-300"
    if (score >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-gray-200 shadow-2xl transition-transform duration-300 z-50 ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-center text-xl font-semibold text-indigo-700 flex items-center justify-between gap-2">
            <ClipboardList size={20} className="text-indigo-600" />
            Test Details
          </h2>
          <Button
            onClick={onClose}
            className="hover:bg-red-50 hover:text-red-600 rounded-full p-2"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-2 text-sm">
          {[
            {
              icon: <ClipboardList className="text-foreground" size={18} />,
              label: "Test ID",
              value: test.test_id,
            },
            {
              icon: <BookOpen className="text-blue-500" size={18} />,
              label: "Test Name",
              value: test.test_name,
            },
            {
              icon: <User className="text-emerald-500" size={18} />,
              label: "Student",
              value: test.student_name ?? test.student_user_id,
            },
            {
              icon: <GraduationCap className="text-indigo-500" size={18} />,
              label: "Class",
              value: test.class_name ?? "-",
            },
            {
              icon: <ClipboardList className="text-orange-500" size={18} />,
              label: "Test Type",
              value: test.test_type ?? "-",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-gray-50"
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-foreground font-medium">{item.label}</span>
              </div>
              <span className="text-foreground font-semibold">{item.value}</span>
            </div>
          ))}

          {/* Score */}
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Award className="text-yellow-500" size={18} />
              <span className="text-foreground font-medium">Score</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full border font-semibold text-sm ${getScoreBadgeColor(
                test.score
              )}`}
            >
              {test.score}
            </div>
          </div>

          {/* Exam Date */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Calendar className="text-purple-500" size={18} />
              <span className="text-foreground font-medium">Exam Date</span>
            </div>
            <span className="text-foreground font-semibold">
              {formatDate(test.exam_date || "")}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-5" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-yellow-200 text-yellow-600 hover:bg-yellow-500 hover:text-white cursor-pointer"
              onClick={() => onEdit(test)}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
              onClick={() => {
                onDelete(test.test_id)
                onClose()
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
