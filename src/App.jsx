import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Spinner from './components/Spinner.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AllTasksPage from './pages/AllTasksPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MyTasksPage from './pages/MyTasksPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage.jsx';
import TeamProgressPage from './pages/TeamProgressPage.jsx';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="h-screen" />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/tasks" element={<AllTasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/team-progress" element={<TeamProgressPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
