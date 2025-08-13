import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInForm from "./auth/forms/SignInForm";
import SignUpForm from "./auth/forms/SignUpForm";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import NewsArticles from "./pages/NewsArticles";

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/sign-in" element={<SignInForm />}></Route>
      <Route path="/sign-up" element={<SignUpForm />}></Route>
      
      <Route path="/" element={<Home />}></Route>
      <Route path="/about" element={<About />}></Route>
      <Route path="/dashboard" element={<Dashboard />}></Route>
      <Route path="/news" element={<NewsArticles />}></Route>
    </Routes>
    </BrowserRouter>
  );
};

export default App;
