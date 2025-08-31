import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardCard from "./DashboardCard";

const MainDashboard = () => {
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

  // 🔹 Fetch all data in parallel
  const fetchDashboardData = async () => {
    try {
      const [
        usersCurrentRes,
        usersPrevRes,
        postsCurrentRes,
        postsPrevRes,
        commentsCurrentRes,
        commentsPrevRes,
      ] = await Promise.all([
        fetch(
          `/api/user/getUsersInPeriod?startDate=${oneMonthAgo.toISOString()}&endDate=${now.toISOString()}`
        ),
        fetch(
          `/api/user/getUsersInPeriod?startDate=${twoMonthsAgo.toISOString()}&endDate=${prevMonthEnd.toISOString()}`
        ),
        fetch(
          `/api/post/getPostsInPeriod?startDate=${oneMonthAgo.toISOString()}&endDate=${now.toISOString()}`
        ),
        fetch(
          `/api/post/getPostsInPeriod?startDate=${twoMonthsAgo.toISOString()}&endDate=${prevMonthEnd.toISOString()}`
        ),
        fetch(
          `/api/comment/getCommentsInPeriod?startDate=${oneMonthAgo.toISOString()}&endDate=${now.toISOString()}`
        ),
        fetch(
          `/api/comment/getCommentsInPeriod?startDate=${twoMonthsAgo.toISOString()}&endDate=${prevMonthEnd.toISOString()}`
        ),
      ]);

      const [
        usersCurrent,
        usersPrev,
        postsCurrent,
        postsPrev,
        commentsCurrent,
        commentsPrev,
      ] = await Promise.all([
        usersCurrentRes.json(),
        usersPrevRes.json(),
        postsCurrentRes.json(),
        postsPrevRes.json(),
        commentsCurrentRes.json(),
        commentsPrevRes.json(),
      ]);

      // ✅ Update state
      if (usersCurrentRes.ok) setCurrentMonthUsers(usersCurrent.total || 0);
      if (usersPrevRes.ok) setPrevMonthUsers(usersPrev.total || 0);
      if (postsCurrentRes.ok) setCurrentMonthPosts(postsCurrent.total || 0);
      if (postsPrevRes.ok) setPrevMonthPosts(postsPrev.total || 0);
      if (commentsCurrentRes.ok)
        setCurrentMonthComments(commentsCurrent.total || 0);
      if (commentsPrevRes.ok) setPrevMonthComments(commentsPrev.total || 0);
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
    </div>
  );
};

export default MainDashboard;
