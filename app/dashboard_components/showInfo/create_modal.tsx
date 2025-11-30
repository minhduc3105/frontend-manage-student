"use client"

import type React from "react"
import { X, User, Calendar, DollarSign, BookOpen, Award, Briefcase, Clock, MapPin } from "lucide-react"
import { useState } from "react"
import { Input } from "../../../components/ui/input"

interface CreateModalProps {
  type: string
  onClose: () => void
  onCreate: (data: any) => void
}

export function CreateModal({ type, onClose, onCreate }: CreateModalProps) {
  const [formData, setFormData] = useState<any>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
    onClose()
  }

  const renderLabel = (icon: React.ReactNode, text: string) => (
    <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
      {icon}
      {text}
    </label>
  )

  const inputStyle =
    "w-full px-3 py-2 border border-cyan-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"

  const renderForm = () => {
    switch (type) {
      case "payroll":
        return (
          <div className="space-y-4">
            <div>
              {renderLabel(<User className="h-4 w-4 text-cyan-600" />, "Teacher ID")}
              <Input
                type="text"
                value={formData.teacherId || ""}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<Calendar className="h-4 w-4 text-cyan-600" />, "Month")}
              <Input
                type="text"
                value={formData.month || ""}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<DollarSign className="h-4 w-4 text-cyan-600" />, "Total Base")}
              <Input
                type="text"
                value={formData.totalBase || ""}
                onChange={(e) => setFormData({ ...formData, totalBase: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<Award className="h-4 w-4 text-cyan-600" />, "Reward Bonus")}
              <Input
                type="text"
                value={formData.rewardBonus || ""}
                onChange={(e) => setFormData({ ...formData, rewardBonus: e.target.value })}
                className={inputStyle}
              />
            </div>
          </div>
        )
      case "tuition":
        return (
          <div className="space-y-4">
            <div>
              {renderLabel(<User className="h-4 w-4 text-cyan-600" />, "Student")}
              <Input
                type="text"
                value={formData.student || ""}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<DollarSign className="h-4 w-4 text-cyan-600" />, "Amount")}
              <Input
                type="text"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<BookOpen className="h-4 w-4 text-cyan-600" />, "Term")}
              <Input
                type="text"
                value={formData.term || ""}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<Calendar className="h-4 w-4 text-cyan-600" />, "Due Date")}
              <Input
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={inputStyle}
              />
            </div>
          </div>
        )
      case "class":
        return (
          <div className="space-y-4">
            <div>
              {renderLabel(<BookOpen className="h-4 w-4 text-cyan-600" />, "Class Name")}
              <Input
                type="text"
                value={formData.className || ""}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<User className="h-4 w-4 text-cyan-600" />, "Teacher")}
              <Input
                type="text"
                value={formData.teacher || ""}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<Briefcase className="h-4 w-4 text-cyan-600" />, "Subject")}
              <Input
                type="text"
                value={formData.subject || ""}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<DollarSign className="h-4 w-4 text-cyan-600" />, "Fee")}
              <Input
                type="text"
                value={formData.fee || ""}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                className={inputStyle}
              />
            </div>
          </div>
        )
      case "schedule":
        return (
          <div className="space-y-4">
            <div>
              {renderLabel(<BookOpen className="h-4 w-4 text-cyan-600" />, "Class")}
              <Input
                type="text"
                value={formData.class || ""}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<MapPin className="h-4 w-4 text-cyan-600" />, "Room")}
              <Input
                type="text"
                value={formData.room || ""}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<Briefcase className="h-4 w-4 text-cyan-600" />, "Schedule Type")}
              <select
                aria-label="Schedule type"
                value={formData.scheduleType || ""}
                onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                className={inputStyle}
              >
                <option value="">Select type</option>
                <option value="Weekly">Weekly</option>
                <option value="Once">Once</option>
              </select>
            </div>
            <div>
              {renderLabel(<Calendar className="h-4 w-4 text-cyan-600" />, "Date")}
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<Clock className="h-4 w-4 text-cyan-600" />, "Start Time")}
              <Input
                type="time"
                value={formData.startTime || ""}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={inputStyle}
              />
            </div>
            <div>
              {renderLabel(<Clock className="h-4 w-4 text-cyan-600" />, "End Time")}
              <Input
                type="time"
                value={formData.endTime || ""}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={inputStyle}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-background text-foreground rounded-lg shadow-xl w-96 p-6 relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>

      <form onSubmit={handleSubmit}>
        {renderForm()}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
