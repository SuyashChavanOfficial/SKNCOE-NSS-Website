import React from "react";
import { Button } from "../ui/button";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/firebase";
import { useDispatch } from "react-redux";
import { signInFailure, signInSuccess } from "@/redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const GoogleAuth = () => {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const firebaseResponse = await signInWithPopup(auth, provider);

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firebaseResponse.user.displayName,
          email: firebaseResponse.user.email,
          profilePicture: firebaseResponse.user.photoURL,
        }),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        toast({
          title: "Google Sign-In Failed",
          description: data.message || "Please try again.",
        });
        return;
      }

      if (res.ok) {
        dispatch(signInSuccess(data.user));
        toast({ title: "Sign in Successful!" });
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      dispatch(signInFailure(error.message));
      toast({
        title: "Something went wrong",
        description: "Could not sign in with Google.",
      });
    }
  };

  return (
    <div>
      <Button
        type="button"
        className="bg-green-500 w-full"
        onClick={handleGoogleAuth}
      >
        Continue with Google
      </Button>
    </div>
  );
};

export default GoogleAuth;
