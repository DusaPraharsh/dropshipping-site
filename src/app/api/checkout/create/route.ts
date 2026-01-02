import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session || (session.user as any).role !== "BUYER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { items, shipping } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    // Fetch product details and validate stock
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products are no longer available" },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId)
      if (!product) continue

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemTotal,
      })
    }

    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "5")
    const platformFee = (subtotal * platformFeePercentage) / 100
    const total = subtotal + platformFee

    // Create order in database
    const order = await prisma.order.create({
      data: {
        buyerId: (session.user as any).id,
        status: "PENDING",
        subtotal,
        platformFee,
        totalAmount: total,
        shippingAddress: shipping.shippingAddress,
        shippingCity: shipping.shippingCity,
        shippingState: shipping.shippingState || null,
        shippingZip: shipping.shippingZip,
        shippingCountry: shipping.shippingCountry,
        items: {
          create: orderItems,
        },
      },
    })

    // Create Stripe Checkout Session
    const lineItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId)
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product?.name || "Product",
          },
          unit_amount: Math.round((product?.price || 0) * 100),
        },
        quantity: item.quantity,
      }
    })

    // Add platform fee as a line item
    if (platformFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Platform Fee",
          },
          unit_amount: Math.round(platformFee * 100),
        },
        quantity: 1,
      })
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
      metadata: {
        orderId: order.id,
        userId: (session.user as any).id,
      },
    })

    return NextResponse.json({ sessionId: stripeSession.id })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

