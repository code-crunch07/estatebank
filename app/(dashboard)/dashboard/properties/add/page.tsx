"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataStore, Amenity, Property } from "@/lib/data-store";
import { Plus, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import { MediaSelector } from "@/components/media-selector";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as IoIcons from "react-icons/io5";
import Image from "next/image";

// Static BHK options (not dynamic data)
const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6 BHK"];

export default function AddPropertyPage() {
  const router = useRouter();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedOwnerImages, setSelectedOwnerImages] = useState<File[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isAddAmenityDialogOpen, setIsAddAmenityDialogOpen] = useState(false);
  const [propertyStatuses, setPropertyStatuses] = useState<string[]>([]);
  const [capacities, setCapacities] = useState<Array<{ _id: string; name: string; bedrooms: number; bathrooms: number }>>([]);
  const [occupancyTypes, setOccupancyTypes] = useState<Array<{ _id: string; name: string; description?: string }>>([]);
  
  // Dropdown data from APIs
  const [locations, setLocations] = useState<Array<{ _id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<{ _id: string; name: string }>>([]);
  const [propertyTypes, setPropertyTypes] = useState<Array<{ _id: string; name: string }>>([]);
  const [brokers, setBrokers] = useState<Array<{ _id: string; name: string }>>([]);
  const [owners, setOwners] = useState<Array<{ _id: string; name: string }>>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    sequence: "",
    title: "",
    location: "",
    area: "",
    landmark: "",
    address: "",
    type: "", // Buy or Rent
    segment: "", // Residential or Commercial
    bedrooms: "",
    bathrooms: "",
    capacity: "", // Capacity ID (for backward compatibility)
    capacities: [] as string[], // Array of capacity IDs
    occupancyType: "", // Occupancy Type ID
    propertyType: "",
    status: ["Available"], // Property statuses (array)
    deposit: "",
    price: "",
    rent: "",
    carpetArea: "",
    dateAvailableFrom: "",
    commencementDate: "",
    priceNote: "",
    videoLink: "",
    videoTour: "",
    clientName: "",
    broker: "",
    ownerName: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    overview: "",
    keyHighlights: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedFloorPlans, setSelectedFloorPlans] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState<string[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{ name: string; distance: string; icon: string }>>([]);
  
  // Featured image state
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>("");
  const [isFeaturedMediaSelectorOpen, setIsFeaturedMediaSelectorOpen] = useState(false);
  
  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch amenities from API
    const fetchAmenities = async () => {
      try {
        const response = await fetch('/api/amenities');
        const data = await response.json();
        if (data.success && data.data) {
          const allAmenities = Array.isArray(data.data) ? data.data : [];
          setAmenities(allAmenities.filter((a: any) => a.status === "Active"));
        }
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    };
    
    fetchAmenities();

    // Load property statuses
    const stored = localStorage.getItem("propertyStatuses");
    if (stored) {
      try {
        const statuses = JSON.parse(stored);
        setPropertyStatuses(statuses.map((s: any) => s.name));
      } catch (error) {
        // Use default statuses if parsing fails
        setPropertyStatuses(["Available", "Sold", "Under Construction", "Completed", "Reserved", "Coming Soon"]);
      }
    } else {
      setPropertyStatuses(["Available", "Sold", "Under Construction", "Completed", "Reserved", "Coming Soon"]);
    }

    // Fetch capacities
    const fetchCapacities = async () => {
      try {
        const response = await fetch('/api/capacities');
        const data = await response.json();
        if (data.success && data.data) {
          setCapacities(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error('Error fetching capacities:', error);
      }
    };

    // Fetch occupancy types
    const fetchOccupancyTypes = async () => {
      try {
        const response = await fetch('/api/occupancy');
        const data = await response.json();
        if (data.success && data.data) {
          setOccupancyTypes(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error('Error fetching occupancy types:', error);
      }
    };

    fetchCapacities();
    fetchOccupancyTypes();

    // Fetch locations
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        if (data.success && data.data) {
          setLocations(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    // Fetch areas
    const fetchAreas = async () => {
      try {
        const response = await fetch('/api/areas');
        const data = await response.json();
        if (data.success && data.data) {
          setAreas(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    // Fetch property types
    const fetchPropertyTypes = async () => {
      try {
        const response = await fetch('/api/property-types');
        const data = await response.json();
        if (data.success && data.data) {
          // API returns { types: [...], count, total, hasMore }
          const typesArray = data.data.types || (Array.isArray(data.data) ? data.data : []);
          setPropertyTypes(typesArray);
        }
      } catch (error) {
        console.error('Error fetching property types:', error);
      }
    };

    // Fetch brokers
    const fetchBrokers = async () => {
      try {
        const response = await fetch('/api/people/brokers');
        const data = await response.json();
        if (data.success && data.data) {
          const brokersData = Array.isArray(data.data) ? data.data : [];
          setBrokers(brokersData.map((b: any) => ({ _id: b._id || b.id, name: b.name })));
        }
      } catch (error) {
        console.error('Error fetching brokers:', error);
      }
    };

    // Fetch owners
    const fetchOwners = async () => {
      try {
        const response = await fetch('/api/people/owners');
        const data = await response.json();
        if (data.success && data.data) {
          const ownersData = Array.isArray(data.data) ? data.data : [];
          setOwners(ownersData.map((o: any) => ({ _id: o._id || o.id, name: o.name })));
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
      }
    };

    fetchLocations();
    fetchAreas();
    fetchPropertyTypes();
    fetchBrokers();
    fetchOwners();
  }, []);

  const handleAmenityChange = (amenityName: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenityName]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenityName));
    }
  };

  // Helper function to render amenity icon
  const renderAmenityIcon = (amenity: Amenity) => {
    if (amenity.iconLibrary === "lucide") {
      const IconComponent = (LucideIcons as any)[amenity.icon];
      if (!IconComponent) return null;
      return <IconComponent className="h-4 w-4" />;
    } else {
      const prefix = amenity.icon.substring(0, 2);
      let IconComponent: any = null;
      
      if (prefix === "Fa") {
        IconComponent = (FaIcons as any)[amenity.icon];
      } else if (prefix === "Md") {
        IconComponent = (MdIcons as any)[amenity.icon];
      } else if (prefix === "Hi") {
        IconComponent = (HiIcons as any)[amenity.icon];
      } else if (prefix === "Io") {
        IconComponent = (IoIcons as any)[amenity.icon];
      }
      
      if (!IconComponent) return null;
      return <IconComponent className="h-4 w-4" />;
    }
  };

  const handleAddAmenity = async (amenityData: { name: string; icon: string; iconLibrary: "lucide" | "react-icons" }) => {
    try {
      const response = await fetch('/api/amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: amenityData.name,
          icon: amenityData.icon,
          iconLibrary: amenityData.iconLibrary,
          status: "Active",
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Refresh amenities list
        const fetchResponse = await fetch('/api/amenities');
        const fetchData = await fetchResponse.json();
        if (fetchData.success && fetchData.data) {
          const allAmenities = Array.isArray(fetchData.data) ? fetchData.data : [];
          setAmenities(allAmenities.filter((a: any) => a.status === "Active"));
        }
        setIsAddAmenityDialogOpen(false);
        toast.success("Amenity added successfully!");
      } else {
        toast.error(result.error || "Failed to add amenity");
      }
    } catch (error) {
      console.error('Error adding amenity:', error);
      toast.error("Failed to add amenity");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedOwnerImages(Array.from(e.target.files));
    }
  };

  const handleFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFeaturedImageFile(file);
      setFeaturedImageUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeaturedImageUrlChange = (url: string) => {
    setFeaturedImageUrl(url);
    setFeaturedImagePreview(url);
    setFeaturedImageFile(null);
  };

  const handleRemoveFeaturedImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    setFeaturedImageUrl("");
  };

  const handlePropertyImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(files);
      // Create previews
      const previewPromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(previewPromises).then(setImagePreviews);
    }
  };

  const handleFloorPlansChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFloorPlans(files);
      // Create previews
      const previewPromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(previewPromises).then(setFloorPlanPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeFloorPlan = (index: number) => {
    const newPlans = selectedFloorPlans.filter((_, i) => i !== index);
    const newPreviews = floorPlanPreviews.filter((_, i) => i !== index);
    setSelectedFloorPlans(newPlans);
    setFloorPlanPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSaving) {
      return;
    }
    
    // Validate required fields based on type
    if (!formData.title || !formData.location || !formData.address || !formData.type || !formData.overview) {
      toast.error("Please fill in all required fields including Property Overview");
      return;
    }
    
    setIsSaving(true);

    // Validate type-specific fields
    if (formData.type === "Buy") {
      if (!formData.carpetArea || !formData.price) {
        toast.error("Please fill in Carpet Area and Price for Buy properties");
        return;
      }
    } else if (formData.type === "Rent") {
      if (!formData.deposit || !formData.rent) {
        toast.error("Please fill in Deposit and Rent for Rent properties");
        return;
      }
    }

    // No need to get existing properties - API handles this
    
    // Convert selected amenities to the format expected by Property interface
    const propertyAmenities = selectedAmenities.map((amenityName) => {
      const amenity = amenities.find((a) => a.name === amenityName);
      return {
        name: amenityName,
        icon: amenity?.icon || "Home",
        iconLibrary: amenity?.iconLibrary || "lucide",
        description: amenityName,
      };
    });

    // Get bedrooms and bathrooms from first selected capacity or form data
    let bedrooms = 0;
    let bathrooms = 0;
    
    if (formData.capacities.length > 0) {
      // Use the first selected capacity for bedrooms/bathrooms (primary capacity)
      const firstCapacity = capacities.find(c => c._id === formData.capacities[0]);
      if (firstCapacity) {
        bedrooms = firstCapacity.bedrooms;
        bathrooms = firstCapacity.bathrooms;
      }
    } else if (formData.capacity) {
      // Fallback to single capacity for backward compatibility
      const selectedCapacity = capacities.find(c => c._id === formData.capacity);
      if (selectedCapacity) {
        bedrooms = selectedCapacity.bedrooms;
        bathrooms = selectedCapacity.bathrooms;
      }
    } else {
      // Fallback to parsing from bedrooms field if capacity not selected
      const bhkMatch = formData.bedrooms.match(/(\d+)/);
      bedrooms = bhkMatch ? parseInt(bhkMatch[1]) : parseInt(formData.bedrooms) || 0;
      bathrooms = parseInt(formData.bathrooms) || (bedrooms >= 3 ? 2 : 1);
    }

    // Validate that at least one capacity is selected
    if (formData.capacities.length === 0 && !formData.capacity) {
      toast.error("Please select at least one capacity (BHK)");
      return;
    }

    // Upload featured image to Cloudinary or convert to base64
    let featuredImage = "";
    if (featuredImageFile) {
      try {
        // Try Cloudinary first
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(featuredImageFile);
        });
        
        const uploadResponse = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, folder: 'properties/featured' }),
        });
        
        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          featuredImage = data.data.url;
        } else {
          // Fallback to base64 if Cloudinary fails
          featuredImage = base64;
        }
      } catch (error) {
        // Fallback to base64 if Cloudinary is not configured
        featuredImage = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(featuredImageFile);
        });
      }
    } else if (featuredImageUrl) {
      featuredImage = featuredImageUrl;
    }

    // Upload gallery images to Cloudinary or convert to base64
    const imagePromises = selectedImages.map(async (file) => {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const uploadResponse = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, folder: 'properties/gallery' }),
        });
        
        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          return data.data.url;
        } else {
          return base64; // Fallback to base64
        }
      } catch (error) {
        // Fallback to base64
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
    });

    // Upload floor plans to Cloudinary or convert to base64
    const floorPlanPromises = selectedFloorPlans.map(async (file) => {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const uploadResponse = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, folder: 'properties/floor-plans' }),
        });
        
        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          return data.data.url;
        } else {
          return base64; // Fallback to base64
        }
      } catch (error) {
        // Fallback to base64
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
    });

    const [propertyImages, floorPlanImages] = await Promise.all([
      Promise.all(imagePromises),
      Promise.all(floorPlanPromises),
    ]);

    // Convert video URL to embed format if needed
    let videoTourUrl = formData.videoTour;
    if (videoTourUrl) {
      // Convert YouTube URL to embed format
      if (videoTourUrl.includes("youtube.com/watch")) {
        const videoId = videoTourUrl.split("v=")[1]?.split("&")[0];
        if (videoId) {
          videoTourUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (videoTourUrl.includes("youtu.be/")) {
        const videoId = videoTourUrl.split("youtu.be/")[1]?.split("?")[0];
        if (videoId) {
          videoTourUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (videoTourUrl.includes("vimeo.com/")) {
        const videoId = videoTourUrl.split("vimeo.com/")[1]?.split("?")[0];
        if (videoId) {
          videoTourUrl = `https://player.vimeo.com/video/${videoId}`;
        }
      }
    }

    // Process key highlights
    const processedHighlights = formData.keyHighlights
      ? formData.keyHighlights
          .split(/[,\n]/)
          .map((h) => h.trim())
          .filter((h) => h.length > 0)
      : [];

    // Determine price based on type
    let priceDisplay = "Price on request";
    if (formData.type === "Buy" && formData.price) {
      priceDisplay = `₹${formData.price}`;
    } else if (formData.type === "Rent" && formData.rent) {
      priceDisplay = `₹${formData.rent}/month`;
      if (formData.deposit) {
        priceDisplay += ` (Deposit: ₹${formData.deposit})`;
      }
    }

    // Get occupancy type name if selected
    const selectedOccupancyType = formData.occupancyType && formData.occupancyType !== "none"
      ? occupancyTypes.find(ot => ot._id === formData.occupancyType)?.name 
      : undefined;

    // Create property data for API
    const propertyData = {
      name: formData.title,
      location: formData.location,
      address: formData.address,
      price: priceDisplay,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      area: formData.carpetArea ? `${formData.carpetArea} sq. ft.` : (formData.area || "N/A"),
      type: formData.type,
      segment: formData.segment as "residential" | "commercial" | undefined,
      status: Array.isArray(formData.status) && formData.status.length > 0 ? formData.status : ["Available"],
      capacity: formData.capacities.length > 0 ? formData.capacities[0] : (formData.capacity || undefined), // Primary capacity for backward compatibility
      capacities: formData.capacities.length > 0 ? formData.capacities : undefined, // Array of all selected capacities
      occupancyType: selectedOccupancyType,
      dateAvailableFrom: formData.type === "Rent" && formData.dateAvailableFrom ? formData.dateAvailableFrom : undefined,
      commencementDate: formData.type === "Buy" && formData.commencementDate ? formData.commencementDate : undefined,
      description: formData.overview || formData.metaDescription || `Beautiful ${formData.type} property in ${formData.location}`,
      keyDetails: processedHighlights,
      amenities: propertyAmenities,
      featuredImage: featuredImage || undefined,
      images: propertyImages,
      floorPlans: floorPlanImages.length > 0 ? floorPlanImages : undefined,
      videoTour: videoTourUrl || undefined,
      transport: [],
      nearby: nearbyPlaces.filter(place => place.name.trim() && place.distance.trim()).length > 0 
        ? nearbyPlaces.filter(place => place.name.trim() && place.distance.trim()).map(place => ({
            name: place.name.trim(),
            distance: place.distance.trim(),
            icon: place.icon || "MapPin"
          }))
        : undefined,
      // Additional fields
      sequence: formData.sequence || undefined,
      landmark: formData.landmark || undefined,
      priceNote: formData.priceNote || undefined,
      videoLink: formData.videoLink || undefined,
      clientName: formData.clientName || undefined,
      broker: formData.broker || undefined,
      ownerName: formData.ownerName || undefined,
      metaTitle: formData.metaTitle || undefined,
      metaKeywords: formData.metaKeywords || undefined,
      metaDescription: formData.metaDescription || undefined,
      // Save separate fields for rent, deposit, carpetArea, and overview
      rent: formData.type === "Rent" && formData.rent ? formData.rent : undefined,
      deposit: formData.type === "Rent" && formData.deposit ? formData.deposit : undefined,
      carpetArea: formData.carpetArea ? formData.carpetArea : undefined,
      overview: formData.overview || undefined,
      keyHighlights: formData.keyHighlights || undefined,
      propertyType: formData.propertyType || undefined,
    };

    // Save to API
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Property added successfully!");
        router.push("/dashboard/properties");
      } else {
        toast.error(result.error || "Failed to add property");
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error("Failed to add property");
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-lg font-bold">Add Property</h1>
        <p className="text-xs text-muted-foreground">Create a new property listing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>Fill in all the property information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Property Overview</TabsTrigger>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media & SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="overview">Property Overview / Description *</Label>
                  <Textarea
                    id="overview"
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Enter a comprehensive overview of the property. Describe the property's features, location advantages, nearby amenities, and what makes it special..."
                    rows={8}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a detailed description that will help potential buyers/renters understand the property better. Include information about the neighborhood, nearby facilities, and unique selling points.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key-highlights">Key Highlights</Label>
                  <Textarea
                    id="key-highlights"
                    value={formData.keyHighlights}
                    onChange={(e) => setFormData({ ...formData, keyHighlights: e.target.value })}
                    placeholder="Enter key highlights separated by commas or new lines (e.g., 'Prime Location, Modern Amenities, Spacious Layout, Great Connectivity')"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    List the main selling points or highlights of this property. You can separate them by commas or new lines.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> A well-written overview helps attract more potential buyers/renters. Be descriptive and highlight the property&apos;s best features!
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sequence">Sequence Number *</Label>
                  <Input
                    id="sequence"
                    type="number"
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                    placeholder="Enter sequence number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter property title"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.length > 0 ? (
                          locations.map((location) => (
                            <SelectItem key={location._id} value={location.name}>
                              {location.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="Mumbai" disabled>Loading locations...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => setFormData({ ...formData, area: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.length > 0 ? (
                          areas.map((area) => (
                            <SelectItem key={area._id} value={area.name}>
                              {area.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="Mumbai" disabled>Loading areas...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Enter landmark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value, price: "", rent: "", deposit: "", carpetArea: "", dateAvailableFrom: "", commencementDate: "" })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Rent">Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segment">Property Segment *</Label>
                    <Select
                      value={formData.segment}
                      onValueChange={(value) => setFormData({ ...formData, segment: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacities (BHK) *</Label>
                    {capacities.length > 0 ? (
                      <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                        {capacities.map((capacity) => (
                          <div key={capacity._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`capacity-${capacity._id}`}
                              checked={formData.capacities.includes(capacity._id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                          setFormData({ 
                            ...formData, 
                                    capacities: [...formData.capacities, capacity._id],
                                    // Set bedrooms and bathrooms from first selected capacity
                                    capacity: formData.capacities.length === 0 ? capacity._id : formData.capacity,
                                    bedrooms: formData.capacities.length === 0 ? capacity.bedrooms.toString() : formData.bedrooms,
                                    bathrooms: formData.capacities.length === 0 ? capacity.bathrooms.toString() : formData.bathrooms,
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    capacities: formData.capacities.filter(id => id !== capacity._id),
                                    // Update capacity if this was the selected one
                                    capacity: formData.capacity === capacity._id ? "" : formData.capacity,
                          });
                        }
                      }}
                            />
                            <label
                              htmlFor={`capacity-${capacity._id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {capacity.name} ({capacity.bedrooms} BHK, {capacity.bathrooms} Bath)
                            </label>
                          </div>
                        ))}
                      </div>
                        ) : (
                      <div className="border rounded-md p-3 text-xs text-muted-foreground">
                            No capacities available. Add one in Properties → Capacities
                          </div>
                        )}
                    {formData.capacities.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {formData.capacities.length} capacity(ies)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupancy-type">Occupancy Type</Label>
                    <Select
                      value={formData.occupancyType}
                      onValueChange={(value) => setFormData({ ...formData, occupancyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupancy type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupancyTypes.length > 0 ? (
                          <>
                            <SelectItem value="none">None</SelectItem>
                            {occupancyTypes.map((type) => (
                              <SelectItem key={type._id} value={type._id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <>
                            <SelectItem value="none">None</SelectItem>
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                              No occupancy types available. Add one in Properties → Occupancy
                            </div>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-type">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.length > 0 ? (
                          propertyTypes.map((type) => (
                            <SelectItem key={type._id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="Apartment" disabled>Loading property types...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Property Status *</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2 p-4 border rounded-md">
                      {(propertyStatuses.length > 0 ? propertyStatuses : ["Available", "Sold", "Under Construction", "Completed", "Reserved", "Coming Soon", "Hot", "Resale", "Near Possession"]).map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={Array.isArray(formData.status) ? formData.status.includes(status) : false}
                            onCheckedChange={(checked) => {
                              const currentStatuses = Array.isArray(formData.status) ? formData.status : [formData.status].filter(Boolean);
                              if (checked) {
                                setFormData({ ...formData, status: [...currentStatuses, status] });
                              } else {
                                setFormData({ ...formData, status: currentStatuses.filter(s => s !== status) });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-xs font-normal cursor-pointer"
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {Array.isArray(formData.status) && formData.status.length === 0 && (
                      <p className="text-xs text-destructive mt-1">Please select at least one status</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                {formData.type === "Buy" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="carpet-area">Carpet Area *</Label>
                        <Input
                          id="carpet-area"
                          type="number"
                          value={formData.carpetArea}
                          onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                          placeholder="Enter carpet area (sq. ft.)"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="Enter price"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.type === "Rent" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit">Deposit *</Label>
                        <Input
                          id="deposit"
                          type="number"
                          value={formData.deposit}
                          onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                          placeholder="Enter deposit amount"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rent">Rent *</Label>
                        <Input
                          id="rent"
                          type="number"
                          value={formData.rent}
                          onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                          placeholder="Enter rent amount"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="carpet-area-rent">Carpet Area</Label>
                        <Input
                          id="carpet-area-rent"
                          type="number"
                          value={formData.carpetArea}
                          onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                          placeholder="Enter carpet area (sq. ft.)"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-available-from">Date Available From</Label>
                      <Input
                        id="date-available-from"
                        type="month"
                        value={formData.dateAvailableFrom}
                        onChange={(e) => setFormData({ ...formData, dateAvailableFrom: e.target.value })}
                        min={new Date().toISOString().slice(0, 7)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Select the month and year from which the property will be available for rent
                      </p>
                    </div>
                  </>
                )}

                {formData.type === "Buy" && (
                  <div className="space-y-2">
                    <Label htmlFor="commencement-date">Commencement Date</Label>
                    <Input
                      id="commencement-date"
                      type="month"
                      value={formData.commencementDate}
                      onChange={(e) => setFormData({ ...formData, commencementDate: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Select the month and year when construction of the project began
                    </p>
                  </div>
                )}

                {!formData.type && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Please select a type (Buy or Rent) in the Basic Information tab to see pricing fields.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="price-note">Note For Price</Label>
                  <Input
                    id="price-note"
                    value={formData.priceNote}
                    onChange={(e) => setFormData({ ...formData, priceNote: e.target.value })}
                    placeholder="e.g. The price is/are excluding taxes"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Amenities / Facilities</Label>
                    <Dialog open={isAddAmenityDialogOpen} onOpenChange={setIsAddAmenityDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Amenity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Amenity</DialogTitle>
                          <DialogDescription>
                            Add a new amenity that will be available for all properties
                          </DialogDescription>
                        </DialogHeader>
                        <AmenityForm
                          onSave={handleAddAmenity}
                          onCancel={() => setIsAddAmenityDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2 p-4 border rounded-md">
                    {amenities.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-sm text-muted-foreground">
                        No amenities available. Click &quot;Add Amenity&quot; to create one.
                      </div>
                    ) : (
                      amenities.map((amenity, index) => {
                        const amenityKey = (amenity as any)._id || amenity.id || `amenity-${index}-${amenity.name}`;
                        return (
                          <div key={amenityKey} className="flex items-center space-x-2">
                            <Checkbox
                              id={`amenity-${amenityKey}`}
                              checked={selectedAmenities.includes(amenity.name)}
                              onCheckedChange={(checked) =>
                                handleAmenityChange(amenity.name, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`amenity-${amenityKey}`}
                              className="text-xs font-normal cursor-pointer flex items-center gap-2"
                            >
                              {renderAmenityIcon(amenity)}
                              <span>{amenity.name}</span>
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-link">Video Link</Label>
                  <Input
                    id="video-link"
                    type="url"
                    value={formData.videoLink}
                    onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>What&apos;s Nearby</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNearbyPlaces([...nearbyPlaces, { name: "", distance: "", icon: "MapPin" }])}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Nearby Place
                    </Button>
                  </div>
                  <div className="space-y-2 p-4 border rounded-md">
                    {nearbyPlaces.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No nearby places added. Click &quot;Add Nearby Place&quot; to add one.
                      </p>
                    ) : (
                      nearbyPlaces.map((place, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Place name (e.g., Restaurants)"
                              value={place.name}
                              onChange={(e) => {
                                const updated = [...nearbyPlaces];
                                updated[index].name = e.target.value;
                                setNearbyPlaces(updated);
                              }}
                            />
                            <Input
                              placeholder="Distance (e.g., 15+ within 1 km)"
                              value={place.distance}
                              onChange={(e) => {
                                const updated = [...nearbyPlaces];
                                updated[index].distance = e.target.value;
                                setNearbyPlaces(updated);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setNearbyPlaces(nearbyPlaces.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add nearby places like restaurants, schools, shopping malls, transport hubs, etc.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input 
                      id="client-name" 
                      placeholder="Enter client name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="broker">Broker</Label>
                    <Select
                      value={formData.broker}
                      onValueChange={(value) => setFormData({ ...formData, broker: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokers.length > 0 ? (
                          <>
                            <SelectItem value="">None</SelectItem>
                            {brokers.map((broker) => (
                              <SelectItem key={broker._id} value={broker.name}>
                                {broker.name}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">
                            Loading brokers...
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner-name">Owner Name</Label>
                  <Select
                    value={formData.ownerName}
                    onValueChange={(value) => setFormData({ ...formData, ownerName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.length > 0 ? (
                        <>
                          <SelectItem value="">None</SelectItem>
                          {owners.map((owner) => (
                            <SelectItem key={owner._id} value={owner.name}>
                              {owner.name}
                            </SelectItem>
                          ))}
                        </>
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          Loading owners...
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner-images">Owner Images</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="owner-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {selectedOwnerImages.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {selectedOwnerImages.length} file(s) selected
                      </span>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                {/* Featured Image Section */}
                <div className="space-y-2">
                  <Label htmlFor="featured-image">Featured Image *</Label>
                  {featuredImagePreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-64 rounded-md overflow-hidden border">
                        <Image
                          src={featuredImagePreview}
                          alt="Featured image preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={handleRemoveFeaturedImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFeaturedImage}
                      >
                        Replace Featured Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap items-center">
                        <Input
                          id="featured-image-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFeaturedImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="featured-image-file"
                          className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors whitespace-nowrap"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Choose featured image</span>
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsFeaturedMediaSelectorOpen(true)}
                          className="flex items-center gap-2 whitespace-nowrap"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span>Media Library</span>
                        </Button>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">OR</span>
                        <Input
                          id="featured-image-url"
                          type="url"
                          value={featuredImageUrl}
                          onChange={(e) => handleFeaturedImageUrlChange(e.target.value)}
                          placeholder="Enter featured image URL"
                          className="flex-1 min-w-[250px]"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload a featured image (Max 5MB), select from media library, or enter an image URL. This will be the main image displayed for the property.
                      </p>
                    </div>
                  )}
                  <MediaSelector
                    open={isFeaturedMediaSelectorOpen}
                    onOpenChange={setIsFeaturedMediaSelectorOpen}
                    onSelect={(url) => handleFeaturedImageUrlChange(url)}
                    type="image"
                  />
                </div>

                {/* Gallery Images Section */}
                <div className="space-y-2">
                  <Label htmlFor="property-images">Gallery Images</Label>
                  <Input
                    id="property-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePropertyImagesChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload additional property images (multiple images allowed)
                  </p>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={preview}
                            alt={`Property image ${index + 1}`}
                            width={200}
                            height={150}
                            className="rounded-md object-cover w-full h-32"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor-plans">Floor Plans</Label>
                  <Input
                    id="floor-plans"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFloorPlansChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload floor plan images (multiple images allowed)
                  </p>
                  {floorPlanPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {floorPlanPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={preview}
                            alt={`Floor plan ${index + 1}`}
                            width={200}
                            height={150}
                            className="rounded-md object-cover w-full h-32"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFloorPlan(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-tour">Video Tour URL</Label>
                  <Input
                    id="video-tour"
                    type="url"
                    value={formData.videoTour}
                    onChange={(e) => setFormData({ ...formData, videoTour: e.target.value })}
                    placeholder="Enter YouTube or Vimeo URL (e.g., https://www.youtube.com/watch?v=...)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports YouTube and Vimeo URLs. Will be automatically converted to embed format.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-title">Meta Title</Label>
                  <Input
                    id="meta-title"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Enter meta title for SEO"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-keywords">Meta Keywords</Label>
                  <Input
                    id="meta-keywords"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    placeholder="Enter keywords separated by commas"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-description">Meta Description</Label>
                  <Textarea
                    id="meta-description"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Enter meta description for SEO"
                    rows={4}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 150-160 characters
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Property"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AmenityForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { name: string; icon: string; iconLibrary: "lucide" | "react-icons" }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({ 
    name: "", 
    icon: "", 
    iconLibrary: "lucide" as "lucide" | "react-icons" 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter an amenity name");
      return;
    }
    if (!formData.icon) {
      toast.error("Please select an icon");
      return;
    }
    onSave(formData);
    setFormData({ name: "", icon: "", iconLibrary: "lucide" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amenity-name">Amenity Name *</Label>
        <Input
          id="amenity-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter amenity name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Select Icon *</Label>
        <IconPicker
          value={{ icon: formData.icon, iconLibrary: formData.iconLibrary }}
          onChange={(value) => setFormData({ ...formData, icon: value.icon, iconLibrary: value.iconLibrary })}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Amenity</Button>
      </div>
    </form>
  );
}
