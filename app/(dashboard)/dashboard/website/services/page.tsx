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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { IconPicker } from "@/components/icon-picker";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as IoIcons from "react-icons/io5";

interface ServiceApi {
  _id: string;
  name: string;
  description: string;
  icon: string;
  iconLibrary?: string;
  order: number;
  status: string;
}

// Helper function to render icon
function renderServiceIcon(service: ServiceApi) {
  if (service.iconLibrary === "lucide") {
    const IconComponent = (LucideIcons as any)[service.icon];
    if (!IconComponent) return <span className="text-2xl">📋</span>;
    return <IconComponent className="h-6 w-6" />;
  } else {
    // Parse react-icons format (e.g., "FaHome", "MdHome", "HiHome", "IoHome")
    const prefix = service.icon.substring(0, 2);
    let IconComponent: any = null;
    
    if (prefix === "Fa") {
      IconComponent = (FaIcons as any)[service.icon];
    } else if (prefix === "Md") {
      IconComponent = (MdIcons as any)[service.icon];
    } else if (prefix === "Hi") {
      IconComponent = (HiIcons as any)[service.icon];
    } else if (prefix === "Io") {
      IconComponent = (IoIcons as any)[service.icon];
    }
    
    if (!IconComponent) return <span className="text-2xl">📋</span>;
    return <IconComponent className="h-6 w-6" />;
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceApi | null>(null);

  const fetchServices = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/services');
      const data = await response.json();
      if (data.success && data.data) {
        setServices(Array.isArray(data.data) ? data.data : []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
      setServices([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (serviceData: Partial<ServiceApi>) => {
    try {
      if (editingService) {
        // Update existing
        const response = await fetch(`/api/services/${editingService._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Service updated successfully");
          fetchServices();
        } else {
          toast.error(result.error || "Failed to update service");
        }
      } else {
        // Create new
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: serviceData.name || "",
            description: serviceData.description || "",
            icon: serviceData.icon || "Home",
            iconLibrary: serviceData.iconLibrary || "lucide",
            order: serviceData.order || services.length + 1,
            status: serviceData.status || "Active",
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Service added successfully");
          fetchServices();
        } else {
          toast.error(result.error || "Failed to add service");
        }
      }
      setIsDialogOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Service deleted successfully");
        fetchServices();
      } else {
        toast.error(data.error || "Failed to delete service");
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error("Failed to delete service");
    }
  };

  const handleEdit = (service: ServiceApi) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Services</h1>
          <p className="text-xs text-muted-foreground">Manage website services</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingService(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Update service details" : "Create a new service"}
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingService(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            {services.length} services configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                services
                  .sort((a, b) => a.order - b.order)
                  .map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex items-center justify-center w-10 h-10">
                          {renderServiceIcon(service)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>
                        <Badge variant={service.status === "Active" ? "default" : "secondary"}>
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(service._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: ServiceApi | null;
  onSave: (data: Partial<ServiceApi>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    icon: string;
    iconLibrary: "lucide" | "react-icons";
    order: number;
    status: "Active" | "Inactive";
  }>({
    name: service?.name || "",
    description: service?.description || "",
    icon: service?.icon || "Home",
    iconLibrary: (service?.iconLibrary || "lucide") as "lucide" | "react-icons",
    order: service?.order || 1,
    status: (service?.status || "Active") as "Active" | "Inactive",
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        icon: service.icon,
        iconLibrary: (service.iconLibrary || "lucide") as "lucide" | "react-icons",
        order: service.order,
        status: service.status as "Active" | "Inactive",
      });
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter service name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter service description"
          rows={4}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })
            }
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Service</Button>
      </div>
    </form>
  );
}
