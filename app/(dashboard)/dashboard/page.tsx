"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  IndianRupee,
  Calendar,
  Phone,
  Mail,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  MapPin,
} from "lucide-react";
import { DataStore } from "@/lib/data-store";
import Link from "next/link";
import Image from "next/image";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  href?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch properties from API (use lightweight mode for better performance)
        try {
          const propsResponse = await fetch("/api/properties?lightweight=true").catch(() => null);
          if (propsResponse && propsResponse.ok) {
            const propsData = await propsResponse.json();
            // Handle both response formats:
            // 1. When lightweight=true: data.data is an array
            // 2. When lightweight=false: data.data is { properties: [...], count: ... }
            let propertiesArray: any[] = [];
            
            if (Array.isArray(propsData.data)) {
              // Direct array response (lightweight mode)
              propertiesArray = propsData.data;
            } else if (propsData.data?.properties && Array.isArray(propsData.data.properties)) {
              // Object with properties key
              propertiesArray = propsData.data.properties;
            } else if (propsData.data && typeof propsData.data === 'object') {
              // Try to extract any array from the response
              const keys = Object.keys(propsData.data);
              for (const key of keys) {
                if (Array.isArray(propsData.data[key])) {
                  propertiesArray = propsData.data[key];
                  break;
                }
              }
            }
            
            setProperties(propertiesArray);
          } else {
            setProperties([]);
          }
        } catch (error) {
          console.error("Error loading properties:", error);
          setProperties([]);
        }

        // Load clients
        try {
          const clientsResponse = await fetch("/api/people/clients").catch(() => null);
          if (clientsResponse && clientsResponse.ok) {
            const clientsData = await clientsResponse.json();
            const clientsArray = Array.isArray(clientsData.data?.clients) 
              ? clientsData.data.clients 
              : (Array.isArray(clientsData.data) ? clientsData.data : (Array.isArray(clientsData) ? clientsData : []));
            setClients(clientsArray);
          } else {
            setClients([]);
          }
        } catch (error) {
          console.error("Error loading clients:", error);
          setClients([]);
        }

        // Load leads
        try {
          const leadsResponse = await fetch("/api/leads").catch(() => null);
          if (leadsResponse && leadsResponse.ok) {
            const leadsData = await leadsResponse.json();
            const leadsArray = Array.isArray(leadsData.data) ? leadsData.data : (Array.isArray(leadsData) ? leadsData : []);
            setLeads(leadsArray);
          } else {
            setLeads([]);
          }
        } catch (error) {
          console.error("Error loading leads:", error);
          setLeads([]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProperties = Array.isArray(properties) ? properties.length : 0;
    
    // Helper function to check if status includes a value (handles both array and string)
    const hasStatus = (property: any, statusValue: string): boolean => {
      if (!property.status) return false;
      if (Array.isArray(property.status)) {
        return property.status.some((s: string) => 
          s?.toLowerCase() === statusValue.toLowerCase() || 
          s === statusValue
        );
      }
      return property.status === statusValue || 
             property.status.toLowerCase() === statusValue.toLowerCase();
    };
    
    const availableProperties = Array.isArray(properties) 
      ? properties.filter((p) => hasStatus(p, "Available") || !p.status).length 
      : 0;
    const soldProperties = Array.isArray(properties) 
      ? properties.filter((p) => hasStatus(p, "Sold")).length 
      : 0;
    const underConstruction = Array.isArray(properties) 
      ? properties.filter((p) => hasStatus(p, "Under Construction")).length 
      : 0;
    const totalClients = Array.isArray(clients) ? clients.length : 0;
    const leadsArray = Array.isArray(leads) ? leads : [];
    const activeLeads = leadsArray.filter((l) => l.status === "Active" || !l.status).length;
    const totalLeads = leadsArray.length;
    const conversionRate = totalLeads > 0 ? ((totalClients / totalLeads) * 100).toFixed(1) : 0;

    // Calculate revenue (mock calculation)
    const totalRevenue = properties
      .filter((p) => p.status === "Sold")
      .reduce((sum, p) => {
        const price = parseInt(p.price?.replace(/[₹,]/g, "") || "0");
        return sum + price;
      }, 0);

    return {
      totalProperties,
      availableProperties,
      soldProperties,
      underConstruction,
      totalClients,
      activeLeads,
      totalLeads,
      conversionRate,
      totalRevenue,
    };
  }, [properties, clients, leads]);

  // Property status distribution (must be defined before statCards)
  const statusDistribution = useMemo(() => {
    const propertiesArray = Array.isArray(properties) ? properties : [];
    // Helper function to check if status includes a value (handles both array and string)
    const hasStatus = (property: any, statusValue: string): boolean => {
      if (!property.status) return statusValue === "Available"; // Treat no status as Available
      if (Array.isArray(property.status)) {
        return property.status.some((s: string) => 
          s?.toLowerCase() === statusValue.toLowerCase() || 
          s === statusValue
        );
      }
      return property.status === statusValue || 
             property.status.toLowerCase() === statusValue.toLowerCase();
    };
    const statuses = {
      Available: propertiesArray.filter((p) => hasStatus(p, "Available") || !p.status).length,
      Sold: propertiesArray.filter((p) => hasStatus(p, "Sold")).length,
      "Under Construction": propertiesArray.filter((p) => hasStatus(p, "Under Construction")).length,
      Reserved: propertiesArray.filter((p) => hasStatus(p, "Reserved")).length,
    };
    return statuses;
  }, [properties]);

  const statCards: StatCard[] = [
    {
      title: "Total Properties",
      value: stats.totalProperties,
      change: "View all properties",
      icon: <Building2 className="h-5 w-5" />,
      color: "text-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      href: "/dashboard/properties",
    },
    {
      title: "Active Leads",
      value: stats.activeLeads,
      change: `${stats.totalLeads} total leads`,
      icon: <Users className="h-5 w-5" />,
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/10",
      href: "/dashboard/crm/leads",
    },
    {
      title: "Total Clients",
      value: stats.totalClients,
      change: "Registered clients",
      icon: <Users className="h-5 w-5" />,
      color: "text-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/10",
      href: "/dashboard/people/clients",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      change: "Lead to client",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10",
    },
  ];

  // Recent properties
  const recentProperties = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) return [];
    return properties
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [properties]);

  // Recent leads
  const recentLeads = useMemo(() => {
    if (!Array.isArray(leads) || leads.length === 0) return [];
    return leads
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [leads]);


  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Available: "bg-green-500",
      Sold: "bg-red-500",
      "Under Construction": "bg-yellow-500",
      Reserved: "bg-blue-500",
      Completed: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-8 space-y-8">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <div className="w-1 h-12 bg-white/30 rounded-full"></div>
                Dashboard
              </h1>
              <p className="text-white/90 text-lg">
                Welcome back! Here&apos;s what&apos;s happening with your business today.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/20 text-white"
                onClick={() => router.push("/dashboard/properties/add")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
              <Button
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                onClick={() => router.push("/dashboard/crm/leads")}
              >
                <Users className="h-4 w-4 mr-2" />
                View Leads
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Modern Design */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.href || "#"}
              className="block group"
            >
              <Card className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 border-0 bg-white dark:bg-gray-800 shadow-lg">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-100`} />
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-12 -mb-12"></div>
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
                    {stat.value}
                  </div>
                  {stat.title === "Total Properties" ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {statusDistribution.Available > 0 && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                            <span className="font-semibold">{statusDistribution.Available}</span>
                            <span>Available</span>
                          </span>
                        )}
                        {statusDistribution.Sold > 0 && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                            <span className="font-semibold">{statusDistribution.Sold}</span>
                            <span>Sold</span>
                          </span>
                        )}
                        {statusDistribution["Under Construction"] > 0 && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block"></span>
                            <span className="font-semibold">{statusDistribution["Under Construction"]}</span>
                            <span>Under Construction</span>
                          </span>
                        )}
                        {statusDistribution.Reserved > 0 && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
                            <span className="font-semibold">{statusDistribution.Reserved}</span>
                            <span>Reserved</span>
                          </span>
                        )}
                        {stats.totalProperties === 0 && (
                          <span>No properties</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                      {stat.change}
                    </p>
                  )}
                </CardContent>
                {stat.href && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>

        {/* Additional Stats Row - Enhanced Design */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Properties Sold</CardTitle>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 dark:bg-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.soldProperties}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        stats.totalProperties > 0
                          ? (stats.soldProperties / stats.totalProperties) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {stats.totalProperties > 0
                    ? `${((stats.soldProperties / stats.totalProperties) * 100).toFixed(0)}%`
                    : "0%"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200/30 dark:bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Under Construction</CardTitle>
              <div className="p-2.5 rounded-xl bg-yellow-500/20 dark:bg-yellow-500/30">
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.underConstruction}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">In development phase</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available Now</CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-500/20 dark:bg-blue-500/30">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.availableProperties}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Ready for sale/rent</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Properties */}
          <Card className="lg:col-span-2 hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
              <div>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  Recent Properties
                </CardTitle>
                <CardDescription className="mt-1">Latest property additions</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary"
                onClick={() => router.push("/dashboard/properties")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {recentProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">No properties yet</p>
                  <Button
                    onClick={() => router.push("/dashboard/properties/add")}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProperties.map((property, index) => (
                    <div
                      key={property.id || index}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent dark:hover:from-primary/10 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
                      onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={property.images[0]}
                            alt={property.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized={property.images[0]?.startsWith("data:")}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <Building2 className="h-8 w-8 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors mb-1">
                          {property.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs font-medium">
                            {property.type || "N/A"}
                          </Badge>
                          {property.status && (
                            <Badge
                              className={`text-xs font-semibold ${getStatusColor(property.status)} text-white border-0 shadow-sm`}
                            >
                              {property.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-base bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {property.price || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                          {property.bedrooms || 0} BHK
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Status Chart */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group"
                  onClick={() => router.push("/dashboard/properties/add")}
                >
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 mr-3 transition-colors">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Add Property</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group"
                  onClick={() => router.push("/dashboard/people/clients")}
                >
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 mr-3 transition-colors">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Add Client</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group"
                  onClick={() => router.push("/dashboard/crm/leads")}
                >
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 mr-3 transition-colors">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">View Leads</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group"
                  onClick={() => router.push("/dashboard/communication/broadcast")}
                >
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 mr-3 transition-colors">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Send Broadcast</span>
                </Button>
              </CardContent>
            </Card>

            {/* Property Status Distribution */}
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <PieChart className="h-5 w-5 text-primary" />
                  </div>
                  Property Status
                </CardTitle>
                <CardDescription className="mt-1">Distribution of properties by status</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {Object.entries(statusDistribution).map(([status, count]) => {
                    const percentage =
                      stats.totalProperties > 0
                        ? ((count / stats.totalProperties) * 100).toFixed(0)
                        : 0;
                    return (
                      <div key={status} className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{status}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {count} <span className="text-gray-500 dark:text-gray-400">({percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-full ${getStatusColor(status)} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Leads */}
        {recentLeads.length > 0 && (
          <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
              <div>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  Recent Leads
                </CardTitle>
                <CardDescription className="mt-1">Latest lead activities</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary"
                onClick={() => router.push("/dashboard/crm/leads")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recentLeads.map((lead, index) => (
                  <div
                    key={lead._id || lead.id || index}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent dark:hover:from-primary/10 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
                    onClick={() => router.push("/dashboard/crm/leads")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {lead.name || "Unknown Lead"}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          {lead.email && <Mail className="h-3 w-3" />}
                          {lead.phone && <Phone className="h-3 w-3" />}
                          {lead.email || lead.phone || "No contact info"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lead.status && (
                        <Badge
                          variant={lead.status === "Active" ? "default" : "secondary"}
                          className="text-xs font-semibold shadow-sm"
                        >
                          {lead.status}
                        </Badge>
                      )}
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
