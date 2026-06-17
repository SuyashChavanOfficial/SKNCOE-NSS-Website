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
import DashboardPoster from "@/components/shared/DashboardPoster";
import CreateNews from "@/components/shared/CreateNews";
import EditNews from "@/components/shared/EditNews";
import CreateActivity from "@/components/shared/CreateActivity";
import EditActivity from "@/components/shared/EditActivity";
import Attendance from "@/components/shared/Attendance";

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");

    setTab(tabFromUrl || "profile");
  }, [location.search]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [tab]);

  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-300 dark:border-[#1e3a5f] bg-white dark:bg-[#0f1729] sticky top-0 z-40 transition-colors duration-300">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-700 dark:text-gray-300"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <h1 className="text-xl font-bold dark:text-gray-100">Dashboard</h1>
        <div className="w-6 h-6"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky md:top-0 left-0 top-0 h-screen md:h-auto md:min-h-[calc(100vh-theme(spacing.16))]
          w-3/4 md:w-64
          bg-slate-200 dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-lg dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-40 transform transition-all duration-300
          flex-shrink-0
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <DashboardSidebar
          closeSidebar={() => setSidebarOpen(false)}
          activeTab={tab}
        />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0 bg-white dark:bg-[#0b1120] min-h-screen transition-colors duration-300">
        {tab === "profile" && <DashboardProfile />}

        {/* Poster of the Day */}
        {tab === "poster-of-the-day" && <DashboardPoster />}

        {/* Activities */}
        {tab === "activities" && <DashboardActivities />}
        {tab === "create-activity" && <CreateActivity />}
        {tab === "edit-activity" && <EditActivity />}

        {/* news articles */}
        {tab === "posts" && <DashboardPosts />}
        {tab === "create-news" && <CreateNews />}
        {tab === "edit-news" && <EditNews />}

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

        {/* "Manage Attendance" for Admins */}
        {tab === "attendance" && <DashboardAttendance />}

        {/* "My Attendance" for Everyone */}
        {tab === "my-attendance" && <Attendance />}
      </div>
    </div>
  );
};

export default Dashboard;
