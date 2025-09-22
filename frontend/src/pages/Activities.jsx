import ActivityCard from "@/components/shared/ActivityCard";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Activities = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity/get`);
        const data = await res.json();
        if (res.ok) {
          setUpcoming(data.upcoming || []);
          setCompleted(data.completed || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivities();
  }, []);

  const handleToggleInterest = async (activityId) => {
    if (!currentUser) {
      alert("Please sign in to mark interest");
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/activity/toggleInterest/${activityId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        // update locally: reload list or adjust counts (simple: refetch)
        const resp = await fetch(`${API_URL}/api/activity/get`);
        const j = await resp.json();
        setUpcoming(j.upcoming || []);
        setCompleted(j.completed || []);
      } else {
        console.log(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-3">Upcoming Activities</h2>
      <div className="flex flex-col gap-3">
        {upcoming.length > 0 ? (
          upcoming.map((a) => (
            <ActivityCard
              key={a._id}
              activity={a}
              onToggleInterest={handleToggleInterest}
              currentUser={currentUser}
            />
          ))
        ) : (
          <p className="text-gray-600">No upcoming activities.</p>
        )}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-3">Completed Activities</h2>
      <div className="flex flex-col gap-3">
        {completed.length > 0 ? (
          completed.map((a) => (
            <ActivityCard
              key={a._id}
              activity={a}
              onToggleInterest={handleToggleInterest}
              currentUser={currentUser}
            />
          ))
        ) : (
          <p className="text-gray-600">No completed activities.</p>
        )}
      </div>
    </div>
  );
};

export default Activities;
