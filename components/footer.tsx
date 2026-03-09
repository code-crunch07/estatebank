"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, MessageSquare, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-100 via-primary/5 to-gray-100 text-gray-900 overflow-hidden mt-16 md:mt-24 border-t border-primary/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6 lg:col-span-1">
            <Link href="/" className="block">
              <Image
                src="/logo.png"
                alt="EstateBANK.in Logo"
                width={140}
                height={50}
                className="h-10 w-auto object-contain mb-4"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              EstateBANK.in is a premium destination for property investments and real estate growth. We specialize in residential and commercial real estate — buying, selling, and leasing. Building wealth through property since 2004.
            </p>
            <div className="flex gap-3">
              <Link 
                href="#" 
                className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-[#1877f2] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-[#1da1f2] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-[#0077b5] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Properties
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties/under-construction" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Under Construction
                </Link>
              </li>
              <li>
                <Link 
                  href="/blogs" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Blogs
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Our Services</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/properties" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Property Buying
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Property Selling
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Property Rental
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Property Management
                </Link>
              </li>
              <li>
                <Link 
                  href="/properties" 
                  className="text-gray-600 hover:text-primary transition-colors duration-200 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Investment Advisory
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Get in Touch</h4>
            
            {/* Location Icon and Address */}
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    A Wing 804, Palatial Heights,<br />
                    Opp. Vicinia, Chandivali,<br />
                    Powai – Mumbai 400072
                  </p>
                </div>
            </div>

            {/* Additional Contact Info Below */}
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <a 
                    href="tel:+919820590353" 
                    className="text-gray-900 hover:text-primary transition-colors font-semibold block"
                  >
                    +91 9820590353
                  </a>
                  <p className="text-gray-500 text-xs mt-1">Sales Hotline</p>
                </div>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <a 
                    href="mailto:pankaj.realdeals@gmail.com" 
                    className="text-gray-900 hover:text-primary transition-colors font-semibold block text-sm break-all"
                  >
                    pankaj.realdeals@gmail.com
                  </a>
                  <p className="text-gray-500 text-xs mt-1">Primary Email</p>
                </div>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-500 text-xs mt-1">Office Hours</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              &copy; {new Date().getFullYear()} EstateBANK.in. All rights reserved. | Building Wealth Through Property | Designed, Developed and Optimized by{" "}
              <a 
                href="https://webrik.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Webrik
              </a>
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

