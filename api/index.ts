import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import type { DocumentPickerAsset } from "expo-document-picker";
import {
  AuthResponse,
  Category,
  CreateTransactionRequest,
  SignInRequest,
  SignUpRequest,
  Transaction,
  TransactionsResponse,
  TransactionsStats,
  User,
} from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("authToken");
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

const handleTokenInvalidation = async () => {
  try {
    console.log("Token invalid, clearing auth data...");
    await removeAuthToken();

    queryClient.setQueryData(["authToken"], null);

    queryClient.cancelQueries();

    queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    queryClient.removeQueries({ queryKey: queryKeys.transactions.all });
    queryClient.clear();
  } catch (error) {
    console.error("Error during token invalidation:", error);
  }
};

const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const token = await getAuthToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        await handleTokenInvalidation();
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

export const authAPI = {
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  getProfile: async (): Promise<User> => {
    return await apiFetch<User>("/auth/profile");
  },

  logout: async (): Promise<void> => {
    queryClient.cancelQueries();

    await removeAuthToken();

    queryClient.setQueryData(["authToken"], null);

    queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    queryClient.removeQueries({ queryKey: queryKeys.transactions.all });
    queryClient.clear();
  },
};

export const transactionsAPI = {
  getTransactions: async (page: number = 1): Promise<TransactionsResponse> => {
    return await apiFetch<TransactionsResponse>(`/transactions?page=${page}`);
  },

  getRecentTransactions: async (limit: number = 4): Promise<Transaction[]> => {
    const response = await apiFetch<TransactionsResponse>(
      `/transactions?limit=${limit}`
    );
    return response.transactions;
  },

  getStats: async (): Promise<TransactionsStats> => {
    return await apiFetch<TransactionsStats>(`/transactions/stats`);
  },

  getTransaction: async (id: number): Promise<Transaction> => {
    return await apiFetch<Transaction>(`/transactions/${id}`);
  },

  createTransaction: async (
    data: CreateTransactionRequest
  ): Promise<Transaction> => {
    return await apiFetch<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  importTransactionsCSV: async (
    bankCode: "tbc" | "bog",
    file: DocumentPickerAsset
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "text/csv",
    } as any);
    const token = await AsyncStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}/transactions/import/csv/${bankCode}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to import CSV for ${bankCode}`
      );
    }
  },

  getCategories: async (): Promise<Category[]> => {
    return await apiFetch<Category[]>(`/transactions/categories/all`);
  },
};

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    details: () => [...queryKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },
};
