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
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Attendance</h1>
          <p className="text-sm opacity-70">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {!selectedChurchId && (
        <p className="text-sm font-medium">
          Please select a church from the top dropdown.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-xl p-6">
          <p className="text-sm">Total Check-Ins</p>
          <h2 className="text-3xl font-bold">{checkIns.length}</h2>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-sm">Members</p>
          <h2 className="text-3xl font-bold">{members}</h2>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-sm">Visitors</p>
          <h2 className="text-3xl font-bold">{visitors}</h2>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3">Recent Check-Ins</h2>

        <div className="space-y-3">
          {checkIns.slice(0, 10).map((checkIn) => (
            <div
              key={checkIn.id}
              className="border rounded-xl p-4 flex justify-between"
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