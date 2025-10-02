import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardVolunteers = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [volunteers, setVolunteers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    email: "",
    password: "",
    dob: "",
  });

  const fetchVolunteers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/volunteer/get`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setVolunteers(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) fetchVolunteers();
  }, [currentUser]);

  const handleAddVolunteer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/volunteer/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setVolunteers((prev) => [data, ...prev]);
        setFormData({ name: "", batch: "", email: "", password: "", dob: "" });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/volunteer/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setVolunteers((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Volunteers</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Volunteer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Volunteer</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                placeholder="Batch (22-24)"
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
              <Button onClick={handleAddVolunteer}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>List of all volunteers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volunteers.map((v) => (
            <TableRow key={v._id}>
              <TableCell>{v.name}</TableCell>
              <TableCell>{v.batch}</TableCell>
              <TableCell>{v.email}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <span className="font-medium text-red-600 hover:underline cursor-pointer">
                      Delete
                    </span>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the volunteer account and remove their data from
                        our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-2">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        className="bg-red-600 text-white"
                        onClick={() => handleDelete(v._id)}
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DashboardVolunteers;
