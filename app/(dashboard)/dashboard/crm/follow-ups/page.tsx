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
import { Plus, Calendar, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface FollowUp {
  _id: string;
  lead: any;
  leadName?: string;
  type: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  notes?: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [followUpsResponse, leadsResponse] = await Promise.all([
        fetch("/api/follow-ups"),
        fetch("/api/leads?limit=1000"),
      ]);

      const followUpsData = await followUpsResponse.json();
      const leadsData = await leadsResponse.json();

      if (followUpsData.success && Array.isArray(followUpsData.data)) {
        setFollowUps(followUpsData.data);
      }

      if (leadsData.success && leadsData.data?.leads) {
        setLeads(leadsData.data.leads);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (followUpId: string) => {
    try {
      const response = await fetch(`/api/follow-ups/${followUpId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          completedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Follow-up marked as completed");
        fetchData();
      } else {
        toast.error(data.error || "Failed to update follow-up");
      }
    } catch (error) {
      console.error("Error completing follow-up:", error);
      toast.error("Failed to update follow-up");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Follow-ups</h1>
          <p className="text-xs text-muted-foreground">Manage lead follow-ups</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Follow-up</DialogTitle>
              <DialogDescription>Schedule a follow-up for a lead</DialogDescription>
            </DialogHeader>
              <FollowUpForm
                leads={leads}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchData();
                }}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${followUps.length} follow-ups scheduled`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No follow-ups scheduled.
                  </TableCell>
                </TableRow>
              ) : (
                  followUps.map((followUp) => {
                    const leadName = followUp.leadName || (followUp.lead && typeof followUp.lead === "object" ? followUp.lead.name : "") || "N/A";
                    const scheduledDate = followUp.scheduledDate ? format(new Date(followUp.scheduledDate), "MMM dd, yyyy") : "N/A";
                    
                    return (
                      <TableRow key={followUp._id}>
                        <TableCell className="font-medium">{leadName}</TableCell>
                    <TableCell>{followUp.type}</TableCell>
                        <TableCell>{scheduledDate}</TableCell>
                    <TableCell>{followUp.scheduledTime}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          followUp.status === "Completed"
                            ? "default"
                            : followUp.status === "Pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {followUp.status}
                      </Badge>
                    </TableCell>
                        <TableCell className="max-w-xs truncate">{followUp.notes || "N/A"}</TableCell>
                    <TableCell className="text-right">
                          {followUp.status !== "Completed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleComplete(followUp._id)}
                              title="Mark as completed"
                            >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                          )}
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

function FollowUpForm({
  leads,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  leads: Lead[];
  onSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    lead: "",
    type: "",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead || !formData.type || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Follow-up scheduled successfully");
        setFormData({
          lead: "",
          type: "",
          scheduledDate: "",
          scheduledTime: "",
          notes: "",
        });
    onSuccess();
      } else {
        toast.error(data.error || "Failed to schedule follow-up");
      }
    } catch (error) {
      console.error("Error scheduling follow-up:", error);
      toast.error("Failed to schedule follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lead">Select Lead *</Label>
        <Select value={formData.lead} onValueChange={(value) => setFormData({ ...formData, lead: value })} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a lead" />
          </SelectTrigger>
          <SelectContent>
            {leads.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No leads available</div>
            ) : (
              leads.map((lead) => (
                <SelectItem key={lead._id} value={lead._id}>
                  {lead.name} ({lead.email})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Call">Call</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Visit">Visit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time *</Label>
        <Input
          id="time"
          type="time"
          value={formData.scheduledTime}
          onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule"
          )}
        </Button>
      </div>
    </form>
  );
}
