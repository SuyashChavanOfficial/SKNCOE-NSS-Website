import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const PostCard = ({ post }) => {
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
        <p className="text-lg font-semibold line-clamp-1 text-slate-700">
          {post.title}
        </p>

        <span className="italic text-[16px] text-slate-600">
          {post.category}
        </span>

        <Link to={`/post/${post.slug}`}>
          <Button variant="outline" className="w-full border-slate-500 text-slate-700 hover:bg-blue-500 hover:text-white ">Read Article</Button>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
