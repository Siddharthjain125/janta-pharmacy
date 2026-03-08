import { BadgeCheck, Headset, LockKeyhole, PackageCheck } from "lucide-react"

const stats = [
  { label: "100k+ orders delivered", icon: PackageCheck },
  { label: "Certified pharmacy", icon: BadgeCheck },
  { label: "24/7 support", icon: Headset },
  { label: "Secure checkout", icon: LockKeyhole },
]

export function TrustIndicators() {
  return (
    <section className="bg-blue-50">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, icon: Icon }) => (
          <article key={label} className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4">
            <Icon className="h-5 w-5 text-blue-700" />
            <p className="font-medium text-slate-700">{label}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
