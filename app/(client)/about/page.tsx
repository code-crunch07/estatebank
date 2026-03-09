"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Award, 
  Target, 
  Building2, 
  Calendar,
  MapPin,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Globe,
  Handshake,
  BadgeCheck,
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Home,
  Key,
  FileCheck,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { DataStore, TeamMember, Testimonial } from "@/lib/data-store";

const developers = [
  "Lodha Group",
  "Hiranandani Group",
  "Kanakia Group",
  "Runwal Group",
  "Oberoi Realty",
  "Godrej Properties",
  "L&T Realty",
  "Piramal Realty",
  "Mahindra Lifespaces",
  "Rustomjee",
];

const nriServices = [
  { icon: Home, title: "Tenant sourcing and background verification" },
  { icon: Key, title: "Rental marketing and tenant management" },
  { icon: FileCheck, title: "Drafting agreements and legal paperwork" },
  { icon: Shield, title: "Contract coordination and documentation" },
  { icon: Building2, title: "Maintenance and upkeep of the property" },
  { icon: Users, title: "Society coordination and service management" },
  { icon: TrendingUp, title: "Assistance with resale transactions" },
];

const whyChoose = [
  "Over 20 years of real estate experience in Mumbai",
  "RERA-compliant and transparent property transactions",
  "Strong network with leading developers and property owners",
  "Special expertise in Powai and premium residential markets",
  "Dedicated NRI property management services",
];

const services = [
  { icon: Home, title: "Buy Property", desc: "Find your dream home" },
  { icon: Key, title: "Rent/Lease", desc: "Flexible rental solutions" },
  { icon: TrendingUp, title: "Sell Property", desc: "Best market value" },
  { icon: FileCheck, title: "Documentation", desc: "Complete legal support" },
  { icon: Shield, title: "Property Management", desc: "End-to-end maintenance" },
  { icon: Globe, title: "NRI Services", desc: "Global client support" },
];

