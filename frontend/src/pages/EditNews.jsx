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
    try {
      const fetchPost = async () => {
        const res = await fetch(`${API_URL}/api/post/getposts?postId=${postId}`);

        const data = await res.json();

        if (!res.ok) {
          console.log(data.message);
          setUpdatePostError(data.message);
          return;
        }

        if (res.ok) {
          setUpdatePostError(null);
          if (data.post) {
            setFormData(data.post);
          } else {
            setUpdatePostError("Post not found");
          }
        }
      };

      fetchPost();
    } catch (error) {
      console.log(error.message);
    }
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

      setFormData({ ...formData, image: postImageUrl });

      toast({ title: "Image Uploaded Successfully!" });

      if (postImageUrl) {
        setImageUploading(false);
      }
    } catch (error) {
      setImageUploadError("Image upload failed");
      toast({ title: "Image Uploaded Failed!" });
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${API_URL}/api/post/updatepost/${formData._id}/${currentUser._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Something went wrong! Please try again" });
        setUpdatePostError(data.message);
        return;
      }

      if (res.ok) {
        toast({ title: "Congratulations! News Published Successfully." });
        setUpdatePostError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      toast({ title: "Something went wrong! Please try again" });
      setUpdatePostError("Something went wrong! Please try again");
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Edit News Article
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <Input
            className="w-full sm:w-3/4  h-12 border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            type="text"
            placeholder="Title"
            required
            id="title"
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
            }}
            value={formData.title || ""}
          />

          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
            value={formData.category || ""}
          >
            <SelectTrigger className="w-full sm:w-1/4 h-12 border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="tree-plantation">Tree Plantation</SelectItem>
                <SelectItem value="donation-drive">Donation Drive</SelectItem>
                <SelectItem value="camp">Camp</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-slate-600 border-dotted p-3 ">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
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
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
        />

        <Button
          type="submit"
          className="h-12 bg-green-600 font-semibold max-sm:mt-5 text-md"
        >
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
