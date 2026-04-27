"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AuthHeader() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setEmail(user?.email || null)
    }

    loadUser()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="border-b p-4 flex justify-between items-center">
      <a href="/" className="font-bold">
        FlockPulse
      </a>

      <div className="flex gap-4 items-center">
        {email ? (
          <>
            <span className="text-sm">{email}</span>
            <button
              onClick={logout}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <a href="/login" className="bg-black text-white px-4 py-2 rounded-lg">
            Login
          </a>
        )}
      </div>
    </div>
  )
}