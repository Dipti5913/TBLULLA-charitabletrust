import { Layout } from '@/components/layout/Layout';
import { ProfessionalSection, SectionHeader } from '@/components/ui/ProfessionalSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Target, Eye, Users } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <ProfessionalSection>
        <SectionHeader
          badge="About Our Foundation"
          title="T.B. Lulla Charitable Foundation"
          subtitle="Dedicated to Creating Lasting Change"
          description="For over 75 years, T.B. Lulla Charitable Foundation has been at the forefront of 
            community development, working tirelessly to create sustainable solutions 
            for education, healthcare, and social welfare challenges."
        />
        
      </ProfessionalSection>

      {/* Mission, Vision, Values */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="card-professional text-center">
              <CardContent className="p-8 space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To empower underprivileged communities through sustainable development 
                  initiatives in education, healthcare, and environmental conservation, 
                  creating pathways for self-reliance and prosperity.
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional text-center">
              <CardContent className="p-8 space-y-6">
                <div className="mx-auto w-16 h-16 bg-hope/10 rounded-full flex items-center justify-center">
                  <Eye className="h-8 w-8 text-hope" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A world where every individual has access to quality education, 
                  healthcare, and opportunities to thrive in a sustainable environment, 
                  regardless of their socio-economic background.
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional text-center">
              <CardContent className="p-8 space-y-6">
                <div className="mx-auto w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-trust" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Values</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Integrity, compassion, transparency, and community-driven solutions 
                  guide every action we take. We believe in sustainable impact through 
                  collaborative partnerships and inclusive development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="section-padding bg-gradient-to-r from-primary to-hope text-white">
        <div className="container-max">
          <div className="text-center space-y-6 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Our Impact in Numbers</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Over the years, we've touched countless lives through our dedicated programs and initiatives.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">50,000+</div>
              <div className="text-white/80">Lives Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">200+</div>
              <div className="text-white/80">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">25+</div>
              <div className="text-white/80">Communities Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">10,000+</div>
              <div className="text-white/80">Volunteers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="outline" className="text-primary border-primary/20">
              Our Team
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Meet Our Leadership
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our dedicated team of professionals brings decades of experience in 
              social work, community development, and sustainable impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Priya Sharma",
                role: "Founder & CEO",
                bio: "25+ years in social development and community empowerment",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300&h=300&fit=crop&crop=face"
              },
              {
                name: "Rajesh Kumar",
                role: "Director of Programs",
                bio: "Expert in project management and sustainable development",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
              },
              {
                name: "Dr. Anita Desai",
                role: "Head of Healthcare",
                bio: "Public health specialist with 20+ years of experience",
                image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
              }
            ].map((member, index) => (
              <Card key={index} className="card-professional hover-lift">
                <CardContent className="p-6 text-center space-y-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </div>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-card-accent">
        <div className="container-max text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Join Our Mission
            </h2>
            <p className="text-xl text-muted-foreground">
              Whether through volunteering, donations, or partnerships, there are many 
              ways to be part of our community of changemakers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="btn-hope">
                <Users className="mr-2 h-5 w-5" />
                Become a Volunteer
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="mr-2 h-5 w-5" />
                Make a Donation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}