import { getServerSession } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

async function getStats() {
  const [users, products, orders, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "COMPLETED",
      },
    }),
  ])

  const platformFees = await prisma.platformFee.aggregate({
    _sum: {
      amount: true,
    },
  })

  return {
    users,
    products,
    orders,
    totalRevenue: totalRevenue._sum.amount || 0,
    platformFees: platformFees._sum.amount || 0,
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession()

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const stats = await getStats()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.users}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.products}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.orders}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Platform Fees Collected</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${stats.platformFees.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Overview</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Revenue (All Transactions)</span>
            <span className="text-gray-900 font-medium">${stats.totalRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee Percentage</span>
            <span className="text-gray-900 font-medium">
              {process.env.PLATFORM_FEE_PERCENTAGE || "5"}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

