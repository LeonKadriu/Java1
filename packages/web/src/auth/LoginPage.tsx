import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../api/client';
import { useAuth } from './AuthContext';

interface RedirectState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as RedirectState | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to sign in',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <p className="muted">Access your marketplace account.</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="muted">
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </main>
  );
}
