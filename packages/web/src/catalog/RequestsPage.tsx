import { useEffect, useState, type FormEvent } from 'react';
import {
  RequestStatus,
  type CategoryDto,
  type ListRequestsQuery,
  type Paginated,
  type RequestDto,
} from '@marketplace/shared';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

interface FilterForm {
  q: string;
  city: string;
  categoryId: string;
  status: string;
  minBudget: string;
  maxBudget: string;
  mine: boolean;
}

const statuses = [
  RequestStatus.OPEN,
  RequestStatus.CLOSED,
  RequestStatus.CANCELLED,
  RequestStatus.COMPLETED,
  RequestStatus.DRAFT,
];

export function RequestsPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState<ListRequestsQuery>(() => ({
    page: 1,
    limit: 20,
    categoryId: searchParams.get('categoryId') ?? undefined,
  }));
  const [filters, setFilters] = useState<FilterForm>(() => ({
    q: '',
    city: '',
    categoryId: searchParams.get('categoryId') ?? '',
    status: '',
    minBudget: '',
    maxBudget: '',
    mine: false,
  }));
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [result, setResult] = useState<Paginated<RequestDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .categories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api
      .requests(query)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setError('');
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load requests.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  function change(next: Partial<ListRequestsQuery>) {
    setLoading(true);
    setQuery((current) => ({ ...current, ...next, page: next.page ?? 1 }));
  }

  function updateFilter<K extends keyof FilterForm>(key: K, value: FilterForm[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    change({
      q: filters.q || undefined,
      city: filters.city || undefined,
      categoryId: filters.categoryId || undefined,
      status: (filters.status as RequestStatus) || undefined,
      minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
      maxBudget: filters.maxBudget ? Number(filters.maxBudget) : undefined,
      mine: filters.mine || undefined,
    });
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Requests</h1>
          <p className="muted">Find work, rentals and services posted by others.</p>
        </div>
        <Link className="button-link" to="/requests/new">
          New request
        </Link>
      </div>

      <form className="card filters" onSubmit={applyFilters}>
        <label>
          Search
          <input
            value={filters.q}
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder="Title or description"
          />
        </label>
        <label>
          Category
          <select
            value={filters.categoryId}
            onChange={(event) => updateFilter('categoryId', event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          City
          <input
            value={filters.city}
            onChange={(event) => updateFilter('city', event.target.value)}
          />
        </label>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
          >
            <option value="">Open</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Min budget
          <input
            type="number"
            min="0"
            value={filters.minBudget}
            onChange={(event) => updateFilter('minBudget', event.target.value)}
          />
        </label>
        <label>
          Max budget
          <input
            type="number"
            min="0"
            value={filters.maxBudget}
            onChange={(event) => updateFilter('maxBudget', event.target.value)}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.mine}
            onChange={(event) => updateFilter('mine', event.target.checked)}
          />
          Only my requests
        </label>
        <button type="submit">Apply filters</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="message">Loading requests…</p>
      ) : (
        <>
          <p className="muted">{result?.total ?? 0} request(s) found</p>
          <div className="request-list">
            {result?.items.map((item) => (
              <Link
                key={item.id}
                to={`/requests/${item.id}`}
                className="card request-card"
              >
                <div className="request-card-head">
                  <h2>{item.title}</h2>
                  <span className={`status status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                <p className="muted">{item.description.slice(0, 180)}</p>
                <div className="request-meta">
                  <span>{item.category?.name ?? 'Uncategorized'}</span>
                  {item.city && <span>{item.city}</span>}
                  {item.budgetAmount && (
                    <span>
                      {item.budgetAmount} {item.currency}
                    </span>
                  )}
                  {item.requesterName && <span>by {item.requesterName}</span>}
                </div>
              </Link>
            ))}
            {result?.items.length === 0 && (
              <p className="muted">No requests match these filters.</p>
            )}
          </div>

          <div className="pagination">
            <button
              type="button"
              className="secondary"
              disabled={(query.page ?? 1) <= 1}
              onClick={() => change({ page: (query.page ?? 1) - 1 })}
            >
              Previous
            </button>
            <span>
              Page {query.page ?? 1} of{' '}
              {Math.max(1, Math.ceil((result?.total ?? 0) / (result?.limit ?? 20)))}
            </span>
            <button
              type="button"
              className="secondary"
              disabled={
                (query.page ?? 1) * (result?.limit ?? 20) >= (result?.total ?? 0)
              }
              onClick={() => change({ page: (query.page ?? 1) + 1 })}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
