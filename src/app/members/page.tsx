"use client"
import { getCurrentUserProfile } from "@/lib/getCurrentUserProfile"
import RequireAuth from "@/components/RequireAuth"
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
  const [profile, setProfile] = useState<any>(null)
const [churches, setChurches] = useState<any[]>([])
const [selectedChurchId, setSelectedChurchId] = useState("")

useEffect(() => {
  async function loadAccess() {
    const currentProfile = await getCurrentUserProfile()
    setProfile(currentProfile)

    if (currentProfile?.role === "superuser") {
      const { data } = await supabase.from("churches").select("*")
      setChurches(data || [])
    } else {
      setSelectedChurchId(currentProfile?.church_id || "")
    }
  }

  loadAccess()
}, [])

async function addMember(e: React.FormEvent) {
  e.preventDefault()

  const memberId = `FP-${nanoid(6).toUpperCase()}`
if (!selectedChurchId) {
  setSuccessMessage("Please select a church first.")
  return
}
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
    <RequireAuth>
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Members</h1>
{profile?.role === "superuser" && (
  <select
    className="border rounded-lg p-3 w-full"
    value={selectedChurchId}
    onChange={(e) => setSelectedChurchId(e.target.value)}
  >
    <option value="">Select Church</option>
    {churches.map((church) => (
      <option key={church.id} value={church.id}>
        {church.name}
      </option>
    ))}
  </select>
)}

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
    </RequireAuth>
  )
}