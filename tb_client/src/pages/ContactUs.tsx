import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Clock, Globe, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check Firebase connection on component mount
  useEffect(() => {
    console.log("ContactUs component mounted");
    console.log("Firebase db instance:", db);
    console.log("Firebase db type:", typeof db);
    
    if (!db) {
      console.error("Firebase database is not initialized!");
      toast({
        title: "Configuration Error",
        description: "Firebase is not properly configured. Please check the setup.",
        variant: "destructive",
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Email, and Message).",
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

    setIsSubmitting(true);

    try {
      console.log("Attempting to submit contact form with data:", formData);
      console.log("Firebase db instance:", db);
      
      if (!db) {
        throw new Error("Firebase database is not initialized");
      }

      const docRef = await addDoc(collection(db, "contacts"), {
        ...formData,
        createdAt: serverTimestamp(),
        isRead: false
      });

      console.log("Contact form submitted successfully with ID:", docRef.id);

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        subject: "",
        message: ""
      });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMessage = "Failed to send message. Please try again.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check Firebase security rules.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.message.includes('Firebase')) {
        errorMessage = "Firebase connection error. Please check your internet connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Get In Touch
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Contact Us
              <span className="block text-blue-600">We're Here to Help</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our initiatives or want to get involved? We'd love to hear from you. 
              Reach out and let's make a difference together.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Two Equal Sections */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Information Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl h-full flex flex-col">
              {/* Card Border Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10"></div>
              
              {/* Top accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  T. B. Lulla Charitable Foundation
                </CardTitle>
                <p className="text-gray-600">Connect with us through any of these channels</p>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-1">
                {/* Address */}
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      30-A, Abhyankar Complex,<br />
                      Amrai Road, Sangli - 416 416,<br />
                      Maharashtra, India
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600 text-sm">(0233) 2376774</p>
                    <p className="text-gray-600 text-sm">+91 9404332941, +91 9422407979</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a href="mailto:lullakishor@gmail.com" className="text-blue-600 hover:text-blue-700 text-sm">
                      lullakishor@gmail.com
                    </a>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Website</h4>
                    <a
                      href="https://www.lullacharity.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      www.lullacharity.org
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl h-full flex flex-col">
              {/* Card Border Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 pointer-events-none"></div>
              
              {/* Top accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 pointer-events-none" />

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</CardTitle>
                <p className="text-gray-600">We'd love to hear from you. Fill out the form below and we'll get back to you soon.</p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <form
                  className="flex-1 flex flex-col space-y-4"
                  onSubmit={handleSubmit}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name" 
                        required 
                        className="rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <Input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email" 
                        required 
                        className="rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <Input 
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit phone number" 
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                      {formData.phone && formData.phone.length > 0 && formData.phone.length !== 10 && (
                        <p className="text-red-500 text-xs mt-1">
                          Phone number must be exactly 10 digits ({formData.phone.length}/10)
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <Input 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city" 
                        className="rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is this regarding?" 
                      className="rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <Textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..." 
                      className="resize-none flex-1 min-h-[100px] rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" 
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        city: "",
                        subject: "",
                        message: ""
                      })}
                      variant="outline" 
                      className="flex-1 rounded-xl py-3 border-gray-200 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Map Section - Full Width Below Both Sections */}
          <div className="w-full">
            <Card className="overflow-hidden rounded-2xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Our Location
                </CardTitle>
                <p className="text-gray-600 text-center">Find us on the map</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 w-full">
                  <iframe
                    title="T.B. Lulla Charitable Foundation Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.64104906577!2d74.57197937519492!3d16.201167484491156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc11b7b6e74db13%3A0x56a09d1f26c7a6cb!2sT.%20B.%20Lulla%20Charitable%20Foundation!5e0!3m2!1sen!2sin!4v1694523012345!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    allowFullScreen
                    loading="lazy"
                    className="border-0 w-full h-full"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
