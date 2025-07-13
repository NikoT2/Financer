import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { queryClient } from "../../api";
import {
  BudgetSettingsModal,
  ErrorState,
  LoadingState,
} from "../../components";
import { useBudget } from "../../hooks/useBudget";
import {
  calculateCategoryProgress,
  formatCurrency,
  getCategoryColor,
  isCategoryOverBudget,
} from "../../utils/budgetUtils";

export default function Budget() {
  const {
    budgetSummary,
    totalSpentPercentage,
    isOverBudget,
    isLoading,
    error,
    budgetSettings,
    updateBudgetSettings,
  } = useBudget();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions", "stats"] });
  };

  if (isLoading) {
    return <LoadingState message="Loading budget data..." />;
  }

  if (error) {
    return (
      <ErrorState message="Failed to load budget data" onRetry={handleRetry} />
    );
  }

  if (!budgetSummary || !budgetSettings) {
    return (
      <ErrorState message="No budget data available" onRetry={handleRetry} />
    );
  }

  const handleSaveSettings = async (newSettings: any) => {
    await updateBudgetSettings(newSettings);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View
        style={{
          padding: 20,
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: 4,
            }}
          >
            Budget
          </Text>
          <Text style={{ fontSize: 16, color: "#64748b" }}>
            Track your spending and set limits
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setSettingsModalVisible(true)}
          style={{
            backgroundColor: "#3b82f6",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 14 }}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
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
                backgroundColor: isOverBudget ? "#ef4444" : "#10b981",
                borderRadius: 4,
                width: `${Math.min(totalSpentPercentage, 100)}%`,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: isOverBudget ? "#ef4444" : "#10b981",
              fontWeight: "600",
            }}
          >
            {isOverBudget
              ? `${formatCurrency(
                  Math.abs(budgetSummary.remaining)
                )} over budget`
              : `${formatCurrency(budgetSummary.remaining)} remaining`}
          </Text>
        </View>
      </View>

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

        {budgetSummary.categories.length === 0 ? (
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
        ) : (
          budgetSummary.categories.map((category) => {
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
                    {formatCurrency(category.spent - category.limit)} over
                    budget
                  </Text>
                )}
              </View>
            );
          })
        )}
      </View>

      <BudgetSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        currentSettings={budgetSettings}
        onSave={handleSaveSettings}
      />
    </ScrollView>
  );
}
