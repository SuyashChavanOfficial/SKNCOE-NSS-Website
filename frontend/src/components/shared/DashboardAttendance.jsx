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

  useEffect(() => {
    const fetchData = async () => {
      const [aRes, vRes] = await Promise.all([
        fetch(`${API_URL}/api/activity/get`),
        fetch(`${API_URL}/api/volunteer/get`, { credentials: "include" }),
      ]);

      const aData = await aRes.json();
      const vData = await vRes.json();
      if (aRes.ok) setActivities([...aData.upcoming, ...aData.completed]);
      if (vRes.ok) setVolunteers(vData);
    };

    fetchData();
  }, []);

  // fetch attendance (all records)
  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await fetch(
        `${API_URL}/api/attendance/activity/${activities[0]?._id}`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    };
    if (activities.length > 0) fetchAttendance();
  }, [activities]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
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
                      rec.volunteer._id === v._id && rec.activity._id === a._id
                  );
                  return (
                    <TableCell key={a._id}>
                      {record?.status === "present" ? "✅" : "❌"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="mt-4">
          {activities.map((a) => (
            <div key={a._id} className="mb-6 border rounded p-3">
              <h2 className="font-semibold">{a.title}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.map((v) => {
                    const record = attendance.find(
                      (rec) =>
                        rec.volunteer._id === v._id &&
                        rec.activity._id === a._id
                    );
                    return (
                      <TableRow key={v._id}>
                        <TableCell>{v.name}</TableCell>
                        <TableCell>
                          {record?.status === "present" ? "✅" : "❌"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardAttendance;
