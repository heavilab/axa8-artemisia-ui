"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Contact } from "@/schemas/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import { toast } from "sonner";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<(Contact & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<
    (Contact & { id: string }) | null
  >(null);
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: "",
    title: "",
    scope: "",
    email: "",
    phoneNumber: "",
  });
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const isAdmin = profile?.role === "Admin";

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "contacts"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const mapped = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (Contact & { id: string })[];
      setContacts(mapped);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (user?.email) {
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setProfile(snapshot.docs[0].data() as { role: string });
      }
    }
    setProfileLoading(false);
  }, [user?.email]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (!userLoading) {
      fetchProfile();
    }
  }, [userLoading, fetchProfile]);

  const handleAddContact = async () => {
    if (
      !formData.name ||
      !formData.title ||
      !formData.scope ||
      !formData.email ||
      !formData.phoneNumber
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success("Contact added successfully");
      setDialogOpen(false);
      setFormData({
        name: "",
        title: "",
        scope: "",
        email: "",
        phoneNumber: "",
      });
      fetchContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const handleEditContact = async () => {
    if (
      !selectedContact ||
      !formData.name ||
      !formData.title ||
      !formData.scope ||
      !formData.email ||
      !formData.phoneNumber
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await updateDoc(doc(db, "contacts", selectedContact.id), {
        ...formData,
        updatedAt: new Date(),
      });
      toast.success("Contact updated successfully");
      setEditDialogOpen(false);
      setSelectedContact(null);
      setFormData({
        name: "",
        title: "",
        scope: "",
        email: "",
        phoneNumber: "",
      });
      fetchContacts();
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      await deleteDoc(doc(db, "contacts", selectedContact.id));
      toast.success("Contact deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const openEditDialog = (contact: Contact & { id: string }) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      title: contact.title,
      scope: contact.scope,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (contact: Contact & { id: string }) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.title.toLowerCase().includes(search.toLowerCase()) ||
      contact.scope.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || userLoading || profileLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading contacts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contact Directory</h1>
          <p className="text-muted-foreground mt-2">
            Team contacts and contact information
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="cursor-pointer">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to the directory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Job title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Input
                    id="scope"
                    value={formData.scope}
                    onChange={(e) =>
                      setFormData({ ...formData, scope: e.target.value })
                    }
                    placeholder="Department/Scope"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@company.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact}>Add Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {contact.title}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(contact)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(contact)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-muted-foreground">
                  Scope:
                </span>
                <span>{contact.scope}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${contact.phoneNumber}`}
                  className="text-primary hover:underline"
                >
                  {contact.phoneNumber}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search
              ? "No contacts found matching your search."
              : "No contacts available."}
          </p>
        </div>
      )}

      {/* Edit Contact Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Job title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-scope">Scope</Label>
              <Input
                id="edit-scope"
                value={formData.scope}
                onChange={(e) =>
                  setFormData({ ...formData, scope: e.target.value })
                }
                placeholder="Department/Scope"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditContact}>Update Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedContact?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContact}>
              Delete Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
