import React from "react";
import { Text, View } from "react-native";
import { BudgetSummary } from "../../types/budget";
import { formatCurrency } from "../../utils/budgetUtils";

interface BudgetSummaryCardProps {
  budgetSummary: BudgetSummary;
  totalSpentPercentage: number;
  isOverBudget: boolean;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  budgetSummary,
  totalSpentPercentage,
  isOverBudget,
}) => {
  const statusColor = isOverBudget ? "#ef4444" : "#10b981";
  const statusText = isOverBudget
    ? `${formatCurrency(Math.abs(budgetSummary.remaining))} over budget`
    : `${formatCurrency(budgetSummary.remaining)} remaining`;

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: "#64748b",
          marginBottom: 8,
        }}
      >
        Monthly Budget
      </Text>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#1e293b",
          marginBottom: 8,
        }}
      >
        {formatCurrency(budgetSummary.monthlyBudget)}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6b7280",
          marginBottom: 12,
        }}
      >
        {formatCurrency(budgetSummary.totalSpent)} spent this month
      </Text>
      <View
        style={{
          height: 8,
          backgroundColor: "#f3f4f6",
          borderRadius: 4,
          marginBottom: 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            backgroundColor: statusColor,
            borderRadius: 4,
            width: `${Math.min(totalSpentPercentage, 100)}%`,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: statusColor,
        }}
      >
        {statusText}
      </Text>
    </View>
  );
};
