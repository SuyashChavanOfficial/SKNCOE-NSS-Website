import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const EditActivity = () => {
  const { activityId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

    try {
      setUploading(true);

      const uploadedFile = await uploadFile(file);
      const url = await getFileUrl(uploadedFile.$id);

      // if replacing an old poster, mark it for deletion
      const update = {
        ...formData,
        poster: url,
        posterId: uploadedFile.$id,
      };
      if (formData.posterId) {
        update.deleteOldPosterId = formData.posterId;
      }

      setFormData(update);
      toast({ title: "Poster uploaded successfully!" });
    } catch (err) {
      toast({ title: "Poster upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/activity/update/${activityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
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
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Activity</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Input
          type="datetime-local"
          value={formData.startDate?.slice(0, 16)}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          required
        />

        <Input
          type="number"
          placeholder="Duration (hours)"
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
          className="w-full p-2 border rounded"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        {/* Poster Upload */}
        <div className="flex gap-4 items-center border-2 border-dashed p-3 rounded">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            className="bg-slate-700 text-white"
            onClick={handleUploadPoster}
          >
            {uploading ? "Uploading..." : "Upload Poster"}
          </Button>
        </div>

        {formData.poster && (
          <img
            src={formData.poster}
            alt="Poster Preview"
            className="w-full h-64 object-cover mt-2 rounded"
          />
        )}

        <Button type="submit" className="bg-green-600 text-white">
          Update Activity
        </Button>
      </form>
    </div>
  );
};

export default EditActivity;
