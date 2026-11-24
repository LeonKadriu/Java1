import { useState, type FormEvent } from 'react';
import { ProfileType, UserRole } from '@marketplace/shared';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../api/client';
import { useAuth } from './AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [type, setType] = useState<ProfileType>(ProfileType.INDIVIDUAL);
  const [roles, setRoles] = useState<UserRole[]>([UserRole.REQUESTER]);
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function toggleRole(role: UserRole) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (roles.length === 0) {
      setError('Select at least one role.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email,
        password,
        displayName,
        type,
        roles,
        companyName: type === ProfileType.COMPANY ? companyName : undefined,
        city,
        country,
      });
      navigate('/', { replace: true });
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to register',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="muted">Post requests, make offers, and hire or get hired.</p>

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
            minLength={8}
            autoComplete="new-password"
          />
        </label>

        <label>
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            minLength={2}
          />
        </label>

        <label>
          Profile type
          <select
            value={type}
            onChange={(event) => setType(event.target.value as ProfileType)}
          >
            <option value={ProfileType.INDIVIDUAL}>Individual</option>
            <option value={ProfileType.COMPANY}>Company</option>
          </select>
        </label>

        {type === ProfileType.COMPANY && (
          <label>
            Company name
            <input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
          </label>
        )}

        <fieldset>
          <legend>I want to</legend>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={roles.includes(UserRole.REQUESTER)}
              onChange={() => toggleRole(UserRole.REQUESTER)}
            />
            Post requests
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={roles.includes(UserRole.PROVIDER)}
              onChange={() => toggleRole(UserRole.PROVIDER)}
            />
            Make offers
          </label>
        </fieldset>

        <div className="field-row">
          <label>
            City
            <input value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
          <label>
            Country
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <p className="muted">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
