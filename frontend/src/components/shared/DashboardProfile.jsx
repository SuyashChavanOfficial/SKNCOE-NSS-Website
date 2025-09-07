import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutSuccess,
  updateFailure,
  updateStart,
  updateSuccess,
} from "@/redux/user/userSlice";
import { getFileUrl, uploadFile } from "@/lib/appwrite/uploadImage";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../ui/alert-dialog";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const DashboardProfile = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user);

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

      const res = await fetch(`${API_URL}/api/user/update/${currentUser._id}`, {
        method: "PUT",
        credentials: "include",
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

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`${API_URL}/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess());
      }
    } catch (error) {
      console.log(error);
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/signout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      console.log(error);
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

        <div className="relative w-40 h-40 self-center cursor-pointer overflow-hidden">
          {/* Outer Ring - NSS Logo */}
          <img
            src="./nss-logo.png"
            className="w-full h-full"
          />

          {/* Inner Profile Picture */}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="Profile Picture"
            className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full object-cover 
               -translate-x-1/2 -translate-y-1/2 cursor-pointer"
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

        <Button type="submit" className="h-12 bg-green-600" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </form>

      <div className="text-red-500 flex justify-between mt-5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="cursor-pointer">
              Delete Account
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600"
                onClick={handleDeleteUser}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={handleSignout}
        >
          Sign Out
        </Button>
      </div>
      <p className="text-red-600">{error}</p>
    </div>
  );
};

export default DashboardProfile;
