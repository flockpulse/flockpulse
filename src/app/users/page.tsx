"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserProfile } from "@/lib/getCurrentUserProfile"
import RequireAuth from "@/components/RequireAuth"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [churches, setChurches] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [checkingRole, setCheckingRole] = useState(true)

  async function loadData() {
    const { data: churchData } = await supabase
      .from("churches")
      .select("*")
      .order("name", { ascending: true })

    const { data: userData, error } = await supabase
      .from("users")
      .select("*, churches(name)")
      .order("email", { ascending: true })

    if (error) {
      setMessage(error.message)
      return
    }

    setChurches(churchData || [])
    setUsers(userData || [])
  }

  useEffect(() => {
    async function checkRole() {
      const profile = await getCurrentUserProfile()

      if (!profile || profile.role !== "superuser") {
        window.location.href = "/dashboard"
        return
      }

      setCheckingRole(false)
      loadData()
    }

    checkRole()
  }, [])

  async function updateUser(id: string, field: string, value: string) {
    const { error } = await supabase
      .from("users")
      .update({ [field]: value })
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("User updated successfully.")
    loadData()
  }

  if (checkingRole) {
    return <main className="p-6">Checking permissions...</main>
  }

  return (
    <RequireAuth>
      <main className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Users</h1>

        {message && <p className="text-sm font-medium">{message}</p>}

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="border rounded-xl p-4 space-y-3">
              <div>
                <p className="font-bold">{user.name || "No Name"}</p>
                <p>{user.email}</p>
                <p className="text-xs opacity-60">ID: {user.id}</p>
              </div>

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Name"
                defaultValue={user.name || ""}
                onBlur={(e) => updateUser(user.id, "name", e.target.value)}
              />

              <select
                className="w-full border rounded-lg p-3"
                defaultValue={user.role || "admin"}
                onChange={(e) => updateUser(user.id, "role", e.target.value)}
              >
                <option value="superuser">Superuser</option>
                <option value="admin">Admin</option>
                <option value="leader">Leader</option>
                <option value="volunteer">Volunteer</option>
              </select>

              <select
                className="w-full border rounded-lg p-3"
                defaultValue={user.church_id || ""}
                onChange={(e) =>
                  updateUser(user.id, "church_id", e.target.value)
                }
              >
                <option value="">No Church Assigned</option>
                {churches.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </main>
    </RequireAuth>
  )
}