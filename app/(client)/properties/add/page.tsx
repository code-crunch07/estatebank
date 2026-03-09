"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Send } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { useRouter } from "next/navigation";

export default function AddPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
    iAm: "",
    iWantTo: "",
    propertyType: "",
    propertySubType: "",
    bedrooms: "",
    bathrooms: "",
    expectedPrice: "",
    saleableArea: "",
    rent: "",
    deposit: "",
    buildingName: "",
    message: "",
    termsAccepted: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSendingOTP(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`OTP sent to ${formData.phone}`);
        setOtpSent(true);
        // OTP codes must NEVER be logged for security reasons
        // OTP is only returned in API response in development mode
      } else {
        toast.error(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.phone,
          otp: formData.otp 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Mobile number verified successfully");
        setOtpVerified(true);
      } else {
        toast.error(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length > 5) {
      toast.error("Please select maximum 5 images");
      return;
    }

    const fileArray = Array.from(files);
    setSelectedImages(fileArray);
    toast.success(`${fileArray.length} image(s) selected`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error("Please verify your mobile number with OTP");
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("Please accept the Terms and Conditions");
      return;
    }

    // Validate fields based on sale/rent
    if (formData.iWantTo === "sale") {
      if (!formData.expectedPrice || !formData.saleableArea) {
        toast.error("Please fill in Price and Carpet Area for sale");
        return;
      }
    } else if (formData.iWantTo === "rent") {
      if (!formData.rent || !formData.deposit) {
        toast.error("Please fill in Rent and Deposit for rental");
        return;
      }
    } else {
      toast.error("Please select whether you want to Sale or Rent");
      return;
    }

    setIsLoading(true);

    try {
      // Convert images to base64
      const imagePromises = selectedImages.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      const imageDataUrls = await Promise.all(imagePromises);

      // Save submission to DataStore
      const submissionData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        iAm: formData.iAm,
        iWantTo: formData.iWantTo,
        propertyType: formData.propertyType,
        propertySubType: formData.propertySubType,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        buildingName: formData.buildingName || undefined,
        message: formData.message || undefined,
        images: imageDataUrls.length > 0 ? imageDataUrls : undefined,
      };

      // Add sale or rent specific fields
      if (formData.iWantTo === "sale") {
        submissionData.expectedPrice = formData.expectedPrice;
        submissionData.saleableArea = formData.saleableArea;
      } else if (formData.iWantTo === "rent") {
        submissionData.rent = formData.rent;
        submissionData.deposit = formData.deposit;
      }

      // Save submission via API - creates a property with "Pending Review" status
      const response = await fetch('/api/properties/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          iAm: formData.iAm,
          iWantTo: formData.iWantTo,
          propertyType: formData.propertyType,
          propertySubType: formData.propertySubType,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          buildingName: formData.buildingName,
          message: formData.message,
          expectedPrice: formData.expectedPrice,
          saleableArea: formData.saleableArea,
          rent: formData.rent,
          deposit: formData.deposit,
          images: imageDataUrls,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to submit property");
      }

      setIsLoading(false);
      toast.success("Property submitted successfully! It will be reviewed by our team before being published.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        otp: "",
        iAm: "",
        iWantTo: "",
        propertyType: "",
        propertySubType: "",
        bedrooms: "",
        bathrooms: "",
        expectedPrice: "",
        saleableArea: "",
        rent: "",
        deposit: "",
        buildingName: "",
        message: "",
        termsAccepted: false,
      });
      setSelectedImages([]);
      setOtpSent(false);
      setOtpVerified(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to submit property. Please try again.");
      console.error("Error submitting property:", error);
    }
  };

  return (
    <>
      <PageTitle 
        title="Post Your Property"
        subtitle="List With Us"
        description="Share your details and our concierge team will connect for onboarding."
      />
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Enter your contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    required
                    disabled={otpVerified}
                  />
                  {!otpVerified && (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={!formData.phone || formData.phone.length !== 10 || isSendingOTP}
                      variant="outline"
                    >
                      {isSendingOTP ? "Sending..." : "Send OTP"}
                    </Button>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP (Mobile Verification) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="otp"
                      type="text"
                      value={formData.otp}
                      onChange={(e) => handleInputChange("otp", e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    <Button 
                      type="button" 
                      onClick={handleVerifyOTP} 
                      variant="outline"
                      disabled={!formData.otp || formData.otp.length !== 6 || isVerifyingOTP}
                    >
                      {isVerifyingOTP ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  ✓ Mobile number verified successfully
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="iAm">I am *</Label>
                <Select value={formData.iAm} onValueChange={(value) => handleInputChange("iAm", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Property Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="agent">Real Estate Agent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Property Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Property Details</CardTitle>
              <CardDescription>Provide details about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iWantTo">I want to *</Label>
                <Select
                  value={formData.iWantTo}
                  onValueChange={(value) => handleInputChange("iWantTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertySubType">Property Sub type *</Label>
                  <Input
                    id="propertySubType"
                    value={formData.propertySubType}
                    onChange={(e) => handleInputChange("propertySubType", e.target.value)}
                    placeholder="e.g., 2 BHK, 3 BHK"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => handleInputChange("bedrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Select
                    value={formData.bathrooms}
                    onValueChange={(value) => handleInputChange("bathrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.iWantTo === "sale" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedPrice">Price (eg: 2500000) *</Label>
                    <Input
                      id="expectedPrice"
                      type="number"
                      value={formData.expectedPrice}
                      onChange={(e) => handleInputChange("expectedPrice", e.target.value)}
                      placeholder="2500000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saleableArea">Carpet Area (Sq. Ft) *</Label>
                    <Input
                      id="saleableArea"
                      type="number"
                      value={formData.saleableArea}
                      onChange={(e) => handleInputChange("saleableArea", e.target.value)}
                      placeholder="e.g., 1200"
                      required
                    />
                  </div>
                </div>
              ) : formData.iWantTo === "rent" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent">Rent (eg: 50000) *</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={formData.rent}
                      onChange={(e) => handleInputChange("rent", e.target.value)}
                      placeholder="50000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit">Deposit (eg: 200000) *</Label>
                    <Input
                      id="deposit"
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => handleInputChange("deposit", e.target.value)}
                      placeholder="200000"
                      required
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="buildingName">Building Name</Label>
                <Input
                  id="buildingName"
                  value={formData.buildingName}
                  onChange={(e) => handleInputChange("buildingName", e.target.value)}
                  placeholder="Enter building name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message / Comments</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Add any additional details about your property"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Select Images</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{selectedImages.length > 0 ? `${selectedImages.length} file(s) selected` : "No file chosen"}</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Please Select All Images At Once And Upload Maximum 5 Images
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to the Company Terms and Conditions *
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button type="submit" size="lg" disabled={isLoading || !otpVerified} className="min-w-[200px]">
              {isLoading ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Property
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}


