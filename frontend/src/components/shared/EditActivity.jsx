import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const MAX_FILE_SIZE = 500 * 1024;

const EditActivity = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const activityId = urlParams.get("id");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
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
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity/get/${activityId}`);
        const data = await res.json();
        if (res.ok) setFormData(data.activity);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivity();
  }, [activityId]);

  const handleUploadPoster = async () => {
    if (!file) {
      toast({ title: "Please select an image first" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "Poster must be less than 500 KB" });
      return;
    }
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
    try {
      setUploading(true);
      const uploadedFile = await uploadFile(file);
      if (!uploadedFile) throw new Error("File upload failed!");
      uploadedFileId = uploadedFile.$id;
      const url = await getFileUrl(uploadedFile.$id);
      setFormData({ ...formData, poster: url, posterId: uploadedFile.$id });
      toast({ title: "Poster uploaded successfully!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Poster upload failed" });
      if (uploadedFileId) {
        try {
          await fetch(`${API_URL}/api/upload/delete/${uploadedFileId}`, {
            method: "DELETE",
            credentials: "include",
          });
        } catch {}
      }
    } finally {
      setUploading(false);
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
    try {
      const res = await fetch(`${API_URL}/api/activity/update/${activityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          expectedDurationHours: Number(formData.expectedDurationHours),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.message || "Failed to update activity" });
        return;
      }
      toast({ title: "Activity updated successfully!" });
      navigate("/dashboard?tab=activities");
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong!" });
    }
  };

  if (!formData) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col">
      <div className="mb-4 w-full">
        <button
          onClick={() => navigate("/dashboard?tab=activities")}
          className="flex items-center gap-2 text-blue-900 hover:text-red-700 font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-4">Edit Activity</h2>

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
          value={
            formData.startDate
              ? new Date(formData.startDate).toISOString().slice(0, 16)
              : ""
          }
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

        <div className="flex gap-4 items-center border-2 border-dashed p-3 rounded w-full">
          <Input
            type="file"
            accept="image/*"
            className="w-full h-12 text-lg"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            className="bg-slate-700 text-white h-12 px-6"
            onClick={handleUploadPoster}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Poster"}
          </Button>
        </div>

        {formData.poster && (
          <img
            src={formData.poster}
            alt="Poster Preview"
            className="w-full h-72 object-cover mt-2 rounded"
          />
        )}

        <Button
          type="submit"
          className="bg-green-600 text-white h-12 w-full text-sm"
        >
          Update Activity
        </Button>
      </form>
    </div>
  );
};

export default EditActivity;
