"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { fetchArticleBySlug } from "@/lib/article-service";
import type { HealthArticle } from "@/types/api";

export default function HealthArticlePage() {
  const params = useParams<{ slug: string }>();
  const [article, setArticle] = useState<HealthArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.slug) return;
    fetchArticleBySlug(params.slug)
      .then((data) => setArticle(data))
      .catch(() => setError("Article not found"))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  if (error || !article) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error ?? "Not found"}</p>;
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Image
        src={article.coverImage}
        alt={article.title}
        width={900}
        height={420}
        className="h-64 w-full rounded-xl object-cover"
      />
      <h1 className="text-3xl font-semibold text-slate-900">{article.title}</h1>
      <p className="text-sm text-slate-500">
        Published on {new Date(article.publishedAt).toLocaleDateString()}
      </p>
      <div className="whitespace-pre-line text-slate-700">{article.content}</div>
    </article>
  );
}
