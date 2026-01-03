"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">DropShip Pro</span>
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/products"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Products
              </Link>
              {session?.user && (
                <>
                  {(session.user as any).role === "DISTRIBUTOR" && (
                    <Link
                      href="/dashboard/distributor"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      My Products
                    </Link>
                  )}
                  {(session.user as any).role === "BUYER" && (
                    <>
                      <Link
                        href="/cart"
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Cart
                      </Link>
                      <Link
                        href="/orders"
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        My Orders
                      </Link>
                    </>
                  )}
                  {(session.user as any).role === "ADMIN" && (
                    <Link
                      href="/dashboard/admin"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : session ? (
              <>
                <span className="text-sm text-gray-700">
                  {session.user?.name} ({(session.user as any).role})
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

