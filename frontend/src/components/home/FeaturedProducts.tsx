"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchProducts } from "@/lib/catalog-service"
import { calculatePricingDisplay, formatPrice } from "@/lib/pricing-display"
import type { ProductSummary } from "@/types/api"

function ProductCard({ product }: { product: ProductSummary }) {
  const pricing = calculatePricingDisplay(product.price.amount, product.price.currency)
  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Image
        src="/assets/products/product-placeholder.svg"
        alt={product.name}
        width={280}
        height={160}
        className="h-[150px] w-full rounded-lg bg-slate-50 object-cover"
        loading="lazy"
      />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{product.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{product.description ?? "Trusted pharmacy product"}</p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-900">
          {formatPrice(pricing.sellingPrice, pricing.currency)}
        </span>
        <span className="text-slate-400 line-through">
          {formatPrice(pricing.mrp, pricing.currency)}
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
          {pricing.discountPercent}% off
        </span>
      </div>
      <Button className="mt-4 h-9 w-full rounded-full" asChild>
        <Link href={`/catalog/${product.id}`}>View Product</Link>
      </Button>
    </Card>
  )
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts({ featured: true, limit: 8 })
      .then((response) => setProducts(response.data))
      .catch(() => setError("Unable to load featured products"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Featured Products</h2>
        {loading ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No featured products available yet.</p>
        ) : (
          <>
            <div className="mt-6 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
              {products.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:hidden">
              {products.map((item) => (
                <div key={item.id} className="min-w-[260px]">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
