import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = months[date.getMonth()];

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month} ${year}`;
  };

  return (
    <div className="bg-white hover:shadow-lg  rounded-lg overflow-hidden w-full sm:w-[330px] border border-gray-400 transition-transform duration-300 hover:scale-110">
      <Link
        to={`/post/${post.slug}`}
        className="block h-[250px] w-full overflow-hidden"
      >
        <img
          src={post.image}
          alt={post.title + "cover"}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 bg-gray-200"
        />
      </Link>

      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-1 text-slate-900">
          {post.title}
        </p>

        <span className="italic text-[16px] text-slate-600">
          {post.category}
        </span>

        <span className="text-[14px] text-slate-500">
          {post.newsDate ? formatDate(post.newsDate) : "No date"}
        </span>

        <Link to={`/post/${post.slug}`}>
          <Button
            variant="outline"
            className="w-full border-slate-500 text-slate-700 hover:bg-blue-500 hover:text-white "
          >
            Read Article
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
