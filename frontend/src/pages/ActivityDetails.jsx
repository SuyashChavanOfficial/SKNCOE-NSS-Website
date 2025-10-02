import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const ActivityDetails = () => {
  const { activityId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/activity/get/${activityId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        setActivity(data.activity);
        setError(false);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

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

  if (error || !activity) {
    return <p className="text-center mt-10 text-red-600">Activity not found</p>;
  }

  // calculate end time
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
    </main>
  );
};

export default ActivityDetails;
