import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
// Removed Toggle import
import { useToast } from "../../hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "@/components/shared/Pagination";
import { Trash2, Edit, List, LayoutGrid, MoreVertical } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const VOLUNTEERS_PER_PAGE = 10; // This might need adjustment based on card layout density

// ... (initialFormData, batchOptions, statusOptions, getStatusClass remain the same) ...
const initialFormData = {
  username: "",
  email: "",
  password: "",
  nssID: "",
  batch: "",
  status: "active",
  dob: "",
  prnNumber: "",
  eligibilityNumber: "",
  rollNumber: "",
  profilePicture: "",
  profilePictureId: "",
};
const batchOptions = ["24-26", "25-27", "26-28"];
const statusOptions = [
  "active",
  "retired",
  "banned",
  "blacklisted",
  "notListed",
];
const getStatusClass = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "retired":
      return "bg-yellow-100 text-yellow-800";
    case "banned":
      return "bg-red-100 text-red-800";
    case "blacklisted":
      return "bg-gray-900 text-gray-100";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const DashboardVolunteers = () => {
  // ... (useState hooks remain the same) ...
  const { currentUser } = useSelector((state) => state.user);
  const [volunteers, setVolunteers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [isViewingOnly, setIsViewingOnly] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState([]);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [view, setView] = useState("table");
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // ... (location, navigate, queryParams, currentPage remain the same) ...
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page")) || 1;

  // --- Fetching Logic (no changes needed) ---
  const fetchVolunteers = async () => {
    /* ... */
    try {
      const startIndex = (currentPage - 1) * VOLUNTEERS_PER_PAGE;
      const res = await fetch(
        `${API_URL}/api/user/getVolunteers?startIndex=${startIndex}&limit=${VOLUNTEERS_PER_PAGE}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setVolunteers(data.volunteers);
        setTotalPages(Math.ceil(data.totalVolunteers / VOLUNTEERS_PER_PAGE));
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch volunteers",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    if (currentUser?.isAdmin) fetchVolunteers();
    setSelectedVolunteerIds([]);
  }, [currentUser?.isAdmin, location.search]);

  // --- Image Upload Logic (no changes needed) ---
  const checkIsAdmin = async () => {
    /* ... */
    try {
      const res = await fetch(`${API_URL}/api/auth/current`, {
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.user?.isAdmin;
    } catch (err) {
      console.error("Auth check failed:", err);
      return false;
    }
  };
  const handleFileChangeAndUpload = async (e) => {
    /* ... */
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const maxSize = 250 * 1024; // 250 KB limit
    if (selectedFile.size > maxSize) {
      return toast({
        title: "File too large",
        description: "Profile picture must be under 250 KB.",
        variant: "destructive",
      });
    }
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return toast({
        title: "Authorization Failed",
        description: "You are not authorized to upload images.",
        variant: "destructive",
      });
    }
    let uploadedFileId = null;
    try {
      setUploading(true);
      const uploadedFile = await uploadFile(selectedFile);
      if (!uploadedFile) throw new Error("File upload failed!");
      uploadedFileId = uploadedFile.$id;
      const profilePictureUrl = await getFileUrl(uploadedFile.$id);
      setFormData((prevFormData) => ({
        ...prevFormData,
        profilePicture: profilePictureUrl,
        profilePictureId: uploadedFile.$id,
      }));
      toast({ title: "Image Uploaded Successfully!" });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({ title: "Image Upload Failed!", variant: "destructive" });
      if (uploadedFileId) {
        try {
          await fetch(`${API_URL}/api/upload/delete/${uploadedFileId}`, {
            method: "DELETE",
            credentials: "include",
          });
        } catch (delErr) {
          console.error("Failed to delete orphan file:", delErr);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // --- Dialog and Save Logic (no changes needed) ---
  const openDialog = (volunteer = null, viewOnly = true) => {
    /* ... */
    setEditingVolunteer(volunteer);
    setIsViewingOnly(viewOnly); // Set mode
    if (volunteer) {
      setFormData({
        username: volunteer.username || "",
        email: volunteer.email || "",
        password: "", // Always clear password field on open
        nssID: volunteer.nssID || "",
        batch: volunteer.batch || "",
        status: volunteer.status || "active",
        dob: volunteer.dob ? volunteer.dob.split("T")[0] : "",
        prnNumber: volunteer.prnNumber || "",
        eligibilityNumber: volunteer.eligibilityNumber || "",
        rollNumber: volunteer.rollNumber || "",
        profilePicture: volunteer.profilePicture || "",
        profilePictureId: volunteer.profilePictureId || "",
      });
    } else {
      // Add mode (always editable)
      setFormData(initialFormData);
      setIsViewingOnly(false);
    }
    setUploading(false); // Reset upload state
    setDialogOpen(true);
  };
  const handleSave = async () => {
    /* ... */
    if (
      !formData.username ||
      !formData.email ||
      !formData.nssID ||
      !formData.batch
    ) {
      return toast({
        title: "Missing Fields",
        description: "Username, Email, NSS ID, and Batch are required.",
        variant: "destructive",
      });
    }
    if (!editingVolunteer && !formData.password) {
      return toast({
        title: "Missing Fields",
        description: "Password is required for new volunteers.",
        variant: "destructive",
      });
    }

    try {
      let url;
      let method;
      const body = { ...formData };

      if (editingVolunteer) {
        url = `${API_URL}/api/user/update/${editingVolunteer._id}`;
        method = "PUT";
        if (!body.password) delete body.password;
        if (
          editingVolunteer.profilePictureId &&
          formData.profilePictureId !== editingVolunteer.profilePictureId
        ) {
          body.deleteOldPictureId = editingVolunteer.profilePictureId;
        }
      } else {
        url = `${API_URL}/api/user/create`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: editingVolunteer
            ? "Volunteer updated."
            : "Volunteer created.",
        });
        setDialogOpen(false);
        setEditingVolunteer(null);
        fetchVolunteers();
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Operation failed.",
        variant: "destructive",
      });
    }
  };

  // --- Bulk Action Handlers (no changes needed) ---
  const handleSelectAll = (checked) => {
    /* ... */
    if (checked) {
      setSelectedVolunteerIds(volunteers.map((v) => v._id));
    } else {
      setSelectedVolunteerIds([]);
    }
  };
  const handleSelectOne = (volunteerId, checked) => {
    /* ... */
    if (checked) {
      setSelectedVolunteerIds((prev) => [...prev, volunteerId]);
    } else {
      setSelectedVolunteerIds((prev) =>
        prev.filter((id) => id !== volunteerId)
      );
    }
  };
  const handleBulkDelete = async () => {
    /* ... */
    if (selectedVolunteerIds.length === 0) return;
    try {
      const deletePromises = selectedVolunteerIds.map((id) =>
        fetch(`${API_URL}/api/user/delete/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
      );
      const results = await Promise.all(deletePromises);
      const allOk = results.every((res) => res.ok);
      if (allOk) {
        toast({
          title: "Success",
          description: `${selectedVolunteerIds.length} volunteer(s) deleted.`,
        });
        setSelectedVolunteerIds([]);
        fetchVolunteers();
      } else {
        const errorMessages = await Promise.all(
          results
            .filter((res) => !res.ok)
            .map((res) =>
              res
                .json()
                .then(
                  (data) =>
                    data.message || `Failed for ID ${res.url.split("/").pop()}`
                )
            )
        );
        throw new Error(`Some deletions failed: ${errorMessages.join(", ")}`);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Bulk Delete Error",
        description: err.message || "Could not delete all selected volunteers.",
        variant: "destructive",
      });
    }
  };
  const handleBulkStatusSave = async () => {
    /* ... */
    if (selectedVolunteerIds.length === 0 || !targetStatus) return;
    try {
      const updatePromises = selectedVolunteerIds.map((id) =>
        fetch(`${API_URL}/api/user/update/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: targetStatus }),
        })
      );
      const results = await Promise.all(updatePromises);
      const allOk = results.every((res) => res.ok);
      if (allOk) {
        toast({
          title: "Success",
          description: `Status updated for ${selectedVolunteerIds.length} volunteer(s).`,
        });
        setSelectedVolunteerIds([]);
        setBulkStatusDialogOpen(false);
        setTargetStatus("");
        fetchVolunteers();
      } else {
        const errorMessages = await Promise.all(
          results
            .filter((res) => !res.ok)
            .map((res) =>
              res
                .json()
                .then(
                  (data) =>
                    data.message || `Failed for ID ${res.url.split("/").pop()}`
                )
            )
        );
        throw new Error(
          `Some status updates failed: ${errorMessages.join(", ")}`
        );
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Bulk Status Error",
        description:
          err.message || "Could not update status for all selected volunteers.",
        variant: "destructive",
      });
    }
  };

  // --- Helper function (no changes needed) ---
  const formatDate = (dateString) => {
    /* ... */
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const isAllSelected =
    volunteers.length > 0 && selectedVolunteerIds.length === volunteers.length;
  const isAnySelected = selectedVolunteerIds.length > 0;

  const toggleView = () => {
    setView((prev) => (prev === "table" ? "card" : "table"));
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold order-1 sm:order-1">Volunteers</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-2">
          <div className="sm:hidden">
            {" "}
            {/* Mobile Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4 mr-1" /> Actions (
                  {selectedVolunteerIds.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Delete Action */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      disabled={!isAnySelected}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    {" "}
                    {/* ... */}
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete the selected{" "}
                        {selectedVolunteerIds.length} volunteer(s)? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button variant="destructive" onClick={handleBulkDelete}>
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {/* Status Action */}
                <Dialog
                  open={bulkStatusDialogOpen}
                  onOpenChange={setBulkStatusDialogOpen}
                >
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      disabled={!isAnySelected}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="w-4 h-4 mr-2" /> Change Status
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    {" "}
                    {/* ... */}
                    <DialogHeader>
                      <DialogTitle>
                        Change Status for Selected Volunteers
                      </DialogTitle>
                      <DialogDescription>
                        Select the new status for the{" "}
                        {selectedVolunteerIds.length} selected volunteer(s).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="bulkStatusMobile">New Status *</Label>
                      <Select
                        value={targetStatus}
                        onValueChange={setTargetStatus}
                      >
                        <SelectTrigger id="bulkStatusMobile">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setBulkStatusDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkStatusSave}
                        disabled={!targetStatus}
                      >
                        Apply Status Change
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="hidden sm:flex gap-2">
            {" "}
            {/* Desktop Actions */}
            {/* ... Desktop bulk action buttons ... */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!isAnySelected}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete (
                  {selectedVolunteerIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete the selected{" "}
                    {selectedVolunteerIds.length} volunteer(s)? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Dialog
              open={bulkStatusDialogOpen}
              onOpenChange={setBulkStatusDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!isAnySelected}>
                  <Edit className="w-4 h-4 mr-2" /> Change Status (
                  {selectedVolunteerIds.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Change Status for Selected Volunteers
                  </DialogTitle>
                  <DialogDescription>
                    Select the new status for the {selectedVolunteerIds.length}{" "}
                    selected volunteer(s).
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="bulkStatusDesktop">New Status *</Label>
                  <Select value={targetStatus} onValueChange={setTargetStatus}>
                    <SelectTrigger id="bulkStatusDesktop">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setBulkStatusDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkStatusSave}
                    disabled={!targetStatus}
                  >
                    Apply Status Change
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Button
            size="sm"
            onClick={() => openDialog(null, false)}
            className="w-full sm:w-auto"
          >
            Add Volunteer
          </Button>
          <div className="flex border rounded-md p-0.5 bg-muted">
            {" "}
            {/* View Toggle */}
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={toggleView}
              className="px-2 py-1 h-auto transition-colors duration-200" // Added transition
              aria-label="Table View"
            >
              {" "}
              <List className="h-4 w-4" />{" "}
            </Button>
            <Button
              variant={view === "card" ? "secondary" : "ghost"}
              size="icon"
              onClick={toggleView}
              className="px-2 py-1 h-auto transition-colors duration-200" // Added transition
              aria-label="Card View"
            >
              {" "}
              <LayoutGrid className="h-4 w-4" />{" "}
            </Button>
          </div>
        </div>
      </div>

      {/* View/Edit Volunteer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {/* ... Dialog Content ... */}
          <DialogHeader>
            <DialogTitle>
              {editingVolunteer
                ? isViewingOnly
                  ? "View Volunteer"
                  : "Edit Volunteer"
                : "Add New Volunteer"}
            </DialogTitle>
            <DialogDescription>
              {isViewingOnly
                ? "Viewing volunteer details."
                : "Fill in the details for the volunteer. Required fields are marked with *."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] -mx-6 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {!isViewingOnly && (
                <div className="sm:col-span-2 space-y-2">
                  <Label>Profile Picture (Max 250KB)</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-full border bg-gray-100 flex items-center justify-center overflow-hidden">
                      {uploading ? (
                        <DotLottieReact
                          src="https://lottie.host/8e929f18-c53a-4d1e-94f0-9bc6cf21fbaf/8qmvB7P8wA.lottie"
                          loop
                          autoplay
                          style={{ width: "80%", height: "80%" }}
                        />
                      ) : (
                        <img
                          src={
                            formData.profilePicture ||
                            "https://cdn-icons-png.flaticon.com/128/149/149071.png"
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChangeAndUpload}
                        className="file:text-xs"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>
              )}
              {isViewingOnly && editingVolunteer?.profilePicture && (
                <div className="sm:col-span-2 space-y-2">
                  <Label>Profile Picture</Label>
                  <img
                    src={editingVolunteer.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full border"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={isViewingOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nssID">NSS ID *</Label>
                <Input
                  id="nssID"
                  value={formData.nssID}
                  onChange={(e) =>
                    setFormData({ ...formData, nssID: e.target.value })
                  }
                  disabled={isViewingOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isViewingOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch *</Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, batch: value })
                  }
                  disabled={isViewingOnly}
                >
                  <SelectTrigger id="batch">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batchOptions.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={isViewingOnly}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!editingVolunteer && !isViewingOnly && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              )}
              {editingVolunteer && !isViewingOnly && (
                <div className="space-y-2">
                  <Label htmlFor="password">New Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Leave blank to keep same"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  disabled={isViewingOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prnNumber">PRN Number</Label>
                <Input
                  id="prnNumber"
                  value={formData.prnNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, prnNumber: e.target.value })
                  }
                  disabled={isViewingOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNumber: e.target.value })
                  }
                  disabled={isViewingOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eligibilityNumber">Eligibility Number</Label>
                <Input
                  id="eligibilityNumber"
                  type="number"
                  value={formData.eligibilityNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibilityNumber: e.target.value,
                    })
                  }
                  disabled={isViewingOnly}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-end gap-2">
            {isViewingOnly ? (
              <>
                <Button
                  onClick={() => setIsViewingOnly(false)}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={uploading}
                  className="w-full sm:w-auto"
                >
                  {uploading
                    ? "Waiting..."
                    : editingVolunteer
                    ? "Save Changes"
                    : "Save Volunteer"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Conditional Rendering based on view state --- */}
      {view === "table" ? (
        /* --- Volunteers Table --- */
        <div className="border rounded-md overflow-x-auto">
          <Table className="min-w-[1200px]">
            {/* ... Table Content ... */}
            <TableCaption>
              {volunteers.length > 0
                ? "List of all volunteers"
                : "No volunteers found."}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead>Picture</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>NSS ID</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>PRN No.</TableHead>
                <TableHead>Roll No.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((v) => (
                <TableRow
                  key={v._id}
                  data-state={
                    selectedVolunteerIds.includes(v._id) ? "selected" : ""
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedVolunteerIds.includes(v._id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(v._id, checked)
                      }
                      aria-label={`Select row for ${v.username}`}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={
                        v.profilePicture ||
                        "https://cdn-icons-png.flaticon.com/128/149/149071.png"
                      }
                      alt={v.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => openDialog(v, true)}
                  >
                    {v.username}
                  </TableCell>
                  <TableCell>{v.nssID || "N/A"}</TableCell>
                  <TableCell>{v.batch || "N/A"}</TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                        v.status
                      )}`}
                    >
                      {v.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(v.dob)}</TableCell>
                  <TableCell>{v.prnNumber || "N/A"}</TableCell>
                  <TableCell>{v.rollNumber || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* --- Volunteers Card List --- */
        <div className="space-y-4">
          {/* Card rendering logic */}
          {volunteers.length > 0 ? (
            volunteers.map((v) => (
              <div
                key={v._id}
                className="border rounded-lg p-4 bg-white shadow-sm flex gap-4 items-start"
              >
                <div className="flex-shrink-0 pt-1">
                  <Checkbox
                    checked={selectedVolunteerIds.includes(v._id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(v._id, checked)
                    }
                    aria-label={`Select ${v.username}`}
                  />
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <img
                    src={
                      v.profilePicture ||
                      "https://cdn-icons-png.flaticon.com/128/149/149071.png"
                    }
                    alt={v.username}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3
                        className="text-lg font-bold cursor-pointer hover:underline truncate"
                        onClick={() => openDialog(v, true)}
                        title={v.username}
                      >
                        {v.username}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize self-start flex-shrink-0 ${getStatusClass(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <p
                      className="text-sm text-gray-600 truncate"
                      title={v.nssID}
                    >
                      {v.nssID || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Batch: {v.batch || "N/A"}
                    </p>
                    <div className="mt-2 pt-2 border-t space-y-1 text-sm text-gray-500">
                      <p className="truncate" title={v.email}>
                        <strong>Email:</strong> {v.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No volunteers found.
            </p>
          )}
        </div>
      )}

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  );
};

export default DashboardVolunteers;
