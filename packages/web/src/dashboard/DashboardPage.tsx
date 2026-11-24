import { useState, type FormEvent } from 'react';
import {
  ProfileType,
  type ProfileDto,
  type UpdateProfileRequest,
} from '@marketplace/shared';
import { ApiClientError, api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface ProfileForm {
  type: ProfileType;
  displayName: string;
  description: string;
  phone: string;
  city: string;
  country: string;
  avatarUrl: string;
  companyName: string;
  taxId: string;
}

function toForm(profile: ProfileDto | null): ProfileForm {
  return {
    type: profile?.type ?? ProfileType.INDIVIDUAL,
    displayName: profile?.displayName ?? '',
    description: profile?.description ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    country: profile?.country ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
    companyName: profile?.companyName ?? '',
    taxId: profile?.taxId ?? '',
  };
}

export function DashboardPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>(() => toForm(user?.profile ?? null));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    const body: UpdateProfileRequest = { ...form };
    try {
      const profile = await api.updateProfile(body);
      setUser({ ...user!, profile });
      setForm(toForm(profile));
      setMessage('Profile saved.');
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to save profile',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="dashboard">
      <div className="dashboard-grid">
        <section className="card">
          <h2>Your account</h2>
          <p>
            <strong>Roles:</strong> {user?.roles.join(', ')}
          </p>
          <p className="muted">
            Browse categories and requests from the navigation above, or post your own request.
          </p>
        </section>

        <section className="card">
          <h2>Your profile</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Profile type
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as ProfileType,
                  }))
                }
              >
                <option value={ProfileType.INDIVIDUAL}>Individual</option>
                <option value={ProfileType.COMPANY}>Company</option>
              </select>
            </label>

            <label>
              Display name
              <input
                value={form.displayName}
                onChange={(event) => update('displayName', event.target.value)}
                required
                minLength={2}
              />
            </label>

            {form.type === ProfileType.COMPANY && (
              <div className="field-row">
                <label>
                  Company name
                  <input
                    value={form.companyName}
                    onChange={(event) => update('companyName', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Tax ID
                  <input
                    value={form.taxId}
                    onChange={(event) => update('taxId', event.target.value)}
                  />
                </label>
              </div>
            )}

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                rows={3}
              />
            </label>

            <div className="field-row">
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                />
              </label>
              <label>
                City
                <input
                  value={form.city}
                  onChange={(event) => update('city', event.target.value)}
                />
              </label>
            </div>

            <div className="field-row">
              <label>
                Country
                <input
                  value={form.country}
                  onChange={(event) => update('country', event.target.value)}
                />
              </label>
              <label>
                Avatar URL
                <input
                  value={form.avatarUrl}
                  onChange={(event) => update('avatarUrl', event.target.value)}
                />
              </label>
            </div>

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
