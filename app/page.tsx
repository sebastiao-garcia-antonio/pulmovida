import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import About from '@/components/About';
import ServiceCards from '@/components/ServiceCards';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B1E36]">
      <Header />
      <HeroSlider />
      <About />
      <ServiceCards />
      <Newsletter />
      <Footer />
    </div>
  );
}
