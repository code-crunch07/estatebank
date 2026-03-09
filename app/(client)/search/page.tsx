"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";

type PriceBand = {
  min?: number;
  max?: number;
};

const priceBands: Record<string, PriceBand> = {
  "below-1cr": { max: 1 },
  "1-3cr": { min: 1, max: 3 },
  "3-5cr": { min: 3, max: 5 },
  "above-5cr": { min: 5 },
};

function convertToCrores(value: number, unit: string): number {
  const normalized = unit.toLowerCase();
  if (normalized.startsWith("lakh")) {
    return value / 100;
  }
  return value;
}

function extractPrice(value: string): number | null {
  const match = value.toLowerCase().match(/([\d.]+)\s*(lakh|cr)/);
  if (!match) return null;
  const numeric = parseFloat(match[1]);
  const unit = match[2];
  if (Number.isNaN(numeric)) return null;
  return convertToCrores(numeric, unit);
}

function parsePropertyPriceRange(price: string): PriceBand {
  const parts = price.split("-");
  if (parts.length === 0) return {};

  const min = extractPrice(parts[0]);
  const max = parts[1] ? extractPrice(parts[1]) : min;

  const range: PriceBand = {};
  if (min != null) range.min = min;
  if (max != null) range.max = max;
  return range;
}

function priceMatchesFilter(propertyPrice: string, selectedBand: string): boolean {
  if (selectedBand === "any") return true;
  const band = priceBands[selectedBand];
  if (!band) return true;

  const propertyRange = parsePropertyPriceRange(propertyPrice);
  const min = propertyRange.min ?? propertyRange.max;
  const max = propertyRange.max ?? propertyRange.min;

  if (min == null && max == null) {
    return false;
  }

  if (band.min != null && max != null && max < band.min) {
    return false;
  }

  if (band.max != null && min != null && min > band.max) {
    return false;
  }

  return true;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [allProperties, setAllProperties] = useState<any[]>([]);

  const query = searchParams.get("query")?.toLowerCase().trim() ?? "";
  const type = searchParams.get("type") ?? "all";
  const price = searchParams.get("price") ?? "any";
  const bedrooms = searchParams.get("bedrooms") ?? "any";

  useEffect(() => {
    // Fetch properties from API
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        const data = await response.json();
        if (data.success && data.data) {
          setAllProperties(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setAllProperties([]);
      }
    };
    
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      const nameMatch =
        query.length === 0 ||
        property.name.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        (property.type ?? "").toLowerCase().includes(query);

      const typeMatch = type === "all" || (property.type ?? "").toLowerCase() === type.toLowerCase();

      const priceMatch = priceMatchesFilter(property.price, price);

      const bedroomsMatch =
        bedrooms === "any" || property.bedrooms >= Number(bedrooms);

      return nameMatch && typeMatch && priceMatch && bedroomsMatch;
    });
  }, [allProperties, query, type, price, bedrooms]);

  const filtersActive = query || type !== "all" || price !== "any" || bedrooms !== "any";

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Search Results
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              {filteredProperties.length} property{filteredProperties.length === 1 ? "" : "ies"} found
            </h1>
            {filtersActive && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing results for{" "}
                {query ? <span className="font-medium">"{query}"</span> : "all properties"}
                {type !== "all" && ` · type: ${type}`}
                {price !== "any" && ` · price: ${price.replace("-", " to ")}`}
                {bedrooms !== "any" && ` · bedrooms: ${bedrooms}+`}
              </p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link href="/">Modify Search</Link>
          </Button>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-muted/40 border border-dashed rounded-lg p-12 text-center">
            <h2 className="text-lg font-semibold mb-2">No properties found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your filters or explore our full property listing.
            </p>
            <Button asChild>
              <Link href="/properties">Browse All Properties</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <>
      <PageTitle 
        title="Search Results"
        subtitle="Find Your Property"
        description="Discover properties that match your search criteria."
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading search results...</div>}>
        <SearchResultsContent />
      </Suspense>
    </>
  );
}

