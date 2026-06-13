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
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardPosts = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const postsPerPage = 9;

  // Get current page from URL query string
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page")) || 1;

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const fetchPosts = async (page = 1) => {
    try {
      const startIndex = (page - 1) * postsPerPage;
      const res = await fetch(
        `${API_URL}/api/post/get-posts?startIndex=${startIndex}&limit=${postsPerPage}&sort=desc`
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

  // Fetch posts whenever page changes or admin changes
  useEffect(() => {
    if (currentUser?.isAdmin) fetchPosts(currentPage);
  }, [currentUser?.isAdmin, currentPage]);

  // Update URL when changing page
  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    navigate(`/dashboard?tab=posts&page=${pageNum}`);
  };

  const handleDeletePost = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/post/delete-post`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            postId: postIdToDelete,
            userId: currentUser._id,
          }),
        }
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
                {currentUser?.isSuperAdmin && <TableHead className="text-center">Logs</TableHead>}
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
                    {post.authorName || (post.userId && post.userId.username) || "Unknown"}
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
                  {currentUser?.isSuperAdmin && (
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="text-teal-600 hover:underline cursor-pointer">
                            Logs
                          </span>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editorial Logs: {post.title}</DialogTitle>
                            <DialogDescription>
                              Detailed creation and modification history.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 my-2 text-sm text-slate-700">
                            <div>
                              <p><strong>Created By:</strong> {post.createdByName || "Unknown"} (@{post.createdByUsername || "unknown"})</p>
                              <p><strong>Created At:</strong> {new Date(post.createdAt).toLocaleString("en-GB")}</p>
                              <p><strong>Total Updates:</strong> {post.updateCount || 0}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2 text-slate-800">Update History</h4>
                              {post.updateHistory && post.updateHistory.length > 0 ? (
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
                                      {post.updateHistory.map((historyItem, idx) => (
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
                    </TableCell>
                  )}
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
