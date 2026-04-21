import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Splash from "./pages/Splash.tsx";
import Welcome from "./pages/Welcome.tsx";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";
import InstructorDashboard from "./pages/InstructorDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Assessment from "./pages/Assessment.tsx";
import StudentProfile from "./pages/StudentProfile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

type Role = "student" | "instructor" | "admin";

const getDashboardPathByRole = (role?: Role) => {
  if (role === "student") return "/dashboard/student";
  if (role === "instructor") return "/dashboard/instructor";
  if (role === "admin") return "/dashboard/admin";
  return "/auth?mode=login";
};

const DashboardHomeRedirect = () => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return <Navigate to={getDashboardPathByRole(user.role)} replace />;
};

const ProtectedDashboard = ({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: React.ReactElement;
}) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] pt-24 pb-12">
      <div className="container max-w-6xl">
        {children}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/splash" element={<Splash />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardHomeRedirect />} />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedDashboard allowedRoles={["student", "admin"]}>
                  <StudentDashboard />
                </ProtectedDashboard>
              }
            />
            <Route
              path="/dashboard/instructor"
              element={
                <ProtectedDashboard allowedRoles={["instructor", "admin"]}>
                  <InstructorDashboard />
                </ProtectedDashboard>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedDashboard allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedDashboard>
              }
            />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
