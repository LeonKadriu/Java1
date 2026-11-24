import { useEffect, useState } from 'react';
import { JobStatus, type JobDto, type Paginated } from '@marketplace/shared';
import { Link } from 'react-router-dom';
import { ApiClientError, api } from '../api/client';

export function JobsPage() {
  const [jobs, setJobs] = useState<Paginated<JobDto> | null>(null);
  const [status, setStatus] = useState<JobStatus | ''>('');
  const [mine, setMine] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .jobs({
        status: status || undefined,
        mine: mine || undefined,
        page,
        limit: 10,
      })
      .then((data) => {
        if (active) setJobs(data);
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof ApiClientError ? cause.message : 'Unable to load jobs',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [status, mine, page]);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Jobs</h1>
          <p className="muted">Accepted offers you are involved in.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <div className="field-row">
          <label>
            Status
            <select
              value={status}
              onChange={(event) => {
                setLoading(true);
                setStatus(event.target.value as JobStatus | '');
                setPage(1);
              }}
            >
              <option value="">All</option>
              {Object.values(JobStatus).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={mine}
              onChange={(event) => {
                setLoading(true);
                setMine(event.target.checked);
                setPage(1);
              }}
            />
            Assigned to me
          </label>
        </div>
      </section>

      {loading ? (
        <p className="message">Loading jobs…</p>
      ) : jobs && jobs.items.length > 0 ? (
        <>
          <div className="list-stack">
            {jobs.items.map((job) => (
              <Link
                to={`/jobs/${job.id}`}
                className="card job-link-card"
                key={job.id}
              >
                <div className="request-card-head">
                  <h2>{job.requestTitle || 'Job'}</h2>
                  <span className={`status status-${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>
                <p className="muted">
                  {job.providerName ?? 'Provider'} · {job.requesterName ?? 'Requester'}
                </p>
                <p className="muted">
                  {job.price} {job.currency} · Accepted{' '}
                  {new Date(job.acceptedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
          <div className="pagination">
            <button
              type="button"
              className="secondary"
              disabled={page === 1}
              onClick={() => {
                setLoading(true);
                setPage((current) => current - 1);
              }}
            >
              Previous
            </button>
            <span>
              Page {jobs.page} · {jobs.total} jobs
            </span>
            <button
              type="button"
              className="secondary"
              disabled={page * jobs.limit >= jobs.total}
              onClick={() => {
                setLoading(true);
                setPage((current) => current + 1);
              }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="message">No jobs found.</p>
      )}
    </main>
  );
}
