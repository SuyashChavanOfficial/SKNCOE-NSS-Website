import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Clock } from "lucide-react";
import ActivityCard from "@/components/shared/ActivityCard";
import Pagination from "@/components/shared/Pagination";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const COMPLETED_ACTIVITIES_PER_PAGE = 9;

const Activities = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPagesCompleted, setTotalPagesCompleted] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page")) || 1;

  const isInterested = (activity) => {
    return activity.interestedUsers?.some(
      (user) => user === currentUser?._id || user?._id === currentUser?._id
    );
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/activity/get`);
      const data = await res.json();
      if (res.ok) {
        const sortFn = (a, b) => new Date(b.startDate) - new Date(a.startDate);
        const allCompleted = (data.completed || []).sort(sortFn);

        setUpcoming((data.upcoming || []).sort(sortFn));
        setCompleted(allCompleted); 

        setTotalPagesCompleted(
          Math.ceil(allCompleted.length / COMPLETED_ACTIVITIES_PER_PAGE)
        );
      } else {
        toast({
          title: "Error fetching activities",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching activities",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleToggleInterest = async (activityId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to mark interest.",
      });
      navigate("/sign-in");
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
        const updateActivityList = (list) =>
          list.map((act) => {
            if (act._id === activityId) {
              let updatedInterestedUsers = [...(act.interestedUsers || [])];
              if (data.isInterested) {
                updatedInterestedUsers.push(currentUser._id);
              } else {
                updatedInterestedUsers = updatedInterestedUsers.filter(
                  (userId) =>
                    userId !== currentUser._id &&
                    userId?._id !== currentUser._id
                );
              }
              return {
                ...act,
                interestedUsers: updatedInterestedUsers,
              };
            }
            return act;
          });

        setUpcoming(updateActivityList(upcoming));
        setCompleted(updateActivityList(completed));

        toast({
          title: data.isInterested
            ? "Marked as Interested"
            : "Interest Removed",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update interest.",
          variant: "destructive",
        });
        console.log(data);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    }
  };

  const startIndex = (currentPage - 1) * COMPLETED_ACTIVITIES_PER_PAGE;
  const endIndex = startIndex + COMPLETED_ACTIVITIES_PER_PAGE;
  const currentCompletedActivities = completed.slice(startIndex, endIndex);

  if (loading)
    return (
      <p className="text-center p-10 text-gray-600">Loading activities...</p>
    );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-[calc(100vh-200px)]">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-700 text-center">
        Upcoming Activities
      </h2>
      <div className="flex flex-col items-center gap-6">
        {upcoming.length > 0 ? (
          upcoming.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              isActivityCompleted={false}
              onToggleInterest={handleToggleInterest}
              currentUser={currentUser}
            />
          ))
        ) : (
          <p className="text-gray-600 p-4 border rounded-lg bg-gray-50 w-full max-w-xl text-center">
            No upcoming activities scheduled.
          </p>
        )}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-slate-700 text-center">
        Completed Activities
      </h2>
      <div className="flex flex-col items-center gap-6">
        {currentCompletedActivities.length > 0
          ? currentCompletedActivities.map((activity) => (
              <ActivityCard
                key={activity._id}
                activity={activity}
                isActivityCompleted={true}
                onToggleInterest={handleToggleInterest}
                currentUser={currentUser}
              />
            ))
          :
            currentPage === 1 &&
            completed.length === 0 && (
              <p className="text-gray-600 p-4 border rounded-lg bg-gray-50 w-full max-w-xl text-center">
                No activities completed yet.
              </p>
            )}
      </div>

      {completed.length > 0 && totalPagesCompleted > 1 && (
        <Pagination totalPages={totalPagesCompleted} />
      )}
    </div>
  );
};

export default Activities;
