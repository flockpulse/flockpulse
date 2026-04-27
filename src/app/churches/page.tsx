"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserProfile } from "@/lib/getCurrentUserProfile"
import RequireAuth from "@/components/RequireAuth"

export default function ChurchesPage() {
  const [churches, setChurches] = useState<any[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
const [pastorName, setPastorName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [stateName, setStateName] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [message, setMessage] = useState("")
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    async function checkRole() {
      const profile = await getCurrentUserProfile()

      if (!profile || profile.role !== "superuser") {
        window.location.href = "/dashboard"
        return
      }

      setCheckingRole(false)
      loadChurches()
    }

    checkRole()
  }, [])

  async function loadChurches() {
    const { data, error } = await supabase
      .from("churches")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setChurches(data || [])
  }

  async function addChurch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")

    const { error } = await supabase.from("churches").insert([
      {
        name,
        phone,
        address,
        city,
        state: stateName,
        zip_code: zipCode,
      },
    ])

    if (error) {
      setMessage(error.message)
      return
    }

    setName("")
    setPhone("")
    setAddress("")
    setCity("")
    setStateName("")
    setZipCode("")
    setMessage("Church added successfully!")
    loadChurches()
  }

  if (checkingRole) {
    return <main className="p-6">Checking permissions...</main>
  }

  return (
    <RequireAuth>
      <main className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Churches</h1>

        <form
          onSubmit={addChurch}
          className="max-w-2xl space-y-4 border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold">Add Church</h2>

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Church Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
  placeholder="Church Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<input
  className="w-full border rounded-lg p-3"
  placeholder="Pastor's Name"
  value={pastorName}
  onChange={(e) => setPastorName(e.target.value)}
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

          <button className="w-full rounded-lg p-3 bg-black text-white">
            Add Church
          </button>

          {message && <p className="text-sm font-medium">{message}</p>}
        </form>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Existing Churches</h2>

          {churches.map((church) => (
            <div key={church.id} className="border rounded-xl p-4 space-y-1">
              <p className="font-bold">{church.name}</p>
              <p>{church.phone}</p>
              <p>
                {church.address} {church.city} {church.state} {church.zip_code}
              </p>
              <p className="text-xs opacity-60">ID: {church.id}</p>
            </div>
          ))}
        </section>
      </main>
    </RequireAuth>
  )
}