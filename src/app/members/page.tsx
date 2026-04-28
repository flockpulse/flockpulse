"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"
import { nanoid } from "nanoid"
import RequireAuth from "@/components/RequireAuth"

export default function MembersPage() {
  const { selectedChurchId } = useChurch()

  const [subscriptionStatus, setSubscriptionStatus] = useState("")
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState("Visitor")
  const [message, setMessage] = useState("")

  async function checkSubscription() {
    if (!selectedChurchId) {
      setCheckingSubscription(false)
      return
    }

    const { data } = await supabase
      .from("churches")
      .select("subscription_status")
      .eq("id", selectedChurchId)
      .single()

    setSubscriptionStatus(data?.subscription_status || "unpaid")
    setCheckingSubscription(false)
  }

  async function startCheckout() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !selectedChurchId) return

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        churchId: selectedChurchId,
        email: user.email,
      }),
    })

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    }
  }

  useEffect(() => {
    setCheckingSubscription(true)
    checkSubscription()
  }, [selectedChurchId])

  async function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    if (!selectedChurchId) {
      setMessage("Please select a church first.")
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

  if (checkingSubscription) {
    return (
      <RequireAuth>
        <main className="p-6">Loading...</main>
      </RequireAuth>
    )
  }

  if (!selectedChurchId) {
    return (
      <RequireAuth>
        <main className="p-6">
          <p>Please select a church from the dropdown.</p>
        </main>
      </RequireAuth>
    )
  }

  if (subscriptionStatus !== "active") {
    return (
      <RequireAuth>
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full border rounded-xl p-6 text-center space-y-4">
            <h1 className="text-2xl font-bold">Subscription Required</h1>
            <p className="text-sm">
              Please subscribe to continue adding members and visitors.
            </p>

            <button
              onClick={startCheckout}
              className="w-full rounded-lg p-3 bg-black text-white"
            >
              Subscribe for $49/month
            </button>
          </div>
        </main>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
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
            placeholder="Email"
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

          {message && <p className="text-sm font-medium">{message}</p>}
        </form>
      </main>
    </RequireAuth>
  )
}