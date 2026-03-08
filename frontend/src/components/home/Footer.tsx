import Link from "next/link"

const sections = [
  { title: "Company", links: ["About Us", "Careers", "Press"] },
  { title: "Help", links: ["Customer Support", "Order Tracking", "FAQs"] },
  { title: "Policies", links: ["Privacy Policy", "Terms", "Returns"] },
  { title: "Contact", links: ["support@jantapharmacy.in", "+91 90000 12345", "Mon-Sun, 8am-10pm"] },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-slate-900">{section.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {section.links.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-slate-600 no-underline hover:text-slate-900">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Janta Pharmacy. All rights reserved.
      </div>
    </footer>
  )
}
