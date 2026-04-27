"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SignupPage() {
  const [churchName, setChurchName] = useState("")
  const [pastorName, setPastorName] = useState("")
  const [adminName, setAdminName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [stateName, setStateName] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [message, setMessage] = useState("")

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("Creating account...")

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setMessage(authError.message)
      return
    }

    const { data: churchData, error: churchError } = await supabase
      .from("churches")
      .insert([
        {
          name: churchName,
          pastor_name: pastorName,
          email,
          phone,
          address,
          city,
          state: stateName,
          zip_code: zipCode,
        },
      ])
      .select()
      .single()

    if (churchError) {
      setMessage(churchError.message)
      return
    }

    const { error: userError } = await supabase.from("users").insert([
      {
        id: authData.user?.id,
        name: adminName,
        email,
        role: "admin",
        church_id: churchData.id,
      },
    ])

    if (userError) {
      setMessage(userError.message)
      return
    }

    setMessage("Account created. Redirecting to payment...")

    const checkoutResponse = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        churchId: churchData.id,
        email,
      }),
    })

    const checkoutData = await checkoutResponse.json()

if (!checkoutResponse.ok) {
  setMessage(checkoutData.error || "Payment checkout failed.")
  return
}

if (checkoutData.url) {
  window.location.href = checkoutData.url
} else {
  setMessage("No Stripe checkout URL returned.")
}
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-2xl space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-3xl font-bold">Create FlockPulse Account</h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Church Name"
          value={churchName}
          onChange={(e) => setChurchName(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Pastor Name"
          value={pastorName}
          onChange={(e) => setPastorName(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Admin Name"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          type="email"
          placeholder="Admin Email / Login Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Church Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Church Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="State"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Zip Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </div>

        <button className="w-full rounded-lg p-3 bg-black text-white">
          Create Account + Continue to Payment
        </button>

        {message && <p className="text-sm font-medium">{message}</p>}
      </form>
    </main>
  )
}