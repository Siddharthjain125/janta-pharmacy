"use client"

import { useEffect, useState } from "react"
import { useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Search, ShoppingCart, UserRound } from "lucide-react"

import { AnnouncementBar } from "@/components/home/AnnouncementBar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { fetchProducts } from "@/lib/catalog-service"
import { getCart } from "@/lib/cart-service"
import { ROUTES } from "@/lib/constants"
import { ProductSummary, UserRole } from "@/types/api"

const navItems = [
  { href: ROUTES.HOME, label: "Home" },
  { href: ROUTES.CATALOG, label: "Medicines" },
  { href: ROUTES.PRESCRIPTIONS, label: "Prescription" },
  { href: ROUTES.ORDERS, label: "Orders" },
]

export function Header() {
  const router = useRouter()
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const [cartItemCount, setCartItemCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ProductSummary[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const isAdmin = Boolean(user?.roles?.includes(UserRole.ADMIN))

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      getCart()
        .then((cart) => setCartItemCount(cart?.itemCount || 0))
        .catch(() => setCartItemCount(0))
    } else {
      setCartItemCount(0)
    }
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent<{ itemCount: number }>) => {
      setCartItemCount(event.detail.itemCount)
    }

    window.addEventListener("cart-updated" as never, handleCartUpdate)
    return () => window.removeEventListener("cart-updated" as never, handleCartUpdate)
  }, [])

  useEffect(() => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length < 2) {
      setSearchResults([])
      setSearchOpen(false)
      setSearchLoading(false)
      setSearchError(null)
      setHighlightedIndex(-1)
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetchProducts({
          search: trimmedQuery,
          limit: 6,
          page: 1,
        })
        setSearchResults(response.data)
        setSearchOpen(true)
        setHighlightedIndex(-1)
      } catch {
        setSearchError("Unable to fetch results")
        setSearchOpen(true)
      } finally {
        setSearchLoading(false)
      }
    }, 220)

    return () => window.clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }
    window.addEventListener("mousedown", onOutsideClick)
    return () => window.removeEventListener("mousedown", onOutsideClick)
  }, [])

  const runCatalogSearch = () => {
    const trimmed = searchQuery.trim()
    if (trimmed) {
      router.push(`${ROUTES.CATALOG}?search=${encodeURIComponent(trimmed)}`)
      setSearchOpen(false)
      return
    }
    router.push(ROUTES.CATALOG)
  }

  const selectResult = (productId: string) => {
    setSearchOpen(false)
    setSearchQuery("")
    router.push(ROUTES.PRODUCT_DETAIL(productId))
  }

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href={ROUTES.HOME} className="shrink-0 text-xl font-bold text-blue-700 no-underline">
            Janta Pharmacy
          </Link>

          <div ref={searchContainerRef} className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label="Search medicines from header"
              placeholder="Search medicines, vitamins, devices..."
              className="h-10 rounded-full border-slate-200 pl-9 pr-24 shadow-sm"
              value={searchQuery}
              onFocus={() => {
                if (searchResults.length > 0 || searchLoading || searchError) {
                  setSearchOpen(true)
                }
              }}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (!searchOpen || searchResults.length === 0) {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    runCatalogSearch()
                  }
                  return
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setHighlightedIndex((prev) =>
                    prev < searchResults.length - 1 ? prev + 1 : 0,
                  )
                } else if (event.key === "ArrowUp") {
                  event.preventDefault()
                  setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : searchResults.length - 1,
                  )
                } else if (event.key === "Enter") {
                  event.preventDefault()
                  if (highlightedIndex >= 0) {
                    selectResult(searchResults[highlightedIndex].id)
                  } else {
                    runCatalogSearch()
                  }
                } else if (event.key === "Escape") {
                  setSearchOpen(false)
                }
              }}
            />
            <button
              type="button"
              onClick={runCatalogSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Search
            </button>

            {searchOpen && (
              <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border border-slate-200 bg-white shadow-lg">
                {searchLoading ? (
                  <p className="px-4 py-3 text-sm text-slate-500">Searching medicines...</p>
                ) : searchError ? (
                  <p className="px-4 py-3 text-sm text-red-600">{searchError}</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No matching products found.</p>
                ) : (
                  <>
                    <ul className="max-h-80 overflow-y-auto py-2">
                      {searchResults.map((item, index) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectResult(item.id)}
                            className={`flex w-full items-center justify-between px-4 py-2 text-left hover:bg-slate-50 ${
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
                    <div className="border-t border-slate-100 px-4 py-2">
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={runCatalogSearch}
                        className="text-xs font-medium text-blue-700"
                      >
                        View all results for &quot;{searchQuery.trim()}&quot;
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {isLoading ? (
              <span className="text-sm text-slate-500">Loading...</span>
            ) : isAuthenticated ? (
              <Button size="sm" variant="outline" className="rounded-full" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full" asChild>
                <Link href={ROUTES.LOGIN}>Login</Link>
              </Button>
            )}

            <Link href={ROUTES.CART} className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 p-0 text-[10px]">{cartItemCount}</Badge>
              )}
            </Link>

            <Link href={ROUTES.PROFILE} className="rounded-full p-2 text-slate-700 hover:bg-slate-100">
              <UserRound className="h-5 w-5" />
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <button
              aria-label="Search"
              className="rounded-full p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => router.push(ROUTES.CATALOG)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href={ROUTES.CART} className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 p-0 text-[10px]">{cartItemCount}</Badge>
              )}
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <button aria-label="Open menu" className="rounded-full p-2 text-slate-700 hover:bg-slate-100">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="mt-8 space-y-5">
                  <p className="text-lg font-semibold text-slate-900">Menu</p>
                  <nav className="space-y-3">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href} className="block text-slate-700 no-underline hover:text-blue-700">
                        {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <>
                        <Link href={ROUTES.ADMIN_PRESCRIPTIONS} className="block text-slate-700 no-underline hover:text-blue-700">
                          Admin Prescriptions
                        </Link>
                        <Link href={ROUTES.ADMIN_PAYMENTS} className="block text-slate-700 no-underline hover:text-blue-700">
                          Admin Payments
                        </Link>
                      </>
                    )}
                  </nav>
                  {isAuthenticated ? (
                    <Button className="w-full rounded-full" variant="outline" onClick={logout}>
                      Logout
                    </Button>
                  ) : (
                    <Button className="w-full rounded-full" asChild>
                      <Link href={ROUTES.LOGIN}>Login</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="hidden border-t border-slate-100 md:block">
          <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 no-underline hover:text-blue-700">
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href={ROUTES.ADMIN_PAYMENTS} className="text-sm font-medium text-slate-600 no-underline hover:text-blue-700">
                Admin Payments
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
