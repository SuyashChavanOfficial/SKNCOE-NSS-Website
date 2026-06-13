import Editor from "@/components/shared/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getFileUrl, uploadFile } from "@/lib/appwrite/uploadImage";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const CreateNews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "uncategorised",
    date: "",
    academicYear: "",
  });
  const [categories, setCategories] = useState(["uncategorised"]);
  const [imageUploading, setImageUploading] = useState(false);
  const [createPostError, setCreatePostError] = useState(null);

  const academicYears = ["2025-26", "2026-27", "2027-28"];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/category`);
        const data = await res.json();
        if (res.ok) {
          const sorted = data
            .filter((c) => c.name.toLowerCase() !== "uncategorised")
            .sort((a, b) =>
              a.name.localeCompare(b.name, "en", { sensitivity: "base" })
            );
          setCategories(["uncategorised", ...sorted.map((c) => c.name)]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Check if user is admin before upload
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

  // Handle file selection and preview locally
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 1 * 1024 * 1024) {
        toast({ title: "File size exceeds 1 MB" });
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
    if (!formData.date) return toast({ title: "Please select a date" });

    // Check authorization before uploading/submitting
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      toast({
        title: "You are not authorized to perform this action.",
        description: "Try signing in again.",
        variant: "destructive",
      });
      return;
    }

    let uploadedFileId = null;
    let postImageUrl = formData.image;
    let postImageId = formData.imageId;

    try {
      setImageUploading(true);

      // 1. Upload file if selected
      if (file) {
        const uploadedFile = await uploadFile(file);
        if (!uploadedFile) throw new Error("File upload failed!");
        uploadedFileId = uploadedFile.$id;
        postImageUrl = await getFileUrl(uploadedFile.$id);
        postImageId = uploadedFile.$id;
      } else {
        toast({ title: "An image is required to publish news!" });
        setImageUploading(false);
        return;
      }

      const finalFormData = {
        ...formData,
        image: postImageUrl,
        imageId: postImageId,
        category: formData.category || "uncategorised",
        newsDate: formData.date,
        academicYear: formData.academicYear || "2025-26",
      };

      // 2. Submit data to backend
      const res = await fetch(`${API_URL}/api/post/create`, {
         method: "POST",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(finalFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        // Transaction failed! Delete R2 uploaded file immediately to prevent orphan
        if (uploadedFileId) {
          await fetch(`${API_URL}/api/upload/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: uploadedFileId }),
            credentials: "include",
          }).catch((delErr) => console.error("Clean up upload failed:", delErr));
        }
        toast({ title: data.message || "Something went wrong!" });
        setCreatePostError(data.message);
        setImageUploading(false);
        return;
      }

      toast({ title: "News Published Successfully!" });
      setImageUploading(false);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      console.error("Error creating news:", error);
      // Delete R2 uploaded file on catch block too
      if (uploadedFileId) {
        await fetch(`${API_URL}/api/upload/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: uploadedFileId }),
          credentials: "include",
        }).catch((delErr) => console.error("Clean up upload failed:", delErr));
      }
      toast({ title: "Something went wrong!" });
      setImageUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col">
      {/* Back button */}
      <div className="mb-4 w-full">
        <button
          onClick={() => navigate("/dashboard?tab=posts")}
          className="flex items-center gap-2 text-blue-900 hover:text-red-700 font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </button>
      </div>

      <h1 className="text-center text-3xl mb-7 font-semibold text-slate-700">
        Create a News Article
      </h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          className="w-full h-12 border-slate-400 focus-visible:ring-0"
          type="text"
          placeholder="Title"
          required
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Picker */}
          <div className="w-full sm:w-1/3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between w-full h-12 border-slate-400 focus-visible:ring-0"
                >
                  {formData.date
                    ? format(new Date(formData.date), "dd MMM yyyy")
                    : "Select Date"}
                  <Calendar className="ml-2 h-5 w-5 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <CalendarComponent
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) => setFormData({ ...formData, date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Academic Year */}
          <div className="w-full sm:w-1/3">
            <Select
              value={formData.academicYear}
              onValueChange={(value) =>
                setFormData({ ...formData, academicYear: value })
              }
              className="w-full"
            >
              <SelectTrigger className="w-full h-12 border-slate-400 focus-visible:ring-0">
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Academic Year</SelectLabel>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="w-full sm:w-1/3">
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              className="w-full"
            >
              <SelectTrigger className="w-full h-12 border-slate-400 focus-visible:ring-0">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Image Upload Input (No Button) */}
        <div className="border-4 border-slate-600 border-dotted p-3">
          <div className="flex gap-4 items-center">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">Max image size 1 MB</p>
        </div>

        {(file || formData.image) && (
          <img
            src={file ? URL.createObjectURL(file) : formData.image}
            alt="upload"
            className="w-full h-72 object-cover"
          />
        )}

        <Editor
          value={formData.content || ""}
          placeholder="Write News here..."
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
        />

        <Button type="submit" disabled={imageUploading} className="h-12 bg-green-600 font-semibold">
          {imageUploading ? "Publishing..." : "Publish News"}
        </Button>
        {createPostError && (
          <p className="text-red-600 mt-5">{createPostError}</p>
        )}
      </form>
    </div>
  );
};

export default CreateNews;
