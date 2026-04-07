import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import CTA from "@/components/landing/CTA";
import Hero from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow landing-gradient">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
