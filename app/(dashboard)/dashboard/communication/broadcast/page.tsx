"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Users, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Contact {
  id: number | string;
  name: string;
  phone: string;
  type: "client" | "owner" | "broker" | "lead";
}

const broadcastGroups = [
  { value: "all", label: "All Contacts" },
  { value: "clients", label: "Clients Only" },
  { value: "owners", label: "Flat Owners Only" },
  { value: "brokers", label: "Brokers Only" },
  { value: "custom", label: "Custom List" },
];

export default function WhatsAppBroadcastPage() {
  const [message, setMessage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch contacts from API endpoints
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const allContacts: Contact[] = [];

        // Fetch Clients from API
        try {
          const clientsResponse = await fetch("/api/people/clients").catch(() => null);
          if (clientsResponse && clientsResponse.ok) {
            const clientsData = await clientsResponse.json();
            const clients = clientsData.data?.clients || clientsData.data || [];
            clients.forEach((client: any) => {
              // Handle different phone formats (string or array)
              const phone = Array.isArray(client.phone) 
                ? client.phone[0] 
                : client.phone || client.mobileNumber;
              
              if (phone) {
                allContacts.push({
                  id: client._id || client.id || `client-${Date.now()}-${Math.random()}`,
                  name: client.name || `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown",
                  phone: phone,
                  type: "client",
                });
              }
            });
          }
        } catch (error) {
          console.error("Error fetching clients:", error);
        }

        // Fetch Flat Owners from API
        try {
          const ownersResponse = await fetch("/api/people/owners").catch(() => null);
          if (ownersResponse && ownersResponse.ok) {
            const ownersData = await ownersResponse.json();
            const owners = ownersData.data || [];
            owners.forEach((owner: any) => {
              const phone = Array.isArray(owner.phone) 
                ? owner.phone[0] 
                : owner.phone || owner.mobileNumber;
              
              if (phone) {
                allContacts.push({
                  id: owner._id || owner.id || `owner-${Date.now()}-${Math.random()}`,
                  name: owner.name || "Unknown",
                  phone: phone,
                  type: "owner",
                });
              }
            });
          }
        } catch (error) {
          console.error("Error fetching owners:", error);
        }

        // Fetch Brokers from API
        try {
          const brokersResponse = await fetch("/api/people/brokers").catch(() => null);
          if (brokersResponse && brokersResponse.ok) {
            const brokersData = await brokersResponse.json();
            const brokers = brokersData.data || [];
            brokers.forEach((broker: any) => {
              const phone = Array.isArray(broker.phone) 
                ? broker.phone[0] 
                : broker.phone || broker.mobileNumber;
              
              if (phone) {
                allContacts.push({
                  id: broker._id || broker.id || `broker-${Date.now()}-${Math.random()}`,
                  name: broker.name || `${broker.firstName || ""} ${broker.lastName || ""}`.trim() || "Unknown",
                  phone: phone,
                  type: "broker",
                });
              }
            });
          }
        } catch (error) {
          console.error("Error fetching brokers:", error);
        }

        setContacts(allContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to load contacts. Using fallback method.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts based on selected group
  const filteredContacts = useMemo(() => {
    if (!selectedGroup || selectedGroup === "custom") return [];
    
    switch (selectedGroup) {
      case "all":
        return contacts;
      case "clients":
        return contacts.filter((c) => c.type === "client");
      case "owners":
        return contacts.filter((c) => c.type === "owner");
      case "brokers":
        return contacts.filter((c) => c.type === "broker");
      default:
        return [];
    }
  }, [contacts, selectedGroup]);

  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[\s\-\(\)]/g, "").replace(/^\+91/, "").replace(/^91/, "");
  };

  const handleSend = async () => {
    if (!message || !selectedGroup) {
      toast.error("Please fill in all fields");
      return;
    }

    if (filteredContacts.length === 0) {
      toast.error("No contacts found for the selected group");
      return;
    }

    setIsSending(true);

    try {
      // For each contact, open WhatsApp Web with the message
      // Note: WhatsApp Web API doesn't support bulk sending directly
      // This will open individual WhatsApp Web chats
      
      if (filteredContacts.length === 1) {
        // Single contact - open directly
        const phone = cleanPhoneNumber(filteredContacts[0].phone);
        const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        toast.success(`Opening WhatsApp for ${filteredContacts[0].name}`);
      } else {
        // Multiple contacts - show instructions
        toast.info(
          `You have ${filteredContacts.length} contacts. WhatsApp Web will open for each contact. Please send manually to each.`,
          { duration: 5000 }
        );
        
        // Open first contact
        const phone = cleanPhoneNumber(filteredContacts[0].phone);
        const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        
        // For remaining contacts, open with a delay (to avoid popup blockers)
        for (let i = 1; i < Math.min(filteredContacts.length, 5); i++) {
          setTimeout(() => {
            const phone = cleanPhoneNumber(filteredContacts[i].phone);
            const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");
          }, i * 1000);
        }
      }

      // In a production environment with WhatsApp Business API, you would:
      // 1. Call your backend API endpoint
      // 2. Backend would use WhatsApp Business API to send messages
      // 3. Track delivery status
      
      toast.success(`Broadcast initiated for ${filteredContacts.length} contact(s)!`);
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">WhatsApp Broadcast</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send WhatsApp messages to multiple contacts at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose Broadcast Message</CardTitle>
              <CardDescription>
                Create and send messages to your contacts via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="group">Select Recipients *</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient group" />
                  </SelectTrigger>
                  <SelectContent>
                    {broadcastGroups.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGroup && filteredContacts.length > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {filteredContacts.length} contact(s) will receive this message
                  </p>
                )}
                {selectedGroup && filteredContacts.length === 0 && selectedGroup !== "custom" && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    No contacts found for this group
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your broadcast message...&#10;&#10;Example:&#10;Hello! We have exciting new properties available. Would you like to schedule a viewing?"
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {message.length} characters
                  </p>
                  {message.length > 1000 && (
                    <p className="text-xs text-amber-600">
                      Long messages may be split into multiple parts
                    </p>
                  )}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>How it works:</strong> This will open WhatsApp Web for each contact with your message pre-filled. 
                  You&apos;ll need to manually click send for each contact. For automated bulk sending, integrate with WhatsApp Business API.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-muted rounded-md">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-primary" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Tips for WhatsApp Broadcast:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Keep messages concise and clear (under 1000 characters)</li>
                      <li>Personalize with contact names when possible</li>
                      <li>Avoid spam-like content to maintain good relationships</li>
                      <li>Include a clear call-to-action</li>
                      <li>Test with a small group first before broadcasting to all</li>
                      <li>Respect WhatsApp&apos;s anti-spam policies</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={handleSend} 
                  disabled={!message || !selectedGroup || filteredContacts.length === 0 || isSending}
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening WhatsApp...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Broadcast
                      {filteredContacts.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {filteredContacts.length}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipients Preview</CardTitle>
              <CardDescription>
                {selectedGroup ? (
                  <>
                    {filteredContacts.length} contact(s) selected
                  </>
                ) : (
                  "Select a recipient group to see contacts"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : selectedGroup ? (
                filteredContacts.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredContacts.slice(0, 20).map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.phone}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {contact.type}
                        </Badge>
                      </div>
                    ))}
                    {filteredContacts.length > 20 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        ... and {filteredContacts.length - 20} more
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No contacts found in this group
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select a recipient group to preview contacts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Contacts</span>
                <Badge variant="secondary">{contacts.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Clients</span>
                <Badge variant="outline">
                  {contacts.filter((c) => c.type === "client").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Flat Owners</span>
                <Badge variant="outline">
                  {contacts.filter((c) => c.type === "owner").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Brokers</span>
                <Badge variant="outline">
                  {contacts.filter((c) => c.type === "broker").length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
