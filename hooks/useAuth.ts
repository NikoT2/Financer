import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI, queryKeys } from "../api";
import { SignInRequest, SignUpRequest } from "../types";

const syncTokenWithStorage = async (token: string | null) => {
  if (token) {
    await AsyncStorage.setItem("authToken", token);
  } else {
    await AsyncStorage.removeItem("authToken");
  }
};

export const useAuthToken = () => {
  return useQuery({
    queryKey: ["authToken"],
    queryFn: () => AsyncStorage.getItem("authToken"),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useAuthState = () => {
  const { data: token, isLoading } = useAuthToken();
  const hasToken = Boolean(token);

  return {
    isLoading,
    hasToken,
    token,
  };
};

export const useProfile = (options?: {
  enabled?: boolean;
  retry?: boolean;
}) => {
  const { hasToken } = useAuthState();

  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: authAPI.getProfile,
    retry: options?.retry ?? false,
    staleTime: 5 * 60 * 1000,
    enabled: (options?.enabled ?? true) && hasToken,
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInRequest) => authAPI.signIn(data),
    onSuccess: async (data) => {
      queryClient.setQueryData(["authToken"], data.access_token);
      await syncTokenWithStorage(data.access_token);

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignUpRequest) => authAPI.signUp(data),
    onSuccess: async (data) => {
      queryClient.setQueryData(["authToken"], data.access_token);
      await syncTokenWithStorage(data.access_token);

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onMutate: async () => {
      queryClient.setQueryData(["authToken"], null);
      await syncTokenWithStorage(null);
      queryClient.cancelQueries();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.removeQueries({ queryKey: queryKeys.transactions.all });
      queryClient.clear();
    },
  });
};
