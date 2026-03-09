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
import { UserCheck, Search, Loader2, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedTo?: any;
  assignedToName?: string;
  propertyInterest?: string;
}

interface Assignee {
  _id: string;
  name: string;
  role?: string;
}

export default function AssignLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch leads and assignees
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [leadsResponse, teamResponse, brokersResponse] = await Promise.all([
        fetch("/api/leads?limit=1000"),
        fetch("/api/people/team"),
        fetch("/api/people/brokers"),
      ]);

      const leadsData = await leadsResponse.json();
      const teamData = await teamResponse.json();
      const brokersData = await brokersResponse.json();

      if (leadsData.success && leadsData.data?.leads) {
        setLeads(leadsData.data.leads);
      }

      const allAssignees: Assignee[] = [];
      if (teamData.success && Array.isArray(teamData.data)) {
        allAssignees.push(...teamData.data.map((tm: any) => ({ _id: tm._id, name: tm.name, role: tm.role || "Agent" })));
      }
      if (brokersData.success && Array.isArray(brokersData.data)) {
        allAssignees.push(...brokersData.data.map((b: any) => ({ _id: b._id, name: b.name, role: "Broker" })));
      }
      setAssignees(allAssignees);
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

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };

  const handleAssignSubmit = async (assigneeId: string) => {
    if (!selectedLead) return;

    try {
      setIsAssigning(true);
      const assignee = assignees.find((a) => a._id === assigneeId);
      const response = await fetch(`/api/leads/${selectedLead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: assigneeId,
          assignedToName: assignee?.name || "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Lead assigned to ${assignee?.name} successfully!`);
    setIsDialogOpen(false);
        fetchData(); // Refresh leads
      } else {
        toast.error(data.error || "Failed to assign lead");
      }
    } catch (error) {
      console.error("Error assigning lead:", error);
      toast.error("Failed to assign lead");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
        <h1 className="text-lg font-bold">Assign Leads</h1>
        <p className="text-xs text-muted-foreground">Assign leads to team members or brokers</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads Assignment</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${filteredLeads.length} leads found`}
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
                <TableHead>Contact</TableHead>
                <TableHead>Property Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                    <TableRow key={lead._id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">{lead.email}</span>
                        <span className="text-xs">{lead.phone}</span>
                      </div>
                    </TableCell>
                      <TableCell>{lead.propertyInterest || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                        {lead.assignedToName || (lead.assignedTo && typeof lead.assignedTo === "object" && lead.assignedTo.name) ? (
                          <Badge variant="default">
                            {lead.assignedToName || (lead.assignedTo as any)?.name}
                          </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssign(lead)}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                          {lead.assignedToName || (lead.assignedTo && typeof lead.assignedTo === "object" && lead.assignedTo.name) ? "Reassign" : "Assign"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead</DialogTitle>
            <DialogDescription>
              Assign {selectedLead?.name} to a team member or broker
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <AssignForm
              lead={selectedLead}
              assignees={assignees}
              onAssign={handleAssignSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isAssigning={isAssigning}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignForm({
  lead,
  assignees,
  onAssign,
  onCancel,
  isAssigning,
}: {
  lead: Lead;
  assignees: Assignee[];
  onAssign: (assigneeId: string) => void;
  onCancel: () => void;
  isAssigning: boolean;
}) {
  const currentAssigneeId = lead.assignedTo?._id || (typeof lead.assignedTo === "string" ? lead.assignedTo : "");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(currentAssigneeId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssigneeId) {
      onAssign(selectedAssigneeId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assignee">Select Agent/Broker *</Label>
        <Select value={selectedAssigneeId} onValueChange={setSelectedAssigneeId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select agent or broker" />
          </SelectTrigger>
          <SelectContent>
            {assignees.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No agents or brokers available</div>
            ) : (
              assignees.map((assignee) => (
                <SelectItem key={assignee._id} value={assignee._id}>
                  {assignee.name} {assignee.role ? `(${assignee.role})` : ""}
              </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 bg-muted rounded-md">
        <p className="text-xs font-medium mb-1">Lead Information:</p>
        <p className="text-xs">Name: {lead.name}</p>
        <p className="text-xs">Interest: {lead.propertyInterest || "N/A"}</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isAssigning}>
          Cancel
        </Button>
        <Button type="submit" disabled={isAssigning || !selectedAssigneeId}>
          {isAssigning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign Lead"
          )}
        </Button>
      </div>
    </form>
  );
}
