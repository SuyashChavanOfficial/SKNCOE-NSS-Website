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
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const EditNews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const postId = queryParams.get("id");
  const { currentUser } = useSelector((state) => state.user);

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "uncategorised",
    date: "",
    academicYear: "",
    content: "",
    image: "",
  });
  const [categories, setCategories] = useState(["uncategorised"]);
  const [categoryMap, setCategoryMap] = useState({}); // map lowercase -> original
  const [imageUploading, setImageUploading] = useState(false);
  const [updatePostError, setUpdatePostError] = useState(null);

  const academicYears = ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];

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

          const allCategories = ["uncategorised", ...sorted.map((c) => c.name)];
          setCategories(allCategories);

          // Map lowercase -> original
          const map = {};
          allCategories.forEach((cat) => (map[cat.toLowerCase()] = cat));
          setCategoryMap(map);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/api/post/getpostbyid/${postId}`);
        const data = await res.json();
        if (!res.ok) {
          setUpdatePostError(data.message);
          return;
        }

        if (data.post) {
          const categoryLower = data.post.category
            ? data.post.category.toLowerCase()
            : "uncategorised";

          setFormData({
            title: data.post.title,
            category: categoryMap[categoryLower] || "uncategorised",
            date: data.post.newsDate || "",
            content: data.post.content || "",
            image: data.post.image || "",
            imageId: data.post.imageId || null,
            _id: data.post._id,
            academicYear: data.post.academicYear || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
  }, [postId, categoryMap]);

  // Image upload
  const handleImageUpload = async () => {
    if (!file) return toast({ title: "Please select an image!" });
    if (file.size > 1 * 1024 * 1024)
      return toast({ title: "File size exceeds 1 MB!" });

    try {
      setImageUploading(true);
      const uploadedFile = await uploadFile(file);
      const postImageUrl = await getFileUrl(uploadedFile.$id);
      setFormData({
        ...formData,
        image: postImageUrl,
        imageId: uploadedFile.$id,
        deleteOldImageId: formData.imageId || null,
      });
      toast({ title: "Image Uploaded Successfully!" });
      setImageUploading(false);
    } catch {
      toast({ title: "Image Upload Failed!" });
      setImageUploading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) return toast({ title: "Please select a date!" });

    const finalFormData = {
      ...formData,
      category: formData.category || "uncategorised",
      newsDate: formData.date,
    };

    try {
      const res = await fetch(
        `${API_URL}/api/post/updatepost/${formData._id}/${currentUser._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalFormData),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Something went wrong!" });
        setUpdatePostError(data.message);
        return;
      }
      toast({ title: "News Updated Successfully!" });
      navigate(`/post/${data.slug}`);
    } catch {
      toast({ title: "Something went wrong!" });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col">
      <div className="mb-4 w-full">
        <button
          onClick={() => navigate("/dashboard?tab=posts")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 font-medium"
        >
          ← Back to Articles
        </button>
      </div>

      <h1 className="text-center text-3xl mb-7 font-semibold text-slate-700">
        Edit News Article
      </h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          className="w-full h-12 border-slate-400 focus-visible:ring-0"
          type="text"
          placeholder="Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

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
        </div>

        {formData.image && (
          <img
            src={formData.image}
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

        <Button type="submit" className="h-12 bg-green-600 font-semibold">
          Update News
        </Button>
        {updatePostError && (
          <p className="text-red-600 mt-5">{updatePostError}</p>
        )}
      </form>
    </div>
  );
};

export default EditNews;
