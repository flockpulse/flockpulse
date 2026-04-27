import type { Metadata } from "next"
import AuthHeader from "@/components/AuthHeader"
import "./globals.css"

export const metadata: Metadata = {
  title: "FlockPulse",
  description: "Church attendance and engagement system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthHeader />
        {children}
      </body>
    </html>
  )
}