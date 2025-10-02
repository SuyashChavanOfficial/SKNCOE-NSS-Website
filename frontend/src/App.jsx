import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInForm from "./auth/forms/SignInForm";
import SignUpForm from "./auth/forms/SignUpForm";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Header from "./components/shared/Header";
import { Toaster } from "./components/ui/toaster";
import Footer from "./components/shared/Footer";
import PrivateRoute from "./components/shared/PrivateRoute";
import CreateNews from "./pages/CreateNews";
import AdminPrivateRoute from "./components/shared/AdminPrivateRoute";
import EditNews from "./pages/EditNews";
import NewsDetails from "./pages/NewsDetails";
import CreateActivity from "./pages/CreateActivity";
import EditActivity from "./pages/EditActivity";
import ScrollToTop from "./components/shared/ScrollToTop";
import Search from "./pages/Search";
import { useDispatch } from "react-redux";
import { signInSuccess } from "./redux/user/userSlice";
import Activities from "./pages/Activities";
import CategoryManager from "./components/shared/DashboardCategory";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/current`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(signInSuccess(data.user));
        }
      } catch (err) {
        console.log("No user logged in");
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Header />
      <ScrollToTop />

      <Routes>
        <Route path="/sign-in" element={<SignInForm />}></Route>
        <Route path="/sign-up" element={<SignUpForm />}></Route>

        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/search" element={<Search />}></Route>

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}></Route>
        </Route>
        <Route path="/news" element={<Search />}></Route>
        <Route path="/activities" element={<Activities />}></Route>
        <Route path="/post/:postSlug" element={<NewsDetails />}></Route>
        
        <Route element={<AdminPrivateRoute />}>
          {/* For News  */}
          <Route path="/create-post" element={<CreateNews />} />
          <Route path="/update-post/:postId" element={<EditNews />} />
          
          {/* For Activities  */}
          <Route
            path="/dashboard/create-activity"
            element={<CreateActivity />}
          />
          <Route
            path="/dashboard/activity/edit/:activityId"
            element={<EditActivity />}
          />
          
          <Route
            path="/category-manager"
            element={<CategoryManager />}
          />


        </Route>
      </Routes>

      <Footer />
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
