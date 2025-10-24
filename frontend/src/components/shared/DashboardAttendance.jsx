import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux"; // Import useSelector
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Toggle } from "../ui/toggle";
import { useToast } from "../../hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { ArrowLeft, Check, X } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardAttendance = () => {
  const { currentUser } = useSelector((state) => state.user); // Get current user
  const [view, setView] = useState("activity");
  const [activities, setActivities] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]); // For volunteer view
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityAttendance, setActivityAttendance] = useState({});
  const { toast } = useToast();

  // Fetch data based on user role
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [aRes, vRes] = await Promise.all([
          fetch(`${API_URL}/api/activity/get`, { credentials: "include" }),
          fetch(`${API_URL}/api/user/getVolunteers?limit=1000`, {
            credentials: "include",
          }),
        ]);
        const aData = await aRes.json();
        const vData = await vRes.json();

        if (aRes.ok) {
          const allActivities = [...aData.upcoming, ...aData.completed].sort(
            (a, b) => new Date(b.startDate) - new Date(a.startDate)
          );
          setActivities(allActivities);
        }
        if (vRes.ok) setVolunteers(vData.volunteers);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch admin data.",
          variant: "destructive",
        });
      }
    };

    // ✅ FIX: This function now fetches ALL activities and merges them with the user's records.
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
        if (!attendanceRes.ok)
          throw new Error(
            attendanceData.message || "Failed to fetch attendance"
          );

        // 3. Merge the two lists
        const mergedAttendance = allActivities.map((activity) => {
          const record = attendanceData.find(
            (rec) => rec.activity?._id === activity._id
          );
          return {
            // We use the activity._id as the key for the React map
            _id: activity._id,
            activity: activity, // Pass the full activity object
            status: record ? record.status : "absent", // Default to "absent" if no record exists
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

    if (currentUser?.isAdmin) {
      fetchAdminData();
    } else if (currentUser?.isVolunteer) {
      fetchMyAttendance();
    } else {
      setLoading(false); // No data to load for this user
    }
  }, [currentUser, toast]); // Added toast to dependency array

  // Fetch all attendance records *only* if admin and table view is selected
  useEffect(() => {
    const fetchAllAttendance = async () => {
      if (currentUser?.isAdmin && view === "table") {
        try {
          setLoading(true);
          const res = await fetch(`${API_URL}/api/attendance`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setAllAttendance(data);
          }
          setLoading(false);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      }
    };
    fetchAllAttendance();
  }, [view, currentUser?.isAdmin]);

  // --- Admin-Specific Functions ---

  const openActivity = async (activity) => {
    try {
      setLoadingActivity(true);
      setSelectedActivity(activity);
      const res = await fetch(
        `${API_URL}/api/attendance/activity/${activity._id}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      const initialState = {};
      volunteers.forEach((v) => {
        const record = data.find((rec) => rec.volunteer?._id === v._id);
        initialState[v._id] = record?.status === "present" || false;
      });
      setActivityAttendance(initialState);
      setLoadingActivity(false);
    } catch (err) {
      console.error(err);
      setLoadingActivity(false);
      toast({
        title: "Error",
        description: "Could not load activity attendance.",
        variant: "destructive",
      });
    }
  };

  const handleToggleChange = (volunteerId) => {
    setActivityAttendance((prev) => ({
      ...prev,
      [volunteerId]: !prev[volunteerId],
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedActivity) return;
    const updates = Object.entries(activityAttendance).map(
      ([volId, present]) => ({
        volunteerId: volId,
        activityId: selectedActivity._id,
        status: present ? "present" : "absent",
      })
    );
    try {
      const res = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Attendance saved." });
        setSelectedActivity(null);
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // --- Render Logic ---

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
      {/* ---------------- RENDER ADMIN VIEW ---------------- */}
      {currentUser?.isAdmin ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Attendance</h1>
            <Toggle
              pressed={view === "activity"}
              onPressedChange={() =>
                setView(view === "table" ? "activity" : "table")
              }
            >
              {view === "table" ? "Activity View" : "Table View"}
            </Toggle>
          </div>

          {view === "table" ? (
            <ScrollArea className="border rounded-md">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    {activities.map((a) => (
                      <TableHead key={a._id} className="text-center">
                        {a.title}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell className="font-medium">
                        {v.username}
                      </TableCell>
                      {activities.map((a) => {
                        const record = allAttendance.find(
                          (rec) =>
                            rec.volunteer?._id === v._id &&
                            rec.activity?._id === a._id
                        );
                        return (
                          <TableCell key={a._id} className="text-center">
                            {record?.status === "present" ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 mx-auto" />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="mt-4 space-y-4">
              {!selectedActivity ? (
                // Activity List
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activities.map((a) => (
                    <div
                      key={a._id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => openActivity(a)}
                    >
                      <h2 className="font-semibold text-lg">{a.title}</h2>
                      <p className="text-sm text-gray-600">
                        {formatDate(a.startDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                // Attendance Table for Selected Activity
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-4"
                    onClick={() => setSelectedActivity(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Activities
                  </Button>

                  {loadingActivity ? (
                    <div className="flex justify-center items-center p-10">
                      <DotLottieReact
                        src="https://lottie.host/8e929f18-c53a-4d1e-94f0-9bc6cf21fbaf/8qmvB7P8wA.lottie"
                        loop
                        autoplay
                        style={{ width: "100px", height: "100px" }}
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="font-semibold text-xl mb-2">
                        {selectedActivity.title}
                      </h2>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Volunteer</TableHead>
                              <TableHead className="text-center">
                                Present
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {volunteers.map((v) => (
                              <TableRow key={v._id}>
                                <TableCell className="font-medium">
                                  {v.username}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Toggle
                                    pressed={!!activityAttendance[v._id]}
                                    onPressedChange={() =>
                                      handleToggleChange(v._id)
                                    }
                                    aria-label="Toggle attendance"
                                  >
                                    {!!activityAttendance[v._id] ? (
                                      <Check className="w-5 h-5" />
                                    ) : (
                                      <X className="w-5 h-5" />
                                    )}
                                  </Toggle>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <Button
                        onClick={handleSaveAttendance}
                        className="mt-4 w-full"
                      >
                        Save Attendance
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : /* ---------------- RENDER VOLUNTEER VIEW ---------------- */
      currentUser?.isVolunteer ? (
        <>
          <h1 className="text-2xl font-bold mb-4">My Attendance</h1>
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
        </>
      ) : (
        /* ---------------- RENDER DEFAULT VIEW (e.g., regular user) ---------------- */
        <p>You do not have permission to view attendance.</p>
      )}
    </div>
  );
};

export default DashboardAttendance;
