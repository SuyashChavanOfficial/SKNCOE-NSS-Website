import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaComments,
  FaHandsHelping,
  FaImage,
  FaPenSquare,
  FaPeopleCarry,
  FaSignOutAlt,
  FaUser,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";
import { IoDocuments } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { signOutSuccess } from "@/redux/user/userSlice";
import { MdCategory, MdDashboardCustomize } from "react-icons/md";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardSidebar = ({ closeSidebar }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const queryTab = new URLSearchParams(location.search).get("tab");

  const handleSignout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/signout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signOutSuccess());
        navigate("/");
      } else console.log(data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLinkClick = (tab) => {
    closeSidebar?.();
    navigate(`/dashboard?tab=${tab}`);
  };

  const isActive = (tab) => {
    if (tab === "activities") {
      return (
        queryTab === "activities" ||
        queryTab === "create-activity" ||
        queryTab === "edit-activity"
      );
    }
    if (tab === "posts") {
      return (
        queryTab === "posts" ||
        queryTab === "create-news" ||
        queryTab === "edit-news"
      );
    }
    return queryTab === tab;
  };

  return (
    <aside className="h-screen w-64 bg-slate-200 text-slate-800 flex flex-col">
      <div className="p-4 flex items-center justify-center bg-slate-200">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {currentUser?.isAdmin && (
            <li>
              <button
                onClick={() => handleLinkClick("dashboard")}
                className={`flex items-center p-2 w-full rounded ${
                  isActive("dashboard")
                    ? "bg-blue-900 text-white"
                    : "hover:bg-slate-300"
                }`}
              >
                <MdDashboardCustomize className="mr-3" />
                <span>Dashboard</span>
              </button>
            </li>
          )}

          <li>
            <button
              onClick={() => handleLinkClick("profile")}
              className={`flex items-center p-2 w-full rounded ${
                isActive("profile")
                  ? "bg-blue-900 text-white"
                  : "hover:bg-slate-300"
              }`}
            >
              <FaUser className="mr-3" />
              <span>Profile</span>
            </button>
          </li>

          {currentUser?.isAdmin && (
            <>
              <li>
                <button
                  onClick={() => handleLinkClick("poster-of-the-day")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("poster-of-the-day")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <FaImage className="mr-3" />
                  <span>Poster of the Day</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick("activities")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("activities")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <FaHandsHelping className="mr-3" />
                  <span>Activities</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick("volunteers")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("volunteers")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <FaPeopleCarry className="mr-3" />
                  <span>Volunteers</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick("attendance")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("attendance")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <FaChartBar className="mr-3" />
                  <span>Attendance</span>
                </button>
              </li>

              {/* Removed Create News (moved to DashboardPosts button) */}
              <li>
                <button
                  onClick={() => handleLinkClick("category-manager")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("category-manager")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <MdCategory className="mr-3" />
                  <span>Categories</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick("posts")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("posts")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <IoDocuments className="mr-3" />
                  <span>Your Articles</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick("users")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("users")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <FaUsers className="mr-3" />
                  <span>All Users</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick("comments")}
                  className={`flex items-center p-2 w-full rounded ${
                    isActive("comments")
                      ? "bg-blue-900 text-white"
                      : "hover:bg-slate-300"
                  }`}
                >
                  <FaComments className="mr-3" />
                  <span>All Comments</span>
                </button>
              </li>
            </>
          )}

          {currentUser?.isSuperAdmin && (
            <li>
              <button
                onClick={() => handleLinkClick("admins")}
                className={`flex items-center p-2 w-full rounded ${
                  isActive("admins")
                    ? "bg-blue-900 text-white"
                    : "hover:bg-slate-300"
                }`}
              >
                <FaUserShield className="mr-3" />
                <span>Manage Admins</span>
              </button>
            </li>
          )}
        </ul>

        <div className="p-4 border-t border-gray-700">
          <button
            className="flex items-center w-full p-2 hover:bg-slate-300 rounded"
            onClick={handleSignout}
          >
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
