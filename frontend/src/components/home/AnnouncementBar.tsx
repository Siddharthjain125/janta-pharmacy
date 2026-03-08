import Link from "next/link"

export function AnnouncementBar() {
  return (
    <div className="border-b border-blue-100 bg-blue-50 text-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-blue-900">
        <p>Free delivery on orders above Rs 499</p>
        <Link href="/offers" className="font-medium text-blue-700 no-underline hover:text-blue-900">
          View Offers
        </Link>
      </div>
    </div>
  )
}
