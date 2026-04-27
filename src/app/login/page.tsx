"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    })

    setMessage(error ? error.message : "Check your email for the login link.")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Login to FlockPulse</h1>

        <input
          className="w-full border rounded-lg p-3"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="w-full rounded-lg p-3 bg-black text-white">
          Send Login Link
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </main>
  )
}