"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) {
      router.push("/")
      return
    }

    fetch(`/api/orders/verify?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order)
          // Clear cart
          localStorage.removeItem("cart")
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-medium text-red-800">Order Not Found</h2>
          <p className="mt-2 text-sm text-red-600">
            We couldn't find your order. Please contact support.
          </p>
          <Link
            href="/orders"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View My Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-green-800">Order Placed Successfully!</h2>
        <p className="mt-2 text-green-600">Your order #{order.id.slice(0, 8)} has been confirmed.</p>
        <p className="mt-1 text-sm text-green-600">Total: ${order.totalAmount.toFixed(2)}</p>
        <div className="mt-6">
          <Link
            href="/orders"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}

