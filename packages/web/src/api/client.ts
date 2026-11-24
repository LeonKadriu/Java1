import type {
  AuthResponse,
  CategoryDto,
  CreateOfferRequest,
  CreateReviewRequest,
  CreateRequestRequest,
  JobDto,
  ListJobsQuery,
  ListRequestsQuery,
  LoginRequest,
  OfferDto,
  Paginated,
  ProfileDto,
  RegisterRequest,
  RequestDto,
  ReviewDto,
  UpdateOfferRequest,
  UpdateProfileRequest,
  UpdateRequestRequest,
  UserDto,
} from '@marketplace/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'marketplace.token';

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function extractMessage(body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }
  return 'Something went wrong';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiClientError(response.status, extractMessage(body));
  }
  return body as T;
}

function buildQuery(query: ListRequestsQuery): string {
  const params = new URLSearchParams();
  const values: Array<[string, string | number | boolean | undefined]> = [
    ['q', query.q],
    ['categoryId', query.categoryId],
    ['city', query.city],
    ['status', query.status],
    ['minBudget', query.minBudget],
    ['maxBudget', query.maxBudget],
    ['from', query.from],
    ['to', query.to],
    ['mine', query.mine],
    ['page', query.page],
    ['limit', query.limit],
  ];

  for (const [key, value] of values) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

function buildJobsQuery(query: ListJobsQuery): string {
  const params = new URLSearchParams();
  const values: Array<[string, string | number | boolean | undefined]> = [
    ['status', query.status],
    ['mine', query.mine],
    ['page', query.page],
    ['limit', query.limit],
  ];

  for (const [key, value] of values) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export const api = {
  register: (body: RegisterRequest): Promise<AuthResponse> =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: LoginRequest): Promise<AuthResponse> =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: (): Promise<UserDto> => request('/auth/me'),

  getProfile: (): Promise<ProfileDto> => request('/profiles/me'),

  updateProfile: (body: UpdateProfileRequest): Promise<ProfileDto> =>
    request('/profiles/me', { method: 'PATCH', body: JSON.stringify(body) }),

  categories: (): Promise<CategoryDto[]> => request('/categories'),

  categoryTree: (): Promise<CategoryDto[]> => request('/categories/tree'),

  category: (idOrSlug: string): Promise<CategoryDto> =>
    request(`/categories/${encodeURIComponent(idOrSlug)}`),

  requests: (query: ListRequestsQuery = {}): Promise<Paginated<RequestDto>> => {
    const queryString = buildQuery(query);
    return request(`/requests${queryString ? `?${queryString}` : ''}`);
  },

  request: (id: string): Promise<RequestDto> =>
    request(`/requests/${encodeURIComponent(id)}`),

  createRequest: (body: CreateRequestRequest): Promise<RequestDto> =>
    request('/requests', { method: 'POST', body: JSON.stringify(body) }),

  updateRequest: (id: string, body: UpdateRequestRequest): Promise<RequestDto> =>
    request(`/requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  cancelRequest: (id: string): Promise<RequestDto> =>
    request(`/requests/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  requestOffers: (requestId: string): Promise<OfferDto[]> =>
    request(`/offers/request/${encodeURIComponent(requestId)}`),

  myOffers: (): Promise<OfferDto[]> => request('/offers/mine'),

  createOffer: (requestId: string, body: CreateOfferRequest): Promise<OfferDto> =>
    request(`/offers/request/${encodeURIComponent(requestId)}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateOffer: (id: string, body: UpdateOfferRequest): Promise<OfferDto> =>
    request(`/offers/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  withdrawOffer: (id: string): Promise<OfferDto> =>
    request(`/offers/${encodeURIComponent(id)}/withdraw`, { method: 'POST' }),

  acceptOffer: (id: string): Promise<JobDto> =>
    request(`/offers/${encodeURIComponent(id)}/accept`, { method: 'POST' }),

  jobs: (query: ListJobsQuery = {}): Promise<Paginated<JobDto>> => {
    const queryString = buildJobsQuery(query);
    return request(`/jobs${queryString ? `?${queryString}` : ''}`);
  },

  job: (id: string): Promise<JobDto> =>
    request(`/jobs/${encodeURIComponent(id)}`),

  completeJob: (id: string): Promise<JobDto> =>
    request(`/jobs/${encodeURIComponent(id)}/complete`, { method: 'POST' }),

  createReview: (body: CreateReviewRequest): Promise<ReviewDto> =>
    request('/reviews', { method: 'POST', body: JSON.stringify(body) }),

  jobReviews: (jobId: string): Promise<ReviewDto[]> =>
    request(`/reviews/job/${encodeURIComponent(jobId)}`),

  receivedReviews: (): Promise<ReviewDto[]> => request('/reviews/received'),

  myReviews: (): Promise<ReviewDto[]> => request('/reviews/me'),
};
