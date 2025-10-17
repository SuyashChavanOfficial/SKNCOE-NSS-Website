import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PostCard from "@/components/shared/PostCard";
import Pagination from "@/components/shared/Pagination";
import { Menu, X } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Search = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "all",
    academicYear: "all",
  });

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([{ id: null, name: "all" }]);
  const [academicYears, setAcademicYears] = useState(["all"]);
  const [loading, setLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 9;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch categories dynamically
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/category`);
      const data = await res.json();
      if (res.ok) {
        const sortedCategories = data
          .filter((c) => c.name.toLowerCase() !== "all")
          .sort((a, b) =>
            a.name.localeCompare(b.name, "en", { sensitivity: "base" })
          );
        setCategories([{ id: null, name: "all" }, ...sortedCategories]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = ["all"];
    for (let i = 0; i < 5; i++) {
      const start = currentYear + i;
      const end = start + 1;
      years.push(`${start}-${end.toString().slice(-2)}`);
    }
    setAcademicYears(years);
  };

  useEffect(() => {
    fetchCategories();
    fetchAcademicYears();
  }, []);

  // Fetch posts based on filters or URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get("searchTerm") || "";
    const sortFromUrl = urlParams.get("sort") || "desc";
    const categoryFromUrl = urlParams.get("category") || "all";
    const academicYearFromUrl = urlParams.get("academicYear") || "all";
    const pageFromUrl = parseInt(urlParams.get("page")) || 1;

    setSidebarData({
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      category: categoryFromUrl,
      academicYear: academicYearFromUrl,
    });

    setCurrentPage(pageFromUrl);

    const fetchPosts = async () => {
      setLoading(true);
      const startIndex = (pageFromUrl - 1) * postsPerPage;
      urlParams.set("startIndex", startIndex);
      urlParams.set("limit", postsPerPage);

      const searchQuery = urlParams.toString();
      const res = await fetch(`${API_URL}/api/post/getposts?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPosts(data.posts);
      setTotalPosts(data.totalPosts);
      setLoading(false);
    };

    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    setSidebarData({ ...sidebarData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();

    if (sidebarData.searchTerm)
      urlParams.set("searchTerm", sidebarData.searchTerm);
    if (sidebarData.category && sidebarData.category !== "all")
      urlParams.set("category", sidebarData.category);
    if (sidebarData.academicYear && sidebarData.academicYear !== "all")
      urlParams.set("academicYear", sidebarData.academicYear);
    if (sidebarData.sort) urlParams.set("sort", sidebarData.sort);

    urlParams.set("page", 1);
    navigate(`/search?${urlParams.toString()}`);
    setIsSidebarOpen(false);
  };

  const handlePageChange = (pageNum) => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("page", pageNum);
    navigate(`/search?${urlParams.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* ✅ Mobile top bar with hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-300 bg-white sticky top-0 z-40">
        <h1 className="text-lg font-semibold text-slate-700">News Articles</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-slate-700" />
          ) : (
            <Menu className="w-6 h-6 text-slate-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static top-0 left-0 h-full md:h-auto w-3/4 md:w-1/4 
        bg-white shadow-md border-r border-gray-300 
        transform transition-transform duration-300 z-50
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        <div className="p-6 md:p-4">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold text-gray-600 ">Filters</h2>

            {/* Search Input */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-600">Search Term:</label>
              <Input
                placeholder="Search..."
                id="searchTerm"
                type="text"
                value={sidebarData.searchTerm}
                onChange={handleChange}
              />
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-600">Sort By:</label>
              <Select
                onValueChange={(value) =>
                  setSidebarData({ ...sidebarData, sort: value })
                }
                value={sidebarData.sort}
              >
                <SelectTrigger className="w-full border border-slate-400">
                  <SelectValue placeholder="Select Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Order By</SelectLabel>
                    <SelectItem value="desc">Latest</SelectItem>
                    <SelectItem value="asc">Oldest</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-600">Category:</label>
              <Select
                onValueChange={(value) =>
                  setSidebarData({ ...sidebarData, category: value })
                }
                value={sidebarData.category || "all"}
              >
                <SelectTrigger className="w-full border border-slate-400">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id || cat.name} value={cat.name}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-600">
                Academic Year:
              </label>
              <Select
                onValueChange={(value) =>
                  setSidebarData({ ...sidebarData, academicYear: value })
                }
                value={sidebarData.academicYear || "all"}
              >
                <SelectTrigger className="w-full border border-slate-400">
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Academic Year</SelectLabel>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
              <Button
                type="submit"
                className="bg-red-600 text-white py-2 px-4 rounded-md shadow-lg"
                onClick={() => setIsSidebarOpen(false)}
              >
                Apply Filters
              </Button>

              <Button
                type="button"
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md shadow-lg hover:bg-gray-300"
                onClick={() => {
                  setSidebarData({
                    searchTerm: "",
                    sort: "desc",
                    category: "all",
                    academicYear: "all",
                  });
                  navigate("/search");
                  setIsSidebarOpen(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="w-full">
        <h1 className="hidden md:block text-2xl font-semibold text-slate-700 mt-5 p-3">
          News Articles
        </h1>
        <Separator className="bg-slate-300" />

        <div className="p-7 flex flex-wrap gap-8 justify-items-start">
          {loading && (
            <DotLottieReact
              src="https://lottie.host/56f5cd8e-3b11-4dff-8796-df29e53e7bff/S3GWuLfZ57.lottie"
              loop
              autoplay
              height={75}
            />
          )}

          {!loading && posts.length === 0 && (
            <>
              <p className="text-xl text-gray-500">No Posts Found!</p>
              <DotLottieReact
                src="https://lottie.host/eaed6be7-42fe-4d40-ad5c-0c3392ec0add/gMIpYcyui2.lottie"
                loop
                autoplay
                height={75}
              />
            </>
          )}

          {!loading &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Search;
