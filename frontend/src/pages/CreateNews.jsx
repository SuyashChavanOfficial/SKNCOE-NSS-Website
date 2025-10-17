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
import { Calendar } from "lucide-react";
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
    academicYear: "2025-26", // default year
  });
  const [categories, setCategories] = useState(["uncategorised"]);
  const [imageUploading, setImageUploading] = useState(false);
  const [createPostError, setCreatePostError] = useState(null);

  // Academic Years for dropdown
  const academicYears = ["2025-26", "2026-27", "2027-28"];

  // Fetch categories
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

  // Handle Image Upload
  const handleImageUpload = async () => {
    if (!file) return toast({ title: "Please select an image!" });
    if (file.size > 1 * 1024 * 1024) {
      return toast({ title: "File size exceeds 1 MB" });
    }

    try {
      setImageUploading(true);
      const uploadedFile = await uploadFile(file);
      const postImageUrl = await getFileUrl(uploadedFile.$id);
      setFormData({
        ...formData,
        image: postImageUrl,
        imageId: uploadedFile.$id,
      });
      toast({ title: "Image Uploaded Successfully!" });
      setImageUploading(false);
    } catch {
      toast({ title: "Image Upload Failed!" });
      setImageUploading(false);
    }
  };

  // Submit News
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) return toast({ title: "Please select a date" });

    const finalFormData = {
      ...formData,
      category: formData.category || "uncategorised",
      newsDate: formData.date,
    };

    try {
      const res = await fetch(`${API_URL}/api/post/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Something went wrong!" });
        setCreatePostError(data.message);
        return;
      }
      toast({ title: "News Published Successfully!" });
      navigate(`/post/${data.slug}`);
    } catch {
      toast({ title: "Something went wrong!" });
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Create a News Article
      </h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Title */}
        <Input
          className="w-full h-12 border-slate-400 focus-visible:ring-0"
          type="text"
          placeholder="Title"
          required
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        {/* Date & Category & Academic Year */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date */}
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
                <SelectValue placeholder="Select a Category" />
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

        {/* Image Upload */}
        <div className="border-4 border-slate-600 border-dotted p-3">
          <div className="flex gap-4 items-center">
            <Input
              type="file"
              accept="image/*"
              placeholder="Choose image (Max 1 MB)"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              type="button"
              className="bg-slate-700"
              onClick={handleImageUpload}
            >
              {imageUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Note: Maximum image size allowed is 1 MB.
          </p>
        </div>

        {formData.image && (
          <img
            src={formData.image}
            alt="upload"
            className="w-full h-72 object-cover"
          />
        )}

        {/* Editor */}
        <Editor
          value={formData.content || ""}
          placeholder="Write News here..."
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
        />

        <Button type="submit" className="h-12 bg-green-600 font-semibold">
          Publish News
        </Button>
        {createPostError && (
          <p className="text-red-600 mt-5">{createPostError}</p>
        )}
      </form>
    </div>
  );
};

export default CreateNews;
