"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { fetchArticles } from "@/lib/article-service"
import type { HealthArticleSummary } from "@/types/api"

export function BlogPreview() {
  const [posts, setPosts] = useState<HealthArticleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles(3)
      .then((data) => setPosts(data))
      .catch(() => setError("Unable to load health articles"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Health Articles</h2>
        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No health articles available.</p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={360}
                    height={180}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900">{post.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{post.summary}</p>
                    <Link
                      href={`/health/${post.slug}`}
                      className="mt-3 inline-block text-sm font-medium text-blue-700 no-underline"
                    >
                      Read more
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5">
              <Link href="/health" className="text-sm font-medium text-blue-700 no-underline">
                View all health articles
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
