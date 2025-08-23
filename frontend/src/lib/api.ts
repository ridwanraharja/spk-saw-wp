// API Configuration and Service Layer for SPK Backend Integration

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Types from backend
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: TokenPair;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface SubCriteria {
  id: string;
  criterionId: string;
  label: string;
  value: number;
  order: number;
}

export interface Criterion {
  id: string;
  spkId?: string;
  name: string;
  weight: number;
  type: "benefit" | "cost";
  subCriteria?: SubCriteria[];
}

export interface AlternativeValue {
  id: string;
  alternativeId: string;
  criterionId: string;
  value: number;
  criterion?: Criterion;
}

export interface Alternative {
  id: string;
  spkId?: string;
  name: string;
  values?: { [criterionId: string]: number };
  alternativeValues?: AlternativeValue[];
}

export interface SAWResult {
  id: string;
  spkId: string;
  alternativeId: string;
  score: number;
  rank: number;
  alternative?: {
    id: string;
    spkId: string;
    name: string;
  };
}

export interface WPResult {
  id: string;
  spkId: string;
  alternativeId: string;
  score: number;
  rank: number;
  alternative?: {
    id: string;
    spkId: string;
    name: string;
  };
}

export interface SPKRecord {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  sawResults: SAWResult[];
  wpResults: WPResult[];
}

// Extended SPKRecord for admin view with user information
export interface SPKRecordWithUser extends SPKRecord {
  user: User;
}

// Response type for admin SPK list
export interface AdminSPKResponse {
  spkRecords: SPKRecordWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSPKData {
  title: string;
  criteria: Array<{
    name: string;
    weight: number;
    type: "benefit" | "cost";
    subCriteria?: Array<{
      label: string;
      value: number;
      order: number;
    }>;
  }>;
  alternatives: Array<{
    name: string;
    values: { [key: string]: number };
  }>;
}

export interface UpdateSPKData {
  title?: string;
  criteria?: Array<{
    name: string;
    weight: number;
    type: "benefit" | "cost";
    subCriteria?: Array<{
      label: string;
      value: number;
      order: number;
    }>;
  }>;
  alternatives?: Array<{
    name: string;
    values: { [key: string]: number };
  }>;
}

export interface DashboardStats {
  totalSPK: number;
  recentSPK: {
    id: string;
    title: string;
    createdAt: string;
  }[];
}

// Auth Token Management
class TokenManager {
  private static ACCESS_TOKEN_KEY = "spk_access_token";
  private static REFRESH_TOKEN_KEY = "spk_refresh_token";
  private static USER_KEY = "spk_user";

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setTokens(tokens: TokenPair): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearAuth(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// HTTP Client with Auto Token Management
class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token refresh
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry with new token
          headers["Authorization"] = `Bearer ${TokenManager.getAccessToken()}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed, redirect to login
          TokenManager.clearAuth();
          window.location.href = "/login";
          throw new Error("Authentication required");
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  private static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.data.tokens);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// API Service Functions
export const authApi = {
  register: async (data: {
    email: string;
    name: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await ApiClient.post<AuthResponse["data"]>(
      "/auth/register",
      data
    );
    return response as AuthResponse;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await ApiClient.post<AuthResponse["data"]>(
      "/auth/login",
      data
    );
    if (response.success && response.data) {
      TokenManager.setTokens(response.data.tokens);
      TokenManager.setUser(response.data.user);
    }
    return response as AuthResponse;
  },

  logout: async (): Promise<ApiResponse> => {
    const refreshToken = TokenManager.getRefreshToken();
    const response = await ApiClient.post("/auth/logout", { refreshToken });
    TokenManager.clearAuth();
    return response;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return ApiClient.get<{ user: User }>("/auth/profile");
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await ApiClient.put<{ user: User }>("/auth/profile", data);
    if (response.success && response.data) {
      TokenManager.setUser(response.data.user);
    }
    return response;
  },
};

export const spkApi = {
  create: async (data: CreateSPKData): Promise<ApiResponse<SPKRecord>> => {
    return ApiClient.post<SPKRecord>("/spk", data);
  },

  getAllAdmin: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminSPKResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return ApiClient.get<AdminSPKResponse>(
      `/spk/admin/all${query ? `?${query}` : ""}`
    );
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      spkRecords: SPKRecord[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return ApiClient.get(`/spk${query ? `?${query}` : ""}`);
  },

  getById: async (
    id: string
  ): Promise<ApiResponse<{ spkRecord: SPKRecord }>> => {
    return ApiClient.get<{ spkRecord: SPKRecord }>(`/spk/${id}`);
  },

  update: async (
    id: string,
    data: UpdateSPKData
  ): Promise<ApiResponse<{ spkRecord: SPKRecord }>> => {
    return ApiClient.put<{ spkRecord: SPKRecord }>(`/spk/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return ApiClient.delete(`/spk/${id}`);
  },
};

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return ApiClient.get<DashboardStats>("/dashboard/stats");
  },
};

export const userApi = {
  getAllUsers: async (): Promise<ApiResponse<{ users: User[] }>> => {
    return ApiClient.get<{ users: User[] }>("/auth/admin/users");
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    return ApiClient.post<{ user: User }>("/auth/admin/users", data);
  },

  updateUserRole: async (
    userId: string,
    role: string
  ): Promise<ApiResponse<{ user: User }>> => {
    return ApiClient.put<{ user: User }>(`/auth/admin/users/${userId}/role`, {
      role,
    });
  },

  deleteUser: async (userId: string): Promise<ApiResponse> => {
    return ApiClient.delete(`/auth/admin/users/${userId}`);
  },

  getRoles: async (): Promise<
    ApiResponse<{
      roles: Array<{
        value: string;
        label: string;
        description: string;
      }>;
    }>
  > => {
    return ApiClient.get<{
      roles: Array<{
        value: string;
        label: string;
        description: string;
      }>;
    }>("/auth/roles");
  },
};

export const subCriteriaApi = {
  getDefaultTemplate: async (): Promise<ApiResponse<{
    subCriteria: Array<{
      label: string;
      value: number;
      order: number;
    }>;
  }>> => {
    return ApiClient.get<{
      subCriteria: Array<{
        label: string;
        value: number;
        order: number;
      }>;
    }>("/sub-criteria");
  },

  getSubCriteria: async (
    criterionId: string
  ): Promise<ApiResponse<{
    criterionId: string;
    subCriteria: SubCriteria[];
  }>> => {
    return ApiClient.get<{
      criterionId: string;
      subCriteria: SubCriteria[];
    }>(`/sub-criteria/${criterionId}`);
  },

  updateSubCriteria: async (
    criterionId: string,
    subCriteria: Array<{
      label: string;
      value: number;
      order: number;
    }>
  ): Promise<ApiResponse<{
    criterionId: string;
    subCriteria: SubCriteria[];
  }>> => {
    return ApiClient.put<{
      criterionId: string;
      subCriteria: SubCriteria[];
    }>(`/sub-criteria/${criterionId}`, {
      subCriteria,
    });
  },
};

export { TokenManager, ApiClient };
