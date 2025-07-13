import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import {
  AddTransactionModal,
  BalanceCard,
  DashboardHeader,
  QuickActions,
  SectionHeader,
  TransactionsContainer,
} from "../../components";
import { useProfile } from "../../hooks/useAuth";
import {
  useRecentTransactions,
  useTransactionsStats,
} from "../../hooks/useTransactions";
import {
  formatCurrency,
  formatDiff,
  formatTransactionForDashboard,
  getMonthDiff,
} from "../../utils/transactionUtils";

export default function Dashboard() {
  const { data: user } = useProfile();
  const queryClient = useQueryClient();
  const {
    data: recentTransactionsData,
    isLoading: isLoadingTransactions,
    refetch: refetchRecentTransactions,
  } = useRecentTransactions(3);
  const { data: stats, isLoading: isLoadingStats } = useTransactionsStats();
  const [showAddModal, setShowAddModal] = useState(false);

  const currentMonth = stats?.monthlyTrends?.[stats.monthlyTrends.length - 1];
  const expenseDiff = getMonthDiff(stats, "expense");
  const incomeDiff = getMonthDiff(stats, "income");

  const recentTransactions =
    recentTransactionsData?.map(formatTransactionForDashboard) || [];

  const handleTransactionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isLoadingTransactions}
          onRefresh={refetchRecentTransactions}
        />
      }
      style={{ flex: 1 }}
    >
      <DashboardHeader userName={user?.name} />

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingTop: 20,
          gap: 12,
        }}
      >
        <BalanceCard
          title="Monthly Income"
          amount={
            isLoadingStats ? "..." : `₾${formatCurrency(currentMonth?.income)}`
          }
          subtitle={isLoadingStats ? "" : formatDiff(incomeDiff)}
          subtitleColor={
            isLoadingStats || incomeDiff === null
              ? "#10b981"
              : incomeDiff > 0
              ? "#10b981"
              : "#ef4444"
          }
        />
        <BalanceCard
          title="Monthly Expenses"
          amount={
            isLoadingStats
              ? "..."
              : `₾${formatCurrency(currentMonth?.expenses)}`
          }
          subtitle={isLoadingStats ? "" : formatDiff(expenseDiff)}
          subtitleColor={
            isLoadingStats || expenseDiff === null
              ? "#10b981"
              : expenseDiff > 0
              ? "#ef4444"
              : "#10b981"
          }
        />
      </View>

      <SectionHeader title="Recent Transactions" />
      <TransactionsContainer
        transactions={recentTransactions}
        isLoading={isLoadingTransactions}
      />

      <SectionHeader title="Quick Actions" />
      <QuickActions onAddTransaction={() => setShowAddModal(true)} />

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionSuccess}
      />
    </ScrollView>
  );
}
