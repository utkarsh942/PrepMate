import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Topics from "./pages/Topics";
import TopicActions from "./pages/TopicAction";
import ImportantQuestions from "./pages/ImportantQuestions";
import Quiz from "./pages/Quiz";
import Processing from "./pages/processing";

import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./pages/ProtectedRoute";
import TestSetup from "./pages/TestSetup";

const App = () => {
  const location = useLocation();

  // Show navbar ONLY on home
  const showNavbar = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        
        <Route path="/" element={<Home />} />

        
       <Route
  path="/upload"
  element={
    <ProtectedRoute>
      <Upload />
    </ProtectedRoute>
  }
/>

<Route
  path="/topics"
  element={
    <ProtectedRoute>
      <Topics />
    </ProtectedRoute>
  }
/>

<Route
  path="/topics/:topicId"
  element={
    <ProtectedRoute>
      <TopicActions />
    </ProtectedRoute>
  }
/>

<Route
  path="/topics/:topicId/questions"
  element={
    <ProtectedRoute>
      <ImportantQuestions />
    </ProtectedRoute>
  }
/>

<Route
  path="/topics/:topicId/quiz"
  element={
    <ProtectedRoute>
      <Quiz />
    </ProtectedRoute>
  }
/>

<Route
  path="/quiz/all"
  element={
    <ProtectedRoute>
      <Quiz mode="all" />
    </ProtectedRoute>
  }
/>

<Route
  path="/processing"
  element={
    <ProtectedRoute>
      <Processing />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
<Route
path = "/test-setup"
  element={
    <ProtectedRoute>
      <TestSetup />
    </ProtectedRoute>
  }
/>
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;



