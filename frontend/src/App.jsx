import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInForm from "./auth/forms/SignInForm";
import SignUpForm from "./auth/forms/SignUpForm";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import NewsArticles from "./pages/NewsArticles";
import Header from "./components/shared/Header";
import { Toaster } from "./components/ui/toaster";
import Footer from "./components/shared/Footer";
import PrivateRoute from "./components/shared/PrivateRoute";
import CreatePost from "./pages/CreateNews";
import AdminPrivateRoute from "./components/shared/AdminPrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/sign-in" element={<SignInForm />}></Route>
        <Route path="/sign-up" element={<SignUpForm />}></Route>

        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}></Route>
        </Route>
        <Route path="/news" element={<NewsArticles />}></Route>
        <Route element={<AdminPrivateRoute />}>
          <Route path="/create-post" element={<CreatePost />} />
        </Route>
      </Routes>

      <Footer />
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
