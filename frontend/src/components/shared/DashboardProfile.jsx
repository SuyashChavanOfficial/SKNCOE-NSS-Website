import React, { useEffect, useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardProfile = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const profilePicRef = useRef();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
    dob: currentUser?.dob ? currentUser.dob.split("T")[0] : "",
    prnNumber: currentUser?.prnNumber || "",
    eligibilityNumber: currentUser?.eligibilityNumber || "",
    rollNumber: currentUser?.rollNumber || "",
    nssID: currentUser?.nssID || "",
    batch: currentUser?.batch || "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      dob: currentUser?.dob ? currentUser.dob.split("T")[0] : "",
      prnNumber: currentUser?.prnNumber || "",
      eligibilityNumber: currentUser?.eligibilityNumber || "",
      rollNumber: currentUser?.rollNumber || "",
      nssID: currentUser?.nssID || "",
      batch: currentUser?.batch || "",
    }));
  }, [currentUser]);

  const handleChange = (e) => {
    if (!isEditing) return;

    if (currentUser?.isVolunteer) {
      const allowedFields = [
        "dob",
        "prnNumber",
        "eligibilityNumber",
        "rollNumber",
      ];
      if (!allowedFields.includes(e.target.id)) {
        return;
      }
    } else {
      const volunteerFields = [
        "nssID",
        "batch",
        "dob",
        "prnNumber",
        "eligibilityNumber",
        "rollNumber",
      ];
      if (volunteerFields.includes(e.target.id)) {
        return;
      }
    }

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
    if (currentUser?.isVolunteer) return;
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 250 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File size exceeds 250 KB.",
        description: "Please select a smaller image.",
        variant: "destructive",
      });
      if (profilePicRef.current) profilePicRef.current.value = "";
      return;
    }
    const isAuthorized = await checkIsAuthorized();
    if (!isAuthorized) {
      toast({
        title: "Unauthorized",
        description: "Your session may have expired. Please sign in again.",
        variant: "destructive",
      });
      if (profilePicRef.current) profilePicRef.current.value = "";
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
          deleteOldPictureId: currentUser.profilePictureId || null,
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
            console.log("Orphan file deleted:", uploadedFileId);
          } catch (delErr) {
            console.error("Failed to delete orphan file:", delErr);
          }
        }
      } else {
        dispatch(updateSuccess(data));
        setUploading(false);
        toast({ title: "Profile photo updated successfully." });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Profile photo update failed!",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      dispatch(updateFailure(error.message));
      setUploading(false);
      if (uploadedFileId) {
        try {
          await fetch(`${API_URL}/api/upload/delete/${uploadedFileId}`, {
            method: "DELETE",
            credentials: "include",
          });
          console.log("Orphan file deleted on error:", uploadedFileId);
        } catch (delErr) {
          console.error("Failed to delete orphan file on error:", delErr);
        }
      }
    } finally {
      if (profilePicRef.current) profilePicRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    let dataToSend = {};
    if (currentUser?.isVolunteer) {
      dataToSend = {
        dob: formData.dob || null,
        prnNumber: formData.prnNumber || null,
        eligibilityNumber: formData.eligibilityNumber || null,
        rollNumber: formData.rollNumber || null,
      };
    } else {
      dataToSend = { username: formData.username, email: formData.email };
      if (formData.password) dataToSend.password = formData.password;
    }
    const changesMade = Object.keys(dataToSend).some((key) => {
      if (key === "dob") {
        const currentDob = currentUser?.dob
          ? currentUser.dob.split("T")[0]
          : "";
        const formDob = dataToSend.dob || "";
        return formDob !== currentDob;
      }
      const currentValue = currentUser?.[key] || "";
      const formValue = dataToSend[key] || "";
      return formValue !== currentValue;
    });
    if (!changesMade && !dataToSend.password) {
      toast({ title: "No changes detected to save." });
      setIsEditing(false);
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`${API_URL}/api/user/update/${currentUser._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "User Update Failed!",
          description: data.message || "Please try again.",
          variant: "destructive",
        });
        dispatch(updateFailure(data.message));
      } else {
        toast({ title: "User Updated Successfully." });
        dispatch(updateSuccess(data));
        setFormData((prevData) => ({ ...prevData, password: "" }));
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "User Update Failure!",
        description: error.message || "Please try again!",
        variant: "destructive",
      });
      dispatch(updateFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    if (currentUser?.isVolunteer) {
      toast({
        title: "Action Not Allowed",
        description: "Please contact admin.",
        variant: "destructive",
      });
      return;
    }
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`${API_URL}/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        toast({
          title: "Delete Failed",
          description: data.message,
          variant: "destructive",
        });
      } else {
        dispatch(deleteUserSuccess());
      }
    } catch (error) {
      console.log(error);
      dispatch(deleteUserFailure(error.message));
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/signout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signOutSuccess());
      } else {
        toast({
          title: "Sign Out Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">
        {isEditing ? "Edit Profile" : "Your Profile"}
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div
          className={`relative w-40 h-40 self-center group cursor-default`}
          title={
            currentUser?.isVolunteer
              ? "Volunteers cannot change profile picture"
              : "Profile Picture"
          }
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
              <img
                src="/nss-logo.png"
                alt="NSS Logo Background"
                className="w-full h-full"
              />
              <img
                src={
                  currentUser?.profilePicture ||
                  "https://cdn-icons-png.flaticon.com/128/149/149071.png"
                }
                alt="Profile Picture"
                className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full object-cover -translate-x-1/2 -translate-y-1/2 z-10 border-2 border-white shadow-md"
              />
            </>
          )}
        </div>
        {!currentUser?.isVolunteer && isEditing && (
          <div className="self-center w-full max-w-sm space-y-1 mt-2">
            <Label
              htmlFor="profilePictureInput"
              className="text-sm font-medium text-gray-700"
            >
              Change Profile Picture (Max 250KB)
            </Label>
            <Input
              type="file"
              accept="image/*"
              id="profilePictureInput"
              ref={profilePicRef}
              onChange={handleImageChange}
              disabled={uploading}
              className="h-10 border-slate-400 focus-visible:ring-0 file:text-sm file:font-medium file:text-blue-700 hover:file:text-blue-500"
            />
          </div>
        )}
        {/* --- Always Visible & Non-Editable Fields for Volunteers --- */}
        <div className="space-y-1">
          <Label
            htmlFor="username"
            className="text-sm font-medium text-gray-700"
          >
            {currentUser?.isVolunteer ? "Volunteer Name" : "Username"}
          </Label>
          <Input
            type="text"
            id="username"
            placeholder="Username"
            value={formData.username}
            disabled={!isEditing || currentUser?.isVolunteer}
            className="h-12 border-slate-400 focus-visible:ring-0 disabled:opacity-75 disabled:cursor-not-allowed"
            onChange={handleChange}
            readOnly={currentUser?.isVolunteer && !isEditing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            disabled={!isEditing || currentUser?.isVolunteer}
            className="h-12 border-slate-400 focus-visible:ring-0 disabled:opacity-75 disabled:cursor-not-allowed"
            onChange={handleChange}
            readOnly={currentUser?.isVolunteer && !isEditing}
          />
        </div>
        {currentUser?.isVolunteer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="nssID"
                className="text-sm font-medium text-gray-700"
              >
                NSS ID
              </Label>
              <Input
                type="text"
                id="nssID"
                value={formData.nssID}
                disabled
                className="h-12 border-slate-400 focus-visible:ring-0 bg-gray-100 opacity-75 cursor-not-allowed"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="batch"
                className="text-sm font-medium text-gray-700"
              >
                Batch
              </Label>
              <Input
                type="text"
                id="batch"
                value={formData.batch}
                disabled
                className="h-12 border-slate-400 focus-visible:ring-0 bg-gray-100 opacity-75 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        )}

        {currentUser?.isVolunteer && <Separator className="my-4" />}

        {/* --- Password (Only for Non-Volunteers) --- */}
        {!currentUser?.isVolunteer && (
          <div className="relative space-y-1">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter new password to change"
              value={formData.password || ""}
              disabled={!isEditing}
              className="h-12 border-slate-400 focus-visible:ring-0 pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
              onChange={handleChange}
            />
            {isEditing && formData.password && (
              <span
                className="absolute right-3 bottom-[13px] transform cursor-pointer text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            )}
          </div>
        )}
        
        {/* --- Editable Volunteer Fields (Shown in Grid) --- */}
        
        {currentUser?.isVolunteer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="dob"
                className="text-sm font-medium text-gray-700"
              >
                Date of Birth
              </Label>
              <Input
                type="date"
                id="dob"
                value={formData.dob}
                disabled={!isEditing}
                className="h-12 border-slate-400 focus-visible:ring-0 disabled:opacity-75 disabled:cursor-not-allowed"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="prnNumber"
                className="text-sm font-medium text-gray-700"
              >
                PRN Number
              </Label>
              <Input
                type="text"
                id="prnNumber"
                placeholder="PRN Number"
                value={formData.prnNumber}
                disabled={!isEditing}
                className="h-12 border-slate-400 focus-visible:ring-0 disabled:opacity-75 disabled:cursor-not-allowed"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="rollNumber"
                className="text-sm font-medium text-gray-700"
              >
                Roll Number
              </Label>
              <Input
                type="number"
                id="rollNumber"
                placeholder="Roll Number"
                value={formData.rollNumber}
                disabled={!isEditing}
                className="h-12 border-slate-400 focus-visible:ring-0 disabled:opacity-75 disabled:cursor-not-allowed"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="eligibilityNumber"
                className="text-sm font-medium text-gray-700"
              >
                Eligibility Number
              </Label>
              <Input
                type="number"
                id="eligibilityNumber"
                placeholder="Eligibility Number"
                value={formData.eligibilityNumber}
                disabled={!isEditing}
                className="h-12 border-slate-400 focus-visible:ring-0 disabled:opacity-75 disabled:cursor-not-allowed"
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="h-12 bg-green-600 hover:bg-green-700 mt-4"
          disabled={loading || uploading}
        >
          {isEditing
            ? loading
              ? "Saving..."
              : "Save Changes"
            : "Edit Profile"}
        </Button>
      </form>

      {/* Delete & Signout */}
      <div className="text-red-500 flex justify-between mt-5">
        {!currentUser?.isVolunteer ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="cursor-pointer text-red-600 hover:text-red-700"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteUser}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div></div>
        )}
        <Button
          variant="ghost"
          className="cursor-pointer text-red-600 hover:text-red-700"
          onClick={handleSignout}
        >
          Sign Out
        </Button>
      </div>

      {error && (
        <p className="text-red-600 mt-5 text-center">
          {typeof error === "string" ? error : "An error occurred"}
        </p>
      )}
    </div>
  );
};

export default DashboardProfile;
