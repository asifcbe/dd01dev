import React, { useState, Suspense, lazy } from "react";
import AuthCard from "./components/AuthCard.jsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
const Layout = lazy(() => import("./components/DashboardLayout.jsx"));
import { CssBaseline } from "@mui/material";
import axios from "axios";
import "./App.scss";
import LoadMask from "./components/LoadMask.jsx";
import { AppThemeProvider } from "./context/ThemeContext";
import "@fontsource/inter"; // Import the font

// Settings page lazy load
const Settings = lazy(() => import("./components/Settings.jsx"));

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({
    email: "",
    org: "",
    avatar: "https://i.pravatar.cc/300",
  });
  const logOut = async () => {
    try {
      const res = await axios.post(
        "/api/signout",
        {},
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        setLoggedIn(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AppThemeProvider>
      <CssBaseline />
      <div className="app">
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                !loggedIn ? (
                  <AuthCard
                    onLogin={(userData) => { setUser(userData); setLoggedIn(true); }}
                    onSignup={() => setLoggedIn(true)}
                  />
                ) : (
                  <Navigate replace to="/clients" />
                )
              }
            />
            {/* Main App Routes */}
            <Route
              path="/*"
              element={
                loggedIn ? (
                  <Suspense fallback={<LoadMask text="Loading Dashboard" />}>
                     <Routes>
                        <Route path="settings" element={<Settings />} /> 
                        <Route path="*" element={<Layout user={user} onLogout={logOut} />} />
                     </Routes>
                  </Suspense>
                ) : (
                  <Navigate replace to="/" />
                )
              }
            />
            {/* Fallback route */}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AppThemeProvider>
  );
}
