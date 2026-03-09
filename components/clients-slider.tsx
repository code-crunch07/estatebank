"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
export function ClientsSlider() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    // Fetch clients from API
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients?status=Active');
        const data = await response.json();
        if (data.success && data.data) {
          const activeClients = (Array.isArray(data.data) ? data.data : [])
            .filter((c: any) => c.status === "Active")
            .sort((a: any, b: any) => a.order - b.order);
          setClients(activeClients);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
      }
    };
    
    fetchClients();
  }, []);

  // Duplicate clients for seamless infinite scroll
  const duplicatedClients = clients.length > 0 
    ? [...clients, ...clients, ...clients]
    : [];

  if (clients.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-16 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Happy Clients
          </h2>
          <p className="text-lg text-muted-foreground">
            Our Valuable Clients
          </p>
        </div>
      </div>
      <div className="w-full">
        <div className="relative overflow-hidden">
          <div className="flex gap-8 animate-marquee will-change-transform" style={{ width: "max-content" }}>
            {duplicatedClients.map((client, index) => (
              <div
                key={`${client._id || client.id}-${index}`}
                className="flex-shrink-0"
              >
                <Card className="p-8 h-40 w-64 flex items-center justify-center bg-white border-0 rounded-xl">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={180}
                    height={90}
                    className="h-24 w-auto object-contain opacity-100"
                  />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

