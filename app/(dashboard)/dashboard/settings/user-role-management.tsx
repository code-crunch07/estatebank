"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Save, Users, Shield, Search, X } from "lucide-react";
import { toast } from "sonner";

// Permission categories based on dashboard sections
const permissionCategories = {
  dashboard: {
    label: "Dashboard",
    permissions: ["view_dashboard"],
  },
  properties: {
    label: "Property Management",
    permissions: [
      "view_properties",
      "add_properties",
      "edit_properties",
      "delete_properties",
      "manage_property_types",
      "manage_amenities",
    ],
  },
  locations: {
    label: "Locations",
    permissions: [
      "view_locations",
      "manage_locations",
      "manage_areas",
    ],
  },
  crm: {
    label: "CRM",
    permissions: [
      "view_leads",
      "manage_leads",
      "view_followups",
      "manage_followups",
      "view_activities",
      "manage_activities",
      "manage_whatsapp",
    ],
  },
  people: {
    label: "People Management",
    permissions: [
      "view_clients",
      "manage_clients",
      "view_owners",
      "manage_owners",
      "view_brokers",
      "manage_brokers",
      "view_team",
      "manage_team",
    ],
  },
  website: {
    label: "Website Management",
    permissions: [
      "view_banner",
      "manage_banner",
      "view_branding",
      "manage_branding",
      "view_pages",
      "manage_pages",
      "view_seo",
      "manage_seo",
    ],
  },
  content: {
    label: "Content Management",
    permissions: [
      "view_blogs",
      "manage_blogs",
      "view_testimonials",
      "manage_testimonials",
    ],
  },
  communication: {
    label: "Communication",
    permissions: [
      "view_enquiries",
      "manage_enquiries",
      "view_contacts",
      "manage_contacts",
      "send_broadcast",
    ],
  },
  settings: {
    label: "Settings",
    permissions: [
      "view_settings",
      "manage_settings",
      "manage_users",
      "manage_roles",
    ],
  },
};

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

// Default roles
const defaultRoles: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full access to all features and settings",
    permissions: Object.values(permissionCategories).flatMap((cat) => cat.permissions),
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Admin",
    description: "Administrative access with most permissions",
    permissions: [
      ...permissionCategories.dashboard.permissions,
      ...permissionCategories.properties.permissions,
      ...permissionCategories.crm.permissions,
      ...permissionCategories.people.permissions,
      ...permissionCategories.website.permissions,
      ...permissionCategories.content.permissions,
      ...permissionCategories.communication.permissions,
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Manager",
    description: "Management access to properties, CRM, and people",
    permissions: [
      ...permissionCategories.dashboard.permissions,
      ...permissionCategories.properties.permissions.filter((p) => p !== "delete_properties"),
      ...permissionCategories.crm.permissions.filter((p) => !p.includes("manage_whatsapp")),
      ...permissionCategories.people.permissions.filter((p) => !p.includes("manage_team")),
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Agent",
    description: "Basic access for property agents",
    permissions: [
      ...permissionCategories.dashboard.permissions,
      "view_properties",
      "view_leads",
      "manage_leads",
      "view_followups",
      "manage_followups",
      "view_clients",
      "manage_clients",
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Support",
    description: "Support staff with limited access",
    permissions: [
      ...permissionCategories.dashboard.permissions,
      "view_properties",
      "view_enquiries",
      "manage_enquiries",
      "view_contacts",
    ],
    createdAt: new Date().toISOString(),
  },
];

export function UserRoleManagement() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "role" | "user"; id: string; name: string } | null>(null);

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "Active" as "Active" | "Inactive",
  });

  // Load data from localStorage
  useEffect(() => {
    const loadRoles = () => {
      const stored = localStorage.getItem("dashboard_roles");
      if (stored) {
        setRoles(JSON.parse(stored));
      } else {
        setRoles(defaultRoles);
        localStorage.setItem("dashboard_roles", JSON.stringify(defaultRoles));
      }
    };

    const loadUsers = () => {
      const stored = localStorage.getItem("dashboard_users");
      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        // Default admin user
        const defaultUsers: User[] = [
          {
            id: "1",
            name: "Admin User",
            email: "admin@estatebank.in",
            role: "1", // Super Admin
            status: "Active",
            createdAt: new Date().toISOString(),
          },
        ];
        setUsers(defaultUsers);
        localStorage.setItem("dashboard_users", JSON.stringify(defaultUsers));
      }
    };

    loadRoles();
    loadUsers();
  }, []);

  // Filtered data
  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Role handlers
  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: "", description: "", permissions: [] });
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleForm.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (roleForm.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    if (editingRole) {
      // Update existing role
      const updated = roles.map((r) =>
        r.id === editingRole.id
          ? { ...r, ...roleForm, permissions: roleForm.permissions }
          : r
      );
      setRoles(updated);
      localStorage.setItem("dashboard_roles", JSON.stringify(updated));
      toast.success("Role updated successfully");
    } else {
      // Create new role
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        createdAt: new Date().toISOString(),
      };
      const updated = [...roles, newRole];
      setRoles(updated);
      localStorage.setItem("dashboard_roles", JSON.stringify(updated));
      toast.success("Role created successfully");
    }

    setIsRoleDialogOpen(false);
    setRoleForm({ name: "", description: "", permissions: [] });
    setEditingRole(null);
  };

  const handleDeleteRole = (role: Role) => {
    // Check if role is assigned to any user
    const usersWithRole = users.filter((u) => u.role === role.id);
    if (usersWithRole.length > 0) {
      toast.error(`Cannot delete role. ${usersWithRole.length} user(s) are assigned to this role.`);
      return;
    }

    setItemToDelete({ type: "role", id: role.id, name: role.name });
    setDeleteDialogOpen(true);
  };

  // User handlers
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({ name: "", email: "", password: "", role: roles[0]?.id || "", status: "Active" });
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
    });
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editingUser && !userForm.password) {
      toast.error("Password is required for new users");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (editingUser) {
      // Update existing user
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: userForm.name,
              email: userForm.email,
              role: userForm.role,
              status: userForm.status,
            }
          : u
      );
      setUsers(updated);
      localStorage.setItem("dashboard_users", JSON.stringify(updated));
      toast.success("User updated successfully");
    } else {
      // Check if email already exists
      if (users.some((u) => u.email === userForm.email)) {
        toast.error("Email already exists");
        return;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        status: userForm.status,
        createdAt: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      setUsers(updated);
      localStorage.setItem("dashboard_users", JSON.stringify(updated));
      toast.success("User created successfully");
    }

    setIsUserDialogOpen(false);
    setUserForm({ name: "", email: "", password: "", role: roles[0]?.id || "", status: "Active" });
    setEditingUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setItemToDelete({ type: "user", id: user.id, name: user.name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "role") {
      const updated = roles.filter((r) => r.id !== itemToDelete.id);
      setRoles(updated);
      localStorage.setItem("dashboard_roles", JSON.stringify(updated));
      toast.success("Role deleted successfully");
    } else {
      const updated = users.filter((u) => u.id !== itemToDelete.id);
      setUsers(updated);
      localStorage.setItem("dashboard_users", JSON.stringify(updated));
      toast.success("User deleted successfully");
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const togglePermission = (permission: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleCategoryPermissions = (category: keyof typeof permissionCategories) => {
    const categoryPermissions = permissionCategories[category].permissions;
    const allSelected = categoryPermissions.every((p) => roleForm.permissions.includes(p));

    setRoleForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])],
    }));
  };

  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "users" | "roles")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {activeTab === "users" ? (
              <Button onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            ) : (
              <Button onClick={handleCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage dashboard users and their role assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleName(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Create and manage roles with granular permission controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No roles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => {
                      const usersWithRole = users.filter((u) => u.role === role.id).length;
                      return (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {role.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{role.permissions.length} permissions</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{usersWithRole} user(s)</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRole(role)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              Define role name, description, and assign permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                placeholder="e.g., Sales Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Brief description of this role"
              />
            </div>
            <div className="space-y-4">
              <Label>Permissions *</Label>
              <div className="border rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {Object.entries(permissionCategories).map(([categoryKey, category]) => {
                  const categoryPermissions = category.permissions;
                  const allSelected = categoryPermissions.every((p) =>
                    roleForm.permissions.includes(p)
                  );
                  const someSelected = categoryPermissions.some((p) =>
                    roleForm.permissions.includes(p)
                  );

                  return (
                    <div key={categoryKey} className="space-y-2 border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected}
                          ref={(el) => {
                            if (el) (el as HTMLInputElement).indeterminate = someSelected && !allSelected;
                          }}
                          onCheckedChange={() =>
                            toggleCategoryPermissions(categoryKey as keyof typeof permissionCategories)
                          }
                        />
                        <Label className="font-semibold text-sm cursor-pointer">
                          {category.label}
                        </Label>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {categoryPermissions.filter((p) => roleForm.permissions.includes(p)).length}/
                          {categoryPermissions.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-6">
                        {categoryPermissions.map((permission) => (
                          <div key={permission} className="flex items-center gap-2">
                            <Checkbox
                              id={permission}
                              checked={roleForm.permissions.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                            <Label
                              htmlFor={permission}
                              className="text-xs cursor-pointer font-normal"
                            >
                              {permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {roleForm.permissions.length} permission(s)
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole}>
                <Save className="h-4 w-4 mr-2" />
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              Add a new user to the dashboard and assign them a role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name *</Label>
              <Input
                id="user-name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="user-password">Password *</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="user-role">Role *</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-status">Status</Label>
              <Select
                value={userForm.status}
                onValueChange={(value) =>
                  setUserForm({ ...userForm, status: value as "Active" | "Inactive" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser}>
                <Save className="h-4 w-4 mr-2" />
                {editingUser ? "Update User" : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {itemToDelete?.type === "role" ? "the role" : "the user"} &quot;{itemToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
