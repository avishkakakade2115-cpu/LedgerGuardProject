const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export interface User {
  userId: string;
  name: string;
  email: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface DashboardResponse {
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  statistics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = sessionStorage.getItem("ledgerguard_token");

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Unable to connect to LedgerGuard server.",
      0
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      result?.message || "Something went wrong.",
      response.status
    );
  }

  return result as T;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await request<ApiResponse<LoginResponse>>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  sessionStorage.setItem(
    "ledgerguard_token",
    response.data.accessToken
  );

  return response.data;
};

export const getCurrentUser = async () => {
  return request<ApiResponse<User>>("/api/auth/me");
};

export const getDashboardOverview = async () => {
  return request<ApiResponse<DashboardResponse>>(
    "/api/dashboard/overview"
  );
};

export const registerOrganization = async (data: {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}) => {
  return request<ApiResponse<unknown>>(
    "/api/organizations/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const logoutUser = () => {
  sessionStorage.removeItem("ledgerguard_token");
};
