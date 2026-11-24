import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Marketplace
        </Link>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/requests">Requests</NavLink>
          <NavLink to="/requests/new">New request</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
        </nav>
        <div className="header-user">
          <span className="muted">{user?.email}</span>
          <button type="button" className="secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
