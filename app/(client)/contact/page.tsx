"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  CheckCircle2,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Building2,
  Users,
  Award,
  Zap
} from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EnquiryForm } from "./form";
import Link from "next/link";

const directContacts = [
  {
    title: "Sales Hotline",
    value: "+91 9820590353",
    link: "tel:+919820590353",
    helper: "Call us 9:00 AM – 8:00 PM",
    icon: Phone,
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "WhatsApp",
    value: "+91 8080808081",
    link: "https://wa.me/919820590353",
    helper: "Instant updates & quick replies",
    icon: MessageSquare,
    accent: "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "Primary Email",
    value: "pankaj.realdeals@gmail.com",
    link: "mailto:pankaj.realdeals@gmail.com",
    helper: "Founder's Inbox",
    icon: Mail,
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Client Relations",
    value: "info@estatebank.in",
    link: "mailto:info@estatebank.in",
    helper: "Partnerships & media",
    icon: Mail,
    accent: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-400",
    gradient: "from-fuchsia-500 to-pink-600",
  },
];

const officeHours = [
  { day: "Monday – Friday", time: "9:00 AM – 6:00 PM", icon: Building2 },
  { day: "Saturday", time: "10:00 AM – 4:00 PM", icon: Clock },
  { day: "Sunday", time: "By appointment", icon: Award },
];

const stats = [
  { label: "Families Served", value: "1200+", detail: "Across Mumbai", icon: Users },
  { label: "Avg. Response", value: "12 min", detail: "During working hours", icon: Zap },
  { label: "Since", value: "2004", detail: "Trusted Across Mumbai", icon: Award },
];

const socialLinks = [
  { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:bg-[#0077b5]" },
  { name: "Twitter", icon: Twitter, href: "#", color: "hover:bg-[#1da1f2]" },
  { name: "Facebook", icon: Facebook, href: "#", color: "hover:bg-[#1877f2]" },
  { name: "Instagram", icon: Instagram, href: "#", color: "hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af]" },
];

function ContactContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("property");

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              We&apos;re Here to Help • 20+ Years of Excellence
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Get in Touch
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Let&apos;s Connect
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re looking to buy, sell, or rent, our expert team is ready to assist you with your real estate needs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-20 md:py-28 bg-gray-50 overflow-x-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
              {/* Contact Cards */}
              {directContacts.map((contact, index) => (
                <a
                  key={contact.title}
                  href={contact.link}
                  className="group relative overflow-hidden rounded-3xl bg-white p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 min-w-0 w-full"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${contact.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-4 ${contact.accent}`}>
                      <contact.icon className="h-4 w-4" />
                      {contact.title}
                    </div>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors break-all overflow-wrap-anywhere whitespace-normal leading-tight">
                      {contact.value}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{contact.helper}</p>
                  </div>
                  
                  {/* Decorative Element */}
                  <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${contact.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity pointer-events-none`} style={{ maxWidth: 'calc(100% + 1rem)' }}></div>
                </a>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Contact Info & Stats */}
              <div className="lg:col-span-1 space-y-6">
                {/* Office Address */}
                <Card className="border-0 shadow-xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">Studio Experience Centre</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          A Wing 804, Palatial Heights, Opp. Vicinia, Chandivali, Powai – Mumbai 400072
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Walk-ins welcome • Book curated previews in advance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Office Hours */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Studio Hours
                    </CardTitle>
                    <CardDescription>Reach us or schedule a curated visit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {officeHours.map((item) => (
                        <div key={item.day} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{item.day}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <Card key={stat.label} className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
                      <CardContent className="p-4">
                        <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary mb-1">{stat.label}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.detail}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Social Media */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Follow Us
                    </CardTitle>
                    <CardDescription>Connect with us on social media</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color} text-gray-700 hover:text-white`}
                          aria-label={social.name}
                        >
                          <social.icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-2xl">
                  <CardHeader className="space-y-3 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase text-primary">
                      <Send className="h-4 w-4" />
                      Concierge Inquiry
                    </div>
                    <CardTitle className="text-3xl">Tell us about your requirement</CardTitle>
                    <CardDescription className="text-base">
                      Share your details and we&apos;ll arrange a bespoke walkthrough with curated inventory. Our team will get back to you within 12 minutes during working hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <EnquiryForm propertyId={propertyId || undefined} />
                  </CardContent>
                </Card>

                {/* WhatsApp CTA */}
                <Card className="mt-6 border-0 shadow-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-7 w-7 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">Need a faster response?</h3>
                        <p className="text-white/80 mb-4">
                          Ping us on WhatsApp with your budget & preferred location. We reply within 5 minutes during office hours.
                        </p>
                        <a
                          href="https://wa.me/919820590353"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-colors"
                        >
                          <MessageSquare className="h-5 w-5" />
                          WhatsApp Now: +91 8080808081
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white overflow-x-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Visit Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Our Office</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Located in the heart of Powai, our experience centre is easily accessible and welcomes walk-ins.
              </p>
            </div>

            {/* Google Maps Embed */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px] md:h-[600px] border border-gray-200">
              <iframe
                src="https://www.google.com/maps?q=19.105409,72.897982&hl=en&gl=IN&z=16&output=embed&cid=8517692502435000563"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="EstateBANK.in Office Location"
              ></iframe>
              
              {/* Overlay with address and link */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-yellow-400" />
                      <p className="font-semibold text-lg">Studio Experience Centre</p>
                    </div>
                    <p className="text-white/90 text-sm">
                      A Wing 804, Palatial Heights, Opp. Vicinia, Chandivali, Powai – Mumbai 400072
                    </p>
                  </div>
                  <a
                    href="https://www.google.com/maps?ll=19.105409,72.897982&z=16&t=m&hl=en&gl=IN&mapclient=embed&cid=8517692502435000563"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <MapPin className="h-5 w-5" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ContactPage() {
  return (
    <>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading contact details...</p>
        </div>
      }>
        <ContactContent />
      </Suspense>
    </>
  );
}
