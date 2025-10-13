import FooterSection from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero-section";
import Integrations from "@/components/homepage/integrations";
import { getSubscriptionDetails } from "@/lib/subscription";
import PricingTable from "./pricing/_component/pricing-table";
import { CurrentTransitsWidget } from "@/components/astrology/CurrentTransitsWidget";
import { DailyHoroscopeWidget } from "@/components/astrology/DailyHoroscopeWidget";
import HomePageClient from "@/components/HomePageClient";

export default async function Home() {
  const subscriptionDetails = await getSubscriptionDetails();

  return (
    <>
      <HomePageClient />
      <HeroSection />
      <Integrations />
      <div className="container mx-auto px-4 py-8 space-y-16">
        <CurrentTransitsWidget />
        <DailyHoroscopeWidget />
      </div>

      <PricingTable subscriptionDetails={subscriptionDetails} />
      <FooterSection />
    </>
  );
}
