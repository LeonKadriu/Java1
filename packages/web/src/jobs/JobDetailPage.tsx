import { useEffect, useState, type FormEvent } from 'react';
import {
  JobStatus,
  type JobDto,
  type ReviewDto,
} from '@marketplace/shared';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError, api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load(jobId: string) {
    const [updatedJob, updatedReviews] = await Promise.all([
      api.job(jobId),
      api.jobReviews(jobId),
    ]);
    setJob(updatedJob);
    setReviews(updatedReviews);
  }

  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .job(id)
      .then(async (data) => {
        if (!active) return;
        setJob(data);
        const jobReviews = await api.jobReviews(id);
        if (active) setReviews(jobReviews);
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof ApiClientError ? cause.message : 'Unable to load job',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function complete() {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      await api.completeJob(id);
      await load(id);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to complete job',
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      await api.createReview({
        jobId: id,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });
      setComment('');
      await load(id);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to submit review',
      );
    } finally {
      setBusy(false);
    }
  }

  const isRequester = Boolean(user && job && user.id === job.requesterId);
  const alreadyReviewed = reviews.some((review) => review.reviewerId === user?.id);

  return (
    <main className="page">
      <Link to="/jobs" className="back-link">
        ← Back to jobs
      </Link>

      {error && <p className="error">{error}</p>}
      {!job ? (
        <p className="message">Loading job…</p>
      ) : (
        <>
          <section className="card detail-card">
            <div className="request-card-head">
              <h1>{job.requestTitle || 'Job'}</h1>
              <span className={`status status-${job.status.toLowerCase()}`}>
                {job.status}
              </span>
            </div>

            <dl className="detail-list">
              <div>
                <dt>{isRequester ? 'Provider' : 'Requester'}</dt>
                <dd>
                  {isRequester
                    ? (job.providerName ?? 'Provider')
                    : (job.requesterName ?? 'Requester')}
                </dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>
                  {job.price} {job.currency}
                </dd>
              </div>
              <div>
                <dt>Accepted</dt>
                <dd>{new Date(job.acceptedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Completed</dt>
                <dd>
                  {job.completedAt
                    ? new Date(job.completedAt).toLocaleString()
                    : 'Not yet'}
                </dd>
              </div>
            </dl>

            {job.status === JobStatus.ACTIVE && (
              <div className="detail-actions">
                <button type="button" disabled={busy} onClick={complete}>
                  Mark as completed
                </button>
              </div>
            )}
          </section>

          <section className="card offers-section">
            <h2>Reviews</h2>
            {reviews.length === 0 ? (
              <p className="muted">No reviews yet.</p>
            ) : (
              <div className="list-stack">
                {reviews.map((review) => (
                  <article className="offer-item" key={review.id}>
                    <div className="request-card-head">
                      <h3>{review.reviewerName ?? 'Participant'}</h3>
                      <span className="status">{review.rating}/5</span>
                    </div>
                    <p className="muted">{review.targetType}</p>
                    {review.comment && <p className="description">{review.comment}</p>}
                  </article>
                ))}
              </div>
            )}

            {job.status === JobStatus.COMPLETED && !alreadyReviewed && (
              <form className="form-grid" onSubmit={submitReview}>
                <h3>Leave a review</h3>
                <div className="field-row">
                  <label>
                    Rating
                    <select
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Comment
                    <input
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      maxLength={2000}
                      placeholder="Optional"
                    />
                  </label>
                </div>
                <div>
                  <button type="submit" disabled={busy}>
                    Submit review
                  </button>
                </div>
              </form>
            )}
            {job.status === JobStatus.COMPLETED && alreadyReviewed && (
              <p className="success">You have reviewed this job.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
