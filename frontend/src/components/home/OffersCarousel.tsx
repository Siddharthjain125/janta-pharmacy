"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPromotions } from "@/lib/promotion-service"
import type { Promotion } from "@/types/api"

export function OffersCarousel() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPromotions()
      .then((data) => setPromotions(data))
      .catch(() => setError("Unable to load promotions"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Best Deals For You</h2>
        </div>
        {loading ? (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-72 min-w-[260px] rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        ) : promotions.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No active promotions right now.</p>
        ) : (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {promotions.map((item) => (
              <Card
                key={item.id}
                className="min-w-[260px] rounded-xl border-slate-200 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative overflow-hidden rounded-lg bg-slate-50 p-2">
                  <Badge className="absolute left-3 top-3 bg-emerald-600 text-white">
                    {item.discountPercent}% OFF
                  </Badge>
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={240}
                    height={150}
                    className="h-[140px] w-full rounded-md object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                <Button className="mt-4 h-9 w-full rounded-full" asChild>
                  <Link href="/catalog">Shop Offer</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
