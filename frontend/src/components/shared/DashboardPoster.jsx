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
  const [poster, setPoster] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    caption: "",
    media: "",
    mediaId: "",
    mediaType: "image",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch today's poster
  const fetchPoster = async () => {
    try {
      const res = await fetch(`${API_URL}/api/poster/today`);
      const data = await res.json();
      if (res.ok && data.poster) setPoster(data.poster);
      else setPoster(null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPoster();
  }, []);

  // Handle submit
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
      const res = await fetch(`${API_URL}/api/poster/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(posterData),
      });

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
      toast({ title: "Poster added successfully!" });
      setPopupOpen(false);
      setFile(null);
      setFormData({ caption: "", media: "", mediaId: "", mediaType: "image" });
      fetchPoster();
    } catch (err) {
      console.log(err);
      toast({ title: "Something went wrong!" });
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!poster) return;
    try {
      const res = await fetch(`${API_URL}/api/poster/delete/${poster._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return toast({ title: data.message || "Delete failed!" });
      toast({ title: "Poster deleted successfully!" });
      setPoster(null);
    } catch (err) {
      console.log(err);
      toast({ title: "Something went wrong!" });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Poster of the Day</h2>
        <Button onClick={() => setPopupOpen(true)}>Add Poster</Button>
      </div>

      {poster ? (
        <div className="flex items-center gap-6 border p-4 rounded shadow-md">
          {poster.mediaType === "video" ? (
            <video
              src={poster.media}
              className="w-48 h-32 object-cover rounded"
              controls
            />
          ) : (
            <img
              src={poster.media}
              alt="Poster of the Day"
              className="w-48 h-32 object-cover rounded"
            />
          )}

          <div className="flex-1">
            <p className="text-gray-700 font-medium">{poster.caption}</p>
            <p className="text-gray-500 text-sm">
              {format(new Date(poster.date), "do MMMM, yyyy")}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setFormData({
                  caption: poster.caption,
                  media: poster.media,
                  mediaId: poster.mediaId,
                  mediaType: poster.mediaType,
                });
                setFile(null);
                setPopupOpen(true);
              }}
            >
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No poster for today.</p>
      )}

      {/* Popup Form */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <h3 className="text-lg font-semibold mb-4">Add / Edit Poster</h3>
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
              ) : poster?.media ? (
                poster.mediaType === "video" ? (
                  <video
                    src={poster.media}
                    controls
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <img
                    src={poster.media}
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

              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  "Save Poster"
                )}
              </Button>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" onClick={() => setPopupOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <h3 className="text-lg font-semibold mb-4">Add / Edit Poster</h3>
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
              ) : poster?.media ? (
                poster.mediaType === "video" ? (
                  <video
                    src={poster.media}
                    controls
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <img
                    src={poster.media}
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

              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  "Save Poster"
                )}
              </Button>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" onClick={() => setPopupOpen(false)}>
                  Cancel
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
