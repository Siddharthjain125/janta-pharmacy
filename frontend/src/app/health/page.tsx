"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { fetchArticles } from "@/lib/article-service";
import type { HealthArticleSummary } from "@/types/api";

export default function HealthPage() {
  const [articles, setArticles] = useState<HealthArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles(20)
      .then((data) => setArticles(data))
      .catch(() => setError("Unable to load health articles"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Health Articles</h1>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <article key={article.slug} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image
                src={article.coverImage}
                alt={article.title}
                width={420}
                height={210}
                className="h-44 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-slate-900">{article.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{article.summary}</p>
                <Link href={`/health/${article.slug}`} className="mt-4 inline-block text-blue-700 no-underline">
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
