import "primeicons/primeicons.css";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./App.css";

import { getCurrentUser } from "./features/auth/authSlice";
import { socket } from "./lib/socket";

import GuestRoute from "./utils/GuestRoute";
import AuthRoute from "./utils/AuthRoute";

import ChatBot from "./components/ChatBot";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import LeaveManagement from "./pages/LeaveManagement";
import ChatAgent from "./pages/ChatAgent";

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    socket.connect();
    dispatch(getCurrentUser());

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route path="/password">
            <Route
              path="forgot"
              element={
                <GuestRoute>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
            <Route
              path="reset"
              element={
                <GuestRoute>
                  <ResetPassword />
                </GuestRoute>
              }
            />
          </Route>
          <Route path="/dashboard">
            <Route
              path=""
              element={
                <AuthRoute>
                  <Dashboard />
                </AuthRoute>
              }
            />
            <Route
              path="leave-management"
              element={
                <AuthRoute>
                  <LeaveManagement />
                </AuthRoute>
              }
            />
            <Route
              path="chat-agent"
              element={
                <AuthRoute>
                  <ChatAgent />
                </AuthRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      <ChatBot />
    </div>
  );
};

export default App;
