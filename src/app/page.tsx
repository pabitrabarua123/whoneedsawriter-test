import { CtaBox } from "@/components/CtaBox/CtaBox";
import { FAQ } from "@/components/FAQ/FAQ";
import { Features } from "@/components/Features/Features";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { Pricing } from "@/components/Pricing/Pricing";
//import { ExplainerVideo } from "@/components/ExplainerVideo/ExplainerVideo";
import { getSEOTags } from "@/components/SEOTags/SEOTags";
import { Testimonials } from "@/components/Testimonials/Testimonials";
import { Metadata } from "next";
import SampleArticles from "@/components/SampleArticles/SampleArticles";

export const metadata: Metadata = getSEOTags({
  title: 'AI Blog post Generator | Well Researched with Images',
  description: 'Generate hundreds of high-quality Blog Posts from just a keyword in one click. Complete with research and images in minutes. WhoNeedsaWriter makes Blogging effortless.',
});

export default function Home() {
  return (
    <>
      <Header />
      <main className="">
        <Hero />
        {/* <ExplainerVideo /> */}
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <SampleArticles />
        <CtaBox />
      </main>
      <Footer />
    </>
  );
}
