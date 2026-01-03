"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface CartItem {
  productId: string
  quantity: number
  name: string
  price: number
  imageUrl?: string
  stock: number
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if ((session.user as any).role !== "BUYER") {
      router.push("/")
      return
    }

    // Load cart from localStorage
    const cart = localStorage.getItem("cart")
    if (cart) {
      const items = JSON.parse(cart)
      // Fetch product details for each item
      Promise.all(
        items.map(async (item: { productId: string; quantity: number }) => {
          try {
            const res = await fetch(`/api/products/${item.productId}`)
            if (res.ok) {
              const product = await res.json()
              return {
                ...item,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
              }
            }
          } catch (error) {
            console.error("Error fetching product:", error)
          }
          return null
        })
      ).then((products) => {
        setCartItems(products.filter((p) => p !== null))
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [session, router])

  const updateQuantity = (productId: string, quantity: number) => {
    const updated = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
    )
    setCartItems(updated)
    localStorage.setItem(
      "cart",
      JSON.stringify(updated.map(({ productId, quantity }) => ({ productId, quantity })))
    )
  }

  const removeItem = (productId: string) => {
    const updated = cartItems.filter((item) => item.productId !== productId)
    setCartItems(updated)
    localStorage.setItem(
      "cart",
      JSON.stringify(updated.map(({ productId, quantity }) => ({ productId, quantity })))
    )
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const platformFeePercentage = 5 // This should come from env
  const platformFee = (subtotal * platformFeePercentage) / 100
  const total = subtotal + platformFee

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="h-24 w-24 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded bg-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="rounded border border-gray-300 px-2 py-1"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 lg:col-span-5 lg:mt-0">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee ({platformFeePercentage}%)</span>
                  <span className="text-gray-900">${platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

