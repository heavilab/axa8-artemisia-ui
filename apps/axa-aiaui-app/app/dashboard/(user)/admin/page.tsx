"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useUser } from "@/lib/hooks/use-user";

type User = {
  email: string;
  firstName?: string;
  lastName?: string;
  agency: string;
  country: string;
  brand: string;
  entity: string;
  role: "Admin" | "Standard" | "Viewer";
};

export default function AccountPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialog, setDialog] = useState<"edit" | "role" | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    entity: "",
    agency: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user: currentUser } = useUser();

  useEffect(() => {
    async function fetchUsers() {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((doc) => doc.data() as User);
      setUsers(usersData);
    }
    fetchUsers();
  }, []);

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm(user);
    setDialog("edit");
  };

  const openRole = (user: User) => {
    setSelectedUser(user);
    setForm({ role: user.role });
    setDialog("role");
  };

  const handleRoleChange = (val: string) => {
    setPendingRole(val);
    setConfirmOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !pendingRole) return;
    setForm({ ...form, role: pendingRole as User["role"] });
    setConfirmOpen(false);
    await saveChangesWithRole(pendingRole as User["role"]);
    setPendingRole(null);
  };

  const saveChangesWithRole = async (role: User["role"]) => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.email === selectedUser.email ? ({ ...u, ...form, role } as User) : u
      )
    );
    setDialog(null);
    toast("The changes were successfully saved");
    if (role && role !== selectedUser.role) {
      const userRef = doc(db, "users", selectedUser.email);
      await updateDoc(userRef, { role });
    }
  };

  const saveChanges = async () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.email === selectedUser.email ? ({ ...u, ...form } as User) : u
      )
    );
    setDialog(null);
    toast("The changes were successfully saved");
    // Update Firestore if role is changed
    if (form.role && form.role !== selectedUser.role) {
      const userRef = doc(db, "users", selectedUser.email);
      await updateDoc(userRef, { role: form.role });
    }
  };

  const formValid =
    dialog === "edit"
      ? form.email && form.agency && form.country && form.brand
      : form.role;

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    await deleteDoc(doc(db, "users", userToDelete.email));
    setUsers((prev) => prev.filter((u) => u.email !== userToDelete.email));
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    toast("User deleted successfully");
  };

  // Function to get display name
  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email.split("@")[0];
  };

  // Function to get badge variant for role
  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "Admin":
        return "default";
      case "Standard":
        return "outline";
      case "Viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  // Function to extract initials from email
  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    const parts = user.email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      user.email.toLowerCase().includes(query) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query)) ||
      user.agency.toLowerCase().includes(query) ||
      user.country.toLowerCase().includes(query) ||
      user.entity.toLowerCase().includes(query) ||
      user.brand.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query);

    const matchesFilters =
      (!filters.country || user.country === filters.country) &&
      (!filters.entity || user.entity === filters.entity) &&
      (!filters.agency || user.agency === filters.agency);

    return matchesSearch && matchesFilters;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name, email, agency, country, entity, brand, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select
                value={filters.country}
                onValueChange={(value) =>
                  setFilters({ ...filters, country: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All countries</SelectItem>
                  <SelectItem value="FR">FR</SelectItem>
                  <SelectItem value="ES">ES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entity</label>
              <Select
                value={filters.entity}
                onValueChange={(value) =>
                  setFilters({ ...filters, entity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All entities</SelectItem>
                  <SelectItem value="AXA">AXA</SelectItem>
                  <SelectItem value="AXA XL">AXA XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Agency</label>
              <Select
                value={filters.agency}
                onValueChange={(value) =>
                  setFilters({ ...filters, agency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All agencies</SelectItem>
                  <SelectItem value="OMD">OMD</SelectItem>
                  <SelectItem value="Havas">Havas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Entity</TableCell>
            <TableCell>Agency</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Role</TableCell>
            <TableCell />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow
              key={user.email}
              className={currentUser?.email === user.email ? "bg-muted/50" : ""}
            >
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {getDisplayName(user)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.country}</TableCell>
              <TableCell>{user.entity}</TableCell>
              <TableCell>{user.agency}</TableCell>
              <TableCell>{user.brand}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openEdit(user)}>
                      Edit
                    </DropdownMenuItem>
                    {currentUser?.email !== user.email && (
                      <>
                        <DropdownMenuItem onClick={() => openRole(user)}>
                          Manage Access
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={dialog === "edit"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Account Parameters Access</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Email" value={form.email} disabled />
            <Select
              value={form.agency}
              onValueChange={(val) => setForm({ ...form, agency: val })}
            >
              <SelectTrigger className="w-full">Agency</SelectTrigger>
              <SelectContent>
                <SelectItem value="OMD">OMD</SelectItem>
                <SelectItem value="Havas">Havas</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.country}
              onValueChange={(val) => setForm({ ...form, country: val })}
            >
              <SelectTrigger className="w-full">Country</SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">FR</SelectItem>
                <SelectItem value="ES">ES</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.entity}
              onValueChange={(val) => setForm({ ...form, entity: val })}
            >
              <SelectTrigger className="w-full">Entity</SelectTrigger>
              <SelectContent>
                <SelectItem value="AXA">AXA</SelectItem>
                <SelectItem value="AXA XL">AXA XL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={saveChanges} disabled={!formValid}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={dialog === "role"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Access</DialogTitle>
            <p className="text-sm text-muted-foreground">
              You can manage <strong>{selectedUser?.email}</strong> access by
              changing their role
            </p>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={form.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Role Change Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to change the role to{" "}
              <strong>{pendingRole}</strong>?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange}>Yes, change role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete user{" "}
              <strong>{userToDelete?.email}</strong>?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
