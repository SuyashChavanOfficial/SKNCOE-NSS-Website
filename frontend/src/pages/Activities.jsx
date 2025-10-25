import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Activities = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        setUpcoming((data.upcoming || []).sort(sortFn));
        setCompleted((data.completed || []).sort(sortFn));
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEndTime = (startDateStr, durationHours) => {
    if (!startDateStr || durationHours == null) return null;
    const start = new Date(startDateStr);
    const durationMs = Number(durationHours) * 60 * 60 * 1000;
    if (isNaN(durationMs)) return null;
    const end = new Date(start.getTime() + durationMs);
    return end;
  };

  // Function to render a single activity card
  const renderActivityCard = (activity, isActivityCompleted) => {
    const userIsInterested = isInterested(activity);
    const endTime = getEndTime(
      activity.startDate,
      activity.expectedDurationHours
    );

    return (
      <div
        key={activity._id}
        className="flex flex-col md:flex-row bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg w-full max-w-xl"
      >
        {/* Left Side: Image */}
        <div className="w-full md:w-[160px] flex-shrink-0 p-2 md:p-3 bg-gray-50">
          <img
            src={activity.poster}
            alt={activity.title}
            className="object-cover w-full h-full aspect-[1587/2245] rounded"
          />
        </div>

        {/* Right Side: Details and Buttons */}
        <div className="flex flex-col justify-between p-4 w-full">
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
              {activity.title}
            </h3>
            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <p>
                <strong>Starts:</strong> {formatDateTime(activity.startDate)}
              </p>
              <p>
                <strong>Ends:</strong>{" "}
                {endTime ? formatDateTime(endTime) : "N/A"}
              </p>
              <p className="flex items-center justify-center md:justify-start gap-1 pt-1">
                {" "}
                <Clock className="w-3 h-3" />
                <strong>Duration:</strong>{" "}
                {activity.expectedDurationHours ?? "N/A"} hours
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-auto">
            {!isActivityCompleted && (
              <Button
                variant={userIsInterested ? "destructive" : "outline"}
                size="sm"
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-xs px-3 py-1.5" // Added justify-center
                onClick={(e) => handleToggleInterest(activity._id, e)}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    userIsInterested ? "fill-current" : ""
                  }`}
                />
                {userIsInterested ? "Remove Interest" : "Mark Interest"}
              </Button>
            )}
            <Link
              to={`/dashboard/activity/${activity._id}`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="default"
                size="sm"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5" // Added justify-center
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read More Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

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
          upcoming.map((activity) => renderActivityCard(activity, false))
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
        {completed.length > 0 ? (
          completed.map((activity) => renderActivityCard(activity, true))
        ) : (
          <p className="text-gray-600 p-4 border rounded-lg bg-gray-50 w-full max-w-xl text-center">
            No activities completed yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Activities;
