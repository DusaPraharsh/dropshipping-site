import { getServerSession } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

async function getOrders(userId: string, role: string) {
  if (role === "BUYER") {
    return await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } else if (role === "DISTRIBUTOR") {
    // Get orders that contain products from this distributor
    return await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              distributorId: userId,
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
                distributorId: true,
              },
            },
          },
        },
        buyer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }
  return []
}

export default async function OrdersPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/auth/signin")
  }

  const orders = await getOrders((session.user as any).id, (session.user as any).role)

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {(session.user as any).role === "BUYER" ? "My Orders" : "Orders"}
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items
                    .filter((item: any) =>
                      (session.user as any).role === "DISTRIBUTOR"
                        ? item.product.distributorId === (session.user as any).id
                        : true
                    )
                    .map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>
                          {item.product.name} x {item.quantity}
                        </span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="text-gray-900">${order.platformFee.toFixed(2)}</span>
                </div>
              </div>

              {(session.user as any).role === "DISTRIBUTOR" && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    Buyer: {order.buyer.name} ({order.buyer.email})
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Shipping: {order.shippingAddress}, {order.shippingCity}, {order.shippingZip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

