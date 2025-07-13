import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { aiSuggestionsAPI, queryKeys, transactionsAPI } from "../api";
import {
  AISpendingSuggestions,
  CreateTransactionRequest,
  TransactionsResponse,
  TransactionsStats,
} from "../types";
import { useAuthState } from "./useAuth";

export const useTransactions = (page: number = 1) => {
  const { hasToken } = useAuthState();

  return useQuery({
    queryKey: queryKeys.transactions.lists(),
    queryFn: () => transactionsAPI.getTransactions(page),
    staleTime: 2 * 60 * 1000,
    enabled: hasToken,
  });
};

export const useRecentTransactions = (limit: number = 4) => {
  const { hasToken } = useAuthState();

  return useQuery({
    queryKey: [...queryKeys.transactions.lists(), "recent", limit],
    queryFn: () => transactionsAPI.getRecentTransactions(limit),
    staleTime: 2 * 60 * 1000,
    enabled: hasToken,
  });
};

export const useInfiniteTransactions = () => {
  const { hasToken } = useAuthState();

  return useInfiniteQuery<TransactionsResponse, Error>({
    queryKey: [...queryKeys.transactions.lists(), "infinite"],
    queryFn: async ({ pageParam }) => {
      try {
        const result = await transactionsAPI.getTransactions(
          Number(pageParam) || 1
        );
        return result;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !allPages) {
        console.warn("lastPage or allPages is undefined");
        return undefined;
      }
      const currentPage = Number(lastPage.page);
      const totalPages = Number(lastPage.totalPages);
      if (isNaN(currentPage) || isNaN(totalPages)) {
        console.warn("Invalid page numbers:", { currentPage, totalPages });
        return undefined;
      }
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    enabled: hasToken,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useCreateTransaction = () => {
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      transactionsAPI.createTransaction(data),
  });
};

export const useImportTransactionsCSV = () => {
  return useMutation({
    mutationFn: async ({
      bankCode,
      file,
    }: {
      bankCode: "tbc" | "bog";
      file: import("expo-document-picker").DocumentPickerAsset;
    }) => {
      return transactionsAPI.importTransactionsCSV(bankCode, file);
    },
  });
};

export const useTransactionsStats = () => {
  const { hasToken } = useAuthState();

  return useQuery<TransactionsStats, Error>({
    queryKey: ["transactions", "stats"],
    queryFn: () => transactionsAPI.getStats(),
    staleTime: 2 * 60 * 1000,
    enabled: hasToken,
  });
};

export const useTransaction = (id: number) => {
  const { hasToken } = useAuthState();

  return useQuery({
    queryKey: queryKeys.transactions.detail(id.toString()),
    queryFn: () => transactionsAPI.getTransaction(id),
    enabled: !!id && hasToken,
  });
};

export const useTransactionCategories = () => {
  const { hasToken } = useAuthState();

  return useQuery({
    queryKey: ["transactions", "categories"],
    queryFn: () => transactionsAPI.getCategories(),
    staleTime: 10 * 60 * 1000,
    enabled: hasToken,
  });
};

export const useAISpendingSuggestions = () => {
  const { hasToken } = useAuthState();

  return useQuery<AISpendingSuggestions, Error>({
    queryKey: queryKeys.aiSuggestions.spending(),
    queryFn: async () => {
      return aiSuggestionsAPI.getSpendingSuggestions();
    },
    staleTime: 10 * 60 * 1000,
    enabled: hasToken,
  });
};