export default function AboutPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team members
        const teamResponse = await fetch('/api/people/team?status=Active');
        const teamData = await teamResponse.json();
        if (teamData.success && teamData.data) {
          setTeamMembers(Array.isArray(teamData.data) ? teamData.data : []);
        } else {
          setTeamMembers([]);
        }
        
        // Fetch testimonials
        const testimonialsResponse = await fetch('/api/testimonials?status=Published');
        const testimonialsData = await testimonialsResponse.json();
        if (testimonialsData.success && testimonialsData.data) {
          setTestimonials(Array.isArray(testimonialsData.data) ? testimonialsData.data : []);
        } else {
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setTeamMembers([]);
        setTestimonials([]);
      }
    };
    
    fetchData();
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Auto-scroll effect
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <>
      {/* Hero Section with Video Background Effect */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt="Real Estate"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Established 2004 • RERA Registered • 20+ Years of Excellence
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trusted Real Estate
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Consultants in Mumbai
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Real Deals — Professional property advisory across primary sales, resale, rentals, and NRI property management since 2004.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/properties"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                Explore Properties
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <Play className="h-5 w-5" />
                Watch Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Banner - Floating */}
      <section className="relative z-20 -mt-16 mx-4 md:mx-auto max-w-6xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: "20+", label: "Years Experience", icon: Clock },
              { value: "1000+", label: "Happy Clients", icon: Users },
              { value: "5000+", label: "Properties Sold", icon: Home },
              { value: "50+", label: "Locations", icon: MapPin },
            ].map((stat, index) => (
              <div key={index} className="p-6 md:p-8 text-center border-b md:border-b-0 md:border-r last:border-r-0 border-gray-100 hover:bg-gray-50 transition-colors group">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive real estate solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-white cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-1">{service.title}</h3>
                  <p className="text-xs text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Real Deals - Intro Section */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              About Real Deals
            </span>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              Trusted Real Estate Consultants in Mumbai Since 2004
            </h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg text-left">
              <p>
                Real Deals is a trusted Mumbai-based real estate consultancy established in 2004, offering professional property advisory services across primary sales, resale transactions, rental properties, and NRI property management.
              </p>
              <p>
                With over two decades of experience in the Mumbai real estate market, Real Deals has built a reputation for transparency, reliability, and successful property transactions.
              </p>
              <p>
                We are a <strong className="text-foreground">RERA-registered</strong> real estate firm, ensuring that every transaction is conducted with full regulatory compliance and professional accountability.
              </p>
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6 my-8">
                <p className="text-lg font-medium text-gray-900 italic">
                  &quot;One deal closed successfully leads to another.&quot;
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This belief has helped us build long-term relationships with property buyers, investors, landlords, and NRI clients across the world.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-green-50 rounded-xl border border-green-100">
                <BadgeCheck className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">RERA Registered</div>
                  <div className="text-xs text-green-600">Full Compliance</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 rounded-xl border border-blue-100">
                <Globe className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">Global Clients</div>
                  <div className="text-xs text-blue-600">NRI &amp; Overseas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Property Sales Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                New Projects
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
                Primary Property Sales with Leading Developers in Mumbai
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Real Deals works closely with some of India&apos;s most reputed real estate developers, helping clients discover premium residential projects and new property launches in Mumbai.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
              {developers.map((name, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:bg-primary transition-all duration-300 cursor-pointer text-center"
                >
                  <Building2 className="h-8 w-8 text-primary mx-auto mb-3 group-hover:text-white transition-colors" />
                  <h3 className="font-semibold text-sm group-hover:text-white transition-colors">{name}</h3>
                </div>
              ))}
            </div>

            <p className="text-center text-muted-foreground max-w-3xl mx-auto">
              Our team helps homebuyers and investors identify the best new residential projects in Mumbai based on location, investment potential, lifestyle amenities, and long-term value.
            </p>
          </div>
        </div>
      </section>

      {/* Resale and Rental Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  Resale &amp; Rental
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
                  Resale and Rental Properties Across Mumbai
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  In addition to new project sales, Real Deals specializes in resale and rental property transactions across Mumbai.
                </p>
                <p className="text-muted-foreground mb-8">
                  We assist buyers, investors, and tenants in finding the right residential properties including:
                </p>
                <ul className="space-y-3">
                  {["Luxury apartments", "Ready-to-move flats", "Investment properties", "Rental homes"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium text-gray-900">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground mt-8">
                  Our strongest market presence is in <strong className="text-foreground">Powai, Chandivali, and surrounding premium residential micro-markets</strong>, where we actively manage resale and rental opportunities in well-known developments.
                </p>
              </div>
              <div className="relative">
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                    alt="Mumbai Real Estate"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">Powai &amp; Chandivali</h3>
                    <p className="text-white/90">Premium residential micro-markets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NRI Property Management Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  <Globe className="h-4 w-4" />
                  NRI Services
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                  NRI Property Management and Real Estate Services
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                  Real Deals has extensive experience working with NRI property owners who own residential apartments in Mumbai. We provide end-to-end property management and real estate services for NRI clients, ensuring that their property is professionally managed even when they are overseas.
                </p>

                <div className="space-y-4">
                  {nriServices.map((service, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <service.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-gray-900">{service.title}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground mt-8">
                  These services provide complete peace of mind to NRI property owners looking for reliable property management in Mumbai.
                </p>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10">
                    <Globe className="h-16 w-16 mb-6 text-primary" />
                    <h3 className="text-3xl font-bold mb-4">Worldwide Recognition</h3>
                    <p className="text-gray-300 text-lg mb-8">
                      Known as &apos;REAL DEALS&apos; globally, we serve clients from UAE, Middle East, and across India with premium real estate services.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-4xl font-bold mb-1 text-primary">UAE</div>
                        <div className="text-sm text-gray-400">Primary Market</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold mb-1 text-primary">India</div>
                        <div className="text-sm text-gray-400">Headquarters</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-sm text-muted-foreground">NRI Clients Served</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Real Deals */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Our Edge
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Why Choose Real Deals</h2>
            <p className="text-muted-foreground text-lg">
              Clients choose Real Deals because of our commitment to excellence and client satisfaction.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ul className="space-y-4">
              {whyChoose.map((item, i) => (
                <li key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-center text-muted-foreground mt-10 text-lg">
              Our focus is always on understanding client needs and delivering the right property solution.
            </p>
          </div>
        </div>
      </section>

      {/* Our Commitment + Tagline + Video */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  Our Commitment
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
                  Trust and Relationships
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  At Real Deals, we believe that real estate is about trust and relationships.
                </p>
                <p className="text-muted-foreground mb-8">
                  Every successful transaction strengthens our client relationships and helps us grow through referrals and repeat business.
                </p>
                <p className="text-muted-foreground mb-10">
                  Whether you are looking to buy a new home, invest in Mumbai real estate, rent a property, or manage an NRI-owned apartment, Real Deals provides complete end-to-end support throughout the process.
                </p>

                <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl p-6">
                  <p className="text-xl font-bold text-gray-900">
                    Real Deals – Where One Successful Deal Leads to Another.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[4/3] object-cover"
                  >
                    <source src="https://www.estatebank.in/uploads/about_image/video_20200727114642.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <Play className="h-5 w-5 fill-white" />
                    </div>
                    <span className="text-sm font-medium">Real Deals Journey</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Matching Homepage Style Exactly */}
      <section className="w-full py-16 md:py-24 bg-gray-100">
        <div className="w-full px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4 fill-yellow-500 inline mr-2" />
              Client Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what our satisfied clients have to say about their experience with Real Deals.
            </p>
          </div>

          {/* Testimonials Content - Full Width */}
          {testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Quote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No Testimonials Available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for client testimonials
              </p>
            </div>
          ) : (
            <div className="w-full bg-gray-100 rounded-2xl p-8 md:p-12">
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex items-stretch -mr-6">
                    {testimonials.map((testimonial, index) => (
                      <div
                        key={testimonial.id || `testimonial-${index}`}
                        className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0 flex mr-6"
                      >
                        <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-shadow border-0 rounded-2xl flex flex-col">
                          <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4 flex-1 flex flex-col">
                              {/* Rating */}
                              <div className="flex-shrink-0">
                                <span className="text-sm font-semibold text-primary">
                                  {testimonial.rating || 5}/5
                                </span>
                              </div>

                              {/* Testimonial Text */}
                              <p className="text-base text-gray-700 leading-relaxed">
                                &quot;{testimonial.text}&quot;
                              </p>

                              {/* Client Info */}
                              <div className="flex items-start gap-3 pt-3 border-t border-gray-100 flex-shrink-0 mt-auto">
                                {testimonial.image ? (
                                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                    <Image
                                      src={testimonial.image}
                                      alt={testimonial.name}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/logo.png";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary font-semibold text-lg">
                                      {testimonial.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                    {testimonial.name}
                                  </h4>
                                  {(testimonial.role || testimonial.company) && (
                                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                                      {[testimonial.role, testimonial.company].filter(Boolean).join(" • ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                {testimonials.length > 3 && (
                  <>
                    <button
                      onClick={scrollPrev}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                      aria-label="Previous testimonials"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                      aria-label="Next testimonials"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {testimonials.length > 3 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => emblaApi?.scrollTo(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === selectedIndex ? "w-8 bg-primary" : "w-2 bg-gray-300"
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="w-full px-6 md:px-12 lg:px-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              The Experts Behind Success
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Dedicated professionals committed to making your real estate journey seamless. Our team brings decades of combined experience in the real estate industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 max-w-[110rem] mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="relative bg-gray-800 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-primary/30">
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] min-h-[400px] overflow-hidden">
                    {member.image && member.image.trim() ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=500&background=6366f1&color=ffffff&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <span className="text-6xl font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
                    
                    {/* Social Media Icons */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex gap-4 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                        {member.socials?.linkedin && (
                          <a href={member.socials.linkedin} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#0077b5] transition-all duration-300 border border-white/20">
                            <Linkedin className="h-6 w-6" />
                          </a>
                        )}
                        {member.socials?.twitter && (
                          <a href={member.socials.twitter} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#1da1f2] transition-all duration-300 border border-white/20">
                            <Twitter className="h-6 w-6" />
                          </a>
                        )}
                        {member.socials?.facebook && (
                          <a href={member.socials.facebook} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#1877f2] transition-all duration-300 border border-white/20">
                            <Facebook className="h-6 w-6" />
                          </a>
                        )}
                        {member.socials?.instagram && (
                          <a href={member.socials.instagram} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] transition-all duration-300 border border-white/20">
                            <Instagram className="h-6 w-6" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-8 -mt-24 z-10">
                    <div className="bg-gradient-to-r from-primary via-primary to-primary/80 rounded-2xl p-6 mb-5 shadow-xl">
                      <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                      <p className="text-white/80">{member.role}</p>
                    </div>
                    
                    {member.bio && member.bio.trim() && (
                      <p className="text-gray-400 mb-5 italic text-base">&quot;{member.bio}&quot;</p>
                    )}
                    
                    <div className="space-y-4">
                      {member.department && member.department.trim() && (
                        <div className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors">
                          <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-base">{member.department}</span>
                        </div>
                      )}
                      {member.location && member.location.trim() && (
                        <div className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors">
                          <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-base">{member.location}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-4 text-gray-400">
                        <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col text-base">
                          {(() => {
                            const phoneNumbers = Array.isArray(member.phone) 
                              ? member.phone 
                              : (member.phone ? member.phone.split(",").map(p => p.trim()).filter(p => p) : []);
                            return phoneNumbers.length > 0 ? (
                              phoneNumbers.map((num, i) => (
                                <a key={i} href={`tel:${num.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                                  {num}
                                </a>
                              ))
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              Let our experienced team help you navigate the real estate market with confidence. 
              Contact us today for a free consultation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-primary font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-xl shadow-black/20"
              >
                <Mail className="h-6 w-6" />
                Contact Us
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+919820590353"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
              >
                <Phone className="h-6 w-6" />
                +91 9820590353
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
