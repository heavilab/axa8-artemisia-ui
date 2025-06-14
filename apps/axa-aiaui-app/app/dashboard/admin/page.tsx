"use client";

import { useState } from "react";
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
} from "@/components/ui/select";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

type User = {
  email: string;
  agency: string;
  country: string;
  brand: string;
  role: "Admin" | "Standard" | "Viewer";
};

const usersMock: User[] = [
  {
    email: "a@axa.com",
    agency: "OMD",
    country: "FR",
    brand: "AXA France",
    role: "Admin",
  },
  {
    email: "b@axa.com",
    agency: "Havas",
    country: "ES",
    brand: "AXA España",
    role: "Viewer",
  },
];

export default function AccountPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialog, setDialog] = useState<"edit" | "role" | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [users, setUsers] = useState(usersMock);

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

  const saveChanges = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.email === selectedUser.email ? ({ ...u, ...form } as User) : u
      )
    );
    setDialog(null);
    toast("The changes were successfully saved");
  };

  const formValid =
    dialog === "edit"
      ? form.email && form.agency && form.country && form.brand
      : form.role;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Admin and User Access Management
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Agency</TableCell>
            <TableCell>Country</TableCell>
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
                    <DropdownMenuItem onClick={() => openRole(user)}>
                      Manage Access
                    </DropdownMenuItem>
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
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Select
              value={form.agency}
              onValueChange={(val) => setForm({ ...form, agency: val })}
            >
              <SelectTrigger>Agency</SelectTrigger>
              <SelectContent>
                <SelectItem value="OMD">OMD</SelectItem>
                <SelectItem value="Havas">Havas</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.country}
              onValueChange={(val) => setForm({ ...form, country: val })}
            >
              <SelectTrigger>Country</SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">FR</SelectItem>
                <SelectItem value="ES">ES</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.brand}
              onValueChange={(val) => setForm({ ...form, brand: val })}
            >
              <SelectTrigger>Brand</SelectTrigger>
              <SelectContent>
                <SelectItem value="AXA France">AXA France</SelectItem>
                <SelectItem value="AXA España">AXA España</SelectItem>
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
            <Select
              value={form.role}
              onValueChange={(val) =>
                setForm({ ...form, role: val as User["role"] })
              }
            >
              <SelectTrigger>Role</SelectTrigger>
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
            <Button onClick={saveChanges} disabled={!formValid}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
