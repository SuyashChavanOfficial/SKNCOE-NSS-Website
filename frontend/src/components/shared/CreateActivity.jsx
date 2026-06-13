import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const MAX_FILE_SIZE = 500 * 1024; // 500 KB

const CreateActivity = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    expectedDurationHours: "",
    description: "",
    poster: "",
    posterId: "",
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const checkIsAdmin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/current`, {
        credentials: "include",
      });
      if (!res.ok) return null;

      const data = await res.json();
      if (!data?.user) return null;

      return data.user?.isAdmin ? data.user : null;
    } catch (err) {
      console.error("Auth check failed:", err);
      return null;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({ title: "Poster must be less than 500 KB" });
        e.target.value = "";
        setFile(null);
        return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = await checkIsAdmin();
    if (!user) {
      toast({
        title: "You are not authorized to perform this action.",
        description: "Try signing in again.",
        variant: "destructive",
      });
      return;
    }

    let uploadedFileId = null;
    let posterUrl = formData.poster;
    let posterId = formData.posterId;

    try {
      setUploading(true);

      // 1. Upload file if selected
      if (file) {
        const uploadedFile = await uploadFile(file);
        if (!uploadedFile) throw new Error("File upload failed!");
        uploadedFileId = uploadedFile.$id;
        posterUrl = await getFileUrl(uploadedFile.$id);
        posterId = uploadedFile.$id;
      } else {
        toast({ title: "A poster is required to create an activity!" });
        setUploading(false);
        return;
      }

      // 2. Submit data to backend
      const res = await fetch(`${API_URL}/api/activity/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          poster: posterUrl,
          posterId: posterId,
          expectedDurationHours: Number(formData.expectedDurationHours),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Transaction failed! Delete newly uploaded file to prevent orphan
        if (uploadedFileId) {
          await fetch(`${API_URL}/api/upload/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: uploadedFileId }),
            credentials: "include",
          }).catch((delErr) => console.error("Clean up upload failed:", delErr));
        }
        toast({ title: data.message || "Failed to create activity" });
        setUploading(false);
        return;
      }

      toast({ title: "Activity created successfully!" });
      setUploading(false);
      navigate("/dashboard?tab=activities");
    } catch (err) {
      console.error(err);
      // Delete newly uploaded file on catch block too
      if (uploadedFileId) {
        await fetch(`${API_URL}/api/upload/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: uploadedFileId }),
          credentials: "include",
        }).catch((delErr) => console.error("Clean up upload failed:", delErr));
      }
      toast({ title: "Something went wrong!" });
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col">
      {/* Back button */}
      <div className="mb-4 w-full">
        <button
          onClick={() => navigate("/dashboard?tab=activities")}
          className="flex items-center gap-2 text-blue-900 hover:text-red-700 font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-4">Create Activity</h2>

      <form className="space-y-6 flex flex-col w-full" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Title"
          className="w-full h-12 text-lg"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Input
          type="datetime-local"
          className="w-full h-12 text-lg"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          required
        />

        <Input
          type="number"
          placeholder="Duration (hours)"
          className="w-full h-12 text-lg"
          value={formData.expectedDurationHours}
          onChange={(e) =>
            setFormData({ ...formData, expectedDurationHours: e.target.value })
          }
          required
        />

        <textarea
          placeholder="Description"
          className="w-full h-40 p-3 border rounded text-md"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        {/* Poster Upload */}
        <div className="flex gap-4 items-center border-2 border-dashed p-3 rounded w-full">
          <Input
            type="file"
            accept="image/*"
            className="w-full h-12 text-lg"
            onChange={handleFileChange}
          />
        </div>

        {(file || formData.poster) && (
          <img
            src={file ? URL.createObjectURL(file) : formData.poster}
            alt="Poster Preview"
            className="w-full h-72 object-cover mt-2 rounded"
          />
        )}

        <Button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white h-12 w-full text-sm"
        >
          {uploading ? "Creating Activity..." : "Create Activity"}
        </Button>
      </form>
    </div>
  );
};

export default CreateActivity;
