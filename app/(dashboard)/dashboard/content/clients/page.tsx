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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { MediaSelector } from "@/components/media-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

interface ClientApi {
  _id: string;
  name: string;
  logo: string;
  order: number;
  status: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientApi | null>(null);

  const fetchClients = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/clients');
      const data = await response.json();
      if (data.success && data.data) {
        setClients(Array.isArray(data.data) ? data.data : []);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSave = async (clientData: Partial<ClientApi>) => {
    try {
      if (editingClient) {
        // Update existing
        const response = await fetch(`/api/clients/${editingClient._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Client updated successfully");
          fetchClients();
        } else {
          toast.error(result.error || "Failed to update client");
        }
      } else {
        // Create new
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: clientData.name || "",
            logo: clientData.logo || "/logo.png",
            order: clientData.order || clients.length + 1,
            status: clientData.status || "Active",
          }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Client added successfully");
          fetchClients();
        } else {
          toast.error(result.error || "Failed to add client");
        }
      }
      setIsDialogOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error("Failed to save client");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Client deleted successfully");
        fetchClients();
      } else {
        toast.error(data.error || "Failed to delete client");
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error("Failed to delete client");
    }
  };

  const handleEdit = (client: ClientApi) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Happy Clients</h1>
          <p className="text-xs text-muted-foreground">Manage client logos for the homepage slider</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingClient(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add Client"}</DialogTitle>
              <DialogDescription>
                {editingClient ? "Update client information" : "Add a new client logo"}
              </DialogDescription>
            </DialogHeader>
            <ClientForm
              client={editingClient}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingClient(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>{clients.length} clients found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                clients
                  .sort((a, b) => a.order - b.order)
                  .map((client) => (
                    <TableRow key={client._id}>
                      <TableCell>
                        <div className="relative h-12 w-32 bg-muted rounded overflow-hidden">
                          <Image
                            src={client.logo}
                            alt={client.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.order}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(client._id)}
                          >
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

function ClientForm({
  client,
  onSave,
  onCancel,
}: {
  client: ClientApi | null;
  onSave: (data: Partial<ClientApi>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    logo: client?.logo || "/logo.png",
    order: client?.order || 1,
    status: client?.status || ("Active" as "Active" | "Inactive"),
  });
  const [preview, setPreview] = useState<string>(client?.logo || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        logo: client.logo,
        order: client.order,
        status: client.status,
      });
      setPreview(client.logo);
      // Update hidden input for HTML5 validation
      const hiddenInput = document.getElementById("logo-hidden") as HTMLInputElement;
      if (hiddenInput && client.logo && client.logo !== "/logo.png") {
        hiddenInput.value = client.logo;
      }
    } else {
      // Reset form for new client
      setFormData({
        name: "",
        logo: "/logo.png",
        order: 1,
        status: "Active" as "Active" | "Inactive",
      });
      setPreview("");
      setSelectedFile(null);
      const hiddenInput = document.getElementById("logo-hidden") as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = "";
      }
    }
  }, [client]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setFormData({ ...formData, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (base64: string): Promise<string> => {
    const res = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, folder: 'clients/logos' }),
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.data.url;
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview("");
    setFormData({ ...formData, logo: "/logo.png" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that logo is provided
    if (!formData.logo || formData.logo === "/logo.png" || formData.logo.trim() === "") {
      toast.error("Please upload a logo or enter a logo URL");
      return;
    }
    let logoUrl = formData.logo;
    if (formData.logo?.startsWith('data:image')) {
      try {
        logoUrl = await uploadImageToStorage(formData.logo);
      } catch {
        toast.error("Failed to upload logo, saving with base64");
      }
    }
    onSave({ ...formData, logo: logoUrl || formData.logo });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter client name (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo *</Label>
        {/* Hidden required input for HTML5 validation - gets value when logo is set */}
        <input
          id="logo-hidden"
          type="text"
          required
          value={formData.logo && formData.logo !== "/logo.png" ? formData.logo : ""}
          onChange={() => {}}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
        {preview && preview !== "/logo.png" ? (
          <div className="space-y-2">
            <div className="relative w-full h-32 rounded-md overflow-hidden border bg-muted">
              <Image
                src={preview}
                alt="Logo preview"
                fill
                className="object-contain p-2"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.getElementById("logo-upload") as HTMLInputElement;
                  input?.click();
                }}
              >
                Replace Logo
              </Button>
              <Input
                id="logo-url"
                value={formData.logo.startsWith("data:") ? "" : formData.logo}
                onChange={(e) => {
                  setFormData({ ...formData, logo: e.target.value });
                  setPreview(e.target.value);
                }}
                placeholder="Or enter logo URL"
                className="flex-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap items-center">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer flex-1 min-w-[140px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMediaSelectorOpen(true)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Media Library</span>
              </Button>
              <span className="text-xs text-muted-foreground whitespace-nowrap">OR</span>
              <Input
                id="logo-url"
                value={formData.logo}
                onChange={(e) => {
                  const newLogo = e.target.value;
                  setFormData({ ...formData, logo: newLogo });
                  setPreview(newLogo);
                  // Update hidden input for HTML5 validation
                  const hiddenInput = document.getElementById("logo-hidden") as HTMLInputElement;
                  if (hiddenInput) {
                    hiddenInput.value = newLogo;
                  }
                }}
                placeholder="Enter logo URL"
                className="flex-1 min-w-[200px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a logo image (Max 5MB), select from media library, or enter a logo URL
            </p>
          </div>
        )}
        <MediaSelector
          open={isMediaSelectorOpen}
          onOpenChange={setIsMediaSelectorOpen}
          onSelect={(url) => {
            setFormData({ ...formData, logo: url });
            setPreview(url);
            setSelectedFile(null);
            // Update hidden input for HTML5 validation
            const hiddenInput = document.getElementById("logo-hidden") as HTMLInputElement;
            if (hiddenInput) {
              hiddenInput.value = url;
            }
          }}
          type="image"
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
        <Button type="submit">Save Client</Button>
      </div>
    </form>
  );
}


