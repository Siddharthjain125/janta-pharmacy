import { BlogPreview } from "@/components/home/BlogPreview"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { Footer } from "@/components/home/Footer"
import { HealthCategories } from "@/components/home/HealthCategories"
import { Hero } from "@/components/home/Hero"
import { MobileAppSection } from "@/components/home/MobileAppSection"
import { Newsletter } from "@/components/home/Newsletter"
import { OffersCarousel } from "@/components/home/OffersCarousel"
import { PrescriptionBanner } from "@/components/home/PrescriptionBanner"
import { SmartSearch } from "@/components/home/SmartSearch"
import { Testimonials } from "@/components/home/Testimonials"
import { TrustIndicators } from "@/components/home/TrustIndicators"
import { WhyChooseUs } from "@/components/home/WhyChooseUs"

export default function HomePage() {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-white">
      <Hero />
      <SmartSearch />
      <CategoryGrid />
      <OffersCarousel />
      <FeaturedProducts />
      <PrescriptionBanner />
      <HealthCategories />
      <WhyChooseUs />
      <TrustIndicators />
      <Testimonials />
      <MobileAppSection />
      <BlogPreview />
      <Newsletter />
      <Footer />
    </div>
  )
}

