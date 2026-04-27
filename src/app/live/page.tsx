"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"
import RequireAuth from "@/components/RequireAuth"

export default function LiveAttendancePage() {
  const { selectedChurchId } = useChurch()
  const [checkIns, setCheckIns] = useState<any[]>([])

  async function loadCheckIns() {
    if (!selectedChurchId) {
      setCheckIns([])
      return
    }

    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("attendance")
      .select("*, members(full_name, status)")
      .eq("church_id", selectedChurchId)
      .gte("check_in_time", `${today}T00:00:00`)
      .lte("check_in_time", `${today}T23:59:59`)
      .order("check_in_time", { ascending: false })

    setCheckIns(data || [])
  }

  useEffect(() => {
    loadCheckIns()

    const channel = supabase
      .channel("live-attendance")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance" },
        () => {
          loadCheckIns()
        }
      )
      .subscribe()

    const interval = setInterval(() => {
      loadCheckIns()
    }, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [selectedChurchId])

  const visitors = checkIns.filter((c) => c.members?.status === "Visitor").length
  const members = checkIns.filter((c) => c.members?.status === "Member").length

  return (
    <RequireAuth>
      <main className="min-h-screen bg-white text-black p-10 flex flex-col">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-6xl font-bold">Live Attendance</h1>
            <p className="text-2xl opacity-70">FlockPulse Check-In Dashboard</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-medium">
              {new Date().toLocaleDateString()}
            </p>
            <p className="text-xl opacity-70">Today</p>
          </div>
        </div>

        {!selectedChurchId && (
          <p className="text-2xl font-medium mb-6">
            Please select a church from the top dropdown.
          </p>
        )}

        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="border rounded-3xl p-10 text-center">
            <p className="text-3xl opacity-70">Total Check-Ins</p>
            <h2 className="text-8xl font-bold">{checkIns.length}</h2>
          </div>

          <div className="border rounded-3xl p-10 text-center">
            <p className="text-3xl opacity-70">Members</p>
            <h2 className="text-8xl font-bold">{members}</h2>
          </div>

          <div className="border rounded-3xl p-10 text-center">
            <p className="text-3xl opacity-70">Visitors</p>
            <h2 className="text-8xl font-bold">{visitors}</h2>
          </div>
        </div>

        <section className="flex-1 border rounded-3xl p-8">
          <h2 className="text-4xl font-bold mb-6">Recent Check-Ins</h2>

          <div className="space-y-4">
            {checkIns.slice(0, 8).map((checkIn) => (
              <div
                key={checkIn.id}
                className="border rounded-2xl p-5 flex justify-between text-3xl"
              >
                <span>{checkIn.members?.full_name || "Unknown"}</span>
                <span className="opacity-60">{checkIn.service_type}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </RequireAuth>
  )
}