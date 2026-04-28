"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"
import RequireAuth from "@/components/RequireAuth"

export default function DirectoryPage() {
  const { selectedChurchId } = useChurch()

  const [subscriptionStatus, setSubscriptionStatus] = useState("")
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  const [members, setMembers] = useState<any[]>([])
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

  async function loadMembers() {
    if (!selectedChurchId) {
      setMembers([])
      setMessage("Please select a church from the dropdown.")
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
    setCheckingSubscription(true)

    async function loadPage() {
      await checkSubscription()
      await loadMembers()
    }

    loadPage()
  }, [selectedChurchId])

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
              Please subscribe to view the member directory.
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
    </RequireAuth>
  )
}