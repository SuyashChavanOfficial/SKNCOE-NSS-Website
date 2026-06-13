import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { Sun, Moon } from "lucide-react";
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
import { toggleTheme } from "@/redux/theme/themeSlice";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const currentPath = location.pathname;
  const isDark = theme === "dark";

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

  // Treat both /news and /search as active for "News Articles"
  const isActive = (path) => {
    if (
      path === "/news" &&
      (currentPath === "/news" || currentPath === "/search")
    )
      return true;
    return currentPath === path;
  };

  return (
    <nav className="shadow-md sticky top-0 bg-white dark:bg-[#0f1729] z-50 border-b border-gray-200 dark:border-[#1e2d4a] transition-colors duration-300">
      <div className="flex justify-between items-center max-w-6xl lg:max-w-7xl p-4 mx-auto">
        {/* Logo */}
        <Link to={"/"} className="flex items-center gap-2">
          <img
            src="/nss-logo.png"
            alt="SKNCOE NSS Logo"
            className="w-8 h-8 object-contain"
          />
          {/* Hide text on mobile */}
          <h1 className="font-bold text-xl sm:text-2xl flex-wrap">
            <span className="text-red-600">SKNCOE</span>
            <span className="text-blue-900 dark:text-blue-400">NSS</span>
          </h1>
        </Link>

        {/* Search Bar */}
        <form
          className="p-2 bg-blue-50 dark:bg-[#1e293b] rounded-lg flex items-center border border-blue-900 dark:border-blue-700 focus-within:ring-1 focus-within:ring-blue-500 transition-colors duration-300"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Search..."
            className="focus:outline-none bg-transparent w-24 sm:w-64 text-blue-900 dark:text-blue-200 placeholder:text-blue-400 dark:placeholder:text-blue-500 transition-colors duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="searchTerm"
          />
          <button type="submit">
            <FaSearch className="text-red-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors duration-200" />
          </button>
        </form>

        {/* Navigation Links */}
        <ul className="hidden lg:flex gap-6 items-center">
          <li>
            <Link
              to="/"
              className={`pb-1 transition-all duration-200 ${
                isActive("/")
                  ? "text-red-600 font-semibold border-b-2 border-red-600"
                  : "text-blue-900 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400"
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
                  : "text-blue-900 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400"
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
                  : "text-blue-900 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400"
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
                  : "text-blue-900 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              Activities
            </Link>
          </li>
        </ul>

        {/* Right side: Theme Toggle + User Menu */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Button */}
          <button
            id="theme-toggle"
            onClick={() => dispatch(toggleTheme())}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`
              relative w-10 h-10 rounded-full flex items-center justify-center
              border-2 transition-all duration-300 ease-in-out
              hover:scale-110 active:scale-95
              ${
                isDark
                  ? "bg-[#1e293b] border-blue-700 hover:border-blue-500 hover:bg-[#263354]"
                  : "bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100"
              }
            `}
          >
            <span
              className={`transition-all duration-300 ${
                isDark
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 rotate-90 scale-50 absolute"
              }`}
            >
              <Moon className="w-4 h-4 text-blue-300" />
            </span>
            <span
              className={`transition-all duration-300 ${
                isDark
                  ? "opacity-0 -rotate-90 scale-50 absolute"
                  : "opacity-100 rotate-0 scale-100"
              }`}
            >
              <Sun className="w-4 h-4 text-yellow-500" />
            </span>
          </button>

          {/* User Menu */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <img
                    src={currentUser.profilePicture}
                    alt="user profile picture"
                    className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-blue-900 dark:border-blue-500 transition-colors duration-300"
                  />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-60 border border-blue-200 dark:border-[#1e3a5f] shadow-lg dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] dark:bg-[#1a2540]">
                <DropdownMenuLabel className="text-blue-900 dark:text-blue-300 font-semibold">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-200 dark:bg-[#1e3a5f]" />

                <DropdownMenuItem className="block font-semibold text-sm text-blue-900 dark:text-blue-200">
                  <div className="flex flex-col gap-1">
                    <span>@{currentUser.username}</span>
                    <span className="text-slate-600 dark:text-slate-400 font-normal">
                      {currentUser.email}
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-blue-200 dark:bg-[#1e3a5f] lg:hidden" />

                {/* Mobile Nav Links */}
                <Link to="/" className="lg:hidden">
                  <DropdownMenuItem
                    className={`${
                      isActive("/")
                        ? "text-red-600 font-semibold"
                        : "text-blue-900 dark:text-blue-300"
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
                        : "text-blue-900 dark:text-blue-300"
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
                        : "text-blue-900 dark:text-blue-300"
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
                        : "text-blue-900 dark:text-blue-300"
                    }`}
                  >
                    Activities
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator className="bg-blue-200 dark:bg-[#1e3a5f]" />

                <Link to="/dashboard?tab=profile">
                  <DropdownMenuItem className="text-blue-900 dark:text-blue-300">
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
                <Button className="bg-red-600 hover:bg-blue-900 dark:hover:bg-blue-700 text-white transition-colors duration-200">
                  Sign In
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
