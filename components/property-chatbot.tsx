"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Bot, User, MapPin, Bed, Bath, Home, Building2, Key, Globe, Phone } from "lucide-react";
import { PropertyCard } from "./property-card";
import { getPropertyUrl } from "@/lib/utils";
import Link from "next/link";

type Intent = "buy" | "rent" | "sell" | "nri" | "agent" | null;
type RentFor = "family" | "bachelor" | "company" | null;
type SellAction = "sell" | "rent_out" | null;
type NRIService = "buy" | "rent_out" | "management" | "poa" | null;

interface UserPreferences {
  intent?: Intent;
  name?: string;
  mobile?: string;
  email?: string;
  budget?: string;
  location?: string;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  purpose?: string;
  furnishing?: string;
  rentFor?: RentFor;
  sellAction?: SellAction;
  nriService?: NRIService;
  nriCountry?: string;
  preferences?: string[]; // Ready possession, Lake view, etc.
  agentContactMethod?: "call" | "whatsapp" | "meeting";
}

interface Message {
  type: "bot" | "user";
  text: string;
  timestamp: Date;
  buttons?: string[];
}

interface Property {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  type?: string;
  featuredImage?: string;
  area?: string;
  segment?: string;
}

// FAQ Keywords and Answers
const FAQ_KEYWORDS: Record<string, string> = {
  brokerage: "Our brokerage is standard as per market norms and varies by transaction. Would you like our team to explain it clearly?",
  registration: "We assist with complete registration process including documentation, stamp duty, and RERA compliance. Our team will guide you step-by-step.",
  possession: "Possession timelines vary by project. We have both ready-to-move and under-construction properties. What are you looking for?",
  rera: "Yes, all our properties comply with MahaRERA regulations. We ensure complete legal compliance for your peace of mind.",
  maintenance: "Maintenance charges vary by building and amenities. Our team can provide detailed breakdown for any property you're interested in.",
  nri: "We specialize in NRI services including remote property management, POA assistance, and complete documentation support. No need to visit India!",
};

// Escalation triggers
const ESCALATION_KEYWORDS = ["agent", "call", "talk", "human", "representative", "expert", "consultant", "urgent", "ready to buy", "ready to rent"];

