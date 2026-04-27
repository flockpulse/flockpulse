"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"
import RequireAuth from "@/components/RequireAuth"
import { QRCodeCanvas } from "qrcode.react"

export default function MemberProfilePage() {
  const params = useParams()
  const id = params.id as string

  const { selectedChurchId } = useChurch()

  const [member, setMember] = useState<any>(null)
  const [message, setMessage] = useState("Loading...")

  async function loadMember() {
    if (!selectedChurchId) {
      setMember(null)
      setMessage("Please select a church from the top dropdown.")
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .eq("church_id", selectedChurchId)
      .single()

    if (error || !data) {
      setMember(null)
      setMessage("Member not found for selected church.")
      return
    }

    setMember(data)
    setMessage("")
  }

  useEffect(() => {
    if (id) loadMember()
  }, [id, selectedChurchId])

  return (
    <RequireAuth>
      <main className="p-6 space-y-6">
        {message && <p className="text-sm font-medium">{message}</p>}

        {member && (
          <>
            <h1 className="text-3xl font-bold">{member.full_name}</h1>

            <div className="border rounded-xl p-6 space-y-2">
              <p>Status: {member.status}</p>
              <p>Email: {member.email}</p>
              <p>Phone: {member.phone}</p>
              <p>Member ID: {member.member_id}</p>
              <p>Attendance Count: {member.attendance_count || 0}</p>
            </div>

            <div className="border rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-bold">Check-In QR Code</h2>

              <QRCodeCanvas
                value={`https://flockpulse.vercel.app/checkin?member=${member.member_id}`}
                size={180}
              />

              <p className="text-sm">Scan this code at check-in.</p>
            </div>
          </>
        )}
      </main>
    </RequireAuth>
  )
}