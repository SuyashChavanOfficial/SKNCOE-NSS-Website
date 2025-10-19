import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Advertise from "@/components/shared/Advertise";
import PostCard from "@/components/shared/PostCard";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const Home = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`${API_URL}/api/post/getPosts?limit=3&sort=desc`);
      const data = await res.json();

      if (res.ok) {
        setPosts(data.posts);
      }
    };

    fetchPosts();
  }, []);
  const FeatureCard = ({ icon, title, description }) => {
    return (
      <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
        <div className="flex items-center flex-col">
          <img src={icon} alt={title} className="text-5xl mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center gap-10 p-6 md:p-10 max-w-6xl mx-auto">
        {/* Left Section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome to <span className="text-red-600">SKNCOE</span>
            <span className="text-blue-800"> NSS</span>
          </h1>
          <p className="text-gray-600 mt-3 text-base md:text-lg">
            Working for society with utter dedication and taking big challenges
            to solve problems.
          </p>
          <p className="text-gray-500 italic mt-1">सेवा परमो धर्म:</p>
          <Link to={"/search"}>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-full font-semibold shadow-lg flex items-center gap-2 w-fit mt-4 mx-auto md:mx-0">
              View all News. <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Right Section (Image) */}
        <div className="flex-1 flex justify-center">
          <img
            src="/nss-logo.webp"
            alt="SKNCOE NSS"
            className="rounded-lg w-40 sm:w-56 md:w-72 lg:w-96 object-contain animate-spin-slow"
          />
        </div>
      </div>

      <section className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">
            Why you should join SKNCOE NSS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            <FeatureCard
              title="Dedicated Team"
              icon="https://cdn-icons-png.flaticon.com/128/7829/7829198.png"
              description="Strong dedicated team to do vivid tasks."
            />
            <FeatureCard
              title="Solving Real-Life Problems"
              icon="https://cdn-icons-png.flaticon.com/128/2896/2896418.png"
              description="Dealing with on ground problems to make a better tomorrow."
            />
            <FeatureCard
              title="Volunteers Self-Development"
              icon="https://cdn-icons-png.flaticon.com/128/17367/17367155.png"
              description="Everything is managed by Volunteers, imporving their skills and boosting confidence."
            />
          </div>
        </div>
      </section>

      <div className="p-3 bg-blue-50 ">
        <Advertise />
      </div>

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7 ">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-6 md:items-center">
            <h2 className="text-2xl font-bold text-slate-700">Recent News</h2>
            <div className="flex flex-wrap gap-6 md:gap-10 md:justify-around">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={"/search"}
              className="text-lg hover:underline text-center font-semibold"
            >
              View All News
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
