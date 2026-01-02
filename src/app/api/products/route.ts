import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  sku: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session || (session.user as any).role !== "DISTRIBUTOR") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        category: data.category || null,
        sku: data.sku || null,
        distributorId: (session.user as any).id,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

