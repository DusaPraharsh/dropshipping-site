"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string
  stock: number
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if ((session.user as any).role !== "BUYER") {
      setMessage("Only buyers can add items to cart")
      return
    }

    if (quantity > stock) {
      setMessage("Not enough stock available")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Failed to add to cart")
        return
      }

      setMessage("Added to cart!")
      setTimeout(() => setMessage(""), 2000)
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (stock === 0) {
    return (
      <button
        disabled
        className="w-full rounded-md bg-gray-400 px-6 py-3 text-lg font-medium text-white cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          Quantity:
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          max={stock}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1
            setQuantity(Math.min(Math.max(1, val), stock))
          }}
          className="w-20 rounded-md border border-gray-300 px-3 py-2 text-center"
        />
      </div>
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
      {message && (
        <p className={`text-sm ${message.includes("Added") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  )
}

