"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserProfile } from "@/lib/getCurrentUserProfile"
import { useChurch } from "@/lib/churchContext"

export default function AuthHeader() {
  const [email, setEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [churches, setChurches] = useState<any[]>([])

  const { selectedChurchId, setSelectedChurchId } = useChurch()

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setEmail(user?.email || null)

      if (!user) {
        setProfile(null)
        setSelectedChurchId("")
        return
      }

      const currentProfile = await getCurrentUserProfile()
      setProfile(currentProfile)

      if (currentProfile?.role === "superuser") {
        const { data } = await supabase
          .from("churches")
          .select("*")
          .order("name", { ascending: true })

        setChurches(data || [])
      } else {
        setSelectedChurchId(currentProfile?.church_id || "")
      }
    }

    loadUser()
  }, [setSelectedChurchId])

  async function logout() {
    await supabase.auth.signOut()
    setSelectedChurchId("")
    window.location.href = "/login"
  }

  return (
    <div className="border-b p-4 flex flex-wrap gap-4 justify-between items-center">
      <a href="/" className="font-bold text-xl">
        FlockPulse
      </a>

      <div className="flex flex-wrap gap-3 items-center">
        {profile?.role === "superuser" && (
          <select
            className="border rounded-lg p-2"
            value={selectedChurchId}
            onChange={(e) => setSelectedChurchId(e.target.value)}
          >
            <option value="">Select Church</option>
            {churches.map((church) => (
              <option key={church.id} value={church.id}>
                {church.name}
              </option>
            ))}
          </select>
        )}

        {profile?.role !== "superuser" && profile?.church_id && (
          <span className="text-sm opacity-70">Church Account</span>
        )}

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