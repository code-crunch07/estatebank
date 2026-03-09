"use client";

import { PropertyCard } from "./property-card";
import type { Property } from "@/lib/data-store";

interface GridPropertyOneProps {
  properties?: Property[];
  border?: boolean;
}

export function GridPropertyOne({ properties = [], border = false }: GridPropertyOneProps) {
  // If no properties provided, use empty array (will be handled by parent)
  const displayProperties = properties.slice(0, 8); // Show first 8 properties

  if (displayProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No properties available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${border ? 'border-t pt-8' : ''}`}>
      {displayProperties.map((property, index) => {
        const propertyKey = (property as any)._id || property.id || `property-${index}-${property.name}`;
        return (
          <PropertyCard key={propertyKey} property={property} />
        );
      })}
    </div>
  );
}
