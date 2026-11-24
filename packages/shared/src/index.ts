export enum UserRole {
  REQUESTER = 'REQUESTER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export enum ProfileType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface ProfileDto {
  id: string;
  type: ProfileType;
  displayName: string;
  description: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  companyName: string | null;
  taxId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  createdAt: string;
  profile: ProfileDto | null;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  type: ProfileType;
  roles: UserRole[];
  companyName?: string;
  city?: string;
  country?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type UpdateProfileRequest = Partial<{
  type: ProfileType;
  displayName: string;
  description: string;
  phone: string;
  city: string;
  country: string;
  avatarUrl: string;
  companyName: string;
  taxId: string;
}>;

export interface ApiError {
  statusCode: number;
  message: string | string[];
}

export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
}

export interface CategoryAttribute {
  key: string;
  label: string;
  type: AttributeType;
  required?: boolean;
  options?: string[];
  unit?: string;
  description?: string;
}

export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  attributeSchema: CategoryAttribute[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: CategoryDto[];
}

export interface CreateCategoryRequest {
  slug: string;
  name: string;
  description?: string;
  parentId?: string;
  attributeSchema: CategoryAttribute[];
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export enum RequestStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export type AttributeValue = string | number | boolean | null;
export type RequestAttributes = Record<string, AttributeValue>;

export interface RequestDto {
  id: string;
  requesterId: string;
  categoryId: string;
  title: string;
  description: string;
  city: string | null;
  country: string | null;
  address: string | null;
  startsAt: string | null;
  endsAt: string | null;
  budgetAmount: string | null;
  currency: string;
  status: RequestStatus;
  attributes: RequestAttributes;
  createdAt: string;
  updatedAt: string;
  category: Pick<CategoryDto, 'id' | 'slug' | 'name'> | null;
  requesterName: string | null;
}

export interface CreateRequestRequest {
  categoryId: string;
  title: string;
  description: string;
  city?: string;
  country?: string;
  address?: string;
  startsAt?: string;
  endsAt?: string;
  budgetAmount?: number;
  currency?: string;
  attributes?: RequestAttributes;
}

export type UpdateRequestRequest = Partial<CreateRequestRequest> & {
  status?: RequestStatus;
};

export interface ListRequestsQuery {
  q?: string;
  categoryId?: string;
  city?: string;
  status?: RequestStatus;
  minBudget?: number;
  maxBudget?: number;
  from?: string;
  to?: string;
  mine?: boolean;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface OfferDto {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string | null;
  requestTitle: string | null;
  message: string;
  price: string;
  currency: string;
  estimatedDays: number | null;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  message: string;
  price: number;
  currency?: string;
  estimatedDays?: number;
}

export type UpdateOfferRequest = Partial<CreateOfferRequest>;

export enum JobStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface JobDto {
  id: string;
  offerId: string;
  requestId: string;
  requesterId: string;
  providerId: string;
  requesterName: string | null;
  providerName: string | null;
  requestTitle: string;
  price: string;
  currency: string;
  status: JobStatus;
  acceptedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListJobsQuery {
  status?: JobStatus;
  mine?: boolean;
  page?: number;
  limit?: number;
}

export enum ReviewTarget {
  PROVIDER = 'PROVIDER',
  REQUESTER = 'REQUESTER',
}

export interface ReviewDto {
  id: string;
  jobId: string;
  reviewerId: string;
  reviewerName: string | null;
  targetId: string;
  targetType: ReviewTarget;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CreateReviewRequest {
  jobId: string;
  rating: number;
  comment?: string;
}
