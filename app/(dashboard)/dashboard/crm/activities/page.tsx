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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, Mail, MessageSquare, User, Loader2, RefreshCw, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
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

interface Activity {
  _id: string;
  type: string;
  lead: any;
  leadName?: string;
  agent?: any;
  agentName?: string;
  description: string;
  date: string;
  status: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface TeamMember {
  _id: string;
  name: string;
  role?: string;
}

const activityIcons = {
  Call: Phone,
  Email: Mail,
  WhatsApp: MessageSquare,
  Meeting: User,
  Note: User,
  Other: User,
};

export default function ActivityLogsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivities = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/activities?limit=1000");
      const data = await response.json();

      if (data.success && data.data?.activities) {
        setActivities(data.data.activities);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchLeadsAndTeam = async () => {
    try {
      const [leadsResponse, teamResponse] = await Promise.all([
        fetch("/api/leads?limit=1000"),
        fetch("/api/people/team"),
      ]);

      const leadsData = await leadsResponse.json();
      const teamData = await teamResponse.json();

      if (leadsData.success && leadsData.data?.leads) {
        setLeads(leadsData.data.leads);
      }
      if (teamData.success && Array.isArray(teamData.data)) {
        setTeamMembers(teamData.data);
      }
    } catch (error) {
      console.error("Error fetching leads/team:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchLeadsAndTeam();
  }, []);

  const filteredActivities = activities.filter(
    (activity) =>
      (activity.leadName || (activity.lead && typeof activity.lead === "object" ? activity.lead.name : "") || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.agentName || (activity.agent && typeof activity.agent === "object" ? activity.agent.name : "") || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
        <h1 className="text-lg font-bold">Activity Logs</h1>
          <p className="text-xs text-muted-foreground">View and log all CRM activities</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivities}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log New Activity</DialogTitle>
                <DialogDescription>
                  Record a call, email, WhatsApp message, meeting, or other activity
                </DialogDescription>
              </DialogHeader>
              <ActivityForm
                leads={leads}
                teamMembers={teamMembers}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchActivities();
                }}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
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
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${filteredActivities.length} activities found`}
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
                <TableHead>Type</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No activities found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => {
                  const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || User;
                    const leadName = activity.leadName || (activity.lead && typeof activity.lead === "object" ? activity.lead.name : "") || "N/A";
                    const agentName = activity.agentName || (activity.agent && typeof activity.agent === "object" ? activity.agent.name : "") || "N/A";
                    const activityDate = activity.date ? format(new Date(activity.date), "MMM dd, yyyy h:mm a") : "N/A";
                    
                  return (
                      <TableRow key={activity._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{activity.type}</span>
                        </div>
                      </TableCell>
                        <TableCell className="font-medium">{leadName}</TableCell>
                        <TableCell>{agentName}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                        <TableCell>{activityDate}</TableCell>
                      <TableCell>
                        <Badge variant="default">{activity.status}</Badge>
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

function ActivityForm({
  leads,
  teamMembers,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  leads: Lead[];
  teamMembers: TeamMember[];
  onSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    type: "",
    lead: "",
    agent: "none",
    description: "",
    date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    status: "Completed",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.lead || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedLead = leads.find((l) => l._id === formData.lead);
      const selectedAgent = formData.agent !== "none" ? teamMembers.find((tm) => tm._id === formData.agent) : undefined;

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          lead: formData.lead,
          leadName: selectedLead?.name || "",
          agent: formData.agent !== "none" ? formData.agent : undefined,
          agentName: selectedAgent?.name || "",
          description: formData.description,
          date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
          status: formData.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Activity logged successfully");
        setFormData({
          type: "",
          lead: "",
          agent: "none",
          description: "",
          date: new Date().toISOString().slice(0, 16),
          status: "Completed",
        });
        onSuccess();
      } else {
        toast.error(data.error || "Failed to log activity");
      }
    } catch (error) {
      console.error("Error logging activity:", error);
      toast.error("Failed to log activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Activity Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Call">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call
                </div>
              </SelectItem>
              <SelectItem value="Email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </SelectItem>
              <SelectItem value="WhatsApp">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </div>
              </SelectItem>
              <SelectItem value="Meeting">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Meeting
                </div>
              </SelectItem>
              <SelectItem value="Note">Note</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead">Lead *</Label>
        <Select
          value={formData.lead}
          onValueChange={(value) => setFormData({ ...formData, lead: value })}
          required
        >
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

      <div className="space-y-2">
        <Label htmlFor="agent">Agent/Team Member (Optional)</Label>
        <Select
          value={formData.agent}
          onValueChange={(value) => setFormData({ ...formData, agent: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an agent (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member._id} value={member._id}>
                {member.name} {member.role ? `(${member.role})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date & Time *</Label>
        <Input
          id="date"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Enter activity description (e.g., 'Called to discuss property details', 'Sent property brochure via email', 'Scheduled property viewing')"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">
          Describe what happened during this activity
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            "Log Activity"
          )}
        </Button>
      </div>
    </form>
  );
}
