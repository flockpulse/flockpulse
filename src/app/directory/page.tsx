"use client"
import RequireAuth from "@/components/RequireAuth"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DirectoryPage() {
  const [members, setMembers] = useState<any[]>([])

  async function loadMembers() {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })

    setMembers(data || [])
  }

  useEffect(() => {
    loadMembers()
  }, [])

  return (
    <RequireAuth>
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Member Directory</h1>

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
    </RequireAuth>
  )
}