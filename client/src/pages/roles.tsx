import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Plus, 
  Shield, 
  User, 
  Users, 
  Settings,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";

// Mock data for roles (normally would come from API)
const mockRoles = [
  {
    id: "1",
    name: "admin",
    displayName: "Administrator",
    description: "Full access to all system features",
    permissions: [
      { resource: "users", actions: ["create", "read", "update", "delete"] },
      { resource: "schemas", actions: ["create", "read", "update", "delete"] },
      { resource: "forms", actions: ["create", "read", "update", "delete"] },
      { resource: "workflows", actions: ["create", "read", "update", "delete"] },
      { resource: "roles", actions: ["create", "read", "update", "delete"] }
    ],
    users: [
      { id: "1", username: "admin", email: "admin@example.com" }
    ],
    createdAt: "2023-04-10T15:30:00Z",
    updatedAt: "2023-04-10T15:30:00Z"
  },
  {
    id: "2",
    name: "editor",
    displayName: "Editor",
    description: "Can create and edit content, but cannot manage users or system settings",
    permissions: [
      { resource: "users", actions: ["read"] },
      { resource: "schemas", actions: ["read", "update"] },
      { resource: "forms", actions: ["create", "read", "update"] },
      { resource: "workflows", actions: ["read", "update"] },
      { resource: "roles", actions: ["read"] }
    ],
    users: [
      { id: "2", username: "editor1", email: "editor1@example.com" },
      { id: "3", username: "editor2", email: "editor2@example.com" }
    ],
    createdAt: "2023-04-11T10:15:00Z",
    updatedAt: "2023-04-11T10:15:00Z"
  },
  {
    id: "3",
    name: "viewer",
    displayName: "Viewer",
    description: "Read-only access to data",
    permissions: [
      { resource: "users", actions: ["read"] },
      { resource: "schemas", actions: ["read"] },
      { resource: "forms", actions: ["read"] },
      { resource: "workflows", actions: ["read"] },
      { resource: "roles", actions: [] }
    ],
    users: [
      { id: "4", username: "viewer1", email: "viewer1@example.com" }
    ],
    createdAt: "2023-04-12T14:45:00Z",
    updatedAt: "2023-04-12T14:45:00Z"
  }
];

// Mock data for users (normally would come from API)
const mockUsers = [
  { id: "1", username: "admin", email: "admin@example.com", role: "admin" },
  { id: "2", username: "editor1", email: "editor1@example.com", role: "editor" },
  { id: "3", username: "editor2", email: "editor2@example.com", role: "editor" },
  { id: "4", username: "viewer1", email: "viewer1@example.com", role: "viewer" },
  { id: "5", username: "user1", email: "user1@example.com", role: null }
];

// Available resources and actions
const resources = [
  { name: "users", displayName: "Users" },
  { name: "schemas", displayName: "Schemas" },
  { name: "forms", displayName: "Forms" },
  { name: "workflows", displayName: "Workflows" },
  { name: "roles", displayName: "Roles" }
];

const actions = [
  { name: "create", displayName: "Create" },
  { name: "read", displayName: "Read" },
  { name: "update", displayName: "Update" },
  { name: "delete", displayName: "Delete" }
];

export default function RoleManager() {
  const [roles, setRoles] = useState(mockRoles);
  const [users, setUsers] = useState(mockUsers);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  
  const [newRole, setNewRole] = useState({
    name: "",
    displayName: "",
    description: ""
  });
  
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [selectedUser, setSelectedUser] = useState("");

  const handleSelectRole = (role: any) => {
    setSelectedRole(role);
    
    // Initialize permissions state based on selected role
    const initialPermissions: Record<string, string[]> = {};
    role.permissions.forEach((perm: any) => {
      initialPermissions[perm.resource] = perm.actions;
    });
    setPermissions(initialPermissions);
  };

  const handleAddRole = () => {
    const role = {
      id: String(Date.now()),
      name: newRole.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: newRole.displayName,
      description: newRole.description,
      permissions: [],
      users: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setRoles([...roles, role]);
    setNewRole({ name: "", displayName: "", description: "" });
    setShowAddRole(false);
  };

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setPermissions(prevPermissions => {
      const currentActions = prevPermissions[resource] || [];
      
      if (checked && !currentActions.includes(action)) {
        return {
          ...prevPermissions,
          [resource]: [...currentActions, action]
        };
      } else if (!checked && currentActions.includes(action)) {
        return {
          ...prevPermissions,
          [resource]: currentActions.filter(a => a !== action)
        };
      }
      
      return prevPermissions;
    });
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    
    const updatedPermissions = Object.entries(permissions).map(([resource, actions]) => ({
      resource,
      actions
    }));
    
    const updatedRole = {
      ...selectedRole,
      permissions: updatedPermissions,
      updatedAt: new Date().toISOString()
    };
    
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
    setSelectedRole(updatedRole);
  };

  const handleAddUserToRole = () => {
    if (!selectedRole || !selectedUser) return;
    
    const user = users.find(u => u.id === selectedUser);
    if (!user) return;
    
    // Check if user is already in this role
    if (selectedRole.users.some((u: any) => u.id === user.id)) {
      setShowAddUser(false);
      return;
    }
    
    // Add user to selected role
    const updatedRole = {
      ...selectedRole,
      users: [...selectedRole.users, { id: user.id, username: user.username, email: user.email }],
      updatedAt: new Date().toISOString()
    };
    
    // Update user's role
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, role: selectedRole.name } : u
    );
    
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
    setUsers(updatedUsers);
    setSelectedRole(updatedRole);
    setSelectedUser("");
    setShowAddUser(false);
  };

  const handleRemoveUserFromRole = (userId: string) => {
    if (!selectedRole) return;
    
    // Remove user from selected role
    const updatedRole = {
      ...selectedRole,
      users: selectedRole.users.filter((u: any) => u.id !== userId),
      updatedAt: new Date().toISOString()
    };
    
    // Remove role from user
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: null } : u
    );
    
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
    setUsers(updatedUsers);
    setSelectedRole(updatedRole);
  };

  const isPermissionChecked = (resource: string, action: string) => {
    return permissions[resource]?.includes(action) || false;
  };
  
  const hasAllResourcePermissions = (resource: string) => {
    return actions.every(action => isPermissionChecked(resource, action.name));
  };
  
  const hasAnyResourcePermissions = (resource: string) => {
    return actions.some(action => isPermissionChecked(resource, action.name));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Access Control</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Roles</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddRole(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map(role => (
                <Button 
                  key={role.id}
                  variant={selectedRole?.id === role.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectRole(role)}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {role.displayName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {selectedRole ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedRole.displayName}</CardTitle>
                    <CardDescription>
                      {selectedRole.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="permissions">
                  <TabsList className="mb-4">
                    <TabsTrigger value="permissions">
                      <Settings className="h-4 w-4 mr-2" />
                      Permissions
                    </TabsTrigger>
                    <TabsTrigger value="users">
                      <Users className="h-4 w-4 mr-2" />
                      Users ({selectedRole.users.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="permissions">
                    <div className="space-y-6">
                      <div className="bg-muted p-4 rounded-md mb-4">
                        <p className="text-sm">
                          Configure what users with the <strong>{selectedRole.displayName}</strong> role can do in the system.
                          Click the checkboxes to grant or revoke permissions.
                        </p>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Resource</TableHead>
                            {actions.map(action => (
                              <TableHead key={action.name}>
                                {action.displayName}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resources.map(resource => (
                            <TableRow key={resource.name}>
                              <TableCell className="font-medium">
                                {resource.displayName}
                                {hasAllResourcePermissions(resource.name) && (
                                  <Badge variant="outline" className="ml-2">All</Badge>
                                )}
                                {!hasAllResourcePermissions(resource.name) && hasAnyResourcePermissions(resource.name) && (
                                  <Badge variant="outline" className="ml-2">Partial</Badge>
                                )}
                              </TableCell>
                              {actions.map(action => (
                                <TableCell key={action.name}>
                                  <Checkbox 
                                    checked={isPermissionChecked(resource.name, action.name)}
                                    onCheckedChange={(checked) => 
                                      handlePermissionChange(resource.name, action.name, checked as boolean)
                                    }
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="flex justify-end">
                        <Button onClick={handleSavePermissions}>
                          Save Permissions
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="users">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          Users with {selectedRole.displayName} Role
                        </h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddUser(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add User
                        </Button>
                      </div>
                      
                      {selectedRole.users.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-md">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground mb-2">No users have this role yet</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowAddUser(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add User
                          </Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedRole.users.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveUserFromRole(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
              <Shield className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Role Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a role from the list or create a new one.
              </p>
              <Button onClick={() => setShowAddRole(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Add Role Dialog */}
      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a role to define a set of permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="roleDisplayName">Role Name</Label>
              <Input 
                id="roleDisplayName" 
                placeholder="e.g. Content Editor" 
                value={newRole.displayName}
                onChange={(e) => setNewRole({...newRole, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleName">Technical Name</Label>
              <Input 
                id="roleName" 
                placeholder="e.g. content_editor" 
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Used in API and system references.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea 
                id="roleDescription" 
                placeholder="Briefly describe what this role is for" 
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRole(false)}>Cancel</Button>
            <Button onClick={handleAddRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User to Role Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Role</DialogTitle>
            <DialogDescription>
              Assign the {selectedRole?.displayName} role to a user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select 
                value={selectedUser}
                onValueChange={setSelectedUser}
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(user => !selectedRole?.users.some((u: any) => u.id === user.id))
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUserToRole} disabled={!selectedUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}