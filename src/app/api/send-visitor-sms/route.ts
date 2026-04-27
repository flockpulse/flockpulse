import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(request: Request) {
  const { phone, name, churchName } = await request.json()

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  await client.messages.create({
    body: `Hi ${name}, thanks for visiting ${churchName}! We’re glad you joined us.`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phone,
  })

  return NextResponse.json({ success: true })
}