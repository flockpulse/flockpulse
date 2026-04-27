"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"

export default function DirectoryPage() {
  const { selectedChurchId } = useChurch()
  const [members, setMembers] = useState<any[]>([])
  const [message, setMessage] = useState("")

  async function loadMembers() {
    if (!selectedChurchId) {
      setMembers([])
      setMessage("Please select a church from the top dropdown.")
      return
    }

    setMessage("")

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("church_id", selectedChurchId)
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setMembers(data || [])
  }

  useEffect(() => {
    loadMembers()
  }, [selectedChurchId])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Member Directory</h1>

      {message && <p className="text-sm font-medium">{message}</p>}

      <div className="space-y-3">
        {members.map((member) => (
          <a
            key={member.id}
            href={`/members/${member.id}`}
            className="block border rounded-xl p-4"
          >
            <p className="font-bold">{member.full_name}</p>
            <p>{member.phone}</p>
            <p>Status: {member.status}</p>
            <p>ID: {member.member_id}</p>
          </a>
        ))}
      </div>
    </main>
  )
}