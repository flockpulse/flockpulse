"use client"
import RequireAuth from "@/components/RequireAuth"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ChurchesPage() {
  const [churchName, setChurchName] = useState("")
  const [message, setMessage] = useState("")

  async function addChurch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    const { error } = await supabase.from("churches").insert([
      {
        name: churchName,
      },
    ])

    if (error) {
      setMessage(error.message)
      return
    }

    setChurchName("")
    setMessage("Church added successfully!")
  }

  return (
    <RequireAuth>
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={addChurch}
        className="w-full max-w-md space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-2xl font-bold">Add Church</h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Church Name"
          value={churchName}
          onChange={(e) => setChurchName(e.target.value)}
          required
        />

        <button className="w-full rounded-lg p-3 bg-black text-white">
          Add Church
        </button>

        {message && <p className="text-sm font-medium">{message}</p>}
      </form>
    </main>
    </RequireAuth>
  )
}