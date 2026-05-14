import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Heart, 
  Leaf, 
  GraduationCap, 
  Stethoscope, 
  Send, 
  CheckCircle,
  Target,
  TrendingUp,
  Award,
  FileText,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

interface CSRFocusArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  impact?: string;
  projects?: number;
  beneficiaries?: number;
}

interface CSRCertificate {
  id: string;
  name: string;
  number: string;
  type: string;
  url?: string;
}

export default function CSR() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    focusArea: "",
    proposedAmount: "",
    message: "",
    city: "",
    website: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusAreas, setFocusAreas] = useState<CSRFocusArea[]>([]);
  const [certificates, setCertificates] = useState<CSRCertificate[]>([]);

  // Default focus areas (fallback)
  const defaultFocusAreas: CSRFocusArea[] = [
    {
      id: "education",
      title: "Education for All",
      description: "Partner with us to provide quality education and digital literacy to underprivileged children across rural and urban communities.",
      icon: "GraduationCap",
      impact: "50,000+ children educated",
      projects: 25,
      beneficiaries: 50000
    },
    {
      id: "health",
      title: "Health & Nutrition",
      description: "Support our medical outreach programs, nutrition drives, and healthcare infrastructure development in underserved areas.",
      icon: "Stethoscope",
      impact: "100,000+ lives touched",
      projects: 18,
      beneficiaries: 100000
    },
    {
      id: "environment",
      title: "Environmental Sustainability",
      description: "Join us in building a greener tomorrow through clean energy projects, plantation drives, and environmental awareness programs.",
      icon: "Leaf",
      impact: "1M+ trees planted",
      projects: 12,
      beneficiaries: 500000
    },
    {
      id: "needy-community",
      title: "Needy Community",
      description: "Support needy communities through skill development, entrepreneurship support, and leadership training programs.",
      icon: "Users",
      impact: "25,000+ community members supported",
      projects: 15,
      beneficiaries: 25000
    }
  ];

  // Default certificates
  const defaultCertificates: CSRCertificate[] = [
    {
      id: "csr",
      name: "CSR 1 Certificate",
      number: "CSR00023561",
      type: "CSR 1"
    },
    {
      id: "cin",
      name: "CIN Certificate",
      number: "U74999PN2014NPL150087",
      type: "CIN"
    },
    {
      id: "80g",
      name: "80G Tax Exemption Certificate",
      number: "AAECT9113E24PN01",
      type: "80G"
    },
    {
      id: "12a",
      name: "12A Registration Certificate",
      number: "AAECT9113EE20211",
      type: "12 A"
    }
  ];

  // Fetch CSR focus areas from Firebase
  useEffect(() => {
    if (!db) {
      console.log('CSR: Firebase not initialized, using default focus areas');
      setFocusAreas(defaultFocusAreas);
      setCertificates(defaultCertificates);
      return;
    }

    console.log('CSR: Fetching focus areas from Firebase');
    
    try {
      const q = query(collection(db, 'csrFocusAreas'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('CSR: Received', snapshot.docs.length, 'focus areas');
          
          if (snapshot.docs.length > 0) {
            const areas = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as CSRFocusArea[];
            setFocusAreas(areas);
          } else {
            console.log('CSR: No focus areas found, using defaults');
            setFocusAreas(defaultFocusAreas);
          }
        },
        (error) => {
          console.error('CSR: Error fetching focus areas:', error);
          setFocusAreas(defaultFocusAreas);
        }
      );

      // Fetch certificates
      const certQuery = query(collection(db, 'csrCertificates'), orderBy('createdAt', 'desc'));
      const certUnsubscribe = onSnapshot(
        certQuery,
        (snapshot) => {
          if (snapshot.docs.length > 0) {
            const certs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as CSRCertificate[];
            setCertificates(certs);
          } else {
            setCertificates(defaultCertificates);
          }
        },
        (error) => {
          console.error('CSR: Error fetching certificates:', error);
          setCertificates(defaultCertificates);
        }
      );

      return () => {
        unsubscribe();
        certUnsubscribe();
      };
    } catch (error) {
      console.error('CSR: Error setting up Firebase listeners:', error);
      setFocusAreas(defaultFocusAreas);
      setCertificates(defaultCertificates);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number field
    if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }
    
    // Special handling for email field - convert to lowercase
    if (name === 'email') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toLowerCase()
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim() || !formData.contactPerson.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number if provided
    if (formData.phone.trim() && formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    if (!db) {
      toast({
        title: "Service Unavailable",
        description: "Unable to submit proposal at this time. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'csrProposals'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Proposal Submitted Successfully!",
        description: "Thank you for your interest in partnering with us. We'll get back to you within 48 hours.",
      });

      // Reset form
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        focusArea: "",
        proposedAmount: "",
        message: "",
        city: "",
        website: ""
      });

    } catch (error) {
      console.error('Error submitting CSR proposal:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      GraduationCap: <GraduationCap className="h-8 w-8" />,
      Stethoscope: <Stethoscope className="h-8 w-8" />,
      Leaf: <Leaf className="h-8 w-8" />,
      Users: <Users className="h-8 w-8" />,
      Heart: <Heart className="h-8 w-8" />,
      Building2: <Building2 className="h-8 w-8" />
    };
    return icons[iconName] || <Target className="h-8 w-8" />;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Our CSR Focus Area Title */}
        <section className="relative" style={{ marginTop: '66px' }}>
          <div className="w-full px-4">
            <div className="relative bg-gradient-to-r from-sky-200/60 via-sky-100/50 to-blue-100/55 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-hope to-trust bg-clip-text text-transparent mb-1">
                  Our CSR Focus Area
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-0">
                  Partner with us in these key areas to create lasting social impact
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CSR Support Banner */}
        <section className="relative" style={{ paddingBottom: '20px' }}>
          <div className="w-full px-4">
            <img 
              src="/csr.png" 
              alt="CSR Support Banner" 
              className="w-full h-auto object-contain"
            />
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-hope/10 to-trust/10" />
          <div className="relative max-w-7xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
              <Building2 className="h-4 w-4 mr-2" />
              Corporate Social Responsibility
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-hope to-trust bg-clip-text text-transparent mb-6">
              CSR Support
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Collaborate with T.B.Lulla Charitable Foundation to create measurable social impact and build a sustainable future together.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                MCA Registered
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-hope" />
                80G & 12A Certified
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-trust" />
                15+ Years Experience
              </div>
            </div>
          </div>
        </section>

        {/* Impact Statistics */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              {[
                { label: "Lives Impacted", value: "500K+", icon: Users },
                { label: "Projects Completed", value: "150+", icon: Target },
                { label: "Years of Service", value: "15+", icon: Award }
              ].map((stat, index) => (
                <Card key={index} className="text-center border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
                  <CardContent className="pt-6">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* Registration & Certificates */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-hope/5 to-trust/5">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold flex items-center justify-center">
                  <FileText className="h-6 w-6 mr-2 text-primary" />
                  Legal Registrations & Certifications
                </CardTitle>
                <p className="text-muted-foreground">
                  We are fully compliant and registered to receive CSR funds
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center p-4 rounded-lg bg-gradient-to-r from-background to-primary/5 border">
                      <div>
                        <div className="font-semibold text-sm">{cert.type}</div>
                        <div className="text-xs text-muted-foreground">{cert.number}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CSR Proposal Form */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Submit Your CSR Proposal</CardTitle>
                <p className="text-muted-foreground">
                  Let's discuss how we can create meaningful impact together
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name *</label>
                      <Input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Your Company Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Person *</label>
                      <Input
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@company.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        pattern="[0-9]{10}"
                      />
                      {formData.phone && formData.phone.length > 0 && formData.phone.length !== 10 && (
                        <p className="text-red-500 text-xs mt-1">
                          Phone number must be exactly 10 digits ({formData.phone.length}/10)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Your City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <Input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">CSR Focus Area</label>
                      <select
                        name="focusArea"
                        value={formData.focusArea}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      >
                        <option value="">Select Focus Area</option>
                        {focusAreas.map((area) => (
                          <option key={area.id} value={area.title}>
                            {area.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Proposed Amount (₹)</label>
                      <Input
                        type="number"
                        name="proposedAmount"
                        value={formData.proposedAmount}
                        onChange={handleInputChange}
                        placeholder="1000000"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message / Proposal Details *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please describe your CSR objectives, expected outcomes, and how you'd like to partner with us..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit CSR Proposal
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-hope/5 to-trust/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">Get in Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground">lullakishor@gmail.com</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-hope/10 mb-4">
                  <Phone className="h-6 w-6 text-hope" />
                </div>
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground">+91 942207979</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-trust/10 mb-4">
                  <MapPin className="h-6 w-6 text-trust" />
                </div>
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p className="text-muted-foreground">30-A, Abhyankar Complex, Amrai Road,<br />Sangli - 416 416, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
