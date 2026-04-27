import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const churchId = session.metadata?.church_id

    if (churchId) {
      await supabaseAdmin
        .from("churches")
        .update({
          subscription_status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", churchId)
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription

    await supabaseAdmin
      .from("churches")
      .update({ subscription_status: "canceled" })
      .eq("stripe_subscription_id", subscription.id)
  }

  return NextResponse.json({ received: true })
}