"use client"

import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { FormEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { fetchProducts } from "@/lib/catalog-service"
import type { ProductSummary } from "@/types/api"

export function SmartSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductSummary[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLFormElement | null>(null)

  const runCatalogSearch = () => {
    const normalized = query.trim()
    if (normalized) {
      router.push(`/catalog?search=${encodeURIComponent(normalized)}`)
      setOpen(false)
      return
    }
    router.push("/catalog")
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    runCatalogSearch()
  }

  const selectResult = (productId: string) => {
    setOpen(false)
    setQuery("")
    router.push(`/catalog/${productId}`)
  }

  useEffect(() => {
    const trimmedQuery = query.trim()
    if (trimmedQuery.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      setOpen(false)
      setHighlightedIndex(-1)
      return
    }

    setLoading(true)
    setError(null)

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetchProducts({
          search: trimmedQuery,
          limit: 6,
          page: 1,
        })
        setResults(response.data)
        setOpen(true)
        setHighlightedIndex(-1)
      } catch {
        setError("Unable to fetch results")
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 220)

    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener("mousedown", onOutsideClick)
    return () => window.removeEventListener("mousedown", onOutsideClick)
  }, [])

  return (
    <section className="bg-white">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-4xl px-4 py-10"
      >
        <form ref={containerRef} className="relative" onSubmit={handleSubmit}>
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search for medicines and health products"
            placeholder="Search for medicines, health products, vitamins..."
            className="h-14 rounded-full border-slate-200 pl-14 pr-28 text-base shadow-md"
            value={query}
            onFocus={() => {
              if (results.length > 0 || loading || error) setOpen(true)
            }}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (!open || results.length === 0) {
                if (event.key === "Enter") {
                  event.preventDefault()
                  runCatalogSearch()
                }
                return
              }

              if (event.key === "ArrowDown") {
                event.preventDefault()
                setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
              } else if (event.key === "ArrowUp") {
                event.preventDefault()
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
              } else if (event.key === "Enter") {
                event.preventDefault()
                if (highlightedIndex >= 0) {
                  selectResult(results[highlightedIndex].id)
                } else {
                  runCatalogSearch()
                }
              } else if (event.key === "Escape") {
                setOpen(false)
              }
            }}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Search
          </button>

          {open && (
            <div className="absolute left-0 right-0 top-16 z-40 rounded-2xl border border-slate-200 bg-white shadow-lg">
              {loading ? (
                <p className="px-5 py-4 text-sm text-slate-500">Searching medicines...</p>
              ) : error ? (
                <p className="px-5 py-4 text-sm text-red-600">{error}</p>
              ) : results.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">No matching products found.</p>
              ) : (
                <>
                  <ul className="max-h-80 overflow-y-auto py-2">
                    {results.map((item, index) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectResult(item.id)}
                          className={`flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50 ${
                            highlightedIndex === index ? "bg-slate-50" : ""
                          }`}
                        >
                          <span className="min-w-0 pr-4">
                            <span className="block truncate text-sm font-medium text-slate-900">
                              {item.name}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {item.categoryLabel}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-blue-700">
                            {item.price.formatted}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-100 px-5 py-3">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={runCatalogSearch}
                      className="text-xs font-medium text-blue-700"
                    >
                      View all results for &quot;{query.trim()}&quot;
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </motion.div>
    </section>
  )
}
