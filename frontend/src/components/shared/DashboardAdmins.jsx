import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardAdmins = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [admins, setAdmins] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // ✅ Fetch all users, but show sorted (admins first)
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/getusers`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          const sorted = data.users.sort((a, b) => b.isAdmin - a.isAdmin);
          setAdmins(sorted);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser.isSuperAdmin) {
      fetchAdmins();
    }
  }, [currentUser?.isSuperAdmin]);

  // ✅ Handle checkbox toggle
  const handleToggle = (id) => {
    if (!editMode) return; // disabled until Edit is clicked
    setAdmins((prev) =>
      prev.map((user) =>
        user._id === id ? { ...user, isAdmin: !user.isAdmin } : user
      )
    );
  };

  // ✅ Save changes
  const handleSave = async () => {
    try {
      const updates = admins.map((u) => ({
        userId: u._id,
        isAdmin: u.isAdmin,
      }));

      const res = await fetch(`${API_URL}/api/user/updateAdmins`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Admins updated:", data.message);
        setEditMode(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!currentUser?.isSuperAdmin) {
    return <p className="p-3">You are not authorized to view this page.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-3">
      {admins.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Image</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Is Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {admins.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover bg-gray-500"
                    />
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={() => handleToggle(user._id)}
                      disabled={!editMode}
                      className="w-5 h-5"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Toggle button */}
          <Button
            className="mt-5 bg-slate-700 text-white"
            onClick={editMode ? handleSave : () => setEditMode(true)}
          >
            {editMode ? "Save Admins" : "Edit Admins"}
          </Button>
        </>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default DashboardAdmins;
