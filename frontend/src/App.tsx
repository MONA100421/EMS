import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./theme/muiTheme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import PersonalInformation from "./pages/employee/PersonalInformation";
import OnboardingApplication from "./pages/employee/OnboardingApplication";
import VisaStatus from "./pages/employee/VisaStatus";

// HR Pages
import HRDashboard from "./pages/hr/HRDashboard";
import EmployeeProfiles from "./pages/hr/EmployeeProfiles";
import EmployeeProfileDetail from "./pages/hr/EmployeeProfileDetail";
import VisaManagement from "./pages/hr/VisaManagement";
import HiringManagement from "./pages/hr/HiringManagement";

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: "employee" | "hr";
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate
        to={user?.role === "hr" ? "/hr/dashboard" : "/employee/dashboard"}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user?.role === "hr" ? "/hr/dashboard" : "/employee/dashboard"}
      replace
    />
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute requiredRole="employee">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="personal-info" element={<PersonalInformation />} />
        <Route path="onboarding" element={<OnboardingApplication />} />
        <Route path="visa-status" element={<VisaStatus />} />
      </Route>

      {/* HR Routes */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute requiredRole="hr">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="employees" element={<EmployeeProfiles />} />
        <Route path="employees/:id" element={<EmployeeProfileDetail />} />
        <Route path="visa-management" element={<VisaManagement />} />
        <Route path="hiring" element={<HiringManagement />} />
      </Route>

      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
