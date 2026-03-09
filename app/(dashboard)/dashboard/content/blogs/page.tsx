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
import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Eye, Search, Upload, X, Image as ImageIcon, RefreshCw } from "lucide-react";
import { MediaSelector } from "@/components/media-selector";
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
import { toast } from "sonner";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Blog {
  _id: string;
  title: string;
  author: string;
  status: "Published" | "Draft";
  views: number;
  createdAt: string;
  updatedAt?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  images?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  const fetchBlogs = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/blogs');
      const data = await response.json();
      if (data.success && data.data) {
        setBlogs(Array.isArray(data.data) ? data.data : []);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
      setBlogs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setIsDialogOpen(true);
  };

  const handleDelete = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    
    try {
      const response = await fetch(`/api/blogs/${blogToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Blog deleted successfully");
        fetchBlogs();
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete blog");
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error("Failed to delete blog");
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blogs</h1>
          <p className="text-sm text-muted-foreground">Manage blog posts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchBlogs}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingBlog(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBlog(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                <DialogDescription>
                  {editingBlog ? "Update blog post details" : "Write and publish a new blog post"}
                </DialogDescription>
              </DialogHeader>
              <BlogForm 
                blog={editingBlog}
                onSuccess={() => {
                  fetchBlogs();
                  setIsDialogOpen(false);
                  setEditingBlog(null);
                }}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingBlog(null);
                }}
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
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
          <CardDescription>
            {filteredBlogs.length} blog posts found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading blogs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No blog posts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBlogs.map((blog) => (
                    <TableRow key={blog._id}>
                      <TableCell className="font-medium">{blog.title}</TableCell>
                      <TableCell>{blog.author}</TableCell>
                      <TableCell>
                        <Badge
                          variant={blog.status === "Published" ? "default" : "secondary"}
                        >
                          {blog.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{blog.views || 0}</TableCell>
                      <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="View"
                            asChild
                          >
                            <a href={`/blogs/${blog._id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(blog)} title="Delete">
                            <Trash2 className="h-4 w-4" />
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{blogToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BlogForm({ 
  blog, 
  onSuccess,
  onCancel
}: { 
  blog?: Blog | null;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    author: blog?.author || "",
    status: (blog?.status || "Draft") as "Published" | "Draft",
    content: blog?.content || "",
    excerpt: blog?.excerpt || "",
    category: blog?.category || "",
    tags: Array.isArray(blog?.tags) ? blog.tags.join(", ") : (blog?.tags || ""),
    metaTitle: blog?.metaTitle || "",
    metaDescription: blog?.metaDescription || "",
  });
  const [featuredImage, setFeaturedImage] = useState<string>(blog?.featuredImage || "");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [blogImages, setBlogImages] = useState<string[]>(blog?.images || []);
  const [blogImageFiles, setBlogImageFiles] = useState<File[]>([]);
  const [isFeaturedMediaSelectorOpen, setIsFeaturedMediaSelectorOpen] = useState(false);
  const [isBlogMediaSelectorOpen, setIsBlogMediaSelectorOpen] = useState(false);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        author: blog.author || "",
        status: blog.status || "Draft",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        category: blog.category || "",
        tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
      });
      setFeaturedImage(blog.featuredImage || "");
      setBlogImages(blog.images || []);
    }
  }, [blog]);

  const handleFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFeaturedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlogImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    if (fileArray.length > 10) {
      toast.error("Please select maximum 10 images");
      return;
    }

    // Validate all files
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return;
      }
    }

    setBlogImageFiles([...blogImageFiles, ...fileArray]);
    
    // Create previews
    const previewPromises = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    
    const previews = await Promise.all(previewPromises);
    setBlogImages([...blogImages, ...previews]);
  };

  const removeFeaturedImage = () => {
    setFeaturedImage("");
    setFeaturedImageFile(null);
  };

  const removeBlogImage = (index: number) => {
    const newImages = blogImages.filter((_, i) => i !== index);
    const newFiles = blogImageFiles.filter((_, i) => i !== index);
    setBlogImages(newImages);
    setBlogImageFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        status: formData.status,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        featuredImage: featuredImage || undefined,
        images: blogImages.length > 0 ? blogImages : undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
      };

      const url = blog ? `/api/blogs/${blog._id}` : '/api/blogs';
      const method = blog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(blog ? "Blog updated successfully" : "Blog created successfully");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to save blog");
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error("Failed to save blog");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input 
          id="title" 
          placeholder="Enter blog title" 
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt / Short Description</Label>
        <Textarea
          id="excerpt"
          placeholder="Write a brief summary of your blog post..."
          rows={3}
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">A short description that appears in blog listings</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <RichTextEditor
          content={formData.content}
          onChange={(content) => setFormData({ ...formData, content })}
          placeholder="Write your blog content here..."
        />
        <p className="text-xs text-muted-foreground">
          Use the toolbar above to format your content. You can add headings, lists, links, images, and more.
        </p>
      </div>

      {/* Featured Image */}
      <div className="space-y-2">
        <Label>Featured Image</Label>
        {featuredImage ? (
          <div className="space-y-2">
            <div className="relative w-full h-48 rounded-md overflow-hidden border bg-muted">
              <Image
                src={featuredImage}
                alt="Featured image preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={removeFeaturedImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.getElementById("featured-image-input") as HTMLInputElement;
                input?.click();
              }}
            >
              Replace Image
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap items-center">
              <Input
                id="featured-image-input"
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageChange}
                className="cursor-pointer flex-1 min-w-[140px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFeaturedMediaSelectorOpen(true)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Media Library</span>
              </Button>
              <span className="text-xs text-muted-foreground whitespace-nowrap">OR</span>
              <Input
                id="featured-image-url"
                type="url"
                value={featuredImage}
                onChange={(e) => {
                  const newImage = e.target.value;
                  setFeaturedImage(newImage);
                  setFeaturedImageFile(null);
                }}
                placeholder="Enter image URL"
                className="flex-1 min-w-[200px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a featured image (Max 5MB), select from media library, or enter an image URL
            </p>
          </div>
        )}
        <MediaSelector
          open={isFeaturedMediaSelectorOpen}
          onOpenChange={setIsFeaturedMediaSelectorOpen}
          onSelect={(url) => {
            setFeaturedImage(url);
            setFeaturedImageFile(null);
          }}
          type="image"
        />
      </div>

      {/* Blog Images */}
      <div className="space-y-2">
        <Label>Blog Images</Label>
        {blogImages.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {blogImages.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                <Image
                  src={img}
                  alt={`Blog image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeBlogImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="blog-images-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleBlogImagesChange}
              className="cursor-pointer flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBlogMediaSelectorOpen(true)}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Media Library</span>
            </Button>
            <span className="text-xs text-muted-foreground self-center">OR</span>
            <Input
              id="blog-image-url"
              type="url"
              placeholder="Enter image URL"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const url = input.value.trim();
                  if (url && !blogImages.includes(url)) {
                    if (blogImages.length >= 10) {
                      toast.error("Maximum 10 images allowed");
                      return;
                    }
                    setBlogImages([...blogImages, url]);
                    input.value = '';
                  }
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Upload images (Max 10 images, 5MB each), select from media library, or enter image URLs (press Enter to add each URL)
          </p>
        </div>
        <MediaSelector
          open={isBlogMediaSelectorOpen}
          onOpenChange={setIsBlogMediaSelectorOpen}
          onSelect={(url: string) => {
            if (!blogImages.includes(url)) {
              if (blogImages.length >= 10) {
                toast.error("Maximum 10 images allowed");
                return;
              }
              setBlogImages([...blogImages, url]);
            }
          }}
          type="image"
          multiple={true}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author">Author *</Label>
          <Input 
            id="author" 
            placeholder="Enter author name" 
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as "Published" | "Draft" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input 
            id="category" 
            placeholder="e.g., Real Estate, Tips, News" 
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input 
            id="tags" 
            placeholder="e.g., property, investment, mumbai (comma separated)" 
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>
      </div>

      {/* SEO Fields */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold">SEO Settings</h3>
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input 
            id="metaTitle" 
            placeholder="SEO title (leave empty to use blog title)" 
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            placeholder="SEO description (leave empty to use excerpt)"
            rows={3}
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel || (() => {})}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : blog ? "Update Blog" : "Publish Blog"}
        </Button>
      </div>
    </form>
  );
}
