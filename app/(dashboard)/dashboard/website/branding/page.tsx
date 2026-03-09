"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandingSettings, NavLink, NavSubLink } from "@/lib/data-store";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { MediaSelector } from "@/components/media-selector";

function generateNavLink(): NavLink {
  const timestamp = Date.now();
  return {
    id: timestamp,
    label: "New Link",
    href: "/",
    order: timestamp,
    visible: true,
    children: [],
  };
}

function generateNavSubLink(): NavSubLink {
  const timestamp = Date.now();
  return {
    id: timestamp,
    label: "New Sub Link",
    href: "/",
    order: timestamp,
    visible: true,
  };
}

function base64FromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isHeaderLogoMediaOpen, setIsHeaderLogoMediaOpen] = useState(false);
  const [isDashboardLogoMediaOpen, setIsDashboardLogoMediaOpen] = useState(false);
  const [isFaviconMediaOpen, setIsFaviconMediaOpen] = useState(false);

  useEffect(() => {
    // Fetch branding settings from API
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/branding');
        const data = await response.json();
        if (data.success && data.data) {
          setSettings(data.data as BrandingSettings);
        } else {
          // Set default settings if API fails
          setSettings({
            headerLogo: "",
            dashboardLogo: "",
            favicon: "",
            navLinks: [],
          });
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
        // Set default settings on error
        setSettings({
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBranding();
  }, []);

  const sortedNavLinks = useMemo(
    () => {
      if (!settings) return [];
      return [...settings.navLinks]
        .sort((a, b) => {
          if (a.order === b.order) return a.label.localeCompare(b.label);
          return a.order - b.order;
        })
        .map((link) => ({
          ...link,
          children: (link.children ?? []).sort((a, b) => {
            if (a.order === b.order) return a.label.localeCompare(b.label);
            return a.order - b.order;
          }),
        }));
    },
    [settings?.navLinks]
  );

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "headerLogo" | "dashboardLogo" | "favicon"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 2MB.");
      return;
    }

    const base64 = await base64FromFile(file);
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
          [key]: base64,
        } as BrandingSettings;
      }
      return {
        ...prev,
        [key]: base64,
      };
    });
  };

  const handleRemoveLogo = (key: "headerLogo" | "dashboardLogo" | "favicon") => {
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
          [key]: "",
        } as BrandingSettings;
      }
      return {
        ...prev,
        [key]: "",
      };
    });
  };

  const handleNavLinkChange = (
    id: number,
    field: keyof NavLink,
    value: string | number | boolean | NavSubLink[]
  ) => {
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
        } as BrandingSettings;
      }
      return {
        ...prev,
        navLinks: prev.navLinks.map((link) =>
          link.id === id ? { ...link, [field]: value } : link
        ),
      };
    });
  };

  const handleAddNavLink = () => {
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [generateNavLink()],
        } as BrandingSettings;
      }
      return {
        ...prev,
        navLinks: [...prev.navLinks, generateNavLink()],
      };
    });
  };

  const handleRemoveNavLink = (id: number) => {
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
        } as BrandingSettings;
      }
      return {
        ...prev,
        navLinks: prev.navLinks.filter((link) => link.id !== id),
      };
    });
  };

  const handleAddNavChild = (parentId: number) => {
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
        } as BrandingSettings;
      }
      return {
        ...prev,
        navLinks: prev.navLinks.map((link) =>
          link.id === parentId
            ? { ...link, children: [...(link.children ?? []), generateNavSubLink()] }
            : link
        ),
      };
    });
  };

  const handleNavChildChange = (
    parentId: number,
    childId: number,
    field: keyof NavSubLink,
    value: string | number | boolean
  ) => {
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
        } as BrandingSettings;
      }
      return {
        ...prev,
        navLinks: prev.navLinks.map((link) =>
          link.id === parentId
            ? {
                ...link,
                children: (link.children ?? []).map((child) =>
                  child.id === childId ? { ...child, [field]: value } : child
                ),
              }
            : link
        ),
      };
    });
  };

  const handleRemoveNavChild = (parentId: number, childId: number) => {
    setSettings((prev) => {
      if (!prev) {
        return {
          headerLogo: "",
          dashboardLogo: "",
          favicon: "",
          navLinks: [],
        } as BrandingSettings;
      }
      return {
        ...prev,
        navLinks: prev.navLinks.map((link) =>
          link.id === parentId
            ? {
                ...link,
                children: (link.children ?? []).filter((child) => child.id !== childId),
              }
            : link
        ),
      };
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Branding settings updated successfully");
      } else {
        toast.error(data.error || "Failed to update branding settings");
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error("Failed to save branding settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch('/api/branding');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data as BrandingSettings);
        toast.success("Branding settings reloaded");
      } else {
        toast.error("Failed to reload branding settings");
      }
    } catch (error) {
      console.error('Error reloading branding:', error);
      toast.error("Failed to reload branding settings");
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="p-8">
        <div className="text-center py-16">Loading branding settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Branding Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage logos, fonts, and navigation links for the client site and dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Header Logo</CardTitle>
            <CardDescription>
              Upload a logo for the public-facing header (recommended 240x80px PNG with transparent background).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-48 border border-dashed rounded-md bg-muted/40 flex items-center justify-center">
                {settings.headerLogo ? (
                  <Image
                    src={settings.headerLogo}
                    alt="Header Logo Preview"
                    fill
                    className="object-contain p-2"
                    unoptimized={settings.headerLogo.startsWith("data:")}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No logo selected</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="header-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleLogoChange(event, "headerLogo")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsHeaderLogoMediaOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Media</span>
                  </Button>
                  <span className="text-xs text-muted-foreground self-center">OR</span>
                  <Input
                    id="header-logo-url"
                    type="url"
                    placeholder="Enter logo URL"
                    value={settings.headerLogo && !settings.headerLogo.startsWith("data:") ? settings.headerLogo : ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      setSettings((prev) => {
                        if (!prev) {
                          return {
                            headerLogo: url,
                            dashboardLogo: "",
                            favicon: "",
                            navLinks: [],
                          } as BrandingSettings;
                        }
                        return {
                          ...prev,
                          headerLogo: url,
                        } as BrandingSettings;
                      });
                    }}
                    className="flex-1"
                  />
                </div>
                {settings.headerLogo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLogo("headerLogo")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Logo</CardTitle>
            <CardDescription>
              Upload a logo for the admin dashboard sidebar (recommended 200x60px PNG).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-48 border border-dashed rounded-md bg-muted/40 flex items-center justify-center">
                {settings.dashboardLogo ? (
                  <Image
                    src={settings.dashboardLogo}
                    alt="Dashboard Logo Preview"
                    fill
                    className="object-contain p-2"
                    unoptimized={settings.dashboardLogo.startsWith("data:")}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No logo selected</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="dashboard-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleLogoChange(event, "dashboardLogo")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDashboardLogoMediaOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Media</span>
                  </Button>
                  <span className="text-xs text-muted-foreground self-center">OR</span>
                  <Input
                    id="dashboard-logo-url"
                    type="url"
                    placeholder="Enter logo URL"
                    value={settings.dashboardLogo && !settings.dashboardLogo.startsWith("data:") ? settings.dashboardLogo : ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      setSettings((prev) => {
                        if (!prev) {
                          return {
                            headerLogo: "",
                            dashboardLogo: url,
                            favicon: "",
                            navLinks: [],
                          } as BrandingSettings;
                        }
                        return {
                          ...prev,
                          dashboardLogo: url,
                        } as BrandingSettings;
                      });
                    }}
                    className="flex-1"
                  />
                </div>
                {settings.dashboardLogo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLogo("dashboardLogo")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favicon</CardTitle>
            <CardDescription>
              Upload a favicon for the website (recommended 32x32px or 16x16px ICO, PNG, or SVG format).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 border border-dashed rounded-md bg-muted/40 flex items-center justify-center">
                {settings.favicon ? (
                  <Image
                    src={settings.favicon}
                    alt="Favicon Preview"
                    width={32}
                    height={32}
                    className="object-contain"
                    unoptimized={settings.favicon.startsWith("data:")}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No favicon</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="favicon-upload"
                    type="file"
                    accept="image/x-icon,image/png,image/svg+xml,.ico,.png,.svg"
                    onChange={(event) => handleLogoChange(event, "favicon")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFaviconMediaOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Media</span>
                  </Button>
                  <span className="text-xs text-muted-foreground self-center">OR</span>
                  <Input
                    id="favicon-url"
                    type="url"
                    placeholder="Enter favicon URL"
                    value={settings.favicon && !settings.favicon.startsWith("data:") ? settings.favicon : ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      setSettings((prev) => {
                        if (!prev) {
                          return {
                            headerLogo: "",
                            dashboardLogo: "",
                            favicon: url,
                            navLinks: [],
                          } as BrandingSettings;
                        }
                        return {
                          ...prev,
                          favicon: url,
                        } as BrandingSettings;
                      });
                    }}
                    className="flex-1"
                  />
                </div>
                {settings.favicon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLogo("favicon")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The favicon appears in browser tabs and bookmarks. Supported formats: ICO, PNG, SVG.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Links</CardTitle>
          <CardDescription>
            Control the links and sub links displayed in the main header navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {sortedNavLinks.map((link) => (
              <div key={link.id} className="rounded-md border p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`visible-${link.id}`}
                      checked={link.visible}
                      onCheckedChange={(checked) =>
                        handleNavLinkChange(link.id, "visible", Boolean(checked))
                      }
                    />
                    <Label htmlFor={`visible-${link.id}`} className="font-medium">
                      {link.label}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`order-${link.id}`}
                      className="text-xs uppercase tracking-wide text-muted-foreground"
                    >
                      Order
                    </Label>
                    <Input
                      id={`order-${link.id}`}
                      type="number"
                      value={link.order}
                      onChange={(event) =>
                        handleNavLinkChange(link.id, "order", Number(event.target.value))
                      }
                      className="w-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`label-${link.id}`}>Label</Label>
                    <Input
                      id={`label-${link.id}`}
                      value={link.label}
                      onChange={(event) =>
                        handleNavLinkChange(link.id, "label", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`href-${link.id}`}>Link</Label>
                    <Input
                      id={`href-${link.id}`}
                      value={link.href}
                      onChange={(event) =>
                        handleNavLinkChange(link.id, "href", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-md bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Sub Links</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNavChild(link.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub Link
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(link.children ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No sub links. Add one to create a dropdown menu.
                      </p>
                    ) : (
                      (link.children ?? []).map((child) => (
                        <div key={child.id} className="rounded-md border bg-background p-3 space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`child-visible-${child.id}`}
                                checked={child.visible}
                                onCheckedChange={(checked) =>
                                  handleNavChildChange(link.id, child.id, "visible", Boolean(checked))
                                }
                              />
                              <Label htmlFor={`child-visible-${child.id}`} className="text-sm">
                                {child.label}
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={`child-order-${child.id}`}
                                className="text-xs uppercase tracking-wide text-muted-foreground"
                              >
                                Order
                              </Label>
                              <Input
                                id={`child-order-${child.id}`}
                                type="number"
                                className="w-20"
                                value={child.order}
                                onChange={(event) =>
                                  handleNavChildChange(link.id, child.id, "order", Number(event.target.value))
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`child-label-${child.id}`}>Label</Label>
                              <Input
                                id={`child-label-${child.id}`}
                                value={child.label}
                                onChange={(event) =>
                                  handleNavChildChange(link.id, child.id, "label", event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`child-href-${child.id}`}>Link</Label>
                              <Input
                                id={`child-href-${child.id}`}
                                value={child.href}
                                onChange={(event) =>
                                  handleNavChildChange(link.id, child.id, "href", event.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveNavChild(link.id, child.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Sub Link
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNavLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Link
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={handleAddNavLink}>
            <Plus className="h-4 w-4 mr-2" />
            Add Navigation Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
