import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess, signOutSuccess } from "./redux/user/userSlice";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import ScrollToTop from "./components/shared/ScrollToTop";
import PrivateRoute from "./components/shared/PrivateRoute";
import AdminPrivateRoute from "./components/shared/AdminPrivateRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Search from "./pages/Search";
import NewsDetails from "./pages/NewsDetails";
import CreateNews from "./components/shared/CreateNews";
import EditNews from "./components/shared/EditNews";
import CreateActivity from "./components/shared/CreateActivity";
import EditActivity from "./components/shared/EditActivity";
import CategoryManager from "./components/shared/DashboardCategory";
import ActivityDetails from "./pages/ActivityDetails";
import SignInForm from "./auth/forms/SignInForm";
import SignUpForm from "./auth/forms/SignUpForm";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/current`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          dispatch(signInSuccess(data.user));
        } else {
          dispatch(signOutSuccess());
          await fetch(`${API_URL}/api/user/signout`, {
            method: "POST",
            credentials: "include",
          });
        }
      } catch (err) {
        console.log("Auth check failed:", err);
        dispatch(signOutSuccess());
        await fetch(`${API_URL}/api/user/signout`, {
          method: "POST",
          credentials: "include",
        });
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

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
