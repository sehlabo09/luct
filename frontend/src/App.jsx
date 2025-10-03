// frontend/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import LecturerDashboard from "./components/LecturerDashboard";
import PRDashboard from "./components/prDashboard";
import Reports from "./components/reports";
import StudentReports from "./components/student";
import CoursesAdmin from "./components/pr";

// ✅ Protect routes by role
function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // user info saved at login

  if (!token || !user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route
          path="/student/*"
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/reports"
          element={
            <PrivateRoute role="student">
              <StudentReports />
            </PrivateRoute>
          }
        />

        {/* Lecturer */}
        <Route
          path="/lecturer/*"
          element={
            <PrivateRoute role="lecturer">
              <LecturerDashboard />
            </PrivateRoute>
          }
        />

        {/* Program Leader (PL) / Courses Admin */}
        <Route
          path="/pl/courses"
          element={
            <PrivateRoute role="pl">
              <CoursesAdmin />
            </PrivateRoute>
          }
        />

        {/* Principal Lecturer (PR) */}
        <Route
          path="/pr/*"
          element={
            <PrivateRoute role="pr">
              <PRDashboard />
            </PrivateRoute>
          }
        />

        {/* Reports (admin / PR view) */}
        <Route
          path="/reports"
          element={
            <PrivateRoute role="pr">
              <Reports />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
