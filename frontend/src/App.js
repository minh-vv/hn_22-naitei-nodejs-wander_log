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
import NewsFeed from "./pages/Post/NewsFeed/NewsFeed";
import AuthSuccess from "./pages/Auth/AuthSuccess/AuthSuccess";
import Home from "./pages/Home/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers/AdminUsers";
import AdminItineraries from "./pages/Admin/AdminItineraries/AdminItineraries";
import AdminItineraryDetail from './pages/Admin/AdminItineraryDetail/AdminItineraryDetail'; 
import AdminUserDetail from "./pages/Admin/AdminUserDetail/AdminUserDetail";
import Profile from "./pages/Profile/Profile";
import Search from "./pages/Search/Search";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ToastContainer from "./component/Toast/ToastContainer";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("userToken");
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (user && user.role === "ADMIN") {
    return children;
  }
  return <Navigate to="/signin" replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ToastContainer />
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
        
        {/* Trang chính được bảo vệ */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* Search route */}
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } 
        />

        {/* Profile routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/:userId" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route 
          path="/itineraries" 
          element={
            <ProtectedRoute>
              <ItineraryList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/itineraries/new" 
          element={
            <ProtectedRoute>
              <ItineraryForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/itineraries/edit/:id" 
          element={
            <ProtectedRoute>
              <ItineraryForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/itineraries/:slug" 
          element={
            <ProtectedRoute>
              <ItineraryDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/posts/feed" 
          element={
            <ProtectedRoute>
              <NewsFeed />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <AdminProtectedRoute>
                <AdminUserDetail />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/itineraries"
            element={
              <AdminProtectedRoute>
                <AdminItineraries />
              </AdminProtectedRoute>
            }
          />
          <Route
          path="/admin/itineraries/:itineraryId" 
          element={
            <AdminProtectedRoute>
              <AdminItineraryDetail />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/itineraries"
          element={
            <AdminProtectedRoute>
              <AdminItineraries />
            </AdminProtectedRoute>
          }
        />
        
        <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
