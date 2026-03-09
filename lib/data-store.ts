// Central data store - In production, this would connect to a database/API
// For now, using localStorage for persistence

export interface Property {
  id: number;
  name: string;
  location: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  projectArea?: string;
  rating?: number;
  type: string;
  segment?: "residential" | "commercial"; // Property segment: residential or commercial
  status: string;
  occupancyType?: string; // Occupancy type (e.g., "Ready to Move", "Under Construction")
  commencementDate?: string;
  dateAvailableFrom?: string; // For rent properties - date when property becomes available
  description: string;
  keyDetails: string[];
  amenities: Array<{
    name: string;
    icon: string;
    iconLibrary?: "lucide" | "react-icons";
    description: string;
  }>;
  images: string[];
  floorPlans?: string[]; // Floor plan images
  videoTour?: string; // Video URL (YouTube, Vimeo, etc.)
  transport: Array<{
    name: string;
    distance: string;
  }>;
  nearby?: Array<{
    name: string;
    distance: string;
    icon?: string;
  }>;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  text: string;
  status: "Published" | "Draft";
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  logo: string;
  order: number;
  status: "Active" | "Inactive";
}

export interface HeroImage {
  id: number;
  type: "property" | "banner"; // Type of slideshow item
  propertyId?: number; // For property type: property whose images will be used
  image?: string; // For banner type: uploaded banner image
  linkUrl?: string; // For banner type: optional link URL
  order: number;
  status: "Active" | "Inactive";
}

export interface Service {
  id: number;
  name: string;
  description: string;
  icon: string; // Icon name from react-icons (e.g., "FaHome", "MdHome")
  iconLibrary: "lucide" | "react-icons"; // Which icon library to use
  order: number;
  status: "Active" | "Inactive";
}

export interface HomepageArea {
  id: number;
  name: string;
  description?: string;
  image: string;
  link?: string; // Optional link to properties page with filter
  order: number;
  status: "Active" | "Inactive";
}

export interface NavSubLink {
  id: number;
  label: string;
  href: string;
  order: number;
  visible: boolean;
}

export interface NavLink {
  id: number;
  label: string;
  href: string;
  order: number;
  visible: boolean;
  children?: NavSubLink[];
}

export interface BrandingSettings {
  headerLogo: string;
  dashboardLogo: string;
  favicon?: string;
  navLinks: NavLink[];
}

export interface Amenity {
  id: number;
  name: string;
  icon: string; // Icon name from lucide-react or react-icons (e.g., "Droplets", "Dumbbell", "Car")
  iconLibrary: "lucide" | "react-icons"; // Which icon library to use
  status: "Active" | "Inactive";
}

export interface TeamMember {
  id?: number;
  _id?: string;
  name: string;
  role: string;
  department?: string;
  location?: string;
  phone: string | string[]; // Can be string (comma-separated) or array for backward compatibility
  email: string;
  image?: string;
  bio?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  status?: "Active" | "Inactive";
  order?: number;
}

export interface PropertySubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  iAm: string; // owner, broker, agent, other
  iWantTo: string; // sale, rent
  propertyType: string;
  propertySubType: string;
  bedrooms: string;
  bathrooms: string;
  expectedPrice?: string; // For sale: price
  saleableArea?: string; // For sale: carpet area
  rent?: string; // For rent: rent amount
  deposit?: string; // For rent: deposit amount
  buildingName?: string;
  message?: string;
  images?: string[]; // Base64 or URLs
  status: "Pending" | "Reviewed" | "Approved" | "Rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

