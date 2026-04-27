"use client"

import { useState } from "react"
import RequireAuth from "@/components/RequireAuth"

export default function ScanPage() {
  const [message, setMessage] = useState("Tap Start Scanner to begin.")
  const [scannerStarted, setScannerStarted] = useState(false)

  async function startScanner() {
    try {
      setMessage("Starting camera...")

      const { Html5Qrcode } = await import("html5-qrcode")

      const html5QrCode = new Html5Qrcode("reader")

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText: string) => {
          setMessage("QR scanned. Opening check-in...")

          await html5QrCode.stop()
          window.location.href = decodedText
        },
        () => {}
      )

      setScannerStarted(true)
      setMessage("Scanner ready. Point camera at QR code.")
    } catch (error: any) {
      setMessage(`Scanner error: ${error?.message || String(error)}`)
    }
  }

  return (
    <RequireAuth>
      <main className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">Scan QR</h1>
        <p className="text-sm">Tap start, allow camera access, then scan a member QR code.</p>

        {!scannerStarted && (
          <button
            onClick={startScanner}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Start Scanner
          </button>
        )}

        <div id="reader" className="max-w-md" />

        {message && <p className="text-sm font-medium">{message}</p>}
      </main>
    </RequireAuth>
  )
}