import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys, transactionsAPI } from "../api";
import {
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
    queryKey: queryKeys.transactions.lists(),
    queryFn: ({ pageParam }) =>
      transactionsAPI.getTransactions(Number(pageParam) || 1),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = Number(lastPage.page);
      const totalPages = Number(lastPage.totalPages);
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    enabled: hasToken,
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
