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

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const Search = () => {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "",
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");

    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData((prev) => ({
        ...prev,
        searchTerm: searchTermFromUrl || "",
        sort: sortFromUrl || "desc",
        category: categoryFromUrl || "",
      }));
    }

    const fetchPosts = async () => {
      setLoading(true);

      const searchQuery = urlParams.toString();

      const res = await fetch(`${API_URL}/api/post/getposts?${searchQuery}`);

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPosts(data.posts);
      setLoading(false);
      setShowMore(data.posts.length >= 9);
    };

    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    setSidebarData({ ...sidebarData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(location.search);

    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);

    if (sidebarData.category && sidebarData.category !== "all") {
      urlParams.set("category", sidebarData.category);
    } else {
      urlParams.delete("category");
    }

    navigate(`/search?${urlParams.toString()}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);

    urlParams.set("startIndex", startIndex);

    const searchQuery = urlParams.toString();

    const res = await fetch(`${API_URL}/api/post/getposts?${searchQuery}`);

    if (!res.ok) {
      return;
    }

    if (res.ok) {
      const data = await res.json();

      setPosts([...posts, ...data.posts]);

      if (data.posts.length >= 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };
  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar  */}
      <aside className="p-6 md:w-1/4 bg-white shadow-md border border-r border-gray-300">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-gray-600 ">Filters</h2>
          {/* Search Input  */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-600">Search Term:</label>
            <Input
              placeholder="Search..."
              id="searchTerm"
              type="text"
              className="border-gray-300 rounded-md"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>

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
              value={sidebarData.category}
            >
              <SelectTrigger className="w-full border border-slate-400">
                <SelectValue placeholder="Select a Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tree-plantation">
                    Tree Plantation
                  </SelectItem>
                  <SelectItem value="winter-camp">Winter Camp</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="bg-red-600 text-white py-2 px-4 rounded-md shadow-lg "
          >
            Apply Filters
          </Button>
        </form>
      </aside>

      <div className="w-full">
        <h1 className="text-2xl font-semibold text-slate-700 mt-5 p-3">
          News Articles
        </h1>

        <Separator className="bg-slate-300" />

        <div className="p-7 flex flex-wrap gap-4 justify-around">
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

          {loading && (
            <DotLottieReact
              src="https://lottie.host/56f5cd8e-3b11-4dff-8796-df29e53e7bff/S3GWuLfZ57.lottie"
              loop
              autoplay
              height={75}
            />
          )}

          {!loading &&
            posts &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}

          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-slate-800 text-lg hover:underline p-7 w-full"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
