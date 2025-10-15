import FooterSection from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero-section";
import Integrations from "@/components/homepage/integrations";
import { CurrentTransitsWidget } from "@/components/astrology/CurrentTransitsWidget";
import { DailyHoroscopeWidget } from "@/components/astrology/DailyHoroscopeWidget";
import Cta from "@/components/homepage/cta";
import Navbar from "@/components/navbar/navbar";

export default async function Home() {

  return (
    <>
      <Navbar />
      <HeroSection />
      <Integrations />
      <div className="container mx-auto px-4 py-8 space-y-16">
        <CurrentTransitsWidget />
        <DailyHoroscopeWidget />
      </div>

      <Cta/>
      <FooterSection />
    </>
  );
}
