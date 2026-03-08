"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { fetchCategories } from "@/lib/catalog-service"
import type { Category } from "@/types/api"

const categoryImageMap: Record<string, string> = {
  GENERAL: "/assets/categories/pain-relief.svg",
  PRESCRIPTION: "/assets/categories/diabetes.svg",
  SUPPLEMENTS: "/assets/categories/vitamins.svg",
}

function categoryImagePath(code: string): string {
  // TODO: replace with real per-category assets as design pack grows.
  return categoryImageMap[code] ?? "/assets/categories/pain-relief.svg"
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data))
      .catch(() => setError("Unable to load categories"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Popular Categories</h2>
        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No categories available right now.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <motion.article
                key={category.code}
                whileHover={{ y: -4 }}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <Link
                  href={`/catalog?category=${encodeURIComponent(category.code)}`}
                  className="block p-4 no-underline"
                >
                  <Image
                    src={categoryImagePath(category.code)}
                    alt={category.label}
                    width={160}
                    height={80}
                    className="h-20 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                  <p className="mt-3 text-sm font-medium text-slate-700">{category.label}</p>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
