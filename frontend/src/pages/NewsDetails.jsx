import Advertise from "@/components/shared/Advertise";
import CommentSection from "@/components/shared/CommentSection";
import PostCard from "@/components/shared/PostCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const NewsDetails = () => {
  const { postSlug } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // ✅ Fetch single post by slug
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/post/getpost/${postSlug}`);
        const data = await res.json();

        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        setPost(data);
        setError(false);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching post:", error);
        setError(true);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postSlug]);

  // ✅ fetch recent posts but exclude current post
  useEffect(() => {
    const fetchRecentPosts = async () => {
      if (!post?._id) return; // wait until post is loaded

      try {
        const res = await fetch(
          `${API_URL}/api/post/getposts?limit=3&excludeId=${post._id}`
        );
        const data = await res.json();

        if (res.ok) {
          setRecentArticles(data.posts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchRecentPosts();
  }, [post]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLottieReact
          src="https://lottie.host/d9a9a224-1020-4c17-b95a-c53f72c115ff/9TiQ3jn6Q1.lottie"
          loop
          autoplay
        />
      </div>
    );
  }

  const handleLike = async () => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/post/likePost/${post._id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPost(data);
      }
    } catch (error) {
      console.log("Error liking post:", error);
    }
  };

  const readingTime = (text) => {
    if (!text) return "0 sec read";

    const wordsPerMinute = 120;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.floor(words / wordsPerMinute);
    const seconds = Math.floor(
      (words % wordsPerMinute) / (wordsPerMinute / 60)
    );

    if (minutes === 0) return `${seconds} sec read`;
    return `${minutes} min${minutes > 1 ? "s" : ""}${
      seconds > 0 ? ` ${seconds} sec` : ""
    } read`;
  };

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="news-title text-3xl mt-10 p-3 text-center font-bold max-w-3xl mx-auto lg:text-4xl text-slate-700 underline">
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className="self-center mt-5"
      >
        <Button variant="outline" className="border border-slate-500">
          {post && post.category}
        </Button>
      </Link>

      <img
        src={post && post.image}
        alt={post && post.title}
        className="mt-10 p-3 max-h-[500px] w-full object-cover"
      />

      <div className="flex justify-between p-3 mx-auto w-full max-w-2xl text-xs">
        <span>
          Published on - {post && new Date(post.createdAt).toLocaleDateString()}
        </span>
        <span className="italic">{readingTime(post?.content)}</span>
      </div>

      <Separator className="bg-slate-300" />

      <div
        className="p-3 max-w-3xl mx-auto w-full news-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>

      <div className="max-w-4xl mx-auto w-full">
        <Advertise />
      </div>

      <div className="flex items-center gap-3 p-3 max-w-3xl mx-auto">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-red-600 font-semibold"
        >
          <Heart
            className={`w-6 h-6 ${
              post?.likes?.includes(currentUser?._id) ? "fill-red-600" : ""
            }`}
          />
          {post?.numberOfLikes || 0} Likes
        </button>
      </div>

      <CommentSection postId={post._id} />

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl font-semibold mt-5 text-slate-700">
          Recently Published Articles
        </h1>

        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentArticles &&
            recentArticles.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
        </div>
      </div>
    </main>
  );
};

export default NewsDetails;
