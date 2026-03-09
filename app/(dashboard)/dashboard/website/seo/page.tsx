"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SEOSettings {
  _id?: string;
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
  twitterImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  robotsTxt?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
}

export default function SEOSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SEOSettings & { keywordsInput?: string }>({
    siteTitle: "EstateBANK.in - Real Estate • Investments • Trust",
    siteDescription: "Find your dream property in Powai, Mumbai. Premium apartments, villas, and flats in prime locations.",
    keywords: [],
    keywordsInput: "",
    twitterCard: "summary_large_image",
    robotsTxt: "User-agent: *\nAllow: /",
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/seo');
      const data = await response.json();
      if (data.success && data.data) {
        setFormData({
          siteTitle: data.data.siteTitle || "",
          siteDescription: data.data.siteDescription || "",
          keywords: data.data.keywords || [],
          ogImage: data.data.ogImage || "",
          ogTitle: data.data.ogTitle || "",
          ogDescription: data.data.ogDescription || "",
          twitterCard: data.data.twitterCard || "summary_large_image",
          twitterImage: data.data.twitterImage || "",
          twitterTitle: data.data.twitterTitle || "",
          twitterDescription: data.data.twitterDescription || "",
          robotsTxt: data.data.robotsTxt || "User-agent: *\nAllow: /",
          googleAnalyticsId: data.data.googleAnalyticsId || "",
          googleTagManagerId: data.data.googleTagManagerId || "",
          facebookPixelId: data.data.facebookPixelId || "",
        });
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      toast.error('Failed to load SEO settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert keywordsInput (string) to keywords array
      const keywordsArray = (formData.keywordsInput || "")
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        keywords: keywordsArray,
        keywordsInput: undefined, // Remove from payload
      };

      const response = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("SEO settings saved successfully!");
      } else {
        toast.error(data.error || "Failed to save SEO settings");
      }
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast.error("Failed to save SEO settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-muted-foreground">Loading SEO settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">SEO Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global SEO settings for your website</p>
        </div>
        <Button variant="outline" onClick={fetchSEOSettings}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>Manage SEO meta tags and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-title">Site Title *</Label>
            <Input
              id="site-title"
              placeholder="Enter site title"
              value={formData.siteTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, siteTitle: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description *</Label>
            <Textarea
              id="site-description"
              placeholder="Enter site description"
              rows={3}
              value={formData.siteDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-keywords">Meta Keywords</Label>
            <Input
              id="meta-keywords"
              placeholder="real estate, apartments, powai, mumbai"
              value={formData.keywordsInput || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, keywordsInput: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-semibold">Open Graph Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="og-image">Open Graph Image URL</Label>
              <Input
                id="og-image"
                type="url"
                placeholder="https://example.com/og-image.jpg"
                value={formData.ogImage || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Image for social media sharing (1200x630px recommended)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="og-title">Open Graph Title</Label>
              <Input
                id="og-title"
                placeholder="Custom title for social sharing"
                value={formData.ogTitle || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="og-description">Open Graph Description</Label>
              <Textarea
                id="og-description"
                rows={2}
                placeholder="Custom description for social sharing"
                value={formData.ogDescription || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-semibold">Twitter Card Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="twitter-card">Twitter Card Type</Label>
              <Select 
                value={formData.twitterCard || "summary_large_image"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, twitterCard: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter-image">Twitter Image URL</Label>
              <Input
                id="twitter-image"
                type="url"
                placeholder="https://example.com/twitter-image.jpg"
                value={formData.twitterImage || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterImage: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter-title">Twitter Title</Label>
              <Input
                id="twitter-title"
                placeholder="Custom title for Twitter"
                value={formData.twitterTitle || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter-description">Twitter Description</Label>
              <Textarea
                id="twitter-description"
                rows={2}
                placeholder="Custom description for Twitter"
                value={formData.twitterDescription || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterDescription: e.target.value }))}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-semibold">Analytics & Tracking</h3>
            <div className="space-y-2">
              <Label htmlFor="google-analytics">Google Analytics ID</Label>
              <Input
                id="google-analytics"
                placeholder="G-XXXXXXXXXX"
                value={formData.googleAnalyticsId || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google-tag-manager">Google Tag Manager ID</Label>
              <Input
                id="google-tag-manager"
                placeholder="GTM-XXXXXXX"
                value={formData.googleTagManagerId || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, googleTagManagerId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
              <Input
                id="facebook-pixel"
                placeholder="123456789012345"
                value={formData.facebookPixelId || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, facebookPixelId: e.target.value }))}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-2">
            <Label htmlFor="robots-txt">Robots.txt</Label>
            <Textarea
              id="robots-txt"
              rows={4}
              placeholder="User-agent: *&#10;Allow: /"
              value={formData.robotsTxt || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, robotsTxt: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Configure search engine crawling rules</p>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save SEO Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
