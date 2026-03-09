"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, CheckCircle2, XCircle, Clock, Phone, Mail, MapPin, Home, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface PropertySubmissionApi {
  _id: string;
  name: string;
  email: string;
  phone: string;
  iAm: string;
  iWantTo: string;
  propertyType: string;
  propertySubType: string;
  bedrooms: string;
  bathrooms: string;
  expectedPrice?: string;
  saleableArea?: string;
  rent?: string;
  deposit?: string;
  buildingName?: string;
  message?: string;
  images?: string[];
  status: "Pending" | "Reviewed" | "Approved" | "Rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export default function PropertySubmissionsPage() {
  const [submissions, setSubmissions] = useState<PropertySubmissionApi[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<PropertySubmissionApi | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    loadSubmissions();
    
    // Refresh periodically
    const interval = setInterval(loadSubmissions, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadSubmissions = async () => {
    try {
      // Fetch enquiries with property submission details
      const response = await fetch('/api/enquiries');
      const data = await response.json();
      if (data.success && data.data) {
        // Handle both direct array and paginated response
        const enquiriesData = data.data.enquiries || data.data;
        const allSubmissions = Array.isArray(enquiriesData) ? enquiriesData : [];
        // Filter to only show property submissions (those with property submission fields)
        const propertySubmissions = allSubmissions.filter((e: any) => 
          e.iWantTo || e.propertyType || e.bedrooms || e.buildingName
        );
        // Map to submission format
        const mappedSubmissions = propertySubmissions.map((e: any) => ({
          _id: e._id || e.id,
          name: e.name || '',
          email: e.email || '',
          phone: e.phone || '',
          iAm: e.iAm || 'owner',
          iWantTo: e.iWantTo || '',
          propertyType: e.propertyType || '',
          propertySubType: e.propertySubType || '',
          bedrooms: e.bedrooms || '',
          bathrooms: e.bathrooms || '',
          expectedPrice: e.expectedPrice,
          saleableArea: e.saleableArea,
          rent: e.rent,
          deposit: e.deposit,
          buildingName: e.buildingName,
          message: e.message || '',
          images: e.images || [],
          status: e.status === 'Pending' ? 'Pending' : (e.status === 'New' ? 'Pending' : (e.status || 'Pending')),
          createdAt: e.createdAt || new Date().toISOString(),
          reviewedAt: e.reviewedAt,
          reviewedBy: e.reviewedBy,
          notes: e.notes || '',
        }));
        setSubmissions(mappedSubmissions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissions([]);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesSearch =
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.phone.includes(searchTerm) ||
        submission.propertyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.buildingName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  const handleStatusChange = async (id: string, status: PropertySubmissionApi["status"]) => {
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          reviewedAt: new Date().toISOString(),
          notes: reviewNotes || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Submission ${status.toLowerCase()} successfully`);
        loadSubmissions();
        setIsDialogOpen(false);
        setSelectedSubmission(null);
        setReviewNotes("");
      } else {
        toast.error(data.error || "Failed to update submission");
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error("Failed to update submission");
    }
  };

  const handleViewDetails = (submission: PropertySubmissionApi) => {
    setSelectedSubmission(submission);
    setReviewNotes(submission.notes || "");
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: PropertySubmissionApi["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Pending: "secondary",
      Reviewed: "default",
      Approved: "default",
      Rejected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Property Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage property submissions from the public form
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, property type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
          <CardDescription>
            All property submissions from the public form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission: PropertySubmissionApi) => (
                    <TableRow key={submission._id || (submission as any).id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {submission.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {submission.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{submission.propertyType}</div>
                          <div className="text-xs text-muted-foreground">
                            {submission.propertySubType} • {submission.bedrooms} BHK • {submission.bathrooms} Bath
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          ₹{submission.expectedPrice ? parseInt(submission.expectedPrice).toLocaleString() : '0'}
                        </div>
                      </TableCell>
                      <TableCell>{submission.saleableArea || 'N/A'} sq. ft.</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(submission)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Submission Details</DialogTitle>
            <DialogDescription>
              Review and manage this property submission
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{selectedSubmission.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedSubmission.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedSubmission.phone}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">I Am</Label>
                      <p className="font-medium capitalize">{selectedSubmission.iAm}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">I Want To</Label>
                      <p className="font-medium capitalize">{selectedSubmission.iWantTo}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Property Type</Label>
                      <p className="font-medium">{selectedSubmission.propertyType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Sub Type</Label>
                      <p className="font-medium">{selectedSubmission.propertySubType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bedrooms</Label>
                      <p className="font-medium">{selectedSubmission.bedrooms}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bathrooms</Label>
                      <p className="font-medium">{selectedSubmission.bathrooms}</p>
                    </div>
                    {selectedSubmission.iWantTo === "sale" ? (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground">Price</Label>
                          <p className="font-medium">
                            {selectedSubmission.expectedPrice 
                              ? `₹${parseInt(selectedSubmission.expectedPrice).toLocaleString()}`
                              : "N/A"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Carpet Area</Label>
                          <p className="font-medium">
                            {selectedSubmission.saleableArea 
                              ? `${selectedSubmission.saleableArea} sq. ft.`
                              : "N/A"
                            }
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground">Rent</Label>
                          <p className="font-medium">
                            {selectedSubmission.rent 
                              ? `₹${parseInt(selectedSubmission.rent).toLocaleString()}/month`
                              : "N/A"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Deposit</Label>
                          <p className="font-medium">
                            {selectedSubmission.deposit 
                              ? `₹${parseInt(selectedSubmission.deposit).toLocaleString()}`
                              : "N/A"
                            }
                          </p>
                        </div>
                      </>
                    )}
                    {selectedSubmission.buildingName && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Building Name</Label>
                        <p className="font-medium">{selectedSubmission.buildingName}</p>
                      </div>
                    )}
                  </div>
                  {selectedSubmission.message && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Message</Label>
                      <p className="text-sm mt-1">{selectedSubmission.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Images */}
              {selectedSubmission.images && selectedSubmission.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedSubmission.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                          <Image
                            src={img}
                            alt={`Property image ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                    onClick={() => handleStatusChange(selectedSubmission._id, "Rejected")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedSubmission._id, "Reviewed")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Reviewed
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedSubmission._id, "Approved")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
