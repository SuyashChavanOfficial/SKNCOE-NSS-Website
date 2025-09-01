import React from "react";
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
import ScrollToTop from "./components/shared/ScrollToTop";
import Search from "./pages/Search";

const App = () => {
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
        <Route path="/post/:postSlug" element={<NewsDetails />}></Route>
        <Route element={<AdminPrivateRoute />}>
          <Route path="/create-post" element={<CreateNews />} />
          <Route path="/update-post/:postId" element={<EditNews />} />
        </Route>
      </Routes>

      <Footer />
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
