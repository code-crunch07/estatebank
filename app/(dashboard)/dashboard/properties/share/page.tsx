"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, MessageSquare, Search, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";

interface Property {
  _id: string;
  id?: string;
  name: string;
  location: string;
  price: string;
  segment?: string;
  type?: string;
}

export default function SharePropertyPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProperties = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/properties?lightweight=true');
      const data = await response.json();
      if (data.success && data.data) {
        setProperties(Array.isArray(data.data) ? data.data : []);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
      setProperties([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const getPropertyUrl = (property: Property) => {
    const segment = property.segment || 'residential';
    const slug = generateSlug(property.name);
    const id = property._id || property.id;
    return `${window.location.origin}/properties/${segment}/${slug}`;
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const shareViaWhatsApp = (property: Property) => {
    const shareLink = getPropertyUrl(property);
    const message = `Check out this property: ${property.name} - ${property.location} - ₹${property.price}\n${shareLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Share Property</h1>
          <p className="text-sm text-muted-foreground">Share property links via WhatsApp or direct link</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchProperties}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shareable Properties</CardTitle>
          <CardDescription>
            {filteredProperties.length} properties available for sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading properties...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Share Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No properties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => {
                    const shareLink = getPropertyUrl(property);
                    return (
                      <TableRow key={property._id || property.id}>
                        <TableCell className="font-medium">{property.name}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>{property.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              value={shareLink}
                              readOnly
                              className="text-xs w-64"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(shareLink)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareViaWhatsApp(property)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            WhatsApp
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
