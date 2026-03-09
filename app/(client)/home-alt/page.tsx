"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { getPropertyUrl, formatIndianPrice } from "@/lib/utils";
import {
  Search,
  ArrowRight,
  Play,
  Check,
  Sparkles,
  ShieldCheck,
  Handshake,
  Bed,
  Bath,
  Square,
  MapPin,
  Home,
  Building,
  Briefcase,
  Star,
  TrendingUp,
  Users,
  Award,
  Zap,
  Heart,
  ChevronRight,
  ArrowDown,
  Key,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  IndianRupee,
  TrendingDown,
  CheckCircle2,
  Globe,
  Lock,
  Camera,
  Video,
  Calendar,
  BarChart3,
  Target,
  Rocket,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { type Property } from "@/lib/data-store";
import { TestimonialsSlider } from "@/components/testimonials-slider";
import { ClientsSlider } from "@/components/clients-slider";

export default function AlternativeHomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("any");
  const [bedroomFilter, setBedroomFilter] = useState("any");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch properties from API
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        const data = await response.json();
        if (data.success && data.data) {
          const allProperties = Array.isArray(data.data) ? data.data : [];
          setProperties(allProperties as Property[]);
          setFeaturedProperties(allProperties.slice(0, 6) as Property[]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
        setFeaturedProperties([]);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (propertyType !== "all") params.set("type", propertyType);
    if (priceRange !== "any") params.set("price", priceRange);
    if (bedroomFilter !== "any") params.set("bedrooms", bedroomFilter);
    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  };

  const stats = [
    { icon: Home, value: "500+", label: "Properties Listed", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Users, value: "1200+", label: "Happy Clients", color: "text-green-500", bg: "bg-green-500/10" },
    { icon: Award, value: "15+", label: "Years Experience", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { icon: TrendingUp, value: "98%", label: "Success Rate", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const features = [
    { icon: ShieldCheck, title: "Verified Properties", description: "All listings are verified for authenticity", color: "from-blue-500 to-cyan-500" },
    { icon: Zap, title: "Instant Updates", description: "Get real-time notifications on new properties", color: "from-purple-500 to-pink-500" },
    { icon: Handshake, title: "Expert Support", description: "Dedicated team to help you find your dream home", color: "from-green-500 to-emerald-500" },
    { icon: Key, title: "Easy Process", description: "Streamlined buying and renting process", color: "from-orange-500 to-red-500" },
  ];

  const services = [
    { icon: Home, title: "Property Buying", description: "Expert guidance through every step" },
    { icon: Key, title: "Property Renting", description: "Find your perfect rental property" },
    { icon: Building, title: "Commercial Spaces", description: "Premium commercial real estate" },
    { icon: Briefcase, title: "Investment Advisory", description: "Smart investment opportunities" },
    { icon: Target, title: "Property Valuation", description: "Accurate property assessments" },
    { icon: Rocket, title: "Legal Support", description: "Complete legal assistance" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section with Advanced Effects */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20" />
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)] transition-opacity duration-1000"
          style={{
            backgroundPosition: `${mousePosition.x / 50}px ${mousePosition.y / 50}px`,
          }}
        />
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.3),transparent_50%)] transition-opacity duration-1000"
          style={{
            backgroundPosition: `${-mousePosition.x / 50}px ${-mousePosition.y / 50}px`,
          }}
        />
        
        {/* Animated Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-md rounded-full mb-8 shadow-2xl border border-white/20 animate-fade-in">
              <Sparkles className="h-5 w-5 text-primary animate-spin-slow" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Find Your Dream Property Today
              </span>
            </div>

            {/* Main Heading with Animation */}
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight animate-fade-in-up">
              <span className="block bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Discover Your
              </span>
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-primary bg-clip-text text-transparent animate-gradient-reverse">
                Perfect Home
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up-delayed">
              Explore premium properties in prime locations. Your journey to finding the perfect home starts here.
            </p>

            {/* Enhanced Search Bar */}
            <Card className="p-3 shadow-2xl border-0 bg-white/95 backdrop-blur-xl animate-fade-in-up-delayed-2">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search by location, property name..."
                    className="h-16 pl-14 pr-4 text-lg border-2 border-transparent bg-gradient-to-r from-slate-50 to-white focus:border-primary transition-all rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="h-16 w-full md:w-[200px] border-2 border-transparent focus:border-primary transition-all rounded-xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-16 w-full md:w-[200px] border-2 border-transparent focus:border-primary transition-all rounded-xl">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Price</SelectItem>
                    <SelectItem value="under-50">Under ₹50L</SelectItem>
                    <SelectItem value="50-100">₹50L - ₹1Cr</SelectItem>
                    <SelectItem value="100-200">₹1Cr - ₹2Cr</SelectItem>
                    <SelectItem value="over-200">Over ₹2Cr</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-16 px-10 text-lg bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all rounded-xl group"
                >
                  Search
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Card>

            {/* Quick Stats */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm animate-fade-in-up-delayed-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">Verified Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-muted-foreground">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-500" />
                <span className="text-muted-foreground">Secure Transactions</span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-16 flex flex-col items-center gap-2 animate-bounce">
              <span className="text-sm text-muted-foreground font-medium">Scroll to explore</span>
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-5 rounded-2xl ${stat.bg} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <stat.icon className={`h-10 w-10 ${stat.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section with Parallax */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16">
            <div className="mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Star className="h-5 w-5 text-primary fill-primary animate-pulse" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">Featured</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                Premium Properties
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  For You
                </span>
              </h2>
              <p className="text-muted-foreground text-base max-w-xl">Handpicked selections of the finest properties in prime locations</p>
            </div>
            <Button variant="outline" size="lg" className="hidden md:flex group" asChild>
              <Link href="/properties">
                View All Properties
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <div
                key={property.id}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards"
                }}
              >
                <Link href={getPropertyUrl(property)}>
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={property.images?.[0] || "/logo.png"}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-125 transition-transform duration-700"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-6 left-6">
                      <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {property.status || "Available"}
                      </span>
                    </div>
                    
                    {/* Favorite Button */}
                    <div className="absolute top-6 right-6">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full bg-white/95 backdrop-blur-sm hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Rating */}
                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">{property.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <span className="text-2xl font-black text-primary">{formatIndianPrice(property.price)}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Bed className="h-5 w-5" />
                          <span className="font-semibold">{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="h-5 w-5" />
                          <span className="font-semibold">{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Square className="h-5 w-5" />
                          <span className="font-semibold">{property.area}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full h-11 text-base font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:shadow-lg transition-all">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </CardContent>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(120,119,198,0.05)_0%,rgba(59,130,246,0.05)_100%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wide">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Everything You Need
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                In One Place
              </span>
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              We provide comprehensive real estate services to make your property journey seamless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-3 bg-white/80 backdrop-blur-sm relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <CardContent className="p-8 text-center relative z-10">
                  <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-lg font-black mb-2">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Comprehensive real estate solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="border-2 border-transparent hover:border-primary transition-all duration-300 group hover:shadow-2xl"
              >
                <CardContent className="p-8">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-black mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                  <Button variant="ghost" className="p-0 group-hover:text-primary">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-base">Real experiences from satisfied customers</p>
          </div>
          <TestimonialsSlider />
        </div>
      </section>

      {/* Clients/Partners Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Trusted Partners
            </h2>
            <p className="text-muted-foreground text-base">Developers & brands we collaborate with</p>
          </div>
          <ClientsSlider />
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <Rocket className="h-5 w-5" />
              <span className="text-sm font-bold">Get Started Today</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
              Ready to Find Your
              <br />
              Dream Home?
            </h2>
            <p className="text-lg mb-10 text-white/90 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their perfect property with us. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" variant="secondary" className="text-lg px-10 h-14 shadow-2xl hover:shadow-3xl transition-all" asChild>
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm" asChild>
                <Link href="/contact">
                  Contact Us
                  <MessageCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Free Consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Explore by Property Type
            </h2>
            <p className="text-muted-foreground text-base">Find the perfect property that matches your lifestyle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { type: "Apartments", icon: Building, count: "200+", color: "from-blue-500 to-cyan-500", description: "Modern living spaces" },
              { type: "Villas", icon: Home, count: "150+", color: "from-purple-500 to-pink-500", description: "Luxury homes" },
              { type: "Commercial", icon: Briefcase, count: "100+", color: "from-green-500 to-emerald-500", description: "Business spaces" },
            ].map((item, index) => (
              <Link
                key={index}
                href={`/properties?type=${item.type.toLowerCase()}`}
                className="group relative overflow-hidden rounded-3xl h-80 bg-gradient-to-br p-10 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-95 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="inline-flex p-4 bg-white/20 rounded-2xl backdrop-blur-sm mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <item.icon className="h-10 w-10" />
                    </div>
                    <h3 className="text-3xl font-black mb-2">{item.type}</h3>
                    <p className="text-white/90 text-base mb-2">{item.count} Properties</p>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-base font-bold group-hover:translate-x-2 transition-transform">
                    Explore Collection
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
