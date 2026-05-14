import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProjects } from '@/components/home/FeaturedProjects';
import { VideoTestimonials } from '@/components/home/VideoTestimonials';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProjects />
      <VideoTestimonials />
      <UpcomingEvents />
    </Layout>
  );
};

export default Index;
