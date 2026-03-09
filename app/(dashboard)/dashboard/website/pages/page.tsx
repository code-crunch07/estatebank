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
import { Plus, Edit, Eye, Search, Trash2, RefreshCw } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { RichTextEditor } from "@/components/rich-text-editor";

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: "Published" | "Draft";
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  featuredImage?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  const fetchPages = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/pages');
      const data = await response.json();
      if (data.success && data.data) {
        setPages(Array.isArray(data.data) ? data.data : []);
      } else {
        setPages([]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
      setPages([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    
    try {
      const response = await fetch(`/api/pages/${pageToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Page deleted successfully");
        fetchPages();
        setDeleteDialogOpen(false);
        setPageToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete page");
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error("Failed to delete page");
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchPages();
    setIsDialogOpen(false);
    setEditingPage(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground">Manage website pages (About, Contact, Privacy, etc.)</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPages}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingPage(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPage(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPage ? "Edit Page" : "Add New Page"}</DialogTitle>
                <DialogDescription>
                  {editingPage ? "Update page details" : "Create a new website page"}
                </DialogDescription>
              </DialogHeader>
              <PageForm page={editingPage} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Website Pages</CardTitle>
          <CardDescription>
            {filteredPages.length} {filteredPages.length === 1 ? 'page' : 'pages'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading pages...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => (
                    <TableRow key={page._id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant={page.status === "Published" ? "default" : "secondary"}>
                          {page.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            asChild
                            title="View Page"
                          >
                            <Link href={`/${page.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(page)}
                            title="Edit Page"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(page)}
                            title="Delete Page"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PageForm({ page, onSuccess }: { page: Page | null; onSuccess: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    content: page?.content || "",
    excerpt: page?.excerpt || "",
    status: page?.status || "Draft",
    metaTitle: page?.metaTitle || "",
    metaDescription: page?.metaDescription || "",
    metaKeywords: page?.metaKeywords?.join(", ") || "",
    featuredImage: page?.featuredImage || "",
    order: page?.order || 0,
  });

  // Update form data when page prop changes (for editing)
  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || "",
        slug: page.slug || "",
        content: page.content || "",
        excerpt: page.excerpt || "",
        status: page.status || "Draft",
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        metaKeywords: page.metaKeywords?.join(", ") || "",
        featuredImage: page.featuredImage || "",
        order: page.order || 0,
      });
    } else {
      // Reset form when creating new page
      setFormData({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        status: "Draft",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        featuredImage: "",
        order: 0,
      });
    }
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      };

      const url = page ? `/api/pages/${page._id}` : '/api/pages';
      const method = page ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(page ? "Page updated successfully" : "Page created successfully");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to save page");
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error("Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Page Title *</Label>
        <Input 
          id="title" 
          placeholder="Enter page title" 
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input 
          id="slug" 
          placeholder="about-us" 
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
          required 
        />
        <p className="text-xs text-muted-foreground">URL-friendly version (e.g., about-us, contact-us)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <RichTextEditor
          content={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          placeholder="Write your page content here..."
        />
        <p className="text-xs text-muted-foreground">
          Use the toolbar above to format your content. You can add headings, lists, links, images, and more.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          placeholder="Short summary of the page"
          rows={2}
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "Published" | "Draft" }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input 
            id="order" 
            type="number" 
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <h3 className="text-sm font-semibold">SEO Settings</h3>
          <p className="text-xs text-muted-foreground">
            Optimize how this page appears in search engines and social media shares.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta-title">Meta Title</Label>
          <Input 
            id="meta-title" 
            placeholder="EstateBANK.in | About Us" 
            value={formData.metaTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Keep between 50-60 characters.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta Description</Label>
          <Textarea
            id="meta-description"
            rows={3}
            placeholder="Short summary that will show in search results."
            value={formData.metaDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Aim for 150-160 characters.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta-keywords">Meta Keywords</Label>
          <Input 
            id="meta-keywords" 
            placeholder="real estate, mumbai, premium flats" 
            value={formData.metaKeywords}
            onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Separate keywords with commas.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured-image">Featured Image URL</Label>
          <Input 
            id="featured-image" 
            type="url" 
            placeholder="https://example.com/image.jpg" 
            value={formData.featuredImage}
            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : page ? "Update Page" : "Create Page"}
        </Button>
      </div>
    </form>
  );
}
