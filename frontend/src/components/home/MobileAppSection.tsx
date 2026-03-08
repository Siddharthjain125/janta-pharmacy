import Image from "next/image"

import { Button } from "@/components/ui/button"

export function MobileAppSection() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-emerald-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Manage your health on the go.</h2>
          <p className="mt-3 text-slate-600">
            Track orders, manage prescriptions, and reorder medicines in a few taps.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full border-slate-300 bg-white px-6">
              App Store
            </Button>
            <Button className="rounded-full px-6">Google Play</Button>
          </div>
        </div>
        <div className="mx-auto max-w-xs">
          <Image
            src="/assets/hero/app-mockup.svg"
            alt="Janta Pharmacy app mockup"
            width={320}
            height={480}
            className="h-auto w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
