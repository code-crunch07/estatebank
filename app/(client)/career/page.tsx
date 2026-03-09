"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Send, Sparkles } from "lucide-react";
import Link from "next/link";

const benefits = [
  "Work alongside passionate real-estate specialists",
  "Hybrid culture with Powai-based collaboration days",
  "Learning budget, mentorship pods and leadership coaching",
  "Performance-linked incentives on top of base pay",
];

export default function CareerPage() {
  return (
    <div className="bg-muted/30 py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" />
            Join The Team
          </div>
          <h1 className="text-3xl font-bold">Do work that shapes the skyline.</h1>
          <p className="text-muted-foreground">
            EstateBANK.in is assembling product, design, marketing and advisory minds that want to redefine premium living experiences across Mumbai.
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Open Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { title: "Senior Property Advisor", type: "Full-time • Powai" },
              { title: "Growth Marketing Manager", type: "Full-time • Hybrid" },
              { title: "Frontend Engineer (Next.js)", type: "Full-time • Remote (India)" },
            ].map((role) => (
              <div key={role.title} className="rounded-2xl border bg-white/90 px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold">{role.title}</p>
                  <p className="text-xs text-muted-foreground">{role.type}</p>
                </div>
                <Button size="sm" variant="outline" className="mt-4" asChild>
                  <Link href="mailto:careers@estatebank.in?subject=Role%20Application">
                    <Send className="mr-2 h-4 w-4" />
                    Apply Now
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Life at EstateBANK.in</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-2xl border bg-muted/30 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