// Default data
const defaultProperties: Property[] = [
  {
    id: 1,
    name: "Eden Estate",
    location: "Powai, Mumbai",
    address: "2972 Powai Lake Road, Powai, Mumbai, Maharashtra 400076",
    price: "₹60 Lakh - ₹1.9 Cr",
    bedrooms: 3,
    bathrooms: 2,
    area: "1200 sq ft",
    projectArea: "26,346.74 Sq. Ft.",
    rating: 4.5,
    type: "Villa",
    segment: "residential",
    status: "Completed",
    commencementDate: "28 Jun, 2021",
    description: `This stunning luxury property offers breathtaking views and modern amenities. Located in the heart of Powai, this property is perfect for families looking for a premium living experience. The development features state-of-the-art infrastructure, sustainable design, and world-class amenities that cater to modern lifestyle needs.\n\nThe project showcases exceptional architecture with attention to detail in every aspect. From the grand entrance lobby to the meticulously landscaped gardens, every element has been designed to provide residents with a luxurious and comfortable living experience. The residences feature spacious layouts, premium finishes, and large windows that flood the interiors with natural light.`,
    keyDetails: [
      "Location: Central Business District",
      "Total Built-Up Area: 350,000 sq. ft.",
      "Number of Floors: 20, including two underground levels for parking",
      "Special Features: Vertical garden facade, collaborative workspaces, and an energy-efficient HVAC system",
      "Amenities: Gym, café, daycare, and rooftop event space",
    ],
    amenities: [
      { name: "24x7 Security", icon: "Shield", iconLibrary: "lucide", description: "Round-the-clock security personnel" },
      { name: "Surveillance System", icon: "Camera", iconLibrary: "lucide", description: "Advanced CCTV monitoring" },
      { name: "Fitness Center", icon: "Dumbbell", iconLibrary: "lucide", description: "Fully equipped gymnasium" },
      { name: "Children's play area", icon: "Baby", iconLibrary: "lucide", description: "Safe and fun play zones" },
      { name: "24 hour maintenance", icon: "Wrench", iconLibrary: "lucide", description: "Quick response maintenance team" },
      { name: "Swimming Pool", icon: "Droplets", iconLibrary: "lucide", description: "Luxury pool with deck area" },
      { name: "Firefighting System", icon: "Flame", iconLibrary: "lucide", description: "Complete fire safety infrastructure" },
      { name: "Landscape Garden", icon: "TreePine", iconLibrary: "lucide", description: "Beautifully landscaped gardens" },
    ],
    images: ["/20200513110502.jpg", "/20200513110509.jpg", "/20200513110542.jpg", "/20200513110551.jpg"],
    transport: [
      { name: "Coast", distance: "300m" },
      { name: "Supermarket", distance: "500m" },
      { name: "Railway station", distance: "1750m" },
      { name: "Bus station", distance: "450m" },
      { name: "Hospital", distance: "350m" },
      { name: "University", distance: "750m" },
      { name: "Park", distance: "1120m" },
      { name: "Airport", distance: "3150m" },
      { name: "Bank", distance: "415m" },
    ],
  },
];

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Property Owner",
    company: "Tech Solutions",
    image: "/logo.png",
    rating: 5,
    text: "EstateBANK.in helped us find our dream home in Mumbai. Their team was professional, responsive, and made the entire process smooth. Highly recommended!",
    status: "Published",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Home Buyer",
    company: "Finance Corp",
    image: "/logo.png",
    rating: 5,
    text: "Excellent service! The team understood our requirements perfectly and showed us properties that matched our budget and preferences. Thank you EstateBANK.in!",
    status: "Published",
    createdAt: "2024-01-16",
  },
];

const defaultClients: Client[] = [
  { id: 1, name: "Client 1", logo: "/logo.png", order: 1, status: "Active" },
  { id: 2, name: "Client 2", logo: "/logo.png", order: 2, status: "Active" },
  { id: 3, name: "Client 3", logo: "/logo.png", order: 3, status: "Active" },
  { id: 4, name: "Client 4", logo: "/logo.png", order: 4, status: "Active" },
];

const defaultHeroImages: HeroImage[] = [
  { id: 1, type: "property", propertyId: 1, order: 1, status: "Active" },
];

const defaultServices: Service[] = [
  { id: 1, name: "Property Buying", description: "Expert assistance in finding your dream property", icon: "Home", iconLibrary: "lucide", order: 1, status: "Active" },
  { id: 2, name: "Property Selling", description: "Get the best value for your property", icon: "IndianRupee", iconLibrary: "lucide", order: 2, status: "Active" },
  { id: 3, name: "Property Rental", description: "Find the perfect rental property", icon: "Key", iconLibrary: "lucide", order: 3, status: "Active" },
  { id: 4, name: "Property Management", description: "Complete property management services", icon: "FileText", iconLibrary: "lucide", order: 4, status: "Active" },
];

