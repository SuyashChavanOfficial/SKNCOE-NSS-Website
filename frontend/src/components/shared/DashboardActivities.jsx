import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardActivities = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

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
      const res = await fetch(`${API_URL}/api/activity/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: id }),
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
    <div className="p-6">
      {/* Header section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Activities</h2>

        <button
          onClick={() => navigate("/dashboard?tab=create-activity")}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium transition-all"
        >
          + Create Activity
        </button>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-gray-600">No activities yet</p>
        ) : (
          activities.map((a) => (
            <div
              key={a._id}
              className="flex items-center gap-4 p-3 border rounded hover:shadow-md transition-all"
            >
              <img
                src={a.poster}
                alt={a.title}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-800">{a.title}</div>
                <div className="text-xs text-gray-500">
                  Starts: {new Date(a.startDate).toLocaleString()}
                </div>

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
                to={`/dashboard?tab=edit-activity&id=${a._id}`}
                className="font-medium text-blue-900 hover:underline"
              >
                Edit
              </Link>

              <button
                onClick={() => handleDelete(a._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>

              {currentUser?.isSuperAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-teal-600 hover:underline">
                      Logs
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editorial Logs: {a.title}</DialogTitle>
                      <DialogDescription>
                        Detailed creation and modification history.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-2 text-sm text-slate-700">
                      <div>
                        <p><strong>Created By:</strong> {a.createdByName || "Unknown"} (@{a.createdByUsername || "unknown"})</p>
                        <p><strong>Created At:</strong> {new Date(a.createdAt).toLocaleString("en-GB")}</p>
                        <p><strong>Total Updates:</strong> {a.updateCount || 0}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-slate-800">Update History</h4>
                        {a.updateHistory && a.updateHistory.length > 0 ? (
                          <div className="border rounded overflow-hidden">
                            <Table>
                              <TableHeader className="bg-slate-50">
                                <TableRow>
                                  <TableHead className="py-2">Editor Name</TableHead>
                                  <TableHead className="py-2">Username</TableHead>
                                  <TableHead className="py-2">Date Updated</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {a.updateHistory.map((historyItem, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="py-2">{historyItem.updatedByName || "Unknown"}</TableCell>
                                    <TableCell className="py-2">@{historyItem.updatedByUsername || "unknown"}</TableCell>
                                    <TableCell className="py-2">
                                      {new Date(historyItem.updatedAt).toLocaleString("en-GB")}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No update history recorded.</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardActivities;
