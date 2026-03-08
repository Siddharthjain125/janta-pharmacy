import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function PrescriptionBanner() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-2 md:items-center">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8">
          <h2 className="text-3xl font-semibold text-slate-900">Have a prescription?</h2>
          <p className="mt-3 text-slate-600">Upload it and our pharmacists will verify it.</p>
          <Button asChild className="mt-6 rounded-full px-6">
            <Link href="/prescriptions/new">Upload Prescription</Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Image
            src="/assets/hero/prescription-upload.svg"
            alt="Upload prescription illustration"
            width={620}
            height={320}
            className="h-auto w-full rounded-xl"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
