import Image from "next/image"

const items = [
  "Diabetes Care",
  "Heart Health",
  "Immunity",
  "Weight Management",
  "Women's Health",
  "Senior Care",
]

export function HealthCategories() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Health Conditions We Cover</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((title) => (
            <article key={title} className="group relative h-40 overflow-hidden rounded-xl">
              <Image
                src="/assets/categories/condition-card.svg"
                alt={title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
              <p className="absolute bottom-4 left-4 text-lg font-semibold text-white">{title}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
