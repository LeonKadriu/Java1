import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './auth/LoginPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { RegisterPage } from './auth/RegisterPage';
import {
  CategoriesPage,
  CreateRequestPage,
  RequestDetailPage,
  RequestsPage,
} from './catalog';
import { DashboardPage } from './dashboard/DashboardPage';
import { JobDetailPage, JobsPage } from './jobs';
import { Layout } from './layout/Layout';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/new" element={<CreateRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
