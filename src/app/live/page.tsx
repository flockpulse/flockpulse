"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LiveAttendancePage() {
  const [checkIns, setCheckIns] = useState<any[]>([])

  async function loadCheckIns() {
    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("attendance")
      .select("*, members(full_name, status)")
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const visitors = checkIns.filter((c) => c.members?.status === "Visitor").length
  const members = checkIns.filter((c) => c.members?.status === "Member").length

  return (
    <main className="min-h-screen p-8 space-y-8 bg-white text-black">
      <h1 className="text-5xl font-bold">Live Attendance</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="border border-white/20 rounded-2xl p-8">
          <p className="text-lg opacity-70">Total Check-Ins</p>
          <h2 className="text-6xl font-bold">{checkIns.length}</h2>
        </div>

        <div className="border border-white/20 rounded-2xl p-8">
          <p className="text-lg opacity-70">Members</p>
          <h2 className="text-6xl font-bold">{members}</h2>
        </div>

        <div className="border border-white/20 rounded-2xl p-8">
          <p className="text-lg opacity-70">Visitors</p>
          <h2 className="text-6xl font-bold">{visitors}</h2>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Recent Check-Ins</h2>

        {checkIns.slice(0, 10).map((checkIn) => (
          <div
            key={checkIn.id}
            className="border border-white/20 rounded-xl p-4 flex justify-between"
          >
            <span>{checkIn.members?.full_name || "Unknown"}</span>
            <span className="opacity-70">{checkIn.service_type}</span>
          </div>
        ))}
      </section>
    </main>
  )
}