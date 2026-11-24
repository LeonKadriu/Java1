import { useEffect, useState, type FormEvent } from 'react';
import {
  OfferStatus,
  RequestStatus,
  UserRole,
  type CategoryDto,
  type OfferDto,
  type RequestDto,
} from '@marketplace/shared';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError, api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDto | null>(null);
  const [category, setCategory] = useState<CategoryDto | null>(null);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [offerForm, setOfferForm] = useState({
    message: '',
    price: '',
    currency: 'EUR',
    estimatedDays: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh(requestId: string) {
    const [updatedRequest, updatedOffers] = await Promise.all([
      api.request(requestId),
      api.requestOffers(requestId),
    ]);
    setRequest(updatedRequest);
    setOffers(updatedOffers);
  }

  useEffect(() => {
    if (!id) return;
    let active = true;

    api
      .request(id)
      .then(async (data) => {
        if (!active) return;
        setRequest(data);
        try {
          const [detail, requestOffers] = await Promise.all([
            api.category(data.categoryId),
            api.requestOffers(id),
          ]);
          if (active) {
            setCategory(detail);
            setOffers(requestOffers);
          }
        } catch {
          if (active) setCategory(null);
        }
      })
      .catch(() => {
        if (active) setError('Unable to load this request.');
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function changeStatus(status: RequestStatus) {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api.updateRequest(id, { status });
      setRequest(updated);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to update request',
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api.cancelRequest(id);
      setRequest(updated);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to cancel request',
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      await api.createOffer(id, {
        message: offerForm.message,
        price: Number(offerForm.price),
        currency: offerForm.currency,
        estimatedDays: offerForm.estimatedDays
          ? Number(offerForm.estimatedDays)
          : undefined,
      });
      setOfferForm((current) => ({ ...current, message: '', price: '' }));
      await refresh(id);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to submit offer',
      );
    } finally {
      setBusy(false);
    }
  }

  async function acceptOffer(offerId: string) {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      await api.acceptOffer(offerId);
      await refresh(id);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to accept offer',
      );
    } finally {
      setBusy(false);
    }
  }

  async function withdrawOffer(offerId: string) {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      await api.withdrawOffer(offerId);
      await refresh(id);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to withdraw offer',
      );
    } finally {
      setBusy(false);
    }
  }

  const isOwner = Boolean(user && request && user.id === request.requesterId);
  const canOffer = Boolean(
    user &&
      request &&
      !isOwner &&
      request.status === RequestStatus.OPEN &&
      user.roles.includes(UserRole.PROVIDER),
  );

  return (
    <main className="page">
      <Link to="/requests" className="back-link">
        ← Back to requests
      </Link>

      {error && <p className="error">{error}</p>}
      {!request ? (
        <p className="message">Loading request…</p>
      ) : (
        <section className="card detail-card">
          <div className="request-card-head">
            <h1>{request.title}</h1>
            <span className={`status status-${request.status.toLowerCase()}`}>
              {request.status}
            </span>
          </div>

          <p className="muted">
            {request.category?.name ?? 'Uncategorized'}
            {request.city ? ` · ${request.city}` : ''}
            {request.country ? `, ${request.country}` : ''}
            {request.requesterName ? ` · ${request.requesterName}` : ''}
          </p>

          <p className="description">{request.description}</p>

          <dl className="detail-list">
            <div>
              <dt>Budget</dt>
              <dd>
                {request.budgetAmount
                  ? `${request.budgetAmount} ${request.currency}`
                  : 'Not specified'}
              </dd>
            </div>
            <div>
              <dt>Starts</dt>
              <dd>{request.startsAt ? request.startsAt.slice(0, 10) : 'Flexible'}</dd>
            </div>
            <div>
              <dt>Ends</dt>
              <dd>{request.endsAt ? request.endsAt.slice(0, 10) : 'Flexible'}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{new Date(request.createdAt).toLocaleString()}</dd>
            </div>
          </dl>

          {category && category.attributeSchema.length > 0 && (
            <div>
              <h2>Details</h2>
              <dl className="detail-list">
                {category.attributeSchema.map((definition) => {
                  const value = request.attributes[definition.key];
                  if (value === undefined || value === null || value === '') {
                    return null;
                  }
                  return (
                    <div key={definition.key}>
                      <dt>{definition.label}</dt>
                      <dd>
                        {String(value)}
                        {definition.unit ? ` ${definition.unit}` : ''}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {isOwner && request.status === RequestStatus.OPEN && (
            <div className="detail-actions">
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => changeStatus(RequestStatus.CLOSED)}
              >
                Close request
              </button>
              <button type="button" disabled={busy} onClick={cancel}>
                Cancel request
              </button>
            </div>
          )}

          {canOffer && (
            <form className="form-grid offer-form" onSubmit={submitOffer}>
              <h2>Make an offer</h2>
              <label>
                Message
                <textarea
                  rows={3}
                  value={offerForm.message}
                  onChange={(event) =>
                    setOfferForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <div className="field-row">
                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={offerForm.price}
                    onChange={(event) =>
                      setOfferForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Currency
                  <input
                    value={offerForm.currency}
                    onChange={(event) =>
                      setOfferForm((current) => ({
                        ...current,
                        currency: event.target.value,
                      }))
                    }
                    maxLength={3}
                    required
                  />
                </label>
                <label>
                  Estimated days
                  <input
                    type="number"
                    min="1"
                    value={offerForm.estimatedDays}
                    onChange={(event) =>
                      setOfferForm((current) => ({
                        ...current,
                        estimatedDays: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div>
                <button type="submit" disabled={busy}>
                  Submit offer
                </button>
              </div>
            </form>
          )}

          {(isOwner || offers.length > 0) && (
            <section className="offers-section">
              <h2>Offers</h2>
              {offers.length === 0 ? (
                <p className="muted">No offers yet.</p>
              ) : (
                <div className="list-stack">
                  {offers.map((offer) => (
                    <article className="offer-item" key={offer.id}>
                      <div className="request-card-head">
                        <h3>{offer.providerName ?? 'Provider'}</h3>
                        <span
                          className={`status status-${offer.status.toLowerCase()}`}
                        >
                          {offer.status}
                        </span>
                      </div>
                      <p className="muted">
                        {offer.price} {offer.currency}
                        {offer.estimatedDays ? ` · ${offer.estimatedDays} days` : ''}
                      </p>
                      <p className="description">{offer.message}</p>
                      <div className="detail-actions">
                        {isOwner && offer.status === OfferStatus.PENDING && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => acceptOffer(offer.id)}
                          >
                            Accept offer
                          </button>
                        )}
                        {!isOwner &&
                          offer.providerId === user?.id &&
                          offer.status === OfferStatus.PENDING && (
                            <button
                              type="button"
                              className="secondary"
                              disabled={busy}
                              onClick={() => withdrawOffer(offer.id)}
                            >
                              Withdraw offer
                            </button>
                          )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      )}
    </main>
  );
}
