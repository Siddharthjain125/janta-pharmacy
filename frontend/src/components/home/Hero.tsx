"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { fetchCategories } from "@/lib/catalog-service"

export function Hero() {
  const [categoryCount, setCategoryCount] = useState<number>(0)

  useEffect(() => {
    fetchCategories()
      .then((categories) => setCategoryCount(categories.length))
      .catch(() => setCategoryCount(0))
  }, [])

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Trusted Healthcare Delivery</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Your trusted online pharmacy
          </h1>
          <p className="max-w-xl text-base text-slate-600 md:text-lg">
            Genuine medicines, fast delivery and licensed pharmacists.
          </p>
          <p className="text-sm text-slate-500">
            {categoryCount > 0
              ? `Explore ${categoryCount} medicine categories curated by pharmacists.`
              : "Explore medicine categories curated by pharmacists."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-full px-6">
              <Link href="/catalog">Browse Medicines</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full px-6">
              <Link href="/prescriptions/new">Upload Prescription</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-md"
        >
          <Image
            src="/assets/hero/pharmacy-delivery.svg"
            alt="Medical delivery and healthcare illustration"
            width={640}
            height={420}
            className="h-auto w-full rounded-xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}
