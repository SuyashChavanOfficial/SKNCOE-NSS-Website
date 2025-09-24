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
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const CreateNews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ category: "uncategorised" });
  const [categories, setCategories] = useState(["uncategorised"]);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [createPostError, setCreatePostError] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/category`);
        const data = await res.json();
        if (res.ok) {
          const names = data.map((c) => c.name);

          const sorted = names
            .filter((n) => n.toLowerCase() !== "uncategorised")
            .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

          setCategories(["uncategorised", ...sorted]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image!");
        toast({ title: "Please select an image!" });
        return;
      }

      setImageUploading(true);
      setImageUploadError(null);

      const uploadedFile = await uploadFile(file);
      const postImageUrl = await getFileUrl(uploadedFile.$id);

      setFormData({
        ...formData,
        image: postImageUrl,
        imageId: uploadedFile.$id,
      });

      toast({ title: "Image Uploaded Successfully!" });
      if (postImageUrl) setImageUploading(false);
    } catch (error) {
      setImageUploadError("Image upload failed");
      toast({ title: "Image Upload Failed!" });
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const finalFormData = {
        ...formData,
        category: formData.category || "uncategorised",
      };

      const res = await fetch(`${API_URL}/api/post/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Something went wrong! Please try again" });
        setCreatePostError(data.message);
        return;
      }

      toast({ title: "Congratulations! News Published Successfully." });
      setCreatePostError(null);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      toast({ title: "Something went wrong! Please try again" });
      setCreatePostError("Something went wrong! Please try again");
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Create a News Article
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <Input
            className="w-full sm:w-3/4 h-12 border-slate-400 focus-visible:ring-0"
            type="text"
            placeholder="Title"
            required
            id="title"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="w-full sm:w-1/4 h-12 border-slate-400 focus-visible:ring-0">
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

        <div className="flex gap-4 items-center border-4 border-slate-600 border-dotted p-3">
          <Input
            type="file"
            accept="image/*"
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

        {imageUploadError && <p className="text-red-600">{imageUploadError}</p>}
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
