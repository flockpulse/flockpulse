"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CheckInPage() {
  const searchParams = useSearchParams()
  const [memberId, setMemberId] = useState("")
  const [message, setMessage] = useState("")

  async function checkIn(idToCheck: string) {
    setMessage("Checking in...")

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("member_id", idToCheck.trim())
      .single()

    if (memberError || !member) {
      setMessage("Member not found.")
      return
    }

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

  async function handleCheckIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await checkIn(memberId)
  }

  useEffect(() => {
    const scannedMemberId = searchParams.get("member")

    if (scannedMemberId) {
      setMemberId(scannedMemberId)
      checkIn(scannedMemberId)
    }
  }, [searchParams])

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