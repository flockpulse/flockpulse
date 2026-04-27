"use client"

import { useEffect, useState } from "react"
import RequireAuth from "@/components/RequireAuth"

export default function ScanPage() {
  const [message, setMessage] = useState("Loading scanner...")

  useEffect(() => {
    let scanner: any

    async function startScanner() {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode")

        scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          false
        )

        scanner.render(
          (decodedText: string) => {
            setMessage("QR scanned. Opening check-in...")
            window.location.href = decodedText
          },
          (_error: string) => {}
        )

        setMessage("Ready to scan. Allow camera access.")
      } catch (error: any) {
        setMessage(`Scanner error: ${error.message}`)
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {})
      }
    }
  }, [])

  return (
    <RequireAuth>
      <main className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">Scan QR</h1>
        <p className="text-sm">Allow camera access, then scan a member QR code.</p>

        <div id="reader" className="max-w-md" />

        {message && <p className="text-sm font-medium">{message}</p>}
      </main>
    </RequireAuth>
  )
}