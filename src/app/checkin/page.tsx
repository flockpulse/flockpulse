"use client"
import RequireAuth from "@/components/RequireAuth"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CheckInPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading check-in...</main>}>
      <CheckInContent />
    </Suspense>
  )
}

function CheckInContent() {
  const searchParams = useSearchParams()
  const [input, setInput] = useState("")
  const [message, setMessage] = useState("Waiting for scan...")
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  function cleanPhone(value: string) {
    return value.replace(/\D/g, "")
  }

  function getCurrentServiceType() {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()

    if (day === 0 && hour >= 8 && hour < 13) return "Sunday Service"
    if (day === 3 && hour >= 18 && hour < 22) return "Bible Study"
    if (day === 5 && hour >= 18 && hour < 22) return "Youth Service"

    return "Special Event"
  }

  async function checkIn(value: string) {
    const rawValue = decodeURIComponent(value).trim().toUpperCase()
    const phoneValue = cleanPhone(rawValue)
    const serviceType = getCurrentServiceType()

    if (!rawValue || hasCheckedIn) return

    setHasCheckedIn(true)
    setMessage("Checking in...")

    const { data: allMembers } = await supabase.from("members").select("*")

    const member =
      allMembers?.find(
        (m) =>
          String(m.member_id || "").trim().toUpperCase() === rawValue ||
          cleanPhone(m.phone || "") === phoneValue
      ) || null

    if (!member) {
      setMessage(`Member not found. Scanned value: ${rawValue}`)
      setHasCheckedIn(false)
      return
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", member.id)
      .eq("service_type", serviceType)
      .gte("check_in_time", todayStart.toISOString())
      .lte("check_in_time", todayEnd.toISOString())
      .maybeSingle()

    if (existing) {
      setMessage(`${member.full_name} already checked in for ${serviceType} today`)
      setHasCheckedIn(false)
      return
    }

    const { error: attendanceError } = await supabase.from("attendance").insert([
      {
        church_id: member.church_id,
        member_id: member.id,
        service_type: serviceType,
        method: "QR/Manual",
      },
    ])

    if (attendanceError) {
      setMessage(attendanceError.message)
      setHasCheckedIn(false)
      return
    }

    const isVisitor = member.status === "Visitor"
    const isFirstVisit = (member.attendance_count || 0) === 0

    await supabase
      .from("members")
      .update({
        attendance_count: (member.attendance_count || 0) + 1,
        last_attendance: new Date().toISOString(),
      })
      .eq("id", member.id)

    if (isVisitor && isFirstVisit) {
      setMessage(`Welcome ${member.full_name}! First-time visitor checked in.`)
    } else if (isVisitor) {
      setMessage(`Welcome back ${member.full_name}!`)
    } else {
      setMessage(`${member.full_name} checked in successfully!`)
    }

    setInput("")
  }

  useEffect(() => {
    const idFromUrl = searchParams.get("member")

    if (idFromUrl) {
      setInput(idFromUrl)
      checkIn(idFromUrl)
    }
  }, [searchParams])

  async function handleManualCheckIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await checkIn(input)
  }

  return (
    <RequireAuth>
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleManualCheckIn}
        className="w-full max-w-md space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-2xl font-bold">FlockPulse Check-In</h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Scan QR, enter Member ID, or phone number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button className="w-full rounded-lg p-3 bg-black text-white">
          Manual Check In
        </button>

        {message && <p className="text-sm font-medium">{message}</p>}
      </form>
    </main>
    </RequireAuth>
  )
}