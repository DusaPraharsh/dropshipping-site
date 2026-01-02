import Link from "next/link"

export default function Home() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            DropShip Pro
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your complete dropshipping platform. Connect distributors with buyers seamlessly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/products"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Browse Products
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Get Started <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">For Distributors</h3>
            <p className="text-gray-600">
              List your products, manage inventory, and reach customers worldwide. Simple pricing with transparent platform fees.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">For Buyers</h3>
            <p className="text-gray-600">
              Discover quality products from verified distributors. Secure checkout with multiple payment options.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Powered by Stripe. All transactions are secure and encrypted. Track your orders in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
