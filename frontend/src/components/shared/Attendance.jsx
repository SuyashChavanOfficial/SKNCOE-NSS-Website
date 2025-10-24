import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useToast } from "../../hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Check, X } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Attendance = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [myAttendance, setMyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch data only if the current user is a volunteer
  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        setLoading(true);
        // 1. Fetch ALL activities
        const activityRes = await fetch(`${API_URL}/api/activity/get`, {
          credentials: "include",
        });
        const activityData = await activityRes.json();
        if (!activityRes.ok)
          throw new Error(activityData.message || "Failed to fetch activities");

        const allActivities = [
          ...activityData.upcoming,
          ...activityData.completed,
        ];

        // 2. Fetch ONLY the volunteer's attendance records
        const attendanceRes = await fetch(
          `${API_URL}/api/attendance/volunteer/${currentUser._id}`,
          { credentials: "include" }
        );
        const attendanceData = await attendanceRes.json();
        if (!attendanceRes.ok) {
          // This handles cases where the volunteer has no records yet
          if (attendanceRes.status === 404 || attendanceRes.status === 403) {
            console.log("User has no attendance records.");
          } else {
            throw new Error(
              attendanceData.message || "Failed to fetch attendance"
            );
          }
        }

        // 3. Merge the two lists
        const mergedAttendance = allActivities.map((activity) => {
          const record = (
            Array.isArray(attendanceData) ? attendanceData : []
          ).find((rec) => rec.activity?._id === activity._id);
          return {
            _id: activity._id,
            activity: activity,
            status: record ? record.status : "absent",
          };
        });

        // 4. Sort by activity date, newest first
        const sortedData = mergedAttendance.sort(
          (a, b) =>
            new Date(b.activity.startDate) - new Date(a.activity.startDate)
        );

        setMyAttendance(sortedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        toast({
          title: "Error",
          description: err.message || "Failed to fetch your attendance.",
          variant: "destructive",
        });
      }
    };

    // ✅ FIX: Only run the fetch if the user is a volunteer
    if (currentUser?.isVolunteer) {
      fetchMyAttendance();
    } else {
      setLoading(false); // Not a volunteer, stop loading
    }
  }, [currentUser, toast]);

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-10">
        <DotLottieReact
          src="https://lottie.host/8e929f18-c53a-4d1e-94f0-9bc6cf21fbaf/8qmvB7P8wA.lottie"
          loop
          autoplay
          style={{ width: "100px", height: "100px" }}
        />
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Attendance</h1>

      {/* ✅ FIX: Conditionally render table or message based on volunteer status */}
      {currentUser?.isVolunteer ? (
        <ScrollArea className="border rounded-md">
          <Table>
            <TableCaption>
              Your attendance record for all activities.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAttendance.length > 0 ? (
                myAttendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">
                      {record.activity?.title || "Deleted Activity"}
                    </TableCell>
                    <TableCell>
                      {formatDate(record.activity?.startDate)}
                    </TableCell>
                    <TableCell>
                      {record.status === "present" ? (
                        <span className="flex items-center gap-2 text-green-600 font-medium">
                          <Check className="w-5 h-5" /> Present
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-600 font-medium">
                          <X className="w-5 h-5" /> Absent
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No activities found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        // Message for non-volunteers
        <div className="border rounded-md p-10 flex justify-center items-center bg-gray-50">
          <p className="text-gray-600 font-medium text-center">
            You are not registered as a volunteer. This page is only for
            volunteers.
          </p>
        </div>
      )}
    </div>
  );
};

export default Attendance;
