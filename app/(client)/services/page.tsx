"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  Building2, 
  Key, 
  FileCheck, 
  Shield, 
  Clock, 
  Users, 
  TrendingUp,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Home,
    title: "Residential Property Sales",
    description: "Expert assistance in buying and selling residential properties including apartments, villas, and plots in Mumbai and surrounding areas.",
    features: ["Property Valuation", "Legal Documentation", "Negotiation Support", "Post-Sale Services"],
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Building2,
    title: "Commercial Property Sales",
    description: "Comprehensive commercial real estate services for offices, retail spaces, warehouses, and investment properties.",
    features: ["Market Analysis", "Investment Consultation", "Lease Management", "Property Management"],
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Key,
    title: "Property Rental Services",
    description: "Find the perfect rental property or list your property for rent with our professional rental management services.",
    features: ["Tenant Screening", "Rental Agreements", "Property Maintenance", "Rent Collection"],
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: FileCheck,
    title: "Legal Documentation",
    description: "Complete legal support for all property transactions including title verification, registration, and compliance.",
    features: ["Title Verification", "Documentation", "Registration Support", "Legal Consultation"],
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Shield,
    title: "Property Investment Consultation",
    description: "Expert advice on property investments, market trends, and portfolio diversification strategies.",
    features: ["Market Research", "ROI Analysis", "Investment Planning", "Risk Assessment"],
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: Users,
    title: "NRI Services",
    description: "Specialized services for Non-Resident Indians including property management, rental income, and investment guidance.",
    features: ["NRI Property Management", "Rental Income Management", "Tax Consultation", "Remote Property Viewing"],
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

const whyChooseUs = [
  {
    icon: Clock,
    title: "20+ Years Experience",
    description: "Trusted real estate partner since 2004",
  },
  {
    icon: TrendingUp,
    title: "Market Expertise",
    description: "In-depth knowledge of Mumbai and surrounding areas",
  },
  {
    icon: Shield,
    title: "Transparent Process",
    description: "Honest dealings with complete transparency",
  },
  {
    icon: Users,
    title: "1200+ Happy Clients",
    description: "Satisfied customers across Mumbai",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Our Services
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Comprehensive real estate solutions tailored to your needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From property sales to investment consultation, we provide end-to-end real estate services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className={`${service.bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the difference of working with EstateBANK.in
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your real estate needs and discover how we can help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link href="/contact" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Us
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-black hover:bg-white/10">
              <Link href="/properties" className="flex items-center gap-2">
                View Properties
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
