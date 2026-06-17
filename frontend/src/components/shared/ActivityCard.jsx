import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Clock } from "lucide-react";

// Helper function to format date and time
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

// Helper function to calculate end time
const getEndTime = (startDateStr, durationHours) => {
  if (!startDateStr || durationHours == null) return null;
  const start = new Date(startDateStr);
  const durationMs = Number(durationHours) * 60 * 60 * 1000;
  if (isNaN(durationMs)) return null;
  const end = new Date(start.getTime() + durationMs);
  return end;
};

const ActivityCard = ({
  activity,
  isActivityCompleted,
  onToggleInterest,
  currentUser,
}) => {
  const isInterested = () => {
    if (!currentUser || !activity?.interestedUsers) return false;
    return activity.interestedUsers.some(
      (user) => user === currentUser._id || user?._id === currentUser._id
    );
  };

  const userIsInterested = isInterested();
  const endTime = getEndTime(
    activity.startDate,
    activity.expectedDurationHours
  );

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-[#1e293b] rounded-lg shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden border border-gray-200 dark:border-[#334155] transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full">
      {/* Left Side: Image */}
      <div className="w-full md:w-[160px] flex-shrink-0 p-2 md:p-3 bg-gray-50 dark:bg-[#111827]">
        <img
          src={activity.poster || "https://via.placeholder.com/400x500"}
          alt={activity.title}
          className="object-cover w-full h-full aspect-[1587/2245] rounded"
        />
      </div>

      {/* Right Side: Details and Buttons */}
      <div className="flex flex-col justify-between p-4 w-full">
        <div className="text-center md:text-left">
          <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2">
            {activity.title}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
            <p>
              <strong>Starts:</strong> {formatDateTime(activity.startDate)}
            </p>
            <p>
              <strong>Ends:</strong> {endTime ? formatDateTime(endTime) : "N/A"}
            </p>
            <p className="flex items-center justify-center md:justify-start gap-1 pt-1">
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
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-xs px-3 py-1.5 dark:border-slate-600 dark:text-slate-300"
              onClick={(e) => onToggleInterest(activity._id, e)}
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
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5"
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

export default ActivityCard;
