import type { Metadata } from "next"
import AuthHeader from "@/components/AuthHeader"
import "./globals.css"
import { ChurchProvider } from "@/lib/churchContext"

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
        <ChurchProvider>
        <AuthHeader />
        {children}
        </ChurchProvider>
      </body>
    </html>
  )
}