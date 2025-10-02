import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const ActivityDetails = () => {
  const { activityId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/activity/get/${activityId}`);
        const data = await res.json();
        if (res.ok) {
          setActivity(data.activity);
          setSelectedPost(data.activity.linkedPost?._id || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/post/getposts?limit=100`);
        const data = await res.json();
        if (res.ok) setPosts(data.posts);
      } catch (err) {
        console.error(err);
      }
    };
    if (currentUser?.isAdmin) fetchPosts();
  }, [currentUser]);

  const handleLinkPost = async () => {
    if (!selectedPost) return;
    try {
      const res = await fetch(
        `${API_URL}/api/activity/linkNews/${activityId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ postId: selectedPost }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setActivity(data.activity);
        setShowDropdown(false); // hide dropdown after linking
        toast({
          title: "News linked successfully!",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to link news",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLottieReact
          src="https://lottie.host/d9a9a224-1020-4c17-b95a-c53f72c115ff/9TiQ3jn6Q1.lottie"
          loop
          autoplay
        />
      </div>
    );

  if (!activity)
    return <p className="text-center mt-10 text-red-600">Activity not found</p>;

  const start = new Date(activity.startDate);
  const end = new Date(
    start.getTime() + activity.expectedDurationHours * 3600 * 1000
  );

  return (
    <main className="p-3 flex flex-col max-w-4xl mx-auto min-h-screen">
      {/* Title */}
      <h1 className="text-3xl mt-10 p-3 text-center font-bold lg:text-4xl text-slate-700 underline">
        {activity.title}
      </h1>

      {/* Poster */}
      <img
        src={activity.poster}
        alt={activity.title}
        className="mt-10 p-3 max-h-[500px] w-full object-cover rounded"
      />

      {/* Date and Time */}
      <div className="flex justify-between p-3 mx-auto w-full max-w-2xl text-sm text-gray-600">
        <span>Start: {start.toLocaleString()}</span>
        <span>End: {end.toLocaleString()}</span>
      </div>

      <Separator className="bg-slate-300" />

      {/* Description */}
      <div className="p-3 max-w-3xl mx-auto w-full text-gray-800 text-lg">
        {activity.description || "No description provided."}
      </div>

      {/* Linked News */}
      {activity.linkedPost && (
        <Link to={`/post/${activity.linkedPost.slug}`}>
          <div className="mt-6 p-3 border rounded shadow-md cursor-pointer hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">News Highlight</h2>
            <p className="text-lg font-medium">{activity.linkedPost.title}</p>
            <img
              src={activity.linkedPost.image}
              alt={activity.linkedPost.title}
              className="mt-2 w-full h-64 object-cover rounded"
            />
          </div>
        </Link>
      )}

      {/* Admin controls */}
      {currentUser?.isAdmin && (
        <div className="mt-4 flex flex-col gap-2">
          {/* Show dropdown only when requested */}
          {showDropdown && (
            <>
              <select
                value={selectedPost}
                onChange={(e) => setSelectedPost(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">
                  {activity.linkedPost
                    ? "Select a news to update"
                    : "Select a news to link"}
                </option>
                {posts.map((post) => (
                  <option key={post._id} value={post._id}>
                    {post.title}
                  </option>
                ))}
              </select>
              <Button
                className="bg-blue-600 text-white"
                onClick={handleLinkPost}
              >
                Save
              </Button>
            </>
          )}

          {/* Button to trigger dropdown */}
          {!showDropdown && (
            <Button
              className={`${
                activity.linkedPost ? "bg-green-600" : "bg-blue-600"
              } text-white`}
              onClick={() => setShowDropdown(true)}
            >
              {activity.linkedPost ? "Update Linked News" : "Link News"}
            </Button>
          )}
        </div>
      )}
    </main>
  );
};

export default ActivityDetails;
