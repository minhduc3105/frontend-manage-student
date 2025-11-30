// src/hooks/useAuthGuard.ts
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"

export function useAuthGuard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else {
        setChecked(true)
      }
    }
  }, [loading, user, router])

  return { checked, user, loading }
}
