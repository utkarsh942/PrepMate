import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./pages/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import Upload from "./pages/Upload";

// AI Features
import NoteSummary from "./pages/NoteSummary";
import NoteQuiz from "./pages/NoteQuiz";
import NoteFlashcards from "./pages/NoteFlashcards";

// Auth
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

const App = () => {
  const location = useLocation();

  // Show navbar on landing and auth pages, hide on app layout core pages
  const isCoreAppPage = ["/dashboard", "/notes", "/upload", "/profile"].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/")
  );

  return (
    <>
      {!isCoreAppPage && <Navbar />}

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Authenticated Core Pages wrapper with Sidebar Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* AI Feature Pages inside main app frame */}
          <Route path="/notes/:noteId/summary" element={<NoteSummary />} />
          <Route path="/notes/:noteId/quiz" element={<NoteQuiz />} />
          <Route path="/notes/:noteId/flashcards" element={<NoteFlashcards />} />
        </Route>

        {/* Auth pages (WITH AuthLayout wrapper) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
