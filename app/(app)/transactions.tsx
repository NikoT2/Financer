import { FlashList } from "@shopify/flash-list";
import React from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  TransactionItem,
  TransactionsHeader,
} from "../../components";
import { useInfiniteTransactions } from "../../hooks/useTransactions";

export default function Transactions() {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions();

  if (isLoading) {
    return <LoadingState message="Loading transactions..." />;
  }

  if (error) {
    return (
      <ErrorState message="Error loading transactions" onRetry={refetch} />
    );
  }

  const transactions =
    data?.pages?.flatMap((page) => page?.transactions || []) || [];

  return (
    <FlashList
      data={transactions}
      renderItem={({ item }) => <TransactionItem transaction={item} />}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <EmptyState
          title="No transactions found"
          message="Your transactions will appear here once you add some"
        />
      }
      estimatedItemSize={80}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<TransactionsHeader />}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.2}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={{ padding: 16, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        ) : null
      }
    />
  );
}
