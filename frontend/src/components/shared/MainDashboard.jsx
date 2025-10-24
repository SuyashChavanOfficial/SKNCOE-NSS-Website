import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardCard from "./DashboardCard";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const MainDashboard = () => {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);

  const [currentMonthUsers, setCurrentMonthUsers] = useState(0);
  const [currentMonthPosts, setCurrentMonthPosts] = useState(0);
  const [currentMonthComments, setCurrentMonthComments] = useState(0);

  const [prevMonthUsers, setPrevMonthUsers] = useState(0);
  const [prevMonthPosts, setPrevMonthPosts] = useState(0);
  const [prevMonthComments, setPrevMonthComments] = useState(0);

  const { currentUser } = useSelector((state) => state.user);

  // 🔹 Dates
  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );
  const twoMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 2,
    now.getDate()
  );

  // Fix overlap: prev period ends one day before current period
  const prevMonthEnd = new Date(oneMonthAgo);
  prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
  prevMonthEnd.setHours(23, 59, 59, 999);

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const periodDescription = `From ${formatDate(oneMonthAgo)} to ${formatDate(
    now
  )}`;

  // 🔹 Ratio calculation for circle
  const calculateEndAngle = (prevValue, currentValue) => {
    if (prevValue === 0 && currentValue > 0) return 360;
    if (prevValue === 0 && currentValue === 0) return 0;

    const ratio = currentValue / prevValue;
    return Math.min(ratio * 360, 360);
  };

  const fetchDashboardData = async () => {
    try {
      const [
        usersCurrentRes,
        usersPrevRes,
        postsCurrentRes,
        postsPrevRes,
        commentsCurrentRes,
        commentsPrevRes,
        recentUsersRes,
        recentCommentsRes,
        recentPostsRes,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/user/getUsersInPeriod?startDate=${oneMonthAgo.toISOString()}&endDate=${now.toISOString()}`,
          { credentials: "include" }
        ),
        fetch(
          `${API_URL}/api/user/getUsersInPeriod?startDate=${twoMonthsAgo.toISOString()}&endDate=${prevMonthEnd.toISOString()}`,
          { credentials: "include" }
        ),
        fetch(
          `${API_URL}/api/post/getPostsInPeriod?startDate=${oneMonthAgo.toISOString()}&endDate=${now.toISOString()}`,
          { credentials: "include" }
        ),
        fetch(
          `${API_URL}/api/post/getPostsInPeriod?startDate=${twoMonthsAgo.toISOString()}&endDate=${prevMonthEnd.toISOString()}`,
          { credentials: "include" }
        ),
        fetch(
          `${API_URL}/api/comment/getCommentsInPeriod?startDate=${oneMonthAgo.toISOString()}&endDate=${now.toISOString()}`,
          { credentials: "include" }
        ),
        fetch(
          `${API_URL}/api/comment/getCommentsInPeriod?startDate=${twoMonthsAgo.toISOString()}&endDate=${prevMonthEnd.toISOString()}`,
          { credentials: "include" }
        ),
        fetch(`${API_URL}/api/user/getusers?limit=5&sort=desc`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/comment/getComments?limit=5&sort=desc`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/post/getposts?limit=5&sort=desc`),
      ]);

      const [
        usersCurrent,
        usersPrev,
        postsCurrent,
        postsPrev,
        commentsCurrent,
        commentsPrev,
        recentUsers,
        recentComments,
        recentPosts,
      ] = await Promise.all([
        usersCurrentRes.json(),
        usersPrevRes.json(),
        postsCurrentRes.json(),
        postsPrevRes.json(),
        commentsCurrentRes.json(),
        commentsPrevRes.json(),
        recentUsersRes.json(),
        recentCommentsRes.json(),
        recentPostsRes.json(),
      ]);

      // ✅ Update state
      if (usersCurrentRes.ok) setCurrentMonthUsers(usersCurrent.total || 0);
      if (usersPrevRes.ok) setPrevMonthUsers(usersPrev.total || 0);
      if (postsCurrentRes.ok) setCurrentMonthPosts(postsCurrent.total || 0);
      if (postsPrevRes.ok) setPrevMonthPosts(postsPrev.total || 0);
      if (commentsCurrentRes.ok)
        setCurrentMonthComments(commentsCurrent.total || 0);
      if (commentsPrevRes.ok) setPrevMonthComments(commentsPrev.total || 0);

      if (recentUsersRes.ok) setUsers(recentUsers.users || []);
      if (recentCommentsRes.ok) setComments(recentComments.comments || []);
      if (recentPostsRes.ok) setPosts(recentPosts.posts || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  // 🔹 Run once on mount
  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchDashboardData();
    }
  }, [currentUser]);

  return (
    <div className="p-3 md:mx-auto">
      <div className="flex flex-wrap gap-4 justify-center">
        <DashboardCard
          title="All Users"
          description={periodDescription}
          chartData={[{ value: currentMonthUsers, fill: "blue" }]}
          chartConfig={{ users: { label: "Users" } }}
          totalValue={currentMonthUsers}
          lastMonthValue={prevMonthUsers}
          footerText={"Showing current and previous period comparison."}
          endAngle={calculateEndAngle(prevMonthUsers, currentMonthUsers)}
        />

        <DashboardCard
          title="All Posts"
          description={periodDescription}
          chartData={[{ value: currentMonthPosts, fill: "red" }]}
          chartConfig={{ posts: { label: "Posts" } }}
          totalValue={currentMonthPosts}
          lastMonthValue={prevMonthPosts}
          footerText={"Showing current and previous period comparison."}
          endAngle={calculateEndAngle(prevMonthPosts, currentMonthPosts)}
        />

        <DashboardCard
          title="All Comments"
          description={periodDescription}
          chartData={[{ value: currentMonthComments, fill: "green" }]}
          chartConfig={{ comments: { label: "Comments" } }}
          totalValue={currentMonthComments}
          lastMonthValue={prevMonthComments}
          footerText={"Showing current and previous period comparison."}
          endAngle={calculateEndAngle(prevMonthComments, currentMonthComments)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-3 mx-auto">
        {/* For Recent users  */}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md">
          <div className="flex justify-between items-center p-3 text-sm font-semibold">
            <h1 className="text-center p-2 text-xl font-bold text-slate-700">
              Recent Users
            </h1>
            <Button className="">
              <Link to={"/dashboard?tab=users"}>See All</Link>
            </Button>
          </div>

          <Table>
            <TableCaption>A List of recent Users.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">Profile Picture</TableHead>
                <TableHead>Username</TableHead>
              </TableRow>
            </TableHeader>
            {users &&
              users.map((user) => (
                <TableBody className="divide-y" key={user._id}>
                  <TableRow>
                    <TableCell>
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-10 h-10 object-cover bg-gray-200 rounded-full"
                        loading="lazy"
                      />
                    </TableCell>
                    <TableCell className="w-32">{user.username}</TableCell>
                  </TableRow>
                </TableBody>
              ))}
          </Table>
        </div>

        {/* For Recent Comments  */}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md">
          <div className="flex justify-between items-center p-3 text-sm font-semibold">
            <h1 className="text-center p-2 text-xl font-bold text-slate-700">
              Recent Comments
            </h1>
            <Button className="">
              <Link to={"/dashboard?tab=comments"}>See All</Link>
            </Button>
          </div>

          <Table>
            <TableCaption>A List of recent Comments.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">Comments</TableHead>
                <TableHead>Likes</TableHead>
              </TableRow>
            </TableHeader>
            {comments &&
              comments.map((c) => (
                <TableBody className="divide-y" key={c._id}>
                  <TableRow>
                    <TableCell className="w-50">
                      <p className="line-clamp-2">{c.content}</p>
                    </TableCell>
                    <TableCell>{c.numberOfLikes}</TableCell>
                  </TableRow>
                </TableBody>
              ))}
          </Table>
        </div>

        {/* For Recent Posts  */}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md">
          <div className="flex justify-between items-center p-3 text-sm font-semibold">
            <h1 className="text-center p-2 text-xl font-bold text-slate-700">
              Recent Posts
            </h1>
            <Button className="">
              <Link to={"/dashboard?tab=posts"}>See All</Link>
            </Button>
          </div>

          <Table>
            <TableCaption>A List of recent Posts.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">Post Image</TableHead>
                <TableHead>Post Title</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            {posts &&
              posts.map((post) => (
                <TableBody className="divide-y" key={post._id}>
                  <TableRow>
                    <TableCell>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-10 h-10 object-cover bg-gray-200 rounded-full"
                        loading="lazy"
                      />
                    </TableCell>
                    <TableCell className="w-80 line-clamp-2">
                      {post.title}
                    </TableCell>
                    <TableCell className="w-5">{post.category}</TableCell>
                  </TableRow>
                </TableBody>
              ))}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
