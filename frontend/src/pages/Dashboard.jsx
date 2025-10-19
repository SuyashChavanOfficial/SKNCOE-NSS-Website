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

    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [tab]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-300 bg-white sticky top-0 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-700"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      <aside
        className={`
          fixed md:static top-0 left-0 h-full md:h-auto w-3/4 md:w-64
          bg-slate-200 text-slate-800 shadow-lg z-50 transform transition-transform duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <DashboardSidebar
          closeSidebar={() => setSidebarOpen(false)}
          activeTab={tab}
          setTab={setTab}
        />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 w-full">
        {tab === "profile" && <DashboardProfile />}

        {/* Poster of the Day */}
        {tab === "poster-of-the-day" && <DashboardPoster />}

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
