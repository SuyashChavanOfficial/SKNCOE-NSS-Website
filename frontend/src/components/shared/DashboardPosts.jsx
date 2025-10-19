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
import { Link, useNavigate } from "react-router-dom";
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
import Pagination from "../shared/Pagination";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardPosts = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const navigate = useNavigate();

  const fetchPosts = async (page = 1) => {
    try {
      const startIndex = (page - 1) * postsPerPage;
      const res = await fetch(
        `${API_URL}/api/post/getposts?startIndex=${startIndex}&limit=${postsPerPage}&sort=desc`
      );
      const data = await res.json();
      if (res.ok) {
        setUserPosts(data.posts);
        setTotalPosts(data.totalPosts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) fetchPosts(currentPage);
  }, [currentUser?.isAdmin, currentPage]);

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  const handleDeletePost = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/post/deletepost/${postIdToDelete}/${currentUser._id}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) fetchPosts(currentPage);
      else console.log(data.message);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Your Articles</h2>
        <button
          onClick={() => navigate("/dashboard?tab=create-news")}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium transition-all"
        >
          + Create News
        </button>
      </div>

      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table>
            <TableCaption>List of your published articles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date Updated</TableHead>
                <TableHead>News Date</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-center">Delete</TableHead>
                <TableHead className="text-center">Edit</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {userPosts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>
                    {new Date(post.updatedAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    {new Date(post.newsDate).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <Link to={`/post/${post.slug}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-20 h-10 object-cover rounded bg-gray-200"
                      />
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </TableCell>
                  <TableCell>{post.numberOfLikes || 0}</TableCell>
                  <TableCell className="text-slate-600">
                    {post.userId.username}
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <span
                          onClick={() => setPostIdToDelete(post._id)}
                          className="text-red-600 hover:underline cursor-pointer"
                        >
                          Delete
                        </span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={handleDeletePost}
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      to={`/dashboard?tab=edit-news&id=${post._id}`}
                      className="text-blue-900 hover:underline"
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        </>
      ) : (
        <p className="text-slate-600 mt-5 text-lg">No posts found.</p>
      )}
    </div>
  );
};

export default DashboardPosts;
