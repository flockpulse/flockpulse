"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { QRCodeCanvas } from "qrcode.react"

export default function MemberProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [member, setMember] = useState<any>(null)

  async function loadMember() {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single()

    setMember(data)
  }

  useEffect(() => {
    if (id) {
      loadMember()
    }
  }, [id])

  if (!member) return <main className="p-6">Loading...</main>

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{member.full_name}</h1>

      <div className="border rounded-xl p-6 space-y-2">
        <p>Status: {member.status}</p>
        <p>Email: {member.email}</p>
        <p>Phone: {member.phone}</p>
        <p>Member ID: {member.member_id}</p>
      </div>

      <div className="border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Check-In QR Code</h2>

   <QRCodeCanvas
  value={`https://flockpulse.vercel.app/checkin?member=${member.member_id}`}
  size={180}
/>
        

        <p className="text-sm">Scan this code at check-in.</p>
      </div>
    </main>
  )
}