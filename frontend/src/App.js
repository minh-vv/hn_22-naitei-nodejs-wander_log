import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signup from "./pages/Auth/Signup/Signup";
import Signin from "./pages/Auth/Signin/Signin";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
import ChangePassword from "./pages/Auth/ChangePassword/ChangePassword";
import ItineraryForm from "./pages/Itinerary/ItineraryForm/ItineraryForm";
import ItineraryList from "./pages/Itinerary/ItineraryList/ItineraryList";
import ItineraryDetail from "./pages/Itinerary/ItineraryDetail/ItineraryDetail";
import CreatePost from "./pages/Post/CreatePost/CreatePost";
import NewsFeed from "./pages/Post/NewsFeed/NewsFeed";
import AuthSuccess from "./pages/Auth/AuthSuccess/AuthSuccess";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
        <Route path="/itineraries" element={<ItineraryList />} />
        <Route path="/itineraries/new" element={<ItineraryForm />} />
        <Route path="/itineraries/edit/:id" element={<ItineraryForm />} />
        <Route path="/itineraries/:id" element={<ItineraryDetail />} />
        <Route path="/posts/new" element={<CreatePost />} />
        <Route path="/posts/feed" element={<NewsFeed />} />
      </Routes>
    </Router>
  );
}

export default App;
