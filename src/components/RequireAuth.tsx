"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login"
        return
      }

      setAllowed(true)
      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading) return <main className="p-6">Checking login...</main>

  return allowed ? <>{children}</> : null
}