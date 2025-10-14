import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutSuccess } from "@/redux/user/userSlice";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const currentPath = location.pathname;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) setSearchTerm(searchTermFromUrl);
  }, [location.search]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  // ✅ Modified: Treat both /news and /search as active for "News Articles"
  const isActive = (path) => {
    if (
      path === "/news" &&
      (currentPath === "/news" || currentPath === "/search")
    )
      return true;
    return currentPath === path;
  };

  return (
    <nav className="shadow-md sticky top-0 bg-white z-50 border-b border-red-100">
      <div className="flex justify-between items-center max-w-6xl lg:max-w-7xl p-4">
        {/* Logo */}
        <Link to={"/"} className="flex items-center gap-2">
          <img
            src="/nss-logo.png"
            alt="SKNCOE NSS Logo"
            className="w-8 h-8 object-contain"
          />
          {/* Hide text on mobile */}
          <h1 className="font-bold text-xl sm:text-2xl flex-wrap hidden sm:block">
            <span className="text-red-600">SKNCOE</span>
            <span className="text-blue-900">NSS</span>
          </h1>
        </Link>

        {/* Search Bar */}
        <form
          className="p-2 bg-blue-50 rounded-lg flex items-center border border-blue-900 focus-within:ring-1 focus-within:ring-blue-900"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Search..."
            className="focus:outline-none bg-transparent w-24 sm:w-64 text-blue-900 placeholder:text-blue-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-red-600 hover:text-blue-900 transition-colors duration-200" />
          </button>
        </form>

        {/* Navigation Links */}
        <ul className="hidden lg:flex gap-6">
          <li>
            <Link
              to="/"
              className={`pb-1 transition-all duration-200 ${
                isActive("/")
                  ? "text-red-600 font-semibold border-b-2 border-red-600"
                  : "text-blue-900 hover:text-red-600"
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`pb-1 transition-all duration-200 ${
                isActive("/about")
                  ? "text-red-600 font-semibold border-b-2 border-red-600"
                  : "text-blue-900 hover:text-red-600"
              }`}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/news"
              className={`pb-1 transition-all duration-200 ${
                isActive("/news")
                  ? "text-red-600 font-semibold border-b-2 border-red-600"
                  : "text-blue-900 hover:text-red-600"
              }`}
            >
              News Articles
            </Link>
          </li>
          <li>
            <Link
              to="/activities"
              className={`pb-1 transition-all duration-200 ${
                isActive("/activities")
                  ? "text-red-600 font-semibold border-b-2 border-red-600"
                  : "text-blue-900 hover:text-red-600"
              }`}
            >
              Activities
            </Link>
          </li>
        </ul>

        {/* User Menu */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <img
                  src={currentUser.profilePicture}
                  alt="user profile picture"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-blue-900"
                />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60 border border-blue-200 shadow-lg">
              <DropdownMenuLabel className="text-blue-900 font-semibold">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-blue-200" />

              <DropdownMenuItem className="block font-semibold text-sm text-blue-900">
                <div className="flex flex-col gap-1">
                  <span>@{currentUser.username}</span>
                  <span className="text-slate-600">{currentUser.email}</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-blue-200 lg:hidden" />

              {/* Mobile Nav Links */}
              <Link to="/" className="lg:hidden">
                <DropdownMenuItem
                  className={`${
                    isActive("/")
                      ? "text-red-600 font-semibold"
                      : "text-blue-900"
                  }`}
                >
                  Home
                </DropdownMenuItem>
              </Link>
              <Link to="/about" className="lg:hidden">
                <DropdownMenuItem
                  className={`${
                    isActive("/about")
                      ? "text-red-600 font-semibold"
                      : "text-blue-900"
                  }`}
                >
                  About
                </DropdownMenuItem>
              </Link>
              <Link to="/news" className="lg:hidden">
                <DropdownMenuItem
                  className={`${
                    isActive("/news")
                      ? "text-red-600 font-semibold"
                      : "text-blue-900"
                  }`}
                >
                  News Articles
                </DropdownMenuItem>
              </Link>
              <Link to="/activities" className="lg:hidden">
                <DropdownMenuItem
                  className={`${
                    isActive("/activities")
                      ? "text-red-600 font-semibold"
                      : "text-blue-900"
                  }`}
                >
                  Activities
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator className="bg-blue-200" />

              <Link to="/dashboard?tab=profile">
                <DropdownMenuItem className="text-blue-900">
                  Profile
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                onClick={handleSignout}
                className="text-red-600 font-semibold"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          currentPath !== "/sign-in" && (
            <Link to={"/sign-in"}>
              <Button className="bg-red-600 hover:bg-blue-900 text-white transition-colors duration-200">
                Sign In
              </Button>
            </Link>
          )
        )}
      </div>
    </nav>
  );
};

export default Header;