const defaultAmenities: Amenity[] = [
  { id: 1, name: "Swimming Pool", icon: "Droplets", iconLibrary: "lucide", status: "Active" },
  { id: 2, name: "Gym", icon: "Dumbbell", iconLibrary: "lucide", status: "Active" },
  { id: 3, name: "Parking", icon: "Car", iconLibrary: "lucide", status: "Active" },
  { id: 4, name: "Garden", icon: "TreePine", iconLibrary: "lucide", status: "Active" },
  { id: 5, name: "Security", icon: "Shield", iconLibrary: "lucide", status: "Active" },
  { id: 6, name: "Elevator", icon: "ArrowUpDown", iconLibrary: "lucide", status: "Active" },
  { id: 7, name: "Power Backup", icon: "Battery", iconLibrary: "lucide", status: "Active" },
  { id: 8, name: "WiFi", icon: "Wifi", iconLibrary: "lucide", status: "Active" },
  { id: 9, name: "Clubhouse", icon: "Building2", iconLibrary: "lucide", status: "Active" },
  { id: 10, name: "Playground", icon: "Baby", iconLibrary: "lucide", status: "Active" },
];

const defaultHomepageAreas: HomepageArea[] = [
  { id: 1, name: "Powai", description: "Premium properties in Powai", image: "/20200513110502.jpg", link: "/properties?location=Powai", order: 1, status: "Active" },
  { id: 2, name: "Andheri", description: "Luxury homes in Andheri", image: "/20200513110509.jpg", link: "/properties?location=Andheri", order: 2, status: "Active" },
  { id: 3, name: "Bandra", description: "Exclusive properties in Bandra", image: "/20200513110542.jpg", link: "/properties?location=Bandra", order: 3, status: "Active" },
  { id: 4, name: "Juhu", description: "Beachside properties in Juhu", image: "/20200513110551.jpg", link: "/properties?location=Juhu", order: 4, status: "Active" },
];

const defaultTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Pankaj Nagpal",
    role: "CEO & Founder",
    department: "Leadership",
    location: "Mumbai & UAE",
    phone: ["+91 9820590353", "+971 56 9636 586"],
    email: "info@estatebank.in",
    image: "/team/pankaj-nagpal.jpg",
    bio: "Visionary leader with 20+ years in real estate",
    socials: { linkedin: "#", twitter: "#", facebook: "#", instagram: "#" },
    status: "Active",
    order: 1,
  },
  {
    id: 2,
    name: "Abhiksha Jain",
    role: "Sales In Charge",
    department: "Residential & Commercial",
    location: "Mumbai",
    phone: ["+91 9769710130"],
    email: "abhiksha@estatebank.in",
    image: "/team/abhiksha-jain.jpg",
    bio: "Expert in residential and commercial properties",
    socials: { linkedin: "#", twitter: "#", facebook: "#", instagram: "#" },
    status: "Active",
    order: 2,
  },
  {
    id: 3,
    name: "Sangeeta Israni",
    role: "Sourcing Manager",
    department: "NRI Clientele",
    location: "UAE",
    phone: ["+971 505952147"],
    email: "sangeeta@estatebank.in",
    image: "/team/sangeeta-israni.jpg",
    bio: "Specialized in serving NRI clients globally",
    socials: { linkedin: "#", twitter: "#", facebook: "#", instagram: "#" },
    status: "Active",
    order: 3,
  },
  {
    id: 4,
    name: "Shweta Tiwari",
    role: "Sales Head",
    department: "Rentals / Leasing",
    location: "Mumbai",
    phone: ["+91 9769790353"],
    email: "shweta@estatebank.in",
    image: "/team/shweta-tiwari.jpg",
    bio: "Leading expert in rental and leasing solutions",
    socials: { linkedin: "#", twitter: "#", facebook: "#", instagram: "#" },
    status: "Active",
    order: 4,
  },
];

