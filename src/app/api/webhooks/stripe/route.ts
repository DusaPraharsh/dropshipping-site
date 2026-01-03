import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (orderId) {
      try {
        // Update order status
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
          include: { items: true },
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            orderId: order.id,
            userId: order.buyerId,
            amount: order.totalAmount,
            platformFee: order.platformFee,
            distributorAmount: order.subtotal,
            status: "COMPLETED",
            stripePaymentId: session.payment_intent as string,
            stripeSessionId: session.id,
          },
        })

        // Create platform fee record
        await prisma.platformFee.create({
          data: {
            orderId: order.id,
            amount: order.platformFee,
            percentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "5"),
          },
        })

        // Update product stock
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }
      } catch (error) {
        console.error("Error processing webhook:", error)
        return NextResponse.json(
          { error: "Error processing webhook" },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}

