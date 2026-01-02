import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session || (session.user as any).role !== "BUYER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { productId, quantity } = await req.json()

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      )
    }

    // In a real app, you'd store cart in database or session
    // For now, we'll use a simple approach with localStorage on client side
    // This endpoint just validates the request
    
    return NextResponse.json(
      { message: "Product added to cart", productId, quantity },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

