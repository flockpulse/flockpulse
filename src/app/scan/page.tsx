"use client"

import { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

export default function ScanPage() {
  const [message, setMessage] = useState("")

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
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Scan Check-In QR</h1>
      <p>Allow camera access, then scan a member QR code.</p>

      <div id="reader" className="max-w-md" />

      {message && <p>{message}</p>}
    </main>
  )
}