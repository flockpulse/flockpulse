"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { nanoid } from "nanoid"
import { getUserChurchId } from "@/lib/getUserChurch"

export default function MembersPage() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("Visitor")
  const [successMessage, setSuccessMessage] = useState("")

  const churchId = "92b4af22-4273-47b3-a905-dd97b0c1289a"

async function addMember(e: React.FormEvent) {
  e.preventDefault()

  const memberId = `FP-${nanoid(6).toUpperCase()}`

  const { error } = await supabase.from("members").insert([
    {
      church_id: churchId,
      full_name: fullName,
      email,
      phone,
      status,
      member_id: memberId,
    },
  ])

  if (error) {
    setSuccessMessage("Something went wrong. Please try again.")
    return
  }

  setFullName("")
  setEmail("")
  setPhone("")
  setStatus("Visitor")
  setSuccessMessage("Member saved successfully!")
}
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Members</h1>

      <form onSubmit={addMember} className="space-y-3 border p-4 rounded-lg">
        <input
          className="border p-2 w-full"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
            className="border p-2 w-full"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Visitor">Visitor</option>
          <option value="Member">Member</option>
        </select>

        <button className="bg-black text-white p-2 w-full">
          Add Member
        </button>
      </form>

      {successMessage && (
  <p className="text-green-600 font-medium">{successMessage}</p>
)}

    </main>
  )
}