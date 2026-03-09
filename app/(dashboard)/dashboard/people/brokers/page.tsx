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
import { Plus, Edit, Phone, Mail, Search, Calendar, Upload, Trash2, RefreshCw, Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { MediaSelector } from "@/components/media-selector";
import { useState, useMemo, useEffect, useRef } from "react";
import { Pagination } from "@/components/ui/pagination";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { convertToCSV, downloadCSV, readCSVFile } from "@/lib/csv-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Broker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  commission?: string;
  status: "Active" | "Inactive";
  properties?: number;
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState<Broker | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch brokers from API
  const fetchBrokers = async () => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/people/brokers?${params}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setBrokers(Array.isArray(data.data) ? data.data : []);
      } else {
        setBrokers([]);
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
      toast.error('Failed to load brokers');
      setBrokers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrokers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker);
    setIsDialogOpen(true);
  };

  const handleDelete = (broker: Broker) => {
    setBrokerToDelete(broker);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!brokerToDelete) return;

    try {
      const response = await fetch(`/api/people/brokers/${brokerToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Broker deleted successfully");
        setDeleteDialogOpen(false);
        setBrokerToDelete(null);
        fetchBrokers();
      } else {
        toast.error(data.message || "Failed to delete broker");
      }
    } catch (error) {
      console.error('Error deleting broker:', error);
      toast.error("Failed to delete broker");
    }
  };

  // Export brokers to CSV
  const handleExport = () => {
    try {
      setIsExporting(true);
      const headers = ["name", "email", "phone", "commission", "status", "properties"];
      const csvData = brokers.map((b) => ({
        name: b.name || "",
        email: b.email || "",
        phone: b.phone || "",
        commission: b.commission || "",
        status: b.status || "",
        properties: b.properties?.toString() || "0",
      }));

      const csv = convertToCSV(csvData, headers);
      downloadCSV(csv, `brokers-export-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Brokers exported successfully");
    } catch (error) {
      console.error("Error exporting brokers:", error);
      toast.error("Failed to export brokers");
    } finally {
      setIsExporting(false);
    }
  };

  // Import brokers from CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const { rows } = await readCSVFile(file);
      
      if (rows.length === 0) {
        toast.error("CSV file is empty");
        return;
      }

      // Map all rows to broker data array for bulk import
      const brokersData = rows.map((row) => ({
        name: row.name || "",
        email: row.email || "",
        phone: row.phone || "",
        commission: row.commission || "2%",
        status: row.status || "Active",
        properties: row.properties ? parseInt(row.properties) : 0,
      }));

      // Bulk import using array POST
      const response = await fetch("/api/people/brokers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brokersData),
      });

      const data = await response.json();
      if (data.success) {
        const successCount = data.data?.successCount || 0;
        const failedCount = data.data?.failedCount || 0;
        toast.success(`Import completed: ${successCount} brokers imported, ${failedCount} failed`);
        fetchBrokers();
      } else {
        toast.error(data.error || "Failed to import brokers");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing brokers:", error);
      toast.error("Failed to import brokers");
    } finally {
      setIsImporting(false);
    }
  };


  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Brokers</h1>
          <p className="text-xs text-muted-foreground">Manage brokers</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || brokers.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingBroker(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBroker(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Broker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBroker ? "Edit Broker" : "Add Broker"}</DialogTitle>
              <DialogDescription>
                {editingBroker ? "Update broker information" : "Enter broker information"}
              </DialogDescription>
            </DialogHeader>
            <BrokerForm 
              broker={editingBroker}
              onSuccess={async (data) => {
                try {
                  if (editingBroker) {
                    // Update existing broker
                    const response = await fetch(`/api/people/brokers/${editingBroker._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();
                    if (result.success) {
                      toast.success("Broker updated successfully");
                      fetchBrokers();
                    } else {
                      toast.error(result.message || "Failed to update broker");
                      return;
                    }
                  } else {
                    // Create new broker
                    const response = await fetch('/api/people/brokers', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();
                    if (result.success) {
                      toast.success("Broker added successfully");
                      fetchBrokers();
                    } else {
                      toast.error(result.message || "Failed to add broker");
                      return;
                    }
                  }
                  setIsDialogOpen(false);
                  setEditingBroker(null);
                } catch (error) {
                  console.error('Error saving broker:', error);
                  toast.error("Failed to save broker");
                }
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingBroker(null);
              }}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brokers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Brokers</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${brokers.length} ${brokers.length === 1 ? 'broker' : 'brokers'} found`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBrokers}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading brokers...
                  </TableCell>
                </TableRow>
              ) : brokers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No brokers match your search." : "No brokers found. Add a new broker to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                brokers.map((broker) => (
                  <TableRow key={broker._id}>
                    <TableCell className="font-medium">{broker.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{broker.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{broker.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{broker.commission}</TableCell>
                    <TableCell>{broker.properties}</TableCell>
                    <TableCell>
                      <Badge variant={broker.status === "Active" ? "default" : "secondary"}>
                        {broker.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(broker)}
                          title="Edit broker"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(broker)}
                          title="Delete broker"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Broker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{brokerToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setBrokerToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BrokerForm({ 
  broker, 
  onSuccess,
  onCancel
}: { 
  broker?: Broker | null;
  onSuccess: (data: { name: string; email: string; phone: string; commission?: string }) => void;
  onCancel?: () => void;
}) {
  // Extract prefix, first name, and last name from broker name
  const extractNameParts = (fullName?: string) => {
    if (!fullName) return { prefix: "", firstName: "", lastName: "" };
    const prefixes = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
    const parts = fullName.split(" ");
    const possiblePrefix = parts[0];
    if (prefixes.includes(possiblePrefix)) {
      return {
        prefix: possiblePrefix,
        firstName: parts[1] || "",
        lastName: parts.slice(2).join(" ") || "",
      };
    }
    return {
      prefix: "",
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const nameParts = extractNameParts(broker?.name);
  const [formData, setFormData] = useState({
    prefix: nameParts.prefix,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    countryCode: broker?.phone?.match(/^\+\d+/)?.[0] || "+91",
    mobileNumber: broker?.phone?.replace(/^\+\d+\s?/, "") || "",
    alternativeMobileNumber: "",
    email: broker?.email || "",
    dateOfBirth: "",
    image: null as File | null,
    comments: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  const prefixes = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
  const countryCodes = ["+91", "+1", "+44", "+61", "+971", "+65", "+60"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.mobileNumber.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const fullName = formData.prefix 
      ? `${formData.prefix} ${formData.firstName} ${formData.lastName}`.trim()
      : `${formData.firstName} ${formData.lastName}`.trim();
    
    const fullPhone = formData.countryCode 
      ? `${formData.countryCode} ${formData.mobileNumber}`.trim()
      : formData.mobileNumber;

    onSuccess({
      name: fullName,
      email: formData.email,
      phone: fullPhone,
      commission: broker?.commission || "2%",
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-primary pb-2">
        <h2 className="text-lg font-bold">Add Broker</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Prefix, First Name, Last Name */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix</Label>
            <Select 
              value={formData.prefix} 
              onValueChange={(value) => setFormData({ ...formData, prefix: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {prefixes.map((prefix) => (
                  <SelectItem key={prefix} value={prefix}>
                    {prefix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input 
              id="firstName" 
              placeholder="First Name" 
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input 
              id="lastName" 
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required 
            />
          </div>
        </div>

        {/* Row 2: Country Code, Mobile Number, Alternative Mobile Number */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="countryCode">Country Code</Label>
            <Select 
              value={formData.countryCode} 
              onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input 
              id="mobileNumber" 
              placeholder="Mobile Number" 
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternativeMobileNumber">Alternative Mobile Number</Label>
            <Input 
              id="alternativeMobileNumber" 
              placeholder="Alternative Mobile Number" 
              value={formData.alternativeMobileNumber}
              onChange={(e) => setFormData({ ...formData, alternativeMobileNumber: e.target.value })}
            />
          </div>
        </div>

        {/* Row 3: Email, Date of Birth, Select Image */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth-broker">Date of Birth</Label>
            <div className="relative">
              <Input 
                id="dateOfBirth-broker" 
                type="text"
                placeholder="dd/mm/yyyy" 
                value={formData.dateOfBirth}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                  if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
                  setFormData({ ...formData, dateOfBirth: value });
                }}
                maxLength={10}
                className="pr-10"
              />
              <input
                type="date"
                id="dateOfBirth-broker-picker"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const parts = value.split('-');
                    if (parts.length === 3) {
                      const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
                      setFormData({ ...formData, dateOfBirth: formatted });
                    }
                  }
                }}
                style={{ pointerEvents: 'auto', zIndex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  const picker = document.getElementById('dateOfBirth-broker-picker') as HTMLInputElement | null;
                  if (picker) {
                    if ('showPicker' in picker && typeof (picker as any).showPicker === 'function') {
                      (picker as any).showPicker();
                    } else {
                      (picker as HTMLInputElement).click();
                    }
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10 pointer-events-none"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            {formData.dateOfBirth && formData.dateOfBirth.length === 10 && (
              <p className="text-xs text-muted-foreground">Selected: {formData.dateOfBirth}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <Input 
                id="image" 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('image')?.click()}
                className="whitespace-nowrap"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose file
              </Button>
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
                id="image-url"
                type="url"
                placeholder="Enter image URL"
                className="flex-1 min-w-[200px]"
                onChange={(e) => {
                  const url = e.target.value;
                  if (url) {
                    setImagePreview(url);
                    setFormData({ ...formData, image: null });
                  }
                }}
              />
            </div>
            {imagePreview && (
              <div className="relative w-12 h-12 rounded overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <MediaSelector
            open={isMediaSelectorOpen}
            onOpenChange={setIsMediaSelectorOpen}
            onSelect={(url: string) => {
              setImagePreview(url);
              setFormData({ ...formData, image: null });
            }}
            type="image"
          />
        </div>

        {/* Row 4: Comments */}
        <div className="space-y-2">
          <Label htmlFor="comments">Comments</Label>
          <Textarea 
            id="comments" 
            placeholder="Comments" 
            rows={4}
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