export const defaultBrandingSettings: BrandingSettings = {
  headerLogo: "/logo.png",
  dashboardLogo: "/logo.png",
  favicon: "/favicon.ico",
  navLinks: [
    { id: 1, label: "Home", href: "/", order: 1, visible: true, children: [] },
    {
      id: 2,
      label: "Properties",
      href: "/properties",
      order: 2,
      visible: true,
      children: [
        { id: 21, label: "Residential", href: "/properties?segment=residential", order: 1, visible: true },
        { id: 22, label: "Commercial", href: "/properties?segment=commercial", order: 2, visible: true },
      ],
    },
    { id: 3, label: "New Projects", href: "/properties/under-construction", order: 3, visible: true, children: [] },
    { id: 4, label: "Services", href: "/services", order: 4, visible: true, children: [] },
    { id: 5, label: "About Us", href: "/about", order: 5, visible: true, children: [] },
    { id: 6, label: "Testimonials", href: "/testimonials", order: 6, visible: true, children: [] },
    { id: 7, label: "Contact Us", href: "/contact", order: 7, visible: true, children: [] },
  ],
};

// Data Store Functions
export const DataStore = {
  // Properties
  getProperties: (): Property[] => {
    if (typeof window === "undefined") return defaultProperties;
    try {
      const stored = localStorage.getItem("properties");
      if (!stored) return defaultProperties;
      
      const properties = JSON.parse(stored);
      if (!Array.isArray(properties)) return defaultProperties;
      
      // Filter out invalid properties and ensure all properties have required fields
      const validProperties = properties.filter((p: any) => p && typeof p === 'object' && p.id && p.name);
      
      // Ensure all properties have a segment field (migration)
      const migratedProperties = validProperties.map((p: any) => ({
        ...p,
        segment: p.segment || 'residential', // Default to residential if not set
        images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      }));
      
      // Save migrated properties back if they were changed or invalid properties were filtered
      if (migratedProperties.length !== properties.length || migratedProperties.some((p: Property, i: number) => !properties[i].segment)) {
        localStorage.setItem("properties", JSON.stringify(migratedProperties));
      }
      
      return migratedProperties.length > 0 ? migratedProperties : defaultProperties;
    } catch (error) {
      console.error("Error loading properties from localStorage:", error);
      return defaultProperties;
    }
  },

  saveProperties: (properties: Property[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("properties", JSON.stringify(properties));
  },

  getProperty: (id: string): Property | null => {
    const properties = DataStore.getProperties();
    return properties.find((p) => p.id === parseInt(id)) || null;
  },

  getPropertyBySlug: (segment: string, slug: string): Property | null => {
    const properties = DataStore.getProperties();
    // Normalize segment (handle case variations)
    const normalizedSegment = segment.toLowerCase();
    
    // Import slug generation function (using same logic as utils)
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    
    const found = properties.find((p) => {
      const propertySegment = (p.segment || 'residential').toLowerCase();
      const propertySlug = generateSlug(p.name);
      
      return propertySegment === normalizedSegment && propertySlug === slug;
    });
    
    // If not found, try without segment check (fallback)
    if (!found) {
      return properties.find((p) => {
        const propertySlug = generateSlug(p.name);
        return propertySlug === slug;
      }) || null;
    }
    
    return found || null;
  },

  // Testimonials
  getTestimonials: (): Testimonial[] => {
    if (typeof window === "undefined") return defaultTestimonials;
    const stored = localStorage.getItem("testimonials");
    return stored ? JSON.parse(stored) : defaultTestimonials;
  },

  saveTestimonials: (testimonials: Testimonial[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("testimonials", JSON.stringify(testimonials));
  },

  // Clients
  getClients: (): Client[] => {
    if (typeof window === "undefined") return defaultClients;
    const stored = localStorage.getItem("clients");
    return stored ? JSON.parse(stored) : defaultClients;
  },

  saveClients: (clients: Client[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("clients", JSON.stringify(clients));
  },

  // Hero Images
  getHeroImages: (): HeroImage[] => {
    if (typeof window === "undefined") return defaultHeroImages;
    const stored = localStorage.getItem("heroImages");
    return stored ? JSON.parse(stored) : defaultHeroImages;
  },

  saveHeroImages: (images: HeroImage[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("heroImages", JSON.stringify(images));
  },

  // Services
  getServices: (): Service[] => {
    if (typeof window === "undefined") return defaultServices;
    const stored = localStorage.getItem("services");
    return stored ? JSON.parse(stored) : defaultServices;
  },

  saveServices: (services: Service[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("services", JSON.stringify(services));
  },

  // Amenities
  getAmenities: (): Amenity[] => {
    if (typeof window === "undefined") return defaultAmenities;
    const stored = localStorage.getItem("amenities");
    return stored ? JSON.parse(stored) : defaultAmenities;
  },

  saveAmenities: (amenities: Amenity[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("amenities", JSON.stringify(amenities));
  },

  // Homepage Areas
  getHomepageAreas: (): HomepageArea[] => {
    if (typeof window === "undefined") return defaultHomepageAreas;
    const stored = localStorage.getItem("homepageAreas");
    return stored ? JSON.parse(stored) : defaultHomepageAreas;
  },

  saveHomepageAreas: (areas: HomepageArea[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("homepageAreas", JSON.stringify(areas));
  },

  // Branding Settings
  getBrandingSettings: (): BrandingSettings => {
    if (typeof window === "undefined") return defaultBrandingSettings;
    const stored = localStorage.getItem("brandingSettings");
    if (!stored) return defaultBrandingSettings;
    try {
      const parsed = JSON.parse(stored);
      return {
        ...defaultBrandingSettings,
        ...parsed,
        navLinks: (parsed.navLinks ?? defaultBrandingSettings.navLinks).map((link: NavLink) => ({
          ...link,
          children: (link.children ?? []).map((child) => ({ ...child })),
        })),
      };
    } catch {
      return defaultBrandingSettings;
    }
  },

  saveBrandingSettings: (settings: BrandingSettings) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("brandingSettings", JSON.stringify(settings));
  },

  // Property Submissions
  getPropertySubmissions: (): PropertySubmission[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("propertySubmissions");
    return stored ? JSON.parse(stored) : [];
  },

  savePropertySubmission: (submission: Omit<PropertySubmission, "id" | "createdAt" | "status">): PropertySubmission => {
    if (typeof window === "undefined") {
      throw new Error("Cannot save submission on server side");
    }
    const existing = DataStore.getPropertySubmissions();
    const newSubmission: PropertySubmission = {
      ...submission,
      id: existing.length > 0 ? Math.max(...existing.map(s => s.id)) + 1 : 1,
      createdAt: new Date().toISOString(),
      status: "Pending",
    };
    const updated = [...existing, newSubmission];
    localStorage.setItem("propertySubmissions", JSON.stringify(updated));
    return newSubmission;
  },

  updatePropertySubmission: (id: number, updates: Partial<PropertySubmission>) => {
    if (typeof window === "undefined") return;
    const submissions = DataStore.getPropertySubmissions();
    const updated = submissions.map(s => 
      s.id === id ? { ...s, ...updates, reviewedAt: updates.status && updates.status !== "Pending" ? new Date().toISOString() : s.reviewedAt } : s
    );
    localStorage.setItem("propertySubmissions", JSON.stringify(updated));
  },

  deletePropertySubmission: (id: number) => {
    if (typeof window === "undefined") return;
    const submissions = DataStore.getPropertySubmissions();
    const updated = submissions.filter(s => s.id !== id);
    localStorage.setItem("propertySubmissions", JSON.stringify(updated));
  },

  // Team Members
  getTeamMembers: (): TeamMember[] => {
    if (typeof window === "undefined") return defaultTeamMembers;
    const stored = localStorage.getItem("teamMembers");
    return stored ? JSON.parse(stored) : defaultTeamMembers;
  },

  saveTeamMembers: (members: TeamMember[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("teamMembers", JSON.stringify(members));
  },
};


