"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function TestSupabasePage() {
  const [message, setMessage] = useState("Testing...")

  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .limit(1)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage(`Success: ${data.length} record(s) found`)
      }
    }

    test()
  }, [])

  return <main className="p-6">{message}</main>
}