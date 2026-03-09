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
import { Eye, Mail, Phone, Search, RefreshCw, Download, Upload, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { convertToCSV, downloadCSV, readCSVFile } from "@/lib/csv-utils";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  property?: string;
  message?: string;
  status: "New" | "Contacted" | "Resolved";
  createdAt: string;
  updatedAt: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch enquiries from API
  const fetchEnquiries = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/enquiries');
      const data = await response.json();
      
      if (data.success && data.data?.enquiries) {
        setEnquiries(data.data.enquiries);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
      setEnquiries([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter(
    (enquiry) =>
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enquiry.property || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export enquiries to CSV
  const handleExport = () => {
    try {
      setIsExporting(true);
      const headers = ["name", "email", "phone", "property", "message", "status", "createdAt"];
      const csvData = enquiries.map((e) => ({
        name: e.name || "",
        email: e.email || "",
        phone: e.phone || "",
        property: e.property || "",
        message: e.message || "",
        status: e.status || "",
        createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : "",
      }));

      const csv = convertToCSV(csvData, headers);
      downloadCSV(csv, `enquiries-export-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Enquiries exported successfully");
    } catch (error) {
      console.error("Error exporting enquiries:", error);
      toast.error("Failed to export enquiries");
    } finally {
      setIsExporting(false);
    }
  };

  // Import enquiries from CSV
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

      // Map all rows to enquiry data array for bulk import
      const enquiriesData = rows.map((row) => ({
        name: row.name || "",
        email: row.email || "",
        phone: row.phone || "",
        property: row.property || "",
        message: row.message || "",
        status: row.status || "New",
      }));

      // Bulk import using array POST
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiriesData),
      });

      const data = await response.json();
      if (data.success) {
        const successCount = data.data?.successCount || 0;
        const failedCount = data.data?.failedCount || 0;
        toast.success(`Import completed: ${successCount} enquiries imported, ${failedCount} failed`);
        fetchEnquiries();
      } else {
        toast.error(data.error || "Failed to import enquiries");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing enquiries:", error);
      toast.error("Failed to import enquiries");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
        <h1 className="text-lg font-bold">Enquiries</h1>
        <p className="text-xs text-muted-foreground">Manage customer enquiries</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || enquiries.length === 0}
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
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search enquiries..."
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
              <CardTitle>All Enquiries</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${filteredEnquiries.length} enquiries found`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEnquiries}
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
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading enquiries...
                  </TableCell>
                </TableRow>
              ) : filteredEnquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No enquiries match your search." : "No enquiries found. Submit a form from the contact page to see enquiries here."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <TableRow key={enquiry._id}>
                    <TableCell className="font-medium">{enquiry.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{enquiry.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{enquiry.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{enquiry.property || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enquiry.status === "New"
                            ? "default"
                            : enquiry.status === "Contacted"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {enquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(enquiry.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedEnquiry(enquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enquiry Details</DialogTitle>
                            <DialogDescription>
                              {selectedEnquiry?.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedEnquiry && (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Contact Information:</p>
                                <p className="text-sm text-muted-foreground">Email: {selectedEnquiry.email}</p>
                                <p className="text-sm text-muted-foreground">Phone: {selectedEnquiry.phone}</p>
                              </div>
                              {selectedEnquiry.property && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Property:</p>
                                  <p className="text-sm text-muted-foreground">{selectedEnquiry.property}</p>
                                </div>
                              )}
                              {selectedEnquiry.message && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Message:</p>
                                  <p className="text-sm text-muted-foreground">{selectedEnquiry.message}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium mb-1">Status:</p>
                                <Badge variant={selectedEnquiry.status === "New" ? "default" : selectedEnquiry.status === "Contacted" ? "secondary" : "outline"}>
                                  {selectedEnquiry.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Submitted:</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(selectedEnquiry.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
