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
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get("searchTerm");

    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);

    const searchQuery = urlParams.toString();

    navigate(`/search?${searchQuery}`)
  };

  return (
    <nav className="shadow-lg sticky">
      <div className="flex justify-between items-center max-w-6xl lg:max-w-7xl p-4">
        <Link to={"/"}>
          <h1 className="font-bold text-xl sm:text-2xl flex-wrap">
            <span className="text-red-600">SKNCOE</span>
            <span className="text-blue-900">NSS</span>
          </h1>
        </Link>

        <form
          className="p-3 bg-blue-100 rounded-lg flex items-center"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Search..."
            className="focus:outline-none bg-transparent w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-red-600" />
          </button>
        </form>

        <ul className="flex gap-4">
          <li className="hidden lg:inline text-slate-700 hover:underline">
            <Link to={"/"}>Home</Link>
          </li>
          <li className="hidden lg:inline text-slate-700 hover:underline">
            <Link to={"/about"}>About</Link>
          </li>
          <li className="hidden lg:inline text-slate-700 hover:underline">
            <Link to={"/news"}>News Articles</Link>
          </li>
        </ul>

        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <img
                  src={currentUser.profilePicture}
                  alt="user profile picture"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="block font-semibold text-sm">
                <div className="flex flex-col gap-1">
                  <span>@{currentUser.username}</span>
                  <span>{currentUser.email}</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem className="font-semibold mt-1">
                <Link to="/dashboard?tab=profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-semibold mt-1"
                onClick={handleSignout}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to={"/sign-in"}>
            <Button> Sign In</Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Header;
