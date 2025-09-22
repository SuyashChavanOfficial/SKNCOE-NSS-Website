import React from "react";

const ActivityCard = ({ activity, onToggleInterest, currentUser, isAdmin }) => {
  const {
    _id,
    title,
    poster,
    startDate,
    expectedDurationHours,
    interestedUsers = [],
  } = activity;
  const start = new Date(startDate);
  const end = new Date(start.getTime() + expectedDurationHours * 3600 * 1000);
  const isPast = Date.now() > end.getTime();
  const interestedCount = interestedUsers.length;

  const userIsInterested =
    currentUser && interestedUsers.some((u) => u._id === currentUser._id);

  return (
    <div className="flex gap-4 p-4 rounded-lg shadow-sm border bg-white">
      <img
        src={poster}
        alt={title}
        className="w-36 h-24 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">
          Starts: {start.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Duration: {expectedDurationHours} hr(s)
        </p>
        <p className="text-xs text-gray-500">Ends: {end.toLocaleString()}</p>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => onToggleInterest(_id)}
            disabled={!currentUser}
            className={`text-sm px-3 py-1 rounded-md border ${
              userIsInterested
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {userIsInterested ? "Interested ✓" : "Mark Interest"}
          </button>

          <span className="text-sm text-gray-600">
            {interestedCount} interested
          </span>

          {isPast && (
            <span className="ml-auto text-xs py-0.5 px-2 rounded bg-gray-100 text-gray-700">
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
