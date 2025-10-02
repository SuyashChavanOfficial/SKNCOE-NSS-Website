import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Toggle } from "../ui/toggle";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardAttendance = () => {
  const [view, setView] = useState("table"); // "table" | "activity"
  const [activities, setActivities] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityAttendance, setActivityAttendance] = useState({}); // { volunteerId: true/false }

  // Fetch activities and volunteers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [aRes, vRes] = await Promise.all([
          fetch(`${API_URL}/api/activity/get`, { credentials: "include" }),
          fetch(`${API_URL}/api/volunteer/get`, { credentials: "include" }),
        ]);

        const aData = await aRes.json();
        const vData = await vRes.json();

        if (aRes.ok) setActivities([...aData.upcoming, ...aData.completed]);
        if (vRes.ok) setVolunteers(vData);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch all attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_URL}/api/attendance`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAttendance(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttendance();
  }, [activities]);

  // When activity clicked in Activity View
  const openActivity = (activity) => {
    setSelectedActivity(activity);
    // Initialize checkboxes (all unchecked by default)
    const initialState = {};
    volunteers.forEach((v) => {
      const record = attendance.find(
        (rec) =>
          rec.volunteer?._id === v._id && rec.activity?._id === activity._id
      );
      initialState[v._id] = record?.status === "present" || false;
    });
    setActivityAttendance(initialState);
  };

  const handleCheckboxChange = (volunteerId) => {
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
      await Promise.all(
        updates.map((upd) =>
          fetch(`${API_URL}/api/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(upd),
          })
        )
      );

      // Refetch attendance for Table View
      const res = await fetch(`${API_URL}/api/attendance`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
        alert("Attendance saved successfully!");
        setSelectedActivity(null); // back to activity list
      }
    } catch (err) {
      console.error(err);
      alert("Error saving attendance");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <Toggle
          pressed={view === "activity"}
          onPressedChange={() =>
            setView(view === "table" ? "activity" : "table")
          }
        >
          Switch to {view === "table" ? "Activity View" : "Table View"}
        </Toggle>
      </div>

      {view === "table" ? (
        <Table className="mt-4 overflow-x-scroll">
          <TableHeader>
            <TableRow>
              <TableHead>Volunteer</TableHead>
              {activities.map((a) => (
                <TableHead key={a._id}>{a.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.map((v) => (
              <TableRow key={v._id}>
                <TableCell>{v.name}</TableCell>
                {activities.map((a) => {
                  const record = attendance.find(
                    (rec) =>
                      rec.volunteer?._id === v._id &&
                      rec.activity?._id === a._id
                  );
                  return (
                    <TableCell key={a._id} className="text-center">
                      {record?.status === "present" ? "✅" : "❌"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="mt-4 space-y-4">
          {!selectedActivity ? (
            // Activity List
            activities.map((a) => (
              <div
                key={a._id}
                className="p-4 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => openActivity(a)}
              >
                <h2 className="font-semibold">{a.title}</h2>
              </div>
            ))
          ) : (
            // Attendance Table for Selected Activity
            <div>
              <h2 className="font-semibold mb-2">{selectedActivity.title}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={!!activityAttendance[v._id]}
                          onChange={() => handleCheckboxChange(v._id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} className="text-right">
                      <Button onClick={handleSaveAttendance}>
                        Save Attendance
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAttendance;
