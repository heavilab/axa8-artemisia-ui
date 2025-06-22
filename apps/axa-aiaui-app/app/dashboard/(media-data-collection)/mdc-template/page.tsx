"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  addDoc,
  deleteDoc,
  doc,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Upload, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/hooks/use-user";
import { MDCTemplates } from "@/schemas/firestore";

// Extended type for MDCTemplates with templateCategory
type ExtendedMDCTemplates = MDCTemplates & {
  id: string;
  templateCategory?: TemplateCategory;
};

// Template categories with their kebab-case mappings
const TEMPLATE_CATEGORIES = [
  { display: "Digital direct display", kebab: "digital-direct-display" },
  { display: "Digital direct video", kebab: "digital-direct-video" },
  { display: "Digital direct audio", kebab: "digital-direct-audio" },
  { display: "Digital programmatic", kebab: "digital-programmatic" },
  { display: "Paid search", kebab: "paid-search" },
  { display: "Paid social", kebab: "paid-social" },
  { display: "Print media", kebab: "print-media" },
  { display: "Radio", kebab: "radio" },
  { display: "DOOH", kebab: "dooh" },
  { display: "OOH", kebab: "ooh" },
  { display: "TV", kebab: "tv" },
  { display: "Cinema", kebab: "cinema" },
  { display: "Special ops", kebab: "special-ops" },
  { display: "Referencing", kebab: "referencing" },
] as const;

type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]["display"];

// Helper function to get kebab case from display name
const getKebabCase = (display: TemplateCategory): string => {
  const category = TEMPLATE_CATEGORIES.find((cat) => cat.display === display);
  return category?.kebab || display.toLowerCase().replace(/\s+/g, "-");
};

// Color mapping for badges
const getCategoryColor = (category: TemplateCategory) => {
  const colors: Record<TemplateCategory, string> = {
    "Digital direct display": "bg-blue-100 text-blue-800",
    "Digital direct video": "bg-purple-100 text-purple-800",
    "Digital direct audio": "bg-indigo-100 text-indigo-800",
    "Digital programmatic": "bg-green-100 text-green-800",
    "Paid search": "bg-pink-100 text-pink-800",
    "Paid social": "bg-orange-100 text-orange-800",
    "Print media": "bg-yellow-100 text-yellow-800",
    Radio: "bg-teal-100 text-teal-800",
    DOOH: "bg-red-100 text-red-800",
    OOH: "bg-gray-100 text-gray-800",
    TV: "bg-emerald-100 text-emerald-800",
    Cinema: "bg-amber-100 text-amber-800",
    "Special ops": "bg-cyan-100 text-cyan-800",
    Referencing: "bg-lime-100 text-lime-800",
  };
  return colors[category];
};

export default function MDCTemplatePage() {
  const [data, setData] = useState<ExtendedMDCTemplates[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<ExtendedMDCTemplates | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | ""
  >("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const canUploadOrDelete =
    profile?.role === "Admin" || profile?.role === "Standard";

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a template category");
      return;
    }

    if (!canUploadOrDelete) {
      toast.error("You don't have permission to upload templates");
      return;
    }

    if (!user?.email) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create a unique filename with timestamp and category
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `mdc-templates/${selectedCategory}/${timestamp}_${selectedFile.name}`;

      // Create a reference to the file location in GCS
      const storageRef = ref(storage, fileName);

      // Start the upload
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      // Monitor upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          toast.error("Upload failed: " + error.message);
          setUploading(false);
          setUploadProgress(0);
        },
        async () => {
          // Upload completed successfully
          try {
            // Get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Store metadata in mdcTemplates collection
            await addDoc(collection(db, "mdcTemplates"), {
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
              uploadedBy: user.email,
              uploadedAt: new Date(),
              storagePath: fileName,
              downloadURL: downloadURL,
              templateCategory: selectedCategory,
            });

            toast.success("Template uploaded successfully!");
            setDialogOpen(false);
            setSelectedFile(null);
            setSelectedCategory("");
            setUploadProgress(0);

            // Refresh the data to show the new upload
            fetchData();
          } catch (error) {
            console.error("Error saving metadata:", error);
            toast.error("Upload completed but failed to save metadata");
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    if (!canUploadOrDelete) {
      toast.error("You don't have permission to delete templates");
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "mdcTemplates", templateToDelete.id));

      // Delete from Storage
      if (templateToDelete.storagePath) {
        const storageRef = ref(storage, templateToDelete.storagePath);
        await deleteObject(storageRef);
      }

      toast.success("Template deleted successfully!");
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleDownload = (item: ExtendedMDCTemplates) => {
    if (item.downloadURL) {
      const link = document.createElement("a");
      link.href = item.downloadURL;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("Download URL not available");
    }
  };

  const handleTemplateDownload = (category: TemplateCategory) => {
    const kebabCase = getKebabCase(category);
    const downloadUrl = `/documents/mdc-templates/${kebabCase}_media-data-collection-template.xlsx`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${kebabCase}_media-data-collection-template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${category} template`);
  };

  const openDeleteDialog = (item: ExtendedMDCTemplates) => {
    setTemplateToDelete(item);
    setDeleteDialogOpen(true);
  };

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

  const fetchData = useCallback(async () => {
    if (!user?.email) {
      console.log("No user email available");
      return;
    }

    console.log("Fetching data for user:", user.email);
    setLoading(true);
    try {
      // First, let's see if there are any documents at all in the collection
      const q = query(collection(db, "mdcTemplates"));
      const querySnapshot = await getDocs(q);
      console.log("Total documents in collection:", querySnapshot.size);

      const mapped = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ExtendedMDCTemplates[];

      console.log("Mapped data:", mapped);
      setData(mapped);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!userLoading) {
      fetchProfile();
    }
  }, [userLoading, fetchProfile]);

  useEffect(() => {
    if (!userLoading && !profileLoading) {
      fetchData();
    }
  }, [userLoading, profileLoading, fetchData]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: unknown) => {
    if (!date) return "N/A";
    try {
      return new Date(date as string).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  if (loading || userLoading || profileLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Media Data Collection Templates
          </h1>
          <p className="text-muted-foreground mt-2">
            This page enables the uploading of filled media data collection
            templates.
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Download
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {TEMPLATE_CATEGORIES.map((category) => (
                <DropdownMenuItem
                  key={category.display}
                  onClick={() => handleTemplateDownload(category.display)}
                >
                  {category.display}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {canUploadOrDelete && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload MDC Template</DialogTitle>
                  <DialogDescription>
                    Upload a completed MDC template file.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="category">Template Category</label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) =>
                        setSelectedCategory(value as TemplateCategory)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select template category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((category) => (
                          <SelectItem
                            key={category.display}
                            value={category.display}
                          >
                            {category.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="file">Template File</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFileUpload}
                    disabled={uploading || !selectedFile || !selectedCategory}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No templates uploaded yet.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.id.slice(0, 5)}
                  </TableCell>
                  <TableCell>{item.fileName}</TableCell>
                  <TableCell>
                    {item.templateCategory ? (
                      <Badge
                        className={getCategoryColor(item.templateCategory)}
                      >
                        {item.templateCategory}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                  <TableCell>{item.uploadedBy}</TableCell>
                  <TableCell>{formatDate(item.uploadedAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canUploadOrDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(item)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{templateToDelete?.fileName}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
