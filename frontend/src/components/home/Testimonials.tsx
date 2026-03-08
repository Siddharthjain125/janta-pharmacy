import { Star } from "lucide-react"

const reviews = [
  { name: "Anita Verma", text: "Delivery was super quick and medicines were genuine. Packaging was excellent." },
  { name: "Rahul Mehta", text: "Prescription upload flow is simple and pharmacist support is very helpful." },
  { name: "Neha Sharma", text: "Best prices for my monthly medicines with reliable doorstep delivery." },
]

export function Testimonials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Loved by Customers</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {reviews.map((item) => (
            <article key={item.name} className="min-w-[260px] rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {item.name[0]}
                </div>
                <p className="font-semibold text-slate-900">{item.name}</p>
              </div>
              <p className="mt-4 text-sm text-slate-600">{item.text}</p>
              <div className="mt-4 flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
