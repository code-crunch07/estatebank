"use client";

import { PropertyCard } from "./property-card";
import type { Property } from "@/lib/data-store";

interface ExplorePropertyTwoProps {
  properties?: Property[];
}

export function ExplorePropertyTwo({ properties = [] }: ExplorePropertyTwoProps) {
  // Show different properties or same properties in different layout
  const displayProperties = properties.slice(0, 6);

  if (displayProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No properties available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayProperties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
