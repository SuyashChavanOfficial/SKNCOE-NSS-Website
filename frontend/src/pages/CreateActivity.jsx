import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";

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

  const handleUploadPoster = async () => {
    if (!file) {
      toast({ title: "Please select an image first" });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "Poster must be less than 500 KB" });
      return;
    }

    try {
      setUploading(true);
      const uploadedFile = await uploadFile(file);
      const url = await getFileUrl(uploadedFile.$id);

      setFormData({ ...formData, poster: url, posterId: uploadedFile.$id });
      toast({ title: "Poster uploaded successfully!" });
    } catch (err) {
      toast({ title: "Poster upload failed" });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/activity/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          expectedDurationHours: Number(formData.expectedDurationHours),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.message || "Failed to create activity" });
        return;
      }

      toast({ title: "Activity created successfully!" });
      navigate("/dashboard?tab=activities");
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong!" });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex items-center flex-col">
      <h2 className="text-3xl font-bold mb-4">Create Activity</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 flex items-center flex-col w-full"
      >
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
            setFormData({
              ...formData,
              expectedDurationHours: e.target.value,
            })
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
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            className="bg-slate-700 text-white h-12 px-6"
            onClick={handleUploadPoster}
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
          className="bg-blue-600 text-white h-12 w-full text-sm"
        >
          Create Activity
        </Button>
      </form>
    </div>
  );
};

export default CreateActivity;
