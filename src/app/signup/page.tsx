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

    try {
      // 🔐 Create Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // ⛪ Create church
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

      if (churchError) throw churchError

      if (!authData.user?.id) {
  setMessage("User account was not created. Please try again.")
  return
}

const { error: userError } = await supabase.from("users").insert([
  {
    id: authData.user.id,
    name: adminName,
    email,
    role: "admin",
    church_id: churchData.id,
  },
])


      if (userError) throw userError

      setMessage("Redirecting to payment...")

      // 💳 Stripe checkout
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          churchId: churchData.id,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error: any) {
      setMessage(error.message)
    }
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
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Address"
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

        <button className="w-full bg-black text-white p-3 rounded-lg">
          Create Account + Continue to Payment
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </main>
  )
}