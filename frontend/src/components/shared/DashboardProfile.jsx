import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  updateFailure,
  updateStart,
  updateSuccess,
} from "@/redux/user/userSlice";
import { getFileUrl, uploadFile } from "@/lib/appwrite/uploadImage";
import { useToast } from "@/hooks/use-toast";

const DashboardProfile = () => {
  const { currentUser } = useSelector((state) => state.user);

  const profilePicRef = useRef();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [formData, setFormData] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const uploadImage = async () => {
    if (!imageFile) return currentUser.profilePicture;

    try {
      const uploadedFile = await uploadFile(imageFile);
      const profilePictureUrl = await getFileUrl(uploadedFile.$id);

      return profilePictureUrl;
    } catch (error) {
      toast({ title: "User Update Failure. Please try again!" });
      console.log("Image upload failed: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateStart());

      // wait until image is uploaded
      const profilePicture = await uploadImage();
      const updateProfile = {
        ...formData,
        profilePicture,
      };

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateProfile),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "User Update Failure. Please try again!" });
        dispatch(updateFailure(data.message));
      } else {
        toast({ title: "User Updated Successfully." });
        dispatch(updateSuccess(data));
      }
    } catch (error) {
      toast({ title: "User Update Failure. Please try again!" });
      dispatch(updateFailure(error.message));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7  text-center font-semibold text-3xl">
        Update your Profile
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={profilePicRef}
          onChange={handleImageChange}
        />
        <div className="w-32 h-32 self-center cursor-pointer overflow-hidden">
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt=""
            className="rounded-full w-full h-full object-cover border-8 border-gray-300"
            onClick={() => profilePicRef.current.click()}
          />
        </div>
        <Input
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          className="h-12 border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={handleChange}
        />
        <Input
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          className="h-12 border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={handleChange}
        />
        <Input
          type="password"
          id="password"
          placeholder="password"
          className="h-12 border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={handleChange}
        />

        <Button type="submit" className="h-12 bg-green-600">
          Update Profile
        </Button>
      </form>

      <div className="text-red-500 flex justify-between mt-5">
        <span className="cursor-pointer">Delete Account</span>
        <span className="cursor-pointer">Logout</span>
      </div>
    </div>
  );
};

export default DashboardProfile;
