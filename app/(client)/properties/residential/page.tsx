"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  Search,
  Home,
  IndianRupee,
  Bed,
  Bath,
  Square as SquareIcon,
  X,
  SlidersHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/page-title";
import { Property } from "@/lib/data-store";
import { PropertyCard } from "@/components/property-card";
import { getPropertyUrl } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ResidentialPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [selectedBathrooms, setSelectedBathrooms] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Fetch properties with "residential" segment from API
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/properties?lightweight=true');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Handle both old format (data.data) and new lightweight format
        const propertiesData = data.success ? (data.data || data.properties || data) : [];
        if (Array.isArray(propertiesData)) {
          const allProperties = propertiesData;
          // Filter properties with "residential" segment (case-insensitive)
          const residentialProperties = allProperties.filter((p: any) => {
            const segment = (p.segment || "").toLowerCase();
            return segment === "residential";
          });
          // Normalize properties: ensure both _id and id are available
          const normalizedProperties = residentialProperties.map((p: any) => ({
            ...p,
            id: p._id || p.id, // Use _id as id if id doesn't exist
            _id: p._id || p.id, // Ensure _id exists
          }));
          setProperties(normalizedProperties as Property[]);
        } else {
          console.error('API response error:', data);
          setProperties([]);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
    
    // Refresh periodically
    const interval = setInterval(loadProperties, 30000); // Changed to 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Get unique values for filters
  const locations = useMemo(() => {
    const locs = [...new Set(properties.map(p => p?.location).filter(Boolean))];
    return locs.filter(Boolean);
  }, [properties]);

  const types = useMemo(() => {
    const typs = [...new Set(properties.map(p => p?.type).filter(Boolean))];
    return typs.filter(Boolean);
  }, [properties]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!property || (!property.id && !(property as any)._id) || !property.name) return false;
      
      const matchesSearch = 
        property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = selectedLocation === "all" || property.location === selectedLocation;
      const matchesType = selectedType === "all" || property.type?.toLowerCase() === selectedType.toLowerCase();
      const matchesBedrooms = selectedBedrooms === "all" || property.bedrooms?.toString() === selectedBedrooms;
      const matchesBathrooms = selectedBathrooms === "all" || property.bathrooms?.toString() === selectedBathrooms;
      
      // Price filter
      let matchesPrice = true;
      if (selectedPrice !== "all") {
        const priceStr = property.price || "";
        const priceNum = parseFloat(priceStr.replace(/[^\d.]/g, ""));
        if (!isNaN(priceNum)) {
          switch (selectedPrice) {
            case "below-1":
              matchesPrice = priceNum < 1;
              break;
            case "1-3":
              matchesPrice = priceNum >= 1 && priceNum <= 3;
              break;
            case "3-5":
              matchesPrice = priceNum > 3 && priceNum <= 5;
              break;
            case "above-5":
              matchesPrice = priceNum > 5;
              break;
          }
        }
      }

      // Area filter
      let matchesArea = true;
      if (selectedArea !== "all") {
        const areaStr = property.area || "";
        const areaNum = parseFloat(areaStr.replace(/[^\d.]/g, ""));
        if (!isNaN(areaNum)) {
          switch (selectedArea) {
            case "below-1000":
              matchesArea = areaNum < 1000;
              break;
            case "1000-1500":
              matchesArea = areaNum >= 1000 && areaNum <= 1500;
              break;
            case "1500-2000":
              matchesArea = areaNum > 1500 && areaNum <= 2000;
              break;
            case "above-2000":
              matchesArea = areaNum > 2000;
              break;
          }
        }
      }

      return matchesSearch && matchesLocation && matchesType && matchesBedrooms && matchesBathrooms && matchesPrice && matchesArea;
    });
  }, [properties, searchTerm, selectedLocation, selectedType, selectedPrice, selectedBedrooms, selectedBathrooms, selectedArea]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLocation !== "all") count++;
    if (selectedType !== "all") count++;
    if (selectedPrice !== "all") count++;
    if (selectedBedrooms !== "all") count++;
    if (selectedBathrooms !== "all") count++;
    if (selectedArea !== "all") count++;
    return count;
  }, [selectedLocation, selectedType, selectedPrice, selectedBedrooms, selectedBathrooms, selectedArea]);

  const clearAllFilters = () => {
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedPrice("all");
    setSelectedBedrooms("all");
    setSelectedBathrooms("all");
    setSelectedArea("all");
    setSearchTerm("");
  };

  return (
    <>
      <PageTitle 
        title="Residential Properties"
        subtitle="Find Your Dream Home"
        description={`${filteredProperties.length} residential propert${filteredProperties.length === 1 ? 'y' : 'ies'} ready for you.`} 
      />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Filter Section */}
        <Card className="p-6 mb-8 border-0 shadow-xl bg-gradient-to-r from-gray-50 to-white">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-base"
              />
            </div>

            {/* Quick Filters Row */}
            {isMounted ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-12">
                  <Home className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger className="h-12">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="below-1">Below ₹1 Cr</SelectItem>
                  <SelectItem value="1-3">₹1 Cr - ₹3 Cr</SelectItem>
                  <SelectItem value="3-5">₹3 Cr - ₹5 Cr</SelectItem>
                  <SelectItem value="above-5">Above ₹5 Cr</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
                <SelectTrigger className="h-12">
                  <Bed className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bedrooms</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBathrooms} onValueChange={setSelectedBathrooms}>
                <SelectTrigger className="h-12">
                  <Bath className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bathrooms</SelectItem>
                  <SelectItem value="1">1 Bathroom</SelectItem>
                  <SelectItem value="2">2 Bathrooms</SelectItem>
                  <SelectItem value="3">3+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            )}

            {/* Filter Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {isMounted && (
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      More Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[540px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Advanced Filters</DialogTitle>
                      <DialogDescription>
                        Refine your search with additional filters
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 space-y-6">
                      <div className="space-y-2">
                        <Label>Area Range</Label>
                        <Select value={selectedArea} onValueChange={setSelectedArea}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select area range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Areas</SelectItem>
                            <SelectItem value="below-1000">Below 1000 sq ft</SelectItem>
                            <SelectItem value="1000-1500">1000 - 1500 sq ft</SelectItem>
                            <SelectItem value="1500-2000">1500 - 2000 sq ft</SelectItem>
                            <SelectItem value="above-2000">Above 2000 sq ft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Price (₹ Cr)</Label>
                          <Input
                            type="number"
                            placeholder="Min"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Price (₹ Cr)</Label>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100])}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={clearAllFilters}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                )}

                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-12"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Loading Properties...
            </h3>
            <p className="text-muted-foreground">
              Please wait while we fetch the latest properties
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">
                {properties.length === 0 
                  ? "No residential properties are available at the moment."
                  : "Try adjusting your filters or search terms to find what you're looking for."}
              </p>
              {properties.length > 0 && (
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {filteredProperties.length} {filteredProperties.length === 1 ? "Property" : "Properties"} Found
              </h2>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing results with {activeFiltersCount} active filter{activeFiltersCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={(property as any)._id || property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>

      <Card className="mt-12 bg-primary text-primary-foreground">
        <CardContent className="p-8 text-center">
          <Home className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Find Your Perfect Home</h2>
          <p className="text-sm mb-6 opacity-90">
            Explore our curated selection of residential properties in prime locations
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/contact">
              Schedule a Viewing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

