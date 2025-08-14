import React from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <nav className="shadow-lg sticky">
      <div className="flex justify-between items-center max-w-6xl lg-max-w-7xl p-4">
        <Link to={"/"}>
          <h1 className="font-bold text-xl sm:text-2xl flex-wrap">
            <span className="text-red-600">SKNCOE</span>
            <span className="text-blue-900">NSS</span>
          </h1>
        </Link>

        <form className="p-3 bg-blue-100 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="focus:outline-none bg-transparent w-24 sm:w-64"
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
        
        <Link to={"/sign-in"}>
            <Button > Sign In</Button>
        </Link>
      </div>
    </nav>
  );
};

export default Header;
