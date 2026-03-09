"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface QuickEnquiryFormProps {
  propertyId?: string;
  propertyName?: string;
  className?: string;
}

export function QuickEnquiryForm({ propertyId, propertyName, className = "" }: QuickEnquiryFormProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/email/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim() || `I'm interested in ${propertyName || 'your properties'}`,
          property: propertyId || "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      toast.success("Thank you! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setIsOpen(false); // Close form after successful submission
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // For desktop: use hover, for mobile: use click
  const isFormVisible = isDesktop ? isHovered : isOpen;

  return (
    <div 
      className={`fixed bottom-6 left-6 z-50 pb-2 ${className}`}
      onMouseEnter={() => {
        if (isDesktop) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (isDesktop) {
          setIsHovered(false);
        }
      }}
    >
      {/* Form Card - Appears on Hover (Desktop) or Click (Mobile) */}
      <div 
        className={`absolute bottom-0 left-0 w-[calc(100vw-2rem)] sm:w-80 mb-14 transition-all duration-300 ease-in-out ${
          isFormVisible
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 border-b p-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Quick Enquiry
            </CardTitle>
            <p className="text-sm text-white/90 mt-1">Get instant response</p>
          </CardHeader>
          <CardContent className="p-4 space-y-3 bg-white">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="quick-name" className="text-xs font-semibold text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quick-name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quick-email" className="text-xs font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quick-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quick-phone" className="text-xs font-semibold text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quick-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quick-message" className="text-xs font-semibold text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="quick-message"
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tell us about your requirement..."
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary/95 text-white font-semibold h-10 text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </Button>
            </form>

            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              We&apos;ll respond within 12 minutes during working hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Floating Icon Button */}
      <Button
        onClick={() => {
          if (!isDesktop) {
            setIsOpen(!isOpen);
          }
        }}
        className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 p-0 relative z-10"
        aria-label="Quick Enquiry"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  );
}

