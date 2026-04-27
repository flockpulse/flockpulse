"use client"

import RequireAuth from "@/components/RequireAuth"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useChurch } from "@/lib/churchContext"

export default function DashboardPage() {
  const { selectedChurchId } = useChurch()

  const [subscriptionStatus, setSubscriptionStatus] = useState("")
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  const [totalVisitors, setTotalVisitors] = useState(0)
  const [totalMembers, setTotalMembers] = useState(0)

  const [weekCheckIns, setWeekCheckIns] = useState(0)
  const [lastWeekCheckIns, setLastWeekCheckIns] = useState(0)

  function percentChange(current: number, previous: number) {
    if (previous === 0 && current === 0) return "0%"
    if (previous === 0) return "+100%"
    const change = ((current - previous) / previous) * 100
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`
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

  async function openBillingPortal() {
    if (!selectedChurchId) return

    const { data } = await supabase
      .from("churches")
      .select("stripe_customer_id")
      .eq("id", selectedChurchId)
      .single()

    if (!data?.stripe_customer_id) return

    const response = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: data.stripe_customer_id,
      }),
    })

    const result = await response.json()

    if (result.url) {
      window.location.href = result.url
    }
  }

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

  async function loadDashboard() {
    if (!selectedChurchId) return

    const now = new Date()
    const startWeek = new Date()
    startWeek.setDate(now.getDate() - now.getDay())

    const lastWeek = new Date(startWeek)
    lastWeek.setDate(startWeek.getDate() - 7)

    const { count: visitors } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("church_id", selectedChurchId)
      .eq("status", "Visitor")

    const { count: members } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("church_id", selectedChurchId)
      .eq("status", "Member")

    const { count: thisWeek } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("church_id", selectedChurchId)
      .gte("check_in_time", startWeek.toISOString())

    const { count: lastWeekCount } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("church_id", selectedChurchId)
      .gte("check_in_time", lastWeek.toISOString())
      .lt("check_in_time", startWeek.toISOString())

    setTotalVisitors(visitors || 0)
    setTotalMembers(members || 0)
    setWeekCheckIns(thisWeek || 0)
    setLastWeekCheckIns(lastWeekCount || 0)
  }

  useEffect(() => {
    setCheckingSubscription(true)

    if (selectedChurchId) {
      checkSubscription()
      loadDashboard()
    } else {
      setCheckingSubscription(false)
    }
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
          <div className="border rounded-xl p-6 text-center space-y-4">
            <h1 className="text-xl font-bold">Subscription Required</h1>

            <button
              onClick={startCheckout}
              className="bg-black text-white px-4 py-2 rounded-lg"
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">FlockPulse Dashboard</h1>

          <button
            onClick={openBillingPortal}
            className="border rounded-lg px-4 py-2"
          >
            Manage Billing
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Metric title="Total Visitors" value={totalVisitors} />
          <Metric title="Total Members" value={totalMembers} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Metric
            title="This Week Check-Ins"
            value={weekCheckIns}
            change={percentChange(weekCheckIns, lastWeekCheckIns)}
          />
        </div>
      </main>
    </RequireAuth>
  )
}

function Metric({
  title,
  value,
  change,
}: {
  title: string
  value: number
  change?: string
}) {
  return (
    <div className="border rounded-xl p-6">
      <p>{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
      {change && <p>{change}</p>}
    </div>
  )
}