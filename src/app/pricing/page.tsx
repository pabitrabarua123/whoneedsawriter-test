import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Pricing } from "@/components/Pricing/Pricing";
import { brandName } from "@/config";

export const metadata = {
    title: `Pricing | ${brandName}`,
    description: `Pricing | ${brandName}`,
  };

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
