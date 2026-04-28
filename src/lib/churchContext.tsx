"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const ChurchContext = createContext<any>(null)

export function ChurchProvider({ children }: { children: React.ReactNode }) {
  const [selectedChurchId, setSelectedChurchId] = useState("")
  const [churchLoading, setChurchLoading] = useState(true)

  useEffect(() => {
    async function loadChurch() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setSelectedChurchId("")
        setChurchLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("users")
        .select("church_id, role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "superuser") {
        setSelectedChurchId(profile?.church_id || "")
      }

      setChurchLoading(false)
    }

    loadChurch()
  }, [])

  return (
    <ChurchContext.Provider
      value={{
        selectedChurchId,
        setSelectedChurchId,
        churchLoading,
      }}
    >
      {children}
    </ChurchContext.Provider>
  )
}

export function useChurch() {
  return useContext(ChurchContext)
}