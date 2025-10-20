import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FaEye, FaEyeSlash, FaPen } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutSuccess,
} from "@/redux/user/userSlice";
import { uploadFile, getFileUrl } from "@/lib/appwrite/uploadImage";
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

  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    if (!isEditing) return;
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const checkIsAuthorized = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/current`, {
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.user?._id;
    } catch (err) {
      console.error("Authorization check failed:", err);
      return false;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File size exceeds 500 KB.",
        description: "Please select a smaller image.",
        variant: "destructive",
      });
      return;
    }

    const isAuthorized = await checkIsAuthorized();
    if (!isAuthorized) {
      toast({
        title: "You are not authorized to change profile photo.",
        description: "Try signing in again.",
        variant: "destructive",
      });
      return;
    }

    let uploadedFileId = null;

    try {
      dispatch(updateStart());
      setUploading(true);

      const uploadedFile = await uploadFile(file);
      if (!uploadedFile) throw new Error("File upload failed!");
      uploadedFileId = uploadedFile.$id;

      const profilePictureUrl = await getFileUrl(uploadedFile.$id);

      const res = await fetch(`${API_URL}/api/user/update/${currentUser._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profilePicture: profilePictureUrl,
          profilePictureId: uploadedFile.$id,
          deleteOldPictureId: currentUser.profilePictureId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Profile photo update failed!",
          description: data.message || "Please try again.",
          variant: "destructive",
        });
        dispatch(updateFailure(data.message));

        if (uploadedFileId) {
          try {
            await fetch(`${API_URL}/api/upload/delete/${uploadedFileId}`, {
              method: "DELETE",
              credentials: "include",
            });
          } catch (delErr) {
            console.error("Failed to delete orphan file:", delErr);
          }
        }
      } else {
        dispatch(updateSuccess(data));
        setTimeout(() => {
          setUploading(false);
          toast({ title: "Profile photo updated successfully." });
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Profile photo update failed!",
      });
      dispatch(updateFailure(error.message));
      setUploading(false);

      if (uploadedFileId) {
        try {
          await fetch(`${API_URL}/api/upload/delete/${uploadedFileId}`, {
            method: "DELETE",
            credentials: "include",
          });
        } catch (delErr) {
          console.error("Failed to delete orphan file:", delErr);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`${API_URL}/api/user/update/${currentUser._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "User Update Failure. Please try again!" });
        dispatch(updateFailure(data.message));
      } else {
        toast({ title: "User Updated Successfully." });
        dispatch(updateSuccess(data));
        setFormData({ ...formData, password: "" });
        setIsEditing(false);
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
      if (!res.ok) dispatch(deleteUserFailure(data.message));
      else dispatch(deleteUserSuccess());
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
      if (res.ok) dispatch(signOutSuccess());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">
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
        {/* Profile Picture / Upload Animation */}
        <div
          className="relative w-40 h-40 self-center cursor-pointer group"
          onClick={() => profilePicRef.current.click()}
        >
          {uploading ? (
            <DotLottieReact
              src="https://lottie.host/8e929f18-c53a-4d1e-94f0-9bc6cf21fbaf/8qmvB7P8wA.lottie"
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <>
              <img src="./nss-logo.png" className="w-full h-full" />
              <img
                src={currentUser.profilePicture}
                alt="Profile Picture"
                className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full object-cover -translate-x-1/2 -translate-y-1/2 z-10"
              />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 -translate-y-1/2 z-20">
                <FaPen />
              </div>
            </>
          )}
        </div>
        {/* Username */}
        <Input
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          disabled={!isEditing}
          className="h-12 border-slate-400 focus-visible:ring-0 disabled:bg-gray-100"
          onChange={handleChange}
        />
        {/* Email */}
        <Input
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          disabled={!isEditing}
          className="h-12 border-slate-400 focus-visible:ring-0 disabled:bg-gray-100"
          onChange={handleChange}
        />
        {/* Password */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="********"
            value={formData.password || ""}
            disabled={!isEditing}
            className="h-12 border-slate-400 focus-visible:ring-0 pr-10 disabled:bg-gray-100"
            onChange={handleChange}
          />
          {isEditing && formData.password && (
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          )}
        </div>
        <Button type="submit" className="h-12 bg-green-600" disabled={loading}>
          {isEditing
            ? loading
              ? "Saving..."
              : "Save Changes"
            : "Edit Profile"}
        </Button>
      </form>

      {/* Delete & Signout */}
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
