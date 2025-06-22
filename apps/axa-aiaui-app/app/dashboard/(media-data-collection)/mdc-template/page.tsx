"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  orderBy,
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
import { Badge } from "@/components/ui/badge";
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
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/hooks/use-user";
import { MDCTemplates } from "@/schemas/firestore";

export default function MDCTemplatePage() {
  const [data, setData] = useState<(MDCTemplates & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<
    (MDCTemplates & { id: string }) | null
  >(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

      // Create a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `mdc-templates/${timestamp}_${selectedFile.name}`;

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
            });

            toast.success("Template uploaded successfully!");
            setDialogOpen(false);
            setSelectedFile(null);
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

  const handleDownload = (item: MDCTemplates & { id: string }) => {
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

  const openDeleteDialog = (item: MDCTemplates & { id: string }) => {
    setTemplateToDelete(item);
    setDeleteDialogOpen(true);
  };

  const fetchData = async () => {
    if (!user?.email) {
      console.log("No user email available");
      return;
    }

    console.log("Fetching data for user:", user.email);
    setLoading(true);
    try {
      // First, let's see if there are any documents at all in the collection
      const allDocsQuery = query(collection(db, "mdcTemplates"));
      const allDocsSnapshot = await getDocs(allDocsQuery);
      console.log("Total documents in mdcTemplates:", allDocsSnapshot.size);

      if (allDocsSnapshot.size > 0) {
        console.log("All documents data:");
        allDocsSnapshot.docs.forEach((doc, index) => {
          console.log(`Document ${index}:`, doc.data());
        });
      }

      // Try the filtered query without orderBy first
      const q = query(
        collection(db, "mdcTemplates"),
        where("uploadedBy", "==", user.email)
      );
      const querySnapshot = await getDocs(q);
      console.log("Documents for current user:", querySnapshot.size);

      if (querySnapshot.size > 0) {
        console.log("User documents data:");
        querySnapshot.docs.forEach((doc, index) => {
          console.log(`User document ${index}:`, doc.data());
        });
      }

      const mapped = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (MDCTemplates & { id: string })[];

      console.log("Mapped data:", mapped);
      setData(mapped);
    } catch (error) {
      console.error("Error fetching MDC templates:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  }, [user?.email]);

  useEffect(() => {
    async function fetchProfile() {
      if (user?.email) {
        console.log("Fetching profile for user:", user.email);
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        console.log("User profile query result:", snapshot.size, "documents");
        if (!snapshot.empty) {
          const profileData = snapshot.docs[0].data() as { role: string };
          console.log("User profile data:", profileData);
          setProfile(profileData);
        } else {
          console.log("No user profile found");
        }
      } else {
        console.log("No user email available for profile fetch");
      }
      setProfileLoading(false);
    }
    if (!userLoading) {
      fetchProfile();
    }
  }, [user, userLoading]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: any) => {
    if (!date) return "Unknown";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  if (loading || userLoading || profileLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading MDC templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Media Data Collection Template
          </h1>
          <p className="text-muted-foreground mt-2">
            Media Data Collection templates and configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              // Download the Excel template file
              const link = document.createElement("a");
              link.href =
                "/media-data-collection-template_master template_VF_211124_2.xlsx";
              link.download =
                "media-data-collection-template_master template_VF_211124_2.xlsx";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          {canUploadOrDelete && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Filled Template</DialogTitle>
                  <DialogDescription>
                    Upload your completed Media Data Collection template file.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        console.log("File selected:", file.name);
                      }
                    }}
                    className="w-full"
                  />
                  {selectedFile && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  {uploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Uploading... {uploadProgress.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleFileUpload}
                    disabled={uploading || !selectedFile}
                    className="cursor-pointer"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No templates uploaded yet.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.id.substring(0, 5)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.fileName || "Unknown"}
                  </TableCell>
                  <TableCell>{formatFileSize(item.fileSize || 0)}</TableCell>
                  <TableCell>{formatDate(item.uploadedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canUploadOrDelete && (
                        <Button
                          variant="outline"
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
              Are you sure you want to delete the template{" "}
              <strong>{templateToDelete?.fileName}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTemplateToDelete(null);
              }}
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
