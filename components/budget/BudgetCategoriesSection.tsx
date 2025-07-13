import React from "react";
import { Text, View } from "react-native";
import { BudgetSummary } from "../../types/budget";
import {
  calculateCategoryProgress,
  formatCurrency,
  getCategoryColor,
  isCategoryOverBudget,
} from "../../utils/budgetUtils";

interface BudgetCategoriesSectionProps {
  budgetSummary: BudgetSummary;
}

export const BudgetCategoriesSection: React.FC<
  BudgetCategoriesSectionProps
> = ({ budgetSummary }) => {
  if (budgetSummary.categories.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: 16,
          }}
        >
          Current Month Budget Categories
        </Text>
        <View
          style={{
            backgroundColor: "#ffffff",
            padding: 40,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            No spending categories found for this month. Start making
            transactions to see your budget breakdown.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#1e293b",
          marginBottom: 16,
        }}
      >
        Current Month Budget Categories
      </Text>
      {budgetSummary.categories.map((category) => {
        const progress = calculateCategoryProgress(category);
        const categoryColor = getCategoryColor(category);
        const categoryOverBudget = isCategoryOverBudget(category);

        return (
          <View
            key={category.id}
            style={{
              backgroundColor: "#ffffff",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#1e293b",
                }}
              >
                {category.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: categoryOverBudget ? "#ef4444" : "#6b7280",
                }}
              >
                {formatCurrency(category.spent)} /{" "}
                {formatCurrency(category.limit)}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: "#f3f4f6",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  backgroundColor: categoryColor,
                  borderRadius: 4,
                  width: `${Math.min(progress, 100)}%`,
                }}
              />
            </View>
            {categoryOverBudget && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#ef4444",
                  marginTop: 4,
                  fontWeight: "500",
                }}
              >
                {formatCurrency(category.spent - category.limit)} over budget
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};
