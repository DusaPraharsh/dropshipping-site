import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import AddToCartButton from "@/components/AddToCartButton"
import Image from "next/image"

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      distributor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
  return product
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="aspect-h-4 aspect-w-3 overflow-hidden rounded-lg bg-gray-200">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={800}
              height={800}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-xl">No Image Available</span>
            </div>
          )}
        </div>
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-3 text-lg text-gray-500">{product.description}</p>
          
          <div className="mt-6">
            <p className="text-3xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Stock: {product.stock} units
            </p>
            {product.category && (
              <p className="mt-1 text-sm text-gray-500">
                Category: {product.category}
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Distributor</h3>
            <p className="mt-2 text-sm text-gray-500">{product.distributor.name}</p>
          </div>

          <div className="mt-10">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </div>
  )
}

