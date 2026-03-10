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
import { Plus, Edit, Trash2, Phone, Mail, Search, MapPin, Upload, Image as ImageIcon, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useMemo } from "react";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "@/lib/data-store";
import Image from "next/image";
import { MediaSelector } from "@/components/media-selector";

const roles = ["CEO & Founder", "Sales Head", "Sales In Charge", "Sourcing Manager", "Manager", "Agent", "Admin", "Support"];

interface TeamMemberApi {
  _id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  phone: string | string[]; // Can be string (comma-separated) or array for backward compatibility
  email: string;
  image: string;
  bio: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  status: string;
  order: number;
}

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberApi | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMemberApi | null>(null);

  const fetchTeamMembers = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/people/team');
      const data = await response.json();
      if (data.success && data.data) {
        setTeamMembers(Array.isArray(data.data) ? data.data : []);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleSave = async (memberData: Partial<TeamMember> & { password?: string; dashboardRole?: string; createDashboardAccount?: boolean }) => {
    try {
      if (editingMember) {
        // Update existing
        const response = await fetch(`/api/people/team/${editingMember._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Team member updated successfully");
          fetchTeamMembers();
        } else {
          toast.error(result.error || "Failed to update team member");
        }
      } else {
        // Create new team member
        const teamResponse = await fetch('/api/people/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: memberData.name || "",
            role: memberData.role || "Agent",
            department: memberData.department || "",
            location: memberData.location || "",
            phone: memberData.phone || [],
            email: memberData.email || "",
            image: memberData.image || "/team/default.jpg",
            bio: memberData.bio || "",
            socials: memberData.socials || {},
            status: memberData.status || "Active",
            order: teamMembers.length + 1,
          }),
        });
        const teamResult = await teamResponse.json();
        
        if (!teamResult.success) {
          toast.error(teamResult.error || "Failed to add team member");
          return;
        }

        // Create dashboard user account if password is provided
        if (memberData.createDashboardAccount && memberData.password && memberData.dashboardRole) {
          try {
            const userResponse = await fetch('/api/auth/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: memberData.email,
                password: memberData.password,
                name: memberData.name,
                role: memberData.dashboardRole,
              }),
            });
            const userResult = await userResponse.json();
            
            if (userResult.success) {
              toast.success("Team member and dashboard account created successfully");
            } else {
              toast.warning(`Team member created, but dashboard account failed: ${userResult.error}`);
            }
          } catch (userError) {
            console.error('Error creating dashboard account:', userError);
            toast.warning("Team member created, but dashboard account creation failed");
          }
        } else {
          toast.success("Team member added successfully");
        }
        
        fetchTeamMembers();
      }
      setIsDialogOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error("Failed to save team member");
    }
  };

  const handleEdit = (member: TeamMemberApi) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleDelete = (member: TeamMemberApi) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      const response = await fetch(`/api/people/team/${memberToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Team member deleted successfully");
        fetchTeamMembers();
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete team member");
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error("Failed to delete team member");
    }
  };

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamMembers, searchTerm]);

  // Paginate filtered members
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, currentPage, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Team Members</h1>
          <p className="text-xs text-muted-foreground">Manage your team members (displays on About page)</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMember(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMember(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
              <DialogDescription>
                {editingMember ? "Update team member details" : "Add a new team member"}
              </DialogDescription>
            </DialogHeader>
            <TeamMemberForm 
              member={editingMember}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingMember(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
          <CardDescription>
            {filteredMembers.length} team members found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role / Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No team members found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                        {member.image && member.image.trim() ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=ffffff`;
                          }}
                        />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-primary/10">
                            <span className="text-xs font-semibold text-primary">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">
                            {Array.isArray(member.phone) 
                              ? member.phone.join(", ") 
                              : (member.phone || "N/A")}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">{member.role}</Badge>
                        <span className="text-xs text-muted-foreground">{member.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{member.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(member)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(member)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredMembers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredMembers.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredMembers.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{memberToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setMemberToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TeamMemberForm({ 
  member, 
  onSave,
  onCancel
}: { 
  member: TeamMemberApi | null;
  onSave: (data: Partial<TeamMember>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    email: member?.email || "",
    phone: Array.isArray(member?.phone) 
      ? member.phone.join(", ") 
      : (member?.phone || ""),
    role: member?.role || "",
    department: member?.department || "",
    location: member?.location || "",
    image: member?.image || "/team/default.jpg",
    bio: member?.bio || "",
    linkedin: member?.socials?.linkedin || "",
    twitter: member?.socials?.twitter || "",
    facebook: member?.socials?.facebook || "",
    instagram: member?.socials?.instagram || "",
    status: member?.status || "Active",
    // Dashboard account fields
    createDashboardAccount: false,
    password: "",
    dashboardRole: "agent",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(member?.image || null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // Update preview when member changes
  useEffect(() => {
    if (member?.image) {
      setImagePreview(member.image);
      setSelectedFile(null);
    } else {
      setImagePreview(null);
    }
  }, [member]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (base64: string): Promise<string> => {
    const res = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, folder: 'team-members' }),
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.data.url;
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "/team/default.jpg" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate dashboard account fields if enabled
    if (formData.createDashboardAccount && !member) {
      if (!formData.password || formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (!formData.dashboardRole) {
        toast.error("Please select a dashboard role");
        return;
      }
    }

    let imageUrl = formData.image;
    if (formData.image?.startsWith('data:image')) {
      try {
        imageUrl = await uploadImageToStorage(formData.image);
      } catch {
        toast.error("Failed to upload image, saving with base64");
      }
    }

    onSave({
      name: formData.name,
      email: formData.email,
      phone: formData.phone.split(",").map(p => p.trim()).filter(p => p),
      role: formData.role,
      department: formData.department,
      location: formData.location,
      image: imageUrl || formData.image,
      bio: formData.bio,
      socials: {
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
        facebook: formData.facebook || undefined,
        instagram: formData.instagram || undefined,
      },
      status: formData.status as "Active" | "Inactive",
      // Dashboard account fields (only for new members)
      ...(!member && {
        createDashboardAccount: formData.createDashboardAccount,
        password: formData.createDashboardAccount ? formData.password : undefined,
        dashboardRole: formData.createDashboardAccount ? formData.dashboardRole : undefined,
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input 
            id="name" 
            placeholder="Enter name" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter email" 
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Numbers (comma separated)</Label>
          <Input 
            id="phone" 
            placeholder="+91 9820590353, +971 56 9636 586" 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input 
            id="department" 
            placeholder="e.g., Residential & Commercial" 
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="e.g., Mumbai & UAE" 
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image *</Label>
        {imagePreview ? (
          <div className="space-y-2">
            <div className="relative w-32 h-32 rounded-md overflow-hidden border">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
            >
              Replace Image
            </Button>
          </div>
          ) : (
        <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-file"
                  className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors whitespace-nowrap"
                >
                  <Upload className="h-4 w-4" />
                  <span>{selectedFile ? selectedFile.name : "Choose image"}</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMediaSelectorOpen(true)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Media Library</span>
                </Button>
                <span className="text-xs text-muted-foreground whitespace-nowrap">OR</span>
          <Input 
                  id="image-url"
                  type="url"
            value={formData.image}
                  onChange={(e) => {
                    const newImage = e.target.value;
                    setFormData({ ...formData, image: newImage });
                    setImagePreview(newImage);
                    setSelectedFile(null);
                  }}
                  placeholder="Enter image URL"
                  className="flex-1 min-w-[250px]"
          />
        </div>
              <p className="text-xs text-muted-foreground">
                Upload an image (Max 5MB), select from media library, or enter an image URL. Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "Active" | "Inactive" })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dashboard Account Section - Only show for new members */}
      {!member && (
        <>
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="createDashboardAccount"
                checked={formData.createDashboardAccount}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, createDashboardAccount: checked as boolean })
                }
              />
              <Label htmlFor="createDashboardAccount" className="text-sm font-medium cursor-pointer">
                Create Dashboard Login Account
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enable this to allow this team member to login to the dashboard
            </p>

            {formData.createDashboardAccount && (
              <div className="space-y-4 pl-6 border-l-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password (min 6 characters)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dashboardRole">Dashboard Role *</Label>
                    <Select
                      value={formData.dashboardRole}
                      onValueChange={(value) => setFormData({ ...formData, dashboardRole: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Full Access</SelectItem>
                        <SelectItem value="manager">Manager - Management Access</SelectItem>
                        <SelectItem value="agent">Agent - Basic Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  They will be able to login at /login using their email and password
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio" 
          placeholder="Short bio about the team member" 
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Social Links</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            placeholder="LinkedIn URL" 
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
          />
          <Input 
            placeholder="Twitter URL" 
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
          />
          <Input 
            placeholder="Facebook URL" 
            value={formData.facebook}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
          />
          <Input 
            placeholder="Instagram URL" 
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Member</Button>
      </div>
      
      <MediaSelector
        open={isMediaSelectorOpen}
        onOpenChange={setIsMediaSelectorOpen}
        onSelect={(url: string) => {
          setImagePreview(url);
          setFormData({ ...formData, image: url });
          setSelectedFile(null);
        }}
        type="image"
      />
    </form>
  );
}
