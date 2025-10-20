import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess } from "./redux/user/userSlice";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";

import SignInForm from "./auth/forms/SignInForm";
import SignUpForm from "./auth/forms/SignUpForm";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import PrivateRoute from "./components/shared/PrivateRoute";
import CreateNews from "./components/shared/CreateNews";
import AdminPrivateRoute from "./components/shared/AdminPrivateRoute";
import EditNews from "./components/shared/EditNews";
import NewsDetails from "./pages/NewsDetails";
import CreateActivity from "./components/shared/CreateActivity";
import EditActivity from "./components/shared/EditActivity";
import ScrollToTop from "./components/shared/ScrollToTop";
import Search from "./pages/Search";
import Activities from "./pages/Activities";
import CategoryManager from "./components/shared/DashboardCategory";
import ActivityDetails from "./pages/ActivityDetails";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const App = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/current`, {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data?.user) {
          // Valid token and user
          dispatch(signInSuccess(data.user));
        } else {
          // Only show toast if user has a token (i.e., previously logged in)
          if (document.cookie.includes("access_token")) {
            toast({
              title: "Session Expired!",
              description:
                "Your session has expired. Please sign in again to access restricted features.",
              variant: "destructive",
            });
          }
        }
      } catch (err) {
        console.log("Auth check failed:", err);
        if (document.cookie.includes("access_token")) {
          toast({
            title: "Unable to verify session",
            description: "Please sign in again if needed.",
            variant: "destructive",
          });
        }
      }
    };

    fetchCurrentUser();
  }, [dispatch, toast]);

  return (
    <BrowserRouter>
      <Header />
      <ScrollToTop />

      <Routes>
        <Route path="/sign-in" element={<SignInForm />} />
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/news" element={<Search />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/post/:postSlug" element={<NewsDetails />} />
        <Route
          path="/dashboard/activity/:activityId"
          element={<ActivityDetails />}
        />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Admin-only Routes */}
        <Route element={<AdminPrivateRoute />}>
          <Route path="/create-post" element={<CreateNews />} />
          <Route path="/update-post/:postId" element={<EditNews />} />
          <Route
            path="/dashboard/create-activity"
            element={<CreateActivity />}
          />
          <Route
            path="/dashboard/activity/edit/:activityId"
            element={<EditActivity />}
          />
          <Route path="/category-manager" element={<CategoryManager />} />
        </Route>
      </Routes>

      <Footer />
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
