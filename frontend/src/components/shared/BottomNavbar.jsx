import { signOutSuccess } from "@/redux/user/userSlice";
import React from "react";
import { FaPenSquare, FaSignOutAlt } from "react-icons/fa";
import { IoDocuments } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const BottomNavbar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-200 border-t border-gray-300 p-2 flex justify-around">
      {currentUser && currentUser.isAdmin && (
        <Link
          to={"/create-post"}
          className="flex flex-col items-center text-slate-800"
        >
          <FaPenSquare size={20} />
          <span className="text-xs">Create News</span>
        </Link>
      )}

      {currentUser && currentUser.isAdmin && (
        <Link
          to={"/dashboard?tab=posts"}
          className="flex flex-col items-center text-slate-800"
        >
          <IoDocuments size={20} />
          <span className="text-xs">Articles</span>
        </Link>
      )}

      <Link
        to={"/dashboard?tab=profile"}
        className="flex flex-col items-center text-slate-800"
        onClick={handleSignout}
      >
        <FaSignOutAlt size={20} />
        <span className="text-xs">Sign Out</span>
      </Link>
    </div>
  );
};

export default BottomNavbar;
