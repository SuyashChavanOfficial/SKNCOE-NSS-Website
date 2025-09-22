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
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const EditNews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { postId } = useParams();
  const { currentUser } = useSelector((state) => state.user);

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [updatePostError, setUpdatePostError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`${API_URL}/api/post/getpostbyid/${postId}`);
      const data = await res.json();

      if (!res.ok) {
        setUpdatePostError(data.message);
        return;
      }

      if (data.post) {
        setFormData({
          ...data.post,
          category: data.post.category || "uncategorised",
        });
      } else {
        setUpdatePostError("Post not found");
      }
    };
    fetchPost();
  }, [postId]);

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
        deleteOldImageId: formData.imageId || null,
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

    const finalFormData = {
      ...formData,
      category: formData.category || "uncategorised", // ✅ enforce default
    };

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
      toast({ title: "Something went wrong! Please try again" });
      setUpdatePostError(data.message);
      return;
    }

    toast({ title: "News Updated Successfully." });
    navigate(`/post/${data.slug}`);
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Edit News Article
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <Input
            className="w-full sm:w-3/4 h-12 border-slate-400"
            type="text"
            placeholder="Title"
            required
            id="title"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <Select
            value={formData.category || "uncategorised"}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="w-full sm:w-1/4 h-12 border-slate-400">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="uncategorised">Uncategorised</SelectItem>
                <SelectItem value="tree-plantation">Tree Plantation</SelectItem>
                <SelectItem value="donation-drive">Donation Drive</SelectItem>
                <SelectItem value="camp">Camp</SelectItem>
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
