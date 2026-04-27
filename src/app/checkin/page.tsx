"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function CheckInPage() {
  const [memberId, setMemberId] = useState("")
  const [message, setMessage] = useState("")

  async function handleCheckIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("member_id", memberId.trim())
      .single()

    if (memberError || !member) {
      setMessage("Member not found.")
      return
    }

    const searchParams = useSearchParams()

useEffect(() => {
  const scannedMemberId = searchParams.get("member")
  if (scannedMemberId) {
    setMemberId(scannedMemberId)
  }
}, [searchParams])

    const { error: attendanceError } = await supabase.from("attendance").insert([
      {
        church_id: member.church_id,
        member_id: member.id,
        service_type: "Sunday Service",
        method: "QR",
      },
    ])

    if (attendanceError) {
      setMessage(attendanceError.message)
      return
    }

    await supabase
      .from("members")
      .update({
        attendance_count: (member.attendance_count || 0) + 1,
        last_attendance: new Date().toISOString(),
      })
      .eq("id", member.id)

    setMessage(`${member.full_name} checked in successfully!`)
    setMemberId("")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleCheckIn}
        className="w-full max-w-md space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-2xl font-bold">FlockPulse Check-In</h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Enter or scan Member ID"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        />

        <button className="w-full rounded-lg p-3 bg-black text-white">
          Check In
        </button>

        {message && <p className="text-sm font-medium">{message}</p>}
      </form>
    </main>
  )
}