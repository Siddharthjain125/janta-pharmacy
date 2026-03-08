"use client"

import { FormEvent, useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeToNewsletter } from "@/lib/newsletter-service"
import type { ApiError } from "@/types/api"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setToast(null)

    try {
      await subscribeToNewsletter(email.trim())
      setToast({ type: "success", message: "Subscribed successfully." })
      setEmail("")
    } catch (error) {
      const apiError = error as ApiError
      const message =
        apiError?.error?.code === "NEWSLETTER_ALREADY_SUBSCRIBED"
          ? "This email is already subscribed."
          : "Unable to subscribe. Please try again."
      setToast({ type: "error", message })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setToast(null), 2500)
    }
  }

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Get health tips &amp; exclusive offers</h2>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <Input
              type="email"
              aria-label="Email address"
              placeholder="Enter your email"
              className="h-11 rounded-full border-slate-200"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" className="h-11 rounded-full px-6" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          {toast && (
            <div
              className={`mt-4 rounded-lg px-4 py-2 text-sm ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