export function PropertyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [currentFlow, setCurrentFlow] = useState<"entry" | "buy" | "rent" | "sell" | "nri" | "agent" | "completed">("entry");
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedProperties, setSuggestedProperties] = useState<Property[]>([]);
  const [escalationRequested, setEscalationRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const preferencesRef = useRef<UserPreferences>({});

  // Initialize with entry message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        type: "bot",
        text: "Hi 👋 Welcome to EstateBANK.in\nI can help you find homes in Mumbai.\nWhat are you looking for today?",
        timestamp: new Date(),
        buttons: ["Buy a Property", "Rent a Property", "Sell / Rent Out My Flat", "NRI Services", "Talk to an Agent"],
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && currentFlow !== "entry") {
      inputRef.current.focus();
    }
  }, [isOpen, currentFlow, currentStep]);

  const checkEscalation = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return ESCALATION_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const checkFAQ = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    for (const [keyword, answer] of Object.entries(FAQ_KEYWORDS)) {
      if (lowerText.includes(keyword)) {
        return answer;
      }
    }
    return null;
  };

  const handleIntentSelection = (intent: Intent) => {
    setPreferences(prev => ({ ...prev, intent }));
    
    switch (intent) {
      case "buy":
        setCurrentFlow("buy");
        setCurrentStep(0);
        addBotMessage("Great! Let me help you find the right home 🏡\nWhich location do you prefer?", {
          buttons: ["Powai", "Chandivali", "Vikhroli East", "Vikhroli West", "Not Sure"]
        });
        break;
      case "rent":
        setCurrentFlow("rent");
        setCurrentStep(0);
        addBotMessage("Sure! Are you looking for a home on rent for:", {
          buttons: ["Family", "Bachelor", "Company Lease"]
        });
        break;
      case "sell":
        setCurrentFlow("sell");
        setCurrentStep(0);
        addBotMessage("You're in the right place 👍\nWhat would you like to do?", {
          buttons: ["Sell my flat", "Rent / Lease my flat"]
        });
        break;
      case "nri":
        setCurrentFlow("nri");
        setCurrentStep(0);
        addBotMessage("We specialize in NRI property services 🤝\nHow can we assist you?", {
          buttons: ["Buy Property in India", "Rent out my flat", "Property Management", "POA & Registration Help"]
        });
        break;
      case "agent":
        setCurrentFlow("agent");
        setCurrentStep(0);
        addBotMessage("Sure! How would you like to connect?", {
          buttons: ["Call me back", "WhatsApp me", "Schedule meeting"]
        });
        break;
    }
  };

  const addBotMessage = (text: string, options?: { buttons?: string[] }) => {
    setMessages(prev => [...prev, {
      type: "bot",
      text,
      timestamp: new Date(),
      buttons: options?.buttons,
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      type: "user",
      text,
      timestamp: new Date(),
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const trimmedValue = inputValue.trim();
    
    // Check for escalation
    if (checkEscalation(trimmedValue) && !escalationRequested) {
      addUserMessage(trimmedValue);
      setInputValue("");
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      addBotMessage("I'll connect you with our property expert now 👨‍💼\nPlease share your contact details so they can reach you.");
      setEscalationRequested(true);
      setIsLoading(false);
      // Move to contact collection
      setCurrentFlow("agent");
      setCurrentStep(0);
      return;
    }

    // Check for FAQ
    const faqAnswer = checkFAQ(trimmedValue);
    if (faqAnswer) {
      addUserMessage(trimmedValue);
      setInputValue("");
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      addBotMessage(faqAnswer, {
        buttons: ["Yes", "No, thanks"]
      });
      setIsLoading(false);
      return;
    }

    // Handle based on current flow
    switch (currentFlow) {
      case "entry":
        handleEntryFlow(trimmedValue);
        break;
      case "buy":
        await handleBuyFlow(trimmedValue);
        break;
      case "rent":
        await handleRentFlow(trimmedValue);
        break;
      case "sell":
        await handleSellFlow(trimmedValue);
        break;
      case "nri":
        await handleNRIFlow(trimmedValue);
        break;
      case "agent":
        await handleAgentFlow(trimmedValue);
        break;
    }
  };

  const handleEntryFlow = (value: string) => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes("buy")) {
      handleIntentSelection("buy");
    } else if (lowerValue.includes("rent")) {
      handleIntentSelection("rent");
    } else if (lowerValue.includes("sell") || lowerValue.includes("rent out")) {
      handleIntentSelection("sell");
    } else if (lowerValue.includes("nri")) {
      handleIntentSelection("nri");
    } else if (lowerValue.includes("agent") || lowerValue.includes("talk")) {
      handleIntentSelection("agent");
    } else {
      addUserMessage(value);
      addBotMessage("I can help you with:\n• Buying a property\n• Renting a property\n• Selling/Renting out your property\n• NRI services\n• Connecting with an agent\n\nWhat would you like to do?", {
        buttons: ["Buy a Property", "Rent a Property", "Sell / Rent Out My Flat", "NRI Services", "Talk to an Agent"]
      });
    }
  };

  const handleBuyFlow = async (value: string) => {
    addUserMessage(value);
    setInputValue("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const step = currentStep;
    
    if (step === 0) {
      // Location
      setPreferences(prev => ({ ...prev, location: value }));
      setCurrentStep(1);
      addBotMessage("What type of home are you looking for?", {
        buttons: ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Duplex / Penthouse"]
      });
    } else if (step === 1) {
      // BHK
      setPreferences(prev => ({ ...prev, bedrooms: value.replace(/[^\d]/g, "") }));
      setCurrentStep(2);
      addBotMessage("What's your approximate budget?", {
        buttons: ["Below ₹1.5 Cr", "₹1.5 – ₹2.5 Cr", "₹2.5 – ₹4 Cr", "₹4 Cr+", "Flexible"]
      });
    } else if (step === 2) {
      // Budget
      setPreferences(prev => ({ ...prev, budget: value }));
      setCurrentStep(3);
      addBotMessage("Any specific preference?", {
        buttons: ["Ready Possession", "Under Construction", "Lake View", "Higher Floor", "Vaastu Preferred", "None"]
      });
    } else if (step === 3) {
      // Preferences
      const prefs = preferences.preferences || [];
      if (value !== "None") {
        setPreferences(prev => ({ ...prev, preferences: [...prefs, value] }));
      }
      setCurrentStep(4);
      addBotMessage("Perfect! I have a few good options matching your requirement 😊\nCan I have your name and mobile number so our property expert can share details?");
    } else if (step === 4) {
      // Name
      setPreferences(prev => ({ ...prev, name: value }));
      setCurrentStep(5);
      addBotMessage("Thank you! What's your mobile number?");
    } else if (step === 5) {
      // Mobile
      const mobile = value.replace(/\D/g, "");
      if (mobile.length < 10) {
        addBotMessage("Please enter a valid 10-digit mobile number");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => ({ ...prev, mobile: mobile.slice(-10) }));
      setCurrentStep(6);
      addBotMessage("And your email address?");
    } else if (step === 6) {
      // Email - Use functional update to get all previous state
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        addBotMessage("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      // Use functional update to ensure we capture all previous state
      setPreferences(prev => {
        const updatedPreferences = { ...prev, email: value };
        // Save with the complete object
        saveAndSearch(updatedPreferences).catch(err => console.error("Error in saveAndSearch:", err));
        return updatedPreferences;
      });
      setCurrentStep(7);
    }
    
    setIsLoading(false);
  };

  const handleRentFlow = async (value: string) => {
    addUserMessage(value);
    setInputValue("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const step = currentStep;
    
    if (step === 0) {
      // Rent for
      const rentFor = value.toLowerCase().includes("family") ? "family" : 
                     value.toLowerCase().includes("bachelor") ? "bachelor" : "company";
      setPreferences(prev => ({ ...prev, rentFor: rentFor as RentFor }));
      setCurrentStep(1);
      addBotMessage("Preferred location?", {
        buttons: ["Powai", "Chandivali", "Vikhroli", "Any Nearby Area"]
      });
    } else if (step === 1) {
      // Location
      setPreferences(prev => ({ ...prev, location: value }));
      setCurrentStep(2);
      addBotMessage("Monthly rent budget?", {
        buttons: ["Below ₹60,000", "₹60k – ₹1 Lakh", "₹1 – ₹1.5 Lakh", "₹1.5 Lakh+"]
      });
    } else if (step === 2) {
      // Rent budget
      setPreferences(prev => ({ ...prev, budget: value }));
      setCurrentStep(3);
      addBotMessage("Furnishing preference?", {
        buttons: ["Fully Furnished", "Semi Furnished", "Unfurnished"]
      });
    } else if (step === 3) {
      // Furnishing
      setPreferences(prev => ({ ...prev, furnishing: value }));
      setCurrentStep(4);
      addBotMessage("I can share suitable rental options with you.\nPlease share your contact details.");
      addBotMessage("What's your name?");
    } else if (step === 4) {
      // Name
      setPreferences(prev => ({ ...prev, name: value }));
      setCurrentStep(5);
      addBotMessage("Mobile number?");
    } else if (step === 5) {
      // Mobile
      const mobile = value.replace(/\D/g, "");
      if (mobile.length < 10) {
        addBotMessage("Please enter a valid 10-digit mobile number");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => ({ ...prev, mobile: mobile.slice(-10) }));
      setCurrentStep(6);
      addBotMessage("Email address?");
    } else if (step === 6) {
      // Email - Build complete preferences object using functional update
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        addBotMessage("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      // Build complete preferences using functional update
      setPreferences(prev => {
        const updatedPreferences = { ...prev, email: value };
        preferencesRef.current = updatedPreferences;
        // Save with complete object immediately
        saveAndSearch(updatedPreferences).catch(err => {
          console.error("Error saving lead/enquiry:", err);
        });
        return updatedPreferences;
      });
      setCurrentStep(7);
    }
    
    setIsLoading(false);
  };

  const handleSellFlow = async (value: string) => {
    addUserMessage(value);
    setInputValue("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const step = currentStep;
    
    if (step === 0) {
      // Sell or Rent out
      const sellAction = value.toLowerCase().includes("sell") ? "sell" : "rent_out";
      setPreferences(prev => ({ ...prev, sellAction: sellAction as SellAction }));
      setCurrentStep(1);
      addBotMessage("Where is your property located?", {
        buttons: ["Powai", "Chandivali", "Vikhroli", "Other Mumbai Area"]
      });
    } else if (step === 1) {
      // Location
      setPreferences(prev => ({ ...prev, location: value }));
      setCurrentStep(2);
      addBotMessage("What type of property is it?", {
        buttons: ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Villa / Duplex"]
      });
    } else if (step === 2) {
      // Property type
      setPreferences(prev => ({ ...prev, bedrooms: value.replace(/[^\d]/g, "") }));
      setCurrentStep(3);
      addBotMessage("Would you like a free market evaluation?", {
        buttons: ["Yes, please", "Just list my property"]
      });
    } else if (step === 3) {
      setCurrentStep(4);
      addBotMessage("We've been serving Mumbai since 2004 and work with verified buyers & tenants only.\nPlease share your details and our expert will connect with you.");
      addBotMessage("What's your name?");
    } else if (step === 4) {
      // Name
      setPreferences(prev => ({ ...prev, name: value }));
      setCurrentStep(5);
      addBotMessage("Mobile number?");
    } else if (step === 5) {
      // Mobile
      const mobile = value.replace(/\D/g, "");
      if (mobile.length < 10) {
        addBotMessage("Please enter a valid 10-digit mobile number");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => ({ ...prev, mobile: mobile.slice(-10) }));
      setCurrentStep(6);
      addBotMessage("Email address?");
    } else if (step === 6) {
      // Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        addBotMessage("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => {
        const updatedPreferences = { ...prev, email: value };
        preferencesRef.current = updatedPreferences;
        saveLead(updatedPreferences).catch(err => {
          console.error("Error saving lead:", err);
        });
        return updatedPreferences;
      });
      addBotMessage("Thank you! Our property expert will contact you shortly with market evaluation and best options. 😊");
      setCurrentFlow("completed");
    }
    
    setIsLoading(false);
  };

  const handleNRIFlow = async (value: string) => {
    addUserMessage(value);
    setInputValue("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const step = currentStep;
    
    if (step === 0) {
      // NRI Service type
      let nriService: NRIService = null;
      if (value.toLowerCase().includes("buy")) nriService = "buy";
      else if (value.toLowerCase().includes("rent out")) nriService = "rent_out";
      else if (value.toLowerCase().includes("management")) nriService = "management";
      else if (value.toLowerCase().includes("poa")) nriService = "poa";
      
      setPreferences(prev => ({ ...prev, nriService }));
      setCurrentStep(1);
      addBotMessage("Are you currently based in:", {
        buttons: ["UAE", "USA / Canada", "Europe", "Other Country"]
      });
    } else if (step === 1) {
      // Country
      setPreferences(prev => ({ ...prev, nriCountry: value }));
      setCurrentStep(2);
      addBotMessage("No need to visit India. We handle everything end-to-end.\nOur team will guide you through documentation, leasing, maintenance & registration remotely.\nPlease share your contact details.");
      addBotMessage("What's your name?");
    } else if (step === 2) {
      // Name
      setPreferences(prev => ({ ...prev, name: value }));
      setCurrentStep(3);
      addBotMessage("Mobile number?");
    } else if (step === 3) {
      // Mobile
      const mobile = value.replace(/\D/g, "");
      if (mobile.length < 10) {
        addBotMessage("Please enter a valid 10-digit mobile number");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => ({ ...prev, mobile: mobile.slice(-10) }));
      setCurrentStep(4);
      addBotMessage("Email address?");
    } else if (step === 4) {
      // Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        addBotMessage("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => {
        const updatedPreferences = { ...prev, email: value };
        preferencesRef.current = updatedPreferences;
        saveLead(updatedPreferences).catch(err => {
          console.error("Error saving lead:", err);
        });
        return updatedPreferences;
      });
      addBotMessage("Thank you! Our NRI specialist will contact you shortly to assist with your property needs. 🌍");
      setCurrentFlow("completed");
    }
    
    setIsLoading(false);
  };

  const handleAgentFlow = async (value: string) => {
    addUserMessage(value);
    setInputValue("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const step = currentStep;
    
    if (step === 0) {
      // Contact method
      let method: "call" | "whatsapp" | "meeting" = "call";
      if (value.toLowerCase().includes("whatsapp")) method = "whatsapp";
      else if (value.toLowerCase().includes("meeting") || value.toLowerCase().includes("schedule")) method = "meeting";
      
      setPreferences(prev => ({ ...prev, agentContactMethod: method }));
      setCurrentStep(1);
      addBotMessage("Please share your contact number.");
      addBotMessage("What's your name?");
    } else if (step === 1) {
      // Name
      setPreferences(prev => ({ ...prev, name: value }));
      setCurrentStep(2);
      addBotMessage("Mobile number?");
    } else if (step === 2) {
      // Mobile
      const mobile = value.replace(/\D/g, "");
      if (mobile.length < 10) {
        addBotMessage("Please enter a valid 10-digit mobile number");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => ({ ...prev, mobile: mobile.slice(-10) }));
      setCurrentStep(3);
      addBotMessage("Email address?");
    } else if (step === 3) {
      // Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        addBotMessage("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      setPreferences(prev => {
        const updatedPreferences = { ...prev, email: value };
        preferencesRef.current = updatedPreferences;
        saveLead(updatedPreferences).catch(err => {
          console.error("Error saving lead:", err);
        });
        return updatedPreferences;
      });
      addBotMessage("Our property expert will contact you shortly.\nThank you for choosing EstateBANK.in 😊");
      setCurrentFlow("completed");
    }
    
    setIsLoading(false);
  };

  const saveLead = async (customPreferences?: UserPreferences) => {
    try {
      const prefs = customPreferences || preferences;
      
      if (!prefs.name || !prefs.email || !prefs.mobile) {
        console.error("Missing required fields:", { name: prefs.name, email: prefs.email, mobile: prefs.mobile });
        return;
      }

      const propertyInterest = [
        prefs.intent && `Intent: ${prefs.intent}`,
        prefs.location && `Location: ${prefs.location}`,
        prefs.budget && `Budget: ${prefs.budget}`,
        prefs.bedrooms && `BHK: ${prefs.bedrooms}`,
        prefs.furnishing && `Furnishing: ${prefs.furnishing}`,
        prefs.rentFor && `Rent For: ${prefs.rentFor}`,
        prefs.sellAction && `Action: ${prefs.sellAction}`,
        prefs.nriService && `NRI Service: ${prefs.nriService}`,
        prefs.nriCountry && `NRI Country: ${prefs.nriCountry}`,
        prefs.agentContactMethod && `Contact Method: ${prefs.agentContactMethod}`,
        prefs.preferences && prefs.preferences.length > 0 && `Preferences: ${prefs.preferences.join(", ")}`,
      ]
        .filter(Boolean)
        .join(", ");

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: prefs.name,
          email: prefs.email,
          phone: prefs.mobile,
          source: "Chatbot",
          status: "New",
          propertyInterest: propertyInterest || "Chatbot inquiry",
          notes: `Intent: ${prefs.intent || "Unknown"} - ${new Date().toLocaleString()}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Lead saved - log only success status, no PII
        if (process.env.NODE_ENV === 'development') {
          console.log("Lead saved successfully (ID:", data.data?._id || 'unknown', ")");
        }
      } else {
        console.error("Failed to save lead:", data.error || data.message);
      }
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  const saveEnquiry = async (customPreferences?: UserPreferences) => {
    try {
      const prefs = customPreferences || preferences;
      
      // Wait a bit to ensure state is updated if using preferences directly
      if (!customPreferences) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!prefs.name || !prefs.email || !prefs.mobile) {
        console.error("Missing required fields for enquiry:", { name: prefs.name, email: prefs.email, mobile: prefs.mobile });
        return;
      }

      const message = [
        `Property Search via Chatbot - Intent: ${prefs.intent}`,
        prefs.location && `Location: ${prefs.location}`,
        prefs.budget && `Budget: ${prefs.budget}`,
        prefs.bedrooms && `Bedrooms: ${prefs.bedrooms}`,
        prefs.bathrooms && `Bathrooms: ${prefs.bathrooms}`,
        prefs.propertyType && `Property Type: ${prefs.propertyType}`,
        prefs.furnishing && `Furnishing: ${prefs.furnishing}`,
        prefs.rentFor && `Rent For: ${prefs.rentFor}`,
        prefs.preferences && prefs.preferences.length > 0 && `Preferences: ${prefs.preferences.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n");

      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: prefs.name,
          email: prefs.email,
          phone: prefs.mobile,
          message: message,
          status: "New",
          propertyType: prefs.propertyType,
          bedrooms: prefs.bedrooms ? parseInt(prefs.bedrooms) : undefined,
          bathrooms: prefs.bathrooms ? parseInt(prefs.bathrooms) : undefined,
          expectedPrice: prefs.budget,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Enquiry saved - log only success status, no PII
        if (process.env.NODE_ENV === 'development') {
          console.log("Enquiry saved successfully (ID:", data.data?._id || 'unknown', ")");
        }
      } else {
        console.error("Failed to save enquiry:", data.error || data.message);
      }
    } catch (error) {
      console.error("Error saving enquiry:", error);
    }
  };

  const saveAndSearch = async (customPreferences?: UserPreferences) => {
    const prefs = customPreferences || preferences;
    await saveLead(prefs);
    await saveEnquiry(prefs);
    await searchProperties(prefs);
  };

  const searchProperties = async (customPreferences?: UserPreferences) => {
    try {
      setIsLoading(true);
      const prefs = customPreferences || preferences;
      
      const params = new URLSearchParams();
      if (prefs.location) params.append("location", prefs.location);
      if (prefs.propertyType) params.append("type", prefs.propertyType);
      if (prefs.bedrooms) params.append("bedrooms", prefs.bedrooms);
      params.append("lightweight", "true");

      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.data) {
        let properties = Array.isArray(data.data) ? data.data : [];

        // Filter by budget if provided
        if (prefs.budget) {
          properties = filterByBudget(properties, prefs.budget);
        }

        // Filter by bathrooms if provided
        if (prefs.bathrooms) {
          properties = properties.filter(
            (p: Property) => p.bathrooms >= parseInt(prefs.bathrooms || "0")
          );
        }

        // Limit to top 6 properties
        properties = properties.slice(0, 6);
        setSuggestedProperties(properties);

        if (properties.length > 0) {
          addBotMessage(`Excellent news! 🎯 I found ${properties.length} amazing propert${properties.length === 1 ? "y" : "ies"} that match your preferences perfectly. Here are my top recommendations:`);
        } else {
          addBotMessage("I couldn't find exact matches with those specific criteria, but don't worry! Let me show you some great properties that might interest you.");
          const allResponse = await fetch("/api/properties?lightweight=true&limit=6");
          const allData = await allResponse.json();
          if (allData.success && allData.data) {
            setSuggestedProperties(Array.isArray(allData.data) ? allData.data.slice(0, 6) : []);
          }
        }
      }
    } catch (error) {
      console.error("Error searching properties:", error);
      addBotMessage("I'm having a bit of trouble accessing our property database right now. Please try again in a moment!");
    } finally {
      setIsLoading(false);
      setCurrentFlow("completed");
    }
  };

  const filterByBudget = (properties: Property[], budget: string): Property[] => {
    const budgetLower = budget.toLowerCase();
    
    return properties.filter((property) => {
      const priceStr = property.price || "";
      const priceNum = parseFloat(priceStr.replace(/[^\d.]/g, ""));
      if (isNaN(priceNum)) return true;

      if (budgetLower.includes("below") || budgetLower.includes("<") || budgetLower.includes("1.5")) {
        return priceNum < 1.5;
      } else if (budgetLower.includes("1.5") && budgetLower.includes("2.5")) {
        return priceNum >= 1.5 && priceNum <= 2.5;
      } else if (budgetLower.includes("2.5") && budgetLower.includes("4")) {
        return priceNum > 2.5 && priceNum <= 4;
      } else if (budgetLower.includes("4") || budgetLower.includes("above") || budgetLower.includes(">")) {
        return priceNum > 4;
      }
      return true;
    });
  };

  const handleButtonClick = (buttonText: string) => {
    if (currentFlow === "entry") {
      if (buttonText.includes("Buy")) handleIntentSelection("buy");
      else if (buttonText.includes("Rent")) handleIntentSelection("rent");
      else if (buttonText.includes("Sell") || buttonText.includes("Rent Out")) handleIntentSelection("sell");
      else if (buttonText.includes("NRI")) handleIntentSelection("nri");
      else if (buttonText.includes("Agent")) handleIntentSelection("agent");
    } else {
      setInputValue(buttonText);
      setTimeout(() => handleSend(), 100);
    }
  };

  const handleReset = () => {
    setMessages([{
      type: "bot",
      text: "Hi 👋 Welcome to EstateBANK.in\nI can help you find homes in Mumbai.\nWhat are you looking for today?",
      timestamp: new Date(),
      buttons: ["Buy a Property", "Rent a Property", "Sell / Rent Out My Flat", "NRI Services", "Talk to an Agent"],
    }]);
    setPreferences({});
    preferencesRef.current = {};
    setCurrentFlow("entry");
    setCurrentStep(0);
    setInputValue("");
    setSuggestedProperties([]);
    setEscalationRequested(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = (): string => {
    if (currentFlow === "entry") return "Select an option or type your query...";
    if (currentFlow === "buy" && currentStep === 5) return "Enter 10-digit mobile number";
    if (currentFlow === "rent" && currentStep === 5) return "Enter 10-digit mobile number";
    if (currentFlow === "sell" && currentStep === 5) return "Enter 10-digit mobile number";
    if (currentFlow === "nri" && currentStep === 3) return "Enter 10-digit mobile number";
    if (currentFlow === "agent" && currentStep === 2) return "Enter 10-digit mobile number";
    if (currentFlow === "buy" && currentStep === 6) return "Enter your email";
    if (currentFlow === "rent" && currentStep === 6) return "Enter your email";
    if (currentFlow === "sell" && currentStep === 6) return "Enter your email";
    if (currentFlow === "nri" && currentStep === 4) return "Enter your email";
    if (currentFlow === "agent" && currentStep === 3) return "Enter your email";
    return "Type your message...";
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-110 transition-all duration-300 relative group"
            size="icon"
            title="Chat with Property Assistant"
          >
            <Bot className="h-7 w-7 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></span>
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
            </span>
          </Button>
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[80vh] max-h-[600px] flex flex-col shadow-2xl z-50 border-0 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center ring-2 ring-primary-foreground/30">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  Property Assistant
                </h3>
                <p className="text-xs text-primary-foreground/90">I'll help you find your perfect property</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1 ring-1 ring-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div
                    className={`rounded-2xl p-3 shadow-sm ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-white drop-shadow-sm"
                        : "bg-muted border border-border/50 text-foreground"
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${message.type === "user" ? "font-medium text-white" : ""}`}>
                      {message.text}
                    </p>
                  </div>
                  {message.buttons && message.type === "bot" && (
                    <div className="flex flex-wrap gap-2">
                      {message.buttons.map((button, btnIndex) => (
                        <Button
                          key={btnIndex}
                          variant="outline"
                          size="sm"
                          onClick={() => handleButtonClick(button)}
                          disabled={isLoading || currentFlow === "completed"}
                          className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {button}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {message.type === "user" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1 ring-1 ring-primary/20">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {suggestedProperties.length > 0 && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-3">
                  {suggestedProperties.map((property) => (
                    <div
                      key={property._id || property.id}
                      className="border rounded-xl p-3 bg-background hover:bg-muted/50 transition-all duration-200 hover:shadow-md hover:border-primary/20"
                    >
                      <Link href={getPropertyUrl(property)} className="block">
                        {property.featuredImage && (
                          <img
                            src={property.featuredImage}
                            alt={property.name}
                            className="w-full h-32 object-cover rounded-lg mb-2 shadow-sm"
                          />
                        )}
                        <h4 className="font-semibold text-sm mb-1 text-foreground">{property.name}</h4>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                        <p className="text-sm font-semibold text-primary mb-2">{property.price}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            {property.bedrooms}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            {property.bathrooms}
                          </span>
                          {property.area && (
                            <>
                              <span>•</span>
                              <span>{property.area}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                    Start New Search
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/properties">View All Properties</Link>
                  </Button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl p-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
                disabled={isLoading || currentFlow === "completed"}
                className="flex-1 rounded-lg border-2 focus:border-primary"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || currentFlow === "completed"}
                size="icon"
                className="rounded-lg bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {currentFlow === "completed" && (
              <Button variant="outline" size="sm" onClick={handleReset} className="w-full mt-2">
                Start New Conversation
              </Button>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
