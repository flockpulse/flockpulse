"use client"

import { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import RequireAuth from "@/components/RequireAuth"

export default function ScanPage() {
  const [message, setMessage] = useState("Ready to scan.")

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        setMessage("QR scanned. Opening check-in...")
        window.location.href = decodedText
      },
      () => {}
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [])

  return (
    <RequireAuth>
      <main className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">Scan QR</h1>
        <p className="text-sm">
          Scan a member QR code to check them in.
        </p>

        <div id="reader" className="max-w-md" />

        {message && <p className="text-sm font-medium">{message}</p>}
      </main>
    </RequireAuth>
  )
}