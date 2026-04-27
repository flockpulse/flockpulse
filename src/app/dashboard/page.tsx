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

  const [visitorWeek, setVisitorWeek] = useState(0)
  const [visitorLastWeek, setVisitorLastWeek] = useState(0)
  const [visitorMonth, setVisitorMonth] = useState(0)
  const [visitorLastMonth, setVisitorLastMonth] = useState(0)
  const [visitorYear, setVisitorYear] = useState(0)
  const [visitorLastYear, setVisitorLastYear] = useState(0)

  const [memberWeek, setMemberWeek] = useState(0)
  const [memberLastWeek, setMemberLastWeek] = useState(0)
  const [memberMonth, setMemberMonth] = useState(0)
  const [memberLastMonth, setMemberLastMonth] = useState(0)
  const [memberYear, setMemberYear] = useState(0)
  const [memberLastYear, setMemberLastYear] = useState(0)

  const [weekCheckIns, setWeekCheckIns] = useState(0)
  const [lastWeekCheckIns, setLastWeekCheckIns] = useState(0)
  const [monthCheckIns, setMonthCheckIns] = useState(0)
  const [lastMonthCheckIns, setLastMonthCheckIns] = useState(0)
  const [yearCheckIns, setYearCheckIns] = useState(0)
  const [lastYearCheckIns, setLastYearCheckIns] = useState(0)

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

  async function countPeople(status: string, start?: Date, end?: Date) {
    if (!selectedChurchId) return 0

    let query = supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("church_id", selectedChurchId)
      .eq("status", status)

    if (start && end) {
      query = query
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
    }

    const { count } = await query
    return count || 0
  }

  async function countAttendance(start: Date, end: Date) {
    if (!selectedChurchId) return 0

    const { count } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("church_id", selectedChurchId)
      .gte("check_in_time", start.toISOString())
      .lt("check_in_time", end.toISOString())

    return count || 0
  }

  async function loadDashboard() {
    if (!selectedChurchId) return

    const now = new Date()
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const startWeek = new Date(startToday)
    startWeek.setDate(startToday.getDate() - startToday.getDay())

    const startLastWeek = new Date(startWeek)
    startLastWeek.setDate(startWeek.getDate() - 7)

    const endLastWeek = new Date(startWeek)

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const startYear = new Date(now.getFullYear(), 0, 1)

    const startLastYear = new Date(now.getFullYear() - 1, 0, 1)
    const endLastYear = new Date(now.getFullYear(), 0, 1)

    setTotalVisitors(await countPeople("Visitor"))
    setTotalMembers(await countPeople("Member"))

    setVisitorWeek(await countPeople("Visitor", startWeek, now))
    setVisitorLastWeek(await countPeople("Visitor", startLastWeek, endLastWeek))
    setVisitorMonth(await countPeople("Visitor", startMonth, now))
    setVisitorLastMonth(await countPeople("Visitor", startLastMonth, endLastMonth))
    setVisitorYear(await countPeople("Visitor", startYear, now))
    setVisitorLastYear(await countPeople("Visitor", startLastYear, endLastYear))

    setMemberWeek(await countPeople("Member", startWeek, now))
    setMemberLastWeek(await countPeople("Member", startLastWeek, endLastWeek))
    setMemberMonth(await countPeople("Member", startMonth, now))
    setMemberLastMonth(await countPeople("Member", startLastMonth, endLastMonth))
    setMemberYear(await countPeople("Member", startYear, now))
    setMemberLastYear(await countPeople("Member", startLastYear, endLastYear))

    setWeekCheckIns(await countAttendance(startWeek, now))
    setLastWeekCheckIns(await countAttendance(startLastWeek, endLastWeek))
    setMonthCheckIns(await countAttendance(startMonth, now))
    setLastMonthCheckIns(await countAttendance(startLastMonth, endLastMonth))
    setYearCheckIns(await countAttendance(startYear, now))
    setLastYearCheckIns(await countAttendance(startLastYear, endLastYear))
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
          <p className="text-sm font-medium">
            Please select a church from the top dropdown.
          </p>
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
              To continue using FlockPulse, please subscribe to your $49/month plan.
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
        <h1 className="text-3xl font-bold">FlockPulse Dashboard</h1>

        <section className="grid gap-4 md:grid-cols-2">
          <Metric title="Total Visitors" value={totalVisitors} />
          <Metric title="Total Members" value={totalMembers} />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Check-Ins</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric
              title="This Week"
              value={weekCheckIns}
              change={percentChange(weekCheckIns, lastWeekCheckIns)}
              label="vs last week"
            />
            <Metric
              title="This Month"
              value={monthCheckIns}
              change={percentChange(monthCheckIns, lastMonthCheckIns)}
              label="vs last month"
            />
            <Metric
              title="This Year"
              value={yearCheckIns}
              change={percentChange(yearCheckIns, lastYearCheckIns)}
              label="vs last year"
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Visitors</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric
              title="New Visitors This Week"
              value={visitorWeek}
              change={percentChange(visitorWeek, visitorLastWeek)}
              label="vs last week"
            />
            <Metric
              title="New Visitors This Month"
              value={visitorMonth}
              change={percentChange(visitorMonth, visitorLastMonth)}
              label="vs last month"
            />
            <Metric
              title="New Visitors This Year"
              value={visitorYear}
              change={percentChange(visitorYear, visitorLastYear)}
              label="vs last year"
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Members</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric
              title="New Members This Week"
              value={memberWeek}
              change={percentChange(memberWeek, memberLastWeek)}
              label="vs last week"
            />
            <Metric
              title="New Members This Month"
              value={memberMonth}
              change={percentChange(memberMonth, memberLastMonth)}
              label="vs last month"
            />
            <Metric
              title="New Members This Year"
              value={memberYear}
              change={percentChange(memberYear, memberLastYear)}
              label="vs last year"
            />
          </div>
        </section>
      </main>
    </RequireAuth>
  )
}

function Metric({
  title,
  value,
  change,
  label,
}: {
  title: string
  value: number
  change?: string
  label?: string
}) {
  return (
    <div className="border rounded-xl p-6">
      <p className="text-sm">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
      {change && label && (
        <p className="text-sm">
          {change} {label}
        </p>
      )}
    </div>
  )
}