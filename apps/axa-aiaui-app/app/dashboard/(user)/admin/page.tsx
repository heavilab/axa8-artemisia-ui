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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical } from "lucide-react";
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Agency</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Entity</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Role</TableCell>
            <TableCell />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.agency}</TableCell>
              <TableCell>{user.country}</TableCell>
              <TableCell>{user.entity}</TableCell>
              <TableCell>{user.brand}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical />
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
          <div className="py-4">
            <Select value={form.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
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
