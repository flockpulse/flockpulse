"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"
import { nanoid } from "nanoid"

export default function MembersPage() {
  const { selectedChurchId } = useChurch()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState("Visitor")
  const [message, setMessage] = useState("")

  async function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    if (!selectedChurchId) {
      setMessage("Please select a church from the top dropdown.")
      return
    }

    const memberId = `FP-${nanoid(6).toUpperCase()}`

    const { error } = await supabase.from("members").insert([
      {
        church_id: selectedChurchId,
        full_name: fullName,
        email,
        phone,
        status,
        member_id: memberId,
      },
    ])

    if (error) {
      setMessage(error.message)
      return
    }

    setFullName("")
    setEmail("")
    setPhone("")
    setStatus("Visitor")
    setMessage("Member saved successfully!")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={addMember}
        className="w-full max-w-md space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-2xl font-bold">Add Member / Visitor</h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Mobile Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <select
          className="w-full border rounded-lg p-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Visitor">Visitor</option>
          <option value="Member">Member</option>
        </select>

        <button className="w-full rounded-lg p-3 bg-black text-white">
          Save Member
        </button>

        {message && (
          <p className="text-sm font-medium text-center">{message}</p>
        )}
      </form>
    </main>
  )
}