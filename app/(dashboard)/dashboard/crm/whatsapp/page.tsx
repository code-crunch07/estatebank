"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, TestTube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WhatsAppIntegrationPage() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handleSave = () => {
    toast.success("WhatsApp settings saved successfully!");
    setIsConnected(true);
  };

  const handleTest = () => {
    toast.success("Test message sent! Check your WhatsApp.");
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-lg font-bold">WhatsApp Integration</h1>
        <p className="text-xs text-muted-foreground">Configure WhatsApp integration</p>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>WhatsApp API Configuration</CardTitle>
                  <CardDescription>Connect your WhatsApp Business API</CardDescription>
                </div>
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key *</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter WhatsApp API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret *</Label>
                <Input
                  id="api-secret"
                  type="password"
                  placeholder="Enter WhatsApp API Secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Enter WhatsApp Business Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save & Connect
                </Button>
                <Button variant="outline" onClick={handleTest}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Settings</CardTitle>
              <CardDescription>Configure WhatsApp messaging settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-reply">Auto Reply Message</Label>
                <Input
                  id="auto-reply"
                  placeholder="Enter auto-reply message"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-hours">Business Hours Message</Label>
                <Input
                  id="business-hours"
                  placeholder="Enter message for outside business hours"
                />
              </div>

              <Button onClick={() => toast.success("Settings saved!")}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
