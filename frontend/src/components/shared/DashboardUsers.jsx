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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const DashboardUsers = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [userIdToDelete, setUserIdToDelete] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/getusers`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          setUsers(data.users);

          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser?.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = users.length;

    try {
      const res = await fetch(
        `${API_URL}/api/user/getusers?startIndex=${startIndex}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);

        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-3">
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <Table>
            <TableCaption>A list of your recent users.</TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Joined On</TableHead>
                <TableHead>User Image</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {users.map((user) => (
                <TableRow key={user._id}>
                  {/* for updated date  */}
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>

                  {/* for image  */}
                  <TableCell>
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover bg-gray-500"
                      loading="lazy"
                    />
                  </TableCell>

                  {/* For title  */}
                  <TableCell>{user.username}</TableCell>

                  {/* For Category  */}
                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    {user.isAdmin ? (
                      <FaCheck className="text-green-600" />
                    ) : (
                      <ImCross className="text-red-600" />
                    )}
                  </TableCell>

                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <span
                          onClick={() => {
                            setUserIdToDelete(user._id);
                          }}
                          className="font-medium text-red-600 hover:underline cursor-pointer"
                        >
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
                            delete the user account and remove their data from
                            our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={handleDeleteUser}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-blue-700 self-center text-sm py-7"
            >
              Show More
            </button>
          )}
        </>
      ) : (
        <p>You have no users yet!</p>
      )}
    </div>
  );
};

export default DashboardUsers;
