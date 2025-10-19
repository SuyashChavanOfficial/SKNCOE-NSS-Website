import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardPoster = () => {
  const { toast } = useToast();
  const [posters, setPosters] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [formData, setFormData] = useState({
    caption: "",
    media: "",
    mediaId: "",
    mediaType: "image",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all posters
  const fetchPosters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/poster/all`);
      const data = await res.json();
      if (res.ok) setPosters(data.posters || []);
      else setPosters([]);
    } catch (err) {
      console.log(err);
      toast({ title: "Failed to fetch posters" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({ caption: "", media: "", mediaId: "", mediaType: "image" });
    setFile(null);
    setEditingPoster(null);
    setPopupOpen(false);
  };

  // Handle submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caption || (!formData.media && !file))
      return toast({ title: "Fill all fields!" });

    try {
      let mediaUrl = formData.media;
      let mediaId = formData.mediaId;
      let mediaType = formData.mediaType;

      if (file) {
        setUploading(true);
        const uploadedFile = await uploadFile(file);
        mediaUrl = await getFileUrl(uploadedFile.$id);
        mediaId = uploadedFile.$id;
        mediaType = file.type.startsWith("video") ? "video" : "image";
        setUploading(false);
      }

      const posterData = {
        caption: formData.caption,
        media: mediaUrl,
        mediaId,
        mediaType,
      };

      let res;
      if (editingPoster) {
        // Update existing poster
        res = await fetch(`${API_URL}/api/poster/update/${editingPoster._id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(posterData),
        });
      } else {
        // Create new poster
        res = await fetch(`${API_URL}/api/poster/create`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(posterData),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        if (file) {
          await fetch(`${API_URL}/api/upload/delete/${mediaId}`, {
            method: "DELETE",
            credentials: "include",
          });
        }
        return toast({ title: data.message || "Something went wrong!" });
      }

      toast({
        title: editingPoster
          ? "Poster updated successfully!"
          : "Poster added successfully!",
      });
      resetForm();
      fetchPosters();
    } catch (err) {
      console.log(err);
      toast({ title: "Something went wrong!" });
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (posterId, mediaId) => {
    try {
      const res = await fetch(`${API_URL}/api/poster/delete/${posterId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return toast({ title: data.message || "Delete failed!" });
      toast({ title: "Poster deleted successfully!" });
      fetchPosters();
    } catch (err) {
      console.log(err);
      toast({ title: "Something went wrong!" });
    }
  };

  // Handle edit
  const handleEdit = (poster) => {
    setEditingPoster(poster);
    setFormData({
      caption: poster.caption,
      media: poster.media,
      mediaId: poster.mediaId,
      mediaType: poster.mediaType,
    });
    setFile(null);
    setPopupOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Posters</h2>
        <Button onClick={() => setPopupOpen(true)}>Add Poster</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner className="w-8 h-8 animate-spin" />
        </div>
      ) : posters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posters.map((poster) => (
            <div key={poster._id} className="border p-4 rounded shadow-md">
              {poster.mediaType === "video" ? (
                <video
                  src={poster.media}
                  className="w-full h-48 object-cover rounded mb-3"
                  controls
                />
              ) : (
                <img
                  src={poster.media}
                  alt="Poster"
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}

              <p className="text-gray-700 font-medium mb-2 line-clamp-3">
                {poster.caption}
              </p>
              <p className="text-gray-500 text-sm mb-3">
                {format(new Date(poster.date), "do MMMM, yyyy")}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(poster)}
                  className="flex-1"
                >
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete this poster?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600"
                        onClick={() => handleDelete(poster._id, poster.mediaId)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No posters available.</p>
      )}

      {/* Popup Form */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingPoster ? "Edit Poster" : "Add Poster"}
            </h3>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* File input */}
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
              />

              {/* Preview: New file OR existing media */}
              {file ? (
                file.type.startsWith("video") ? (
                  <video
                    src={URL.createObjectURL(file)}
                    controls
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-40 object-cover rounded"
                  />
                )
              ) : formData.media ? (
                formData.mediaType === "video" ? (
                  <video
                    src={formData.media}
                    controls
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <img
                    src={formData.media}
                    alt="preview"
                    className="w-full h-40 object-cover rounded"
                  />
                )
              ) : null}

              {/* Caption */}
              <Textarea
                placeholder="Caption"
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                className="h-36"
                required
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading} className="flex-1">
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <Spinner className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  ) : editingPoster ? (
                    "Update Poster"
                  ) : (
                    "Save Poster"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPoster;
