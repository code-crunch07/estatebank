"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  image?: string;
  leads?: number;
}

interface TeamOneProps {
  members?: TeamMember[];
}

export function TeamOne({ members = [] }: TeamOneProps) {
  // Mock data if no members provided
  const displayMembers = members.length > 0 ? members : [
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 98765 43210",
      role: "Senior Agent",
      image: "/logo.png",
      leads: 12
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 98765 43211",
      role: "Property Consultant",
      image: "/logo.png",
      leads: 8
    },
    {
      id: 3,
      name: "Amit Patel",
      email: "amit@example.com",
      phone: "+91 98765 43212",
      role: "Sales Manager",
      image: "/logo.png",
      leads: 15
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayMembers.map((member) => (
        <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative h-64 w-full">
              <Image
                src={member.image || "/logo.png"}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold mb-2">{member.name}</h4>
              <p className="text-primary mb-4">{member.role}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                {member.leads && (
                  <div className="pt-2">
                    <span className="text-primary font-semibold">{member.leads} Active Leads</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
