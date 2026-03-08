import { CheckCircle2, ShieldCheck, Timer, WalletCards } from "lucide-react"

const features = [
  { title: "Licensed Pharmacists", icon: CheckCircle2, description: "Expert review and guidance for every order." },
  { title: "Genuine Medicines", icon: ShieldCheck, description: "Sourced from verified distributors only." },
  { title: "Fast Delivery", icon: Timer, description: "Express delivery in major service zones." },
  { title: "Secure Payments", icon: WalletCards, description: "Protected checkout with trusted gateways." },
]

export function WhyChooseUs() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Why Choose Janta Pharmacy</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, icon: Icon, description }) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <Icon className="h-7 w-7 text-blue-700" />
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
