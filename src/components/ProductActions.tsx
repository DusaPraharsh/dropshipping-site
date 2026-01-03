"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProductActions({ product }: { product: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete product")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to update product")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end space-x-2">
      <Link
        href={`/dashboard/distributor/products/${product.id}/edit`}
        className="text-blue-600 hover:text-blue-900"
      >
        Edit
      </Link>
      <button
        onClick={handleToggleStatus}
        disabled={loading}
        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
      >
        {product.isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:text-red-900 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}

