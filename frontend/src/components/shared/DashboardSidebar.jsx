import React from "react";
import { Link } from "react-router-dom";
import {
  FaComments,
  FaPenSquare,
  FaSignOutAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { IoDocuments } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { signOutSuccess } from "@/redux/user/userSlice";
import { MdDashboardCustomize } from "react-icons/md";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const DashboardSidebar = () => {
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
    <aside className="h-screen w-64 bg-slate-200 text-slate-800 flex flex-col">
      {/* Logo/Header */}
      <div className="p-4 flex items-center justify-center bg-slate-200">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {currentUser && currentUser.isAdmin && (
            <li>
              <Link
                to={"/dashboard?tab=dashboard"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <MdDashboardCustomize className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
          )}

          <li>
            <Link
              to={"/dashboard?tab=profile"}
              className="flex items-center p-2 hover:bg-slate-300 rounded"
            >
              <FaUser className="mr-3" />
              <span>Profile</span>
            </Link>
          </li>

          {currentUser && currentUser.isAdmin && (
            <li>
              <Link
                to={"/dashboard?tab=activities"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <FaPenSquare className="mr-3" />
                <span>Activities</span>
              </Link>
            </li>
          )}

          <li>
            <Link
              to={"/dashboard?tab=volunteers"}
              className="flex items-center p-2 hover:bg-slate-300 rounded"
            >
              <FaUsers className="mr-3" />
              <span>Volunteers</span>
            </Link>
          </li>

          <li>
            <Link
              to={"/dashboard?tab=attendance"}
              className="flex items-center p-2 hover:bg-slate-300 rounded"
            >
              <IoDocuments className="mr-3" />
              <span>Attendance</span>
            </Link>
          </li>

          {currentUser && currentUser.isAdmin && (
            <li>
              <Link
                to={"/create-post"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <FaPenSquare className="mr-3" />
                <span>Create News</span>
              </Link>
            </li>
          )}

          {currentUser && currentUser.isAdmin && (
            <li>
              <Link
                to={"/category-manager"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <FaPenSquare className="mr-3" />
                <span>Categories</span>
              </Link>
            </li>
          )}

          {currentUser && currentUser.isAdmin && (
            <li>
              <Link
                to={"/dashboard?tab=posts"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <IoDocuments className="mr-3" />
                <span>Your Articles</span>
              </Link>
            </li>
          )}

          {currentUser && currentUser.isSuperAdmin && (
            <li>
              <Link
                to={"/dashboard?tab=admins"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <FaUsers className="mr-3" />
                <span>Manage Admins</span>
              </Link>
            </li>
          )}

          {currentUser && currentUser.isAdmin && (
            <li>
              <Link
                to={"/dashboard?tab=users"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <FaUsers className="mr-3" />
                <span>All Users</span>
              </Link>
            </li>
          )}

          {currentUser && currentUser.isAdmin && (
            <li>
              <Link
                to={"/dashboard?tab=comments"}
                className="flex items-center p-2 hover:bg-slate-300 rounded"
              >
                <FaComments className="mr-3" />
                <span>All Comments</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="p-4 border-t border-gray-700">
          <button
            className="flex items-center w-full p-2 hover:bg-slate-300 rounded"
            onClick={handleSignout}
          >
            <FaSignOutAlt className="mr-3" />
            <span> Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
