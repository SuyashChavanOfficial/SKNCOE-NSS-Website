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
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { useToast } from "../../hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "@/components/shared/Pagination";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const VOLUNTEERS_PER_PAGE = 10; // Define how many volunteers to show per page

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

// Helper for status colors
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
  const { currentUser } = useSelector((state) => state.user);
  const [volunteers, setVolunteers] = useState([]);
  const [totalPages, setTotalPages] = useState(1); // For Pagination
  const [formData, setFormData] = useState(initialFormData);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // Get current page from URL for pagination
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page")) || 1;

  const fetchVolunteers = async () => {
    try {
      // Calculate startIndex based on current page
      const startIndex = (currentPage - 1) * VOLUNTEERS_PER_PAGE;
      const res = await fetch(
        `${API_URL}/api/user/getVolunteers?startIndex=${startIndex}&limit=${VOLUNTEERS_PER_PAGE}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setVolunteers(data.volunteers);
        // Calculate total pages
        setTotalPages(Math.ceil(data.totalVolunteers / VOLUNTEERS_PER_PAGE));
      } else {
        toast({ title: "Error", description: data.message });
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Error", description: "Failed to fetch volunteers" });
    }
  };

  // Re-fetch volunteers when page changes (location.search)
  useEffect(() => {
    if (currentUser?.isAdmin) fetchVolunteers();
  }, [currentUser._id, location.search]);

  const checkIsAdmin = async () => {
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

  // Combined file selection and upload
  const handleFileChangeAndUpload = async (e) => {
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

    // --- Start immediate upload ---
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

      // Set the new picture info into the form state for preview
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
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openDialog = (volunteer = null) => {
    setEditingVolunteer(volunteer);
    if (volunteer) {
      setFormData({
        username: volunteer.username || "",
        email: volunteer.email || "",
        password: "",
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
      setFormData(initialFormData);
    }
    setUploading(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
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

        if (!body.password) {
          delete body.password;
        }

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
        if (editingVolunteer) {
          setVolunteers((prev) =>
            prev.map((v) => (v._id === data._id ? data : v))
          );
          toast({ title: "Success", description: "Volunteer updated." });
        } else {
          setVolunteers((prev) => [data, ...prev]);
          toast({ title: "Success", description: "Volunteer created." });
        }
        setDialogOpen(false);
        setEditingVolunteer(null);
        fetchVolunteers(); // Re-fetch to ensure pagination is correct
      } else {
        toast({ title: "Error", description: data.message });
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Error", description: "Operation failed." });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/user/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "Volunteer deleted." });
        // After deletion, re-fetch volunteers for the current page
        fetchVolunteers();
      } else {
        toast({ title: "Error", description: data.message });
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Error", description: "Failed to delete volunteer." });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Volunteers</h1>
        <Button onClick={() => openDialog()}>Add Volunteer</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingVolunteer ? "Edit Volunteer" : "Add New Volunteer"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the volunteer. Required fields are marked
              with *.
            </DialogDescription>
          </DialogHeader>
          {/* Removed p-4 from ScrollArea, DialogContent p-6 will handle spacing */}
          <ScrollArea className="max-h-[70vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {/* --- Profile Picture Upload --- */}
              <div className="sm:col-span-2 space-y-2">
                <Label>Profile Picture (Max 250KB)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full border bg-gray-100 flex items-center justify-center">
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
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChangeAndUpload} // Changed handler
                      className="file:text-xs"
                      disabled={uploading}
                    />
                    {/* Removed the separate upload button */}
                  </div>
                </div>
              </div>

              {/* --- Required Fields --- */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nssID">NSS ID *</Label>
                <Input
                  id="nssID"
                  placeholder="e.g., SKNCOE/NSS/24/001"
                  value={formData.nssID}
                  onChange={(e) =>
                    setFormData({ ...formData, nssID: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch *</Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, batch: value })
                  }
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
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password{" "}
                  {editingVolunteer ? "(Leave blank to keep same)" : "*"}
                </Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* --- Optional Fields --- */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prnNumber">PRN Number</Label>
                <Input
                  id="prnNumber"
                  placeholder="PRN Number"
                  value={formData.prnNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, prnNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  type="number"
                  placeholder="Roll Number"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eligibilityNumber">Eligibility Number</Label>
                <Input
                  id="eligibilityNumber"
                  type="number"
                  placeholder="Eligibility Number"
                  value={formData.eligibilityNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibilityNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </ScrollArea>
          <div className="pt-4">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={uploading}
            >
              {uploading
                ? "Waiting for image..."
                : editingVolunteer
                ? "Update Volunteer"
                : "Save Volunteer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Volunteers Table (Desktop View) --- */}
      <ScrollArea className="border rounded-md hidden md:block">
        <Table className="min-w-[1200px]">
          <TableCaption>
            {volunteers.length > 0
              ? "List of all volunteers"
              : "No volunteers found."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Picture</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>NSS ID</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>PRN No.</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.map((v) => (
              <TableRow key={v._id}>
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
                <TableCell className="font-medium">{v.username}</TableCell>
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
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(v)}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the volunteer account for "{v.username}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(v._id)}
                        >
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* --- Volunteers List (Mobile View) --- */}
      <div className="md:hidden space-y-4">
        {volunteers.length > 0 ? (
          volunteers.map((v) => (
            <div
              key={v._id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    v.profilePicture ||
                    "https://cdn-icons-png.flaticon.com/128/149/149071.png"
                  }
                  alt={v.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{v.username}</h3>
                  <p className="text-sm text-gray-600">{v.nssID || "N/A"}</p>
                  <p className="text-sm text-gray-600">
                    Batch: {v.batch || "N/A"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize self-start ${getStatusClass(
                    v.status
                  )}`}
                >
                  {v.status}
                </span>
              </div>
              <div className="mt-4 border-t pt-4 space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong> {v.email}
                </p>
                <p className="text-sm">
                  <strong>DOB:</strong> {formatDate(v.dob)}
                </p>
                <p className="text-sm">
                  <strong>PRN:</strong> {v.prnNumber || "N/A"}
                </p>
                <p className="text-sm">
                  <strong>Roll No:</strong> {v.rollNumber || "N/A"}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => openDialog(v)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="w-full">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the volunteer account for "{v.username}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(v._id)}
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No volunteers found.
          </p>
        )}
      </div>

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => {
            queryParams.set("page", page);
            navigate(`${location.pathname}?${queryParams.toString()}`);
          }}
        />
      )}
    </div>
  );
};

export default DashboardVolunteers;
