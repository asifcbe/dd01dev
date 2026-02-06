import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import axios from "axios";
import LoadMask from "./LoadMask";

export default function AuthCard({ onLogin, onSignup }) {
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({
    org: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // <-- loading state

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // On mount, check login status
  useEffect(() => {
    async function checkLogin() {
      setLoading(true);
      try {
        const res = await axios.get("/api/me", {
          withCredentials: true,
        });
        if (res.status === 200) {
          const userEmail = res.data?.email || "User";
          const userOrg = res.data?.org || "Org";
          setUser({ email: userEmail, org: userOrg });
          setIsLoggedIn(true);
          onLogin({ email: userEmail, org: userOrg });
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  const handleChange = (event, newVal) => setTab(newVal);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      org: form.org.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    try {
      const res = await axios.post("/api/signin", payload, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUser({ email: form.email, org: form.org });
        setIsLoggedIn(true);
        onLogin({ email: form.email, org: form.org });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail?.message;
      const msg = Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg || (err.response?.data?.error) || err.message || "Sign in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/signup",
        {
          org: form.org.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        onSignup();
        setTab("signin");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail?.message;
      const msg = Array.isArray(errorMsg) ? errorMsg.join('\n') : (err.response?.data?.error || err.message || "Sign up failed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch {
      // Ignore errors
    }
    setIsLoggedIn(false);
    setUser(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <LoadMask text="Loggin In"/>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {isLoggedIn ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography component="h1" variant="h6" sx={{ fontWeight: "bold" }}>
              {user?.name}
            </Typography>
            <Button variant="outlined" onClick={handleLogout}>
              Log Out
            </Button>
          </Box>
        ) : (
          <>
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h6" sx={{ fontWeight: "bold" }}>
              Welcome Back!
            </Typography>

            <Tabs
              value={tab}
              onChange={handleChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: 3,
                "& .MuiTab-root": {
                  fontWeight: "bold",
                  fontSize: 12,
                  color: "text.primary",
                },
                "& .Mui-selected": { color: "primary.main" },
              }}
            >
              <Tab label="Sign In" value="signin" />
              <Tab label="Sign Up" value="signup" />
            </Tabs>

            {error && (
              <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <Alert
                  onClose={() => setError("")}
                  severity="error"
                  variant="filled"
                  sx={{
                    width: "100%",
                    maxWidth: 600,
                    fontSize: "1rem",
                    fontWeight: 500,
                    boxShadow: 3,
                    borderRadius: 2,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {error}
                </Alert>
              </Snackbar>
            )}

            {tab === "signin" ? (
              <Box
                component="form"
                noValidate
                onSubmit={handleSignIn}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Organization"
                  name="org"
                  value={form.org}
                  onChange={handleInputChange}
                  size="small"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={form.email}
                  onChange={handleInputChange}
                  size="small"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleInputChange}
                  size="small"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
                >
                  Sign In
                </Button>
              </Box>
            ) : (
              <Box
                component="form"
                noValidate
                onSubmit={handleSignUp}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Organization"
                  name="org"
                  value={form.org}
                  onChange={handleInputChange}
                  size="small"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleInputChange}
                  size="small"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleInputChange}
                  size="small"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  size="small"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

