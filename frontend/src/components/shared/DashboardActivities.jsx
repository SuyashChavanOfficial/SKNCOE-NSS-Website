import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardActivities = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity/get`);
        const data = await res.json();
        if (res.ok) {
          setActivities(
            [...data.upcoming, ...data.completed].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (currentUser?.isAdmin) fetchActivities();
  }, [currentUser?.isAdmin]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this activity?")) return;
    try {
      const res = await fetch(`${API_URL}/api/activity/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setActivities((prev) => prev.filter((a) => a._id !== id));
      } else console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Activities</h2>
        <Link
          to="/dashboard/create-activity"
          className="px-3 py-1 rounded bg-blue-600 text-white"
        >
          Create Activity
        </Link>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p>No activities yet</p>
        ) : (
          activities.map((a) => (
            <div
              key={a._id}
              className="flex items-center gap-4 p-3 border rounded"
            >
              <img
                src={a.poster}
                alt={a.title}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-gray-500">
                  Starts: {new Date(a.startDate).toLocaleString()}
                </div>

                {/* Show interested count only for admins */}
                {currentUser?.isAdmin && (
                  <div className="text-xs text-gray-600 mt-1">
                    {a.interestedUsers?.length || 0} interested
                  </div>
                )}
              </div>

              <Link
                to={`/dashboard/activity/${a._id}`}
                className="text-green-600 hover:underline"
              >
                View
              </Link>
              <Link
                to={`/dashboard/activity/edit/${a._id}`}
                className="text-yellow-600 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(a._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardActivities;
