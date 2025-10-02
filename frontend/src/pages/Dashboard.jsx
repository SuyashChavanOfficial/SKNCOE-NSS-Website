import BottomNavbar from "@/components/shared/BottomNavbar";
import DashboardActivities from "@/components/shared/DashboardActivities";
import DashboardAdmins from "@/components/shared/DashboardAdmins";
import DashboardComments from "@/components/shared/DashboardComments";
import DashboardPosts from "@/components/shared/DashboardPosts";
import DashboardProfile from "@/components/shared/DashboardProfile";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import DashboardUsers from "@/components/shared/DashboardUsers";
import MainDashboard from "@/components/shared/MainDashboard";
import DashboardVolunteers from "@/components/shared/DashboardVolunteers";
import DashboardAttendance from "@/components/shared/DashboardAttendance";
import DashboardCategory from "@/components/shared/DashboardCategory";

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");

    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <BottomNavbar />

      <div className="w-full">
        {/* Dashboard Profile */}
        {tab === "profile" && <DashboardProfile />}

        {/* Activities */}
        {tab === "activities" && <DashboardActivities />}

        {/* news articles */}
        {tab === "posts" && <DashboardPosts />}

        {/* Users */}
        {tab === "users" && <DashboardUsers />}

        {/* Comments */}
        {tab === "comments" && <DashboardComments />}

        {/* Main Dashboard */}
        {tab === "dashboard" && <MainDashboard />}

        {/* Admin Dashboard */}
        {tab === "admins" && <DashboardAdmins />}
        
        {tab === "category-manager" && <DashboardCategory />}

        {tab === "volunteers" && <DashboardVolunteers />}
        {tab === "attendance" && <DashboardAttendance />}
      </div>
    </div>
  );
};

export default Dashboard;
