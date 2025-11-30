import { useState, useCallback } from "react"
import toast from "react-hot-toast"
import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getTeacherPayrolls,
  Payroll,
  PayrollCreate, 
  PayrollUpdate
} from "../services/api/payroll"

export function usePayrolls() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayrolls = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPayrolls()
      setPayrolls(data)
      return data
    } catch (err: any) {
      const msg = "Failed to fetch all payrolls."
      toast.error(msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTeacherPayrolls = useCallback(async (teacherUserId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTeacherPayrolls(teacherUserId)
      setPayrolls(data)
      return data
    } catch (err: any) {
      const msg = "Failed to fetch teacher's payrolls."
      toast.error(msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const addPayroll = useCallback(async (payload: PayrollCreate) => {
    setLoading(true)
    setError(null)
    try {
      const newPayroll = await createPayroll(payload)
      setPayrolls(prev => [...prev, newPayroll])
      toast.success("Payroll created successfully!")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to create payroll."
      toast.error(msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const editPayroll = useCallback(async (id: number, payload: PayrollUpdate) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await updatePayroll(id, payload)
      setPayrolls(prev => prev.map(p => (p.id === id ? updated : p)))
      toast.success("Payroll updated successfully!")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to update payroll."
      toast.error(msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const removePayroll = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await deletePayroll(id)
      setPayrolls(prev => prev.filter(p => p.id !== id))
      toast.success("Payroll deleted successfully!")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to delete payroll."
      toast.error(msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    payrolls,
    loading,
    error,
    fetchPayrolls,
    fetchTeacherPayrolls,
    addPayroll,
    editPayroll,
    removePayroll
  }
}
