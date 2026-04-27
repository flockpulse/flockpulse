"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"
import RequireAuth from "@/components/RequireAuth"

export default function FollowUpsPage() {
  const { selectedChurchId } = useChurch()
  const [followUps, setFollowUps] = useState<any[]>([])
  const [message, setMessage] = useState("")

  async function loadFollowUps() {
    if (!selectedChurchId) {
      setFollowUps([])
      setMessage("Please select a church from the top dropdown.")
      return
    }

    setMessage("")

    const { data, error } = await supabase
      .from("follow_ups")
      .select("*, members(full_name, phone, email)")
      .eq("church_id", selectedChurchId)
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setFollowUps(data || [])
  }

  async function markComplete(id: string) {
    await supabase
      .from("follow_ups")
      .update({ status: "Complete" })
      .eq("id", id)

    loadFollowUps()
  }

  useEffect(() => {
    loadFollowUps()
  }, [selectedChurchId])

  return (
    <RequireAuth>
      <main className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Follow-Ups</h1>

        {message && <p className="text-sm font-medium">{message}</p>}

        <div className="space-y-3">
          {followUps.map((item) => (
            <div key={item.id} className="border rounded-xl p-4 space-y-2">
              <p className="font-bold">{item.members?.full_name}</p>
              <p>{item.reason}</p>
              <p>Status: {item.status}</p>
              <p>Due: {item.due_date}</p>
              <p>Phone: {item.members?.phone}</p>
              <p>Email: {item.members?.email}</p>

              {item.status !== "Complete" && (
                <button
                  onClick={() => markComplete(item.id)}
                  className="bg-black text-white rounded-lg px-4 py-2"
                >
                  Mark Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </RequireAuth>
  )
}