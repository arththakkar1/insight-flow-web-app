import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-foreground selection:text-background relative overflow-x-hidden flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
