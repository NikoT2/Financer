import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { queryClient } from "../../api";
import {
  BudgetSettingsModal,
  ErrorState,
  LoadingState,
} from "../../components";
import {
  AISpendingSuggestionsSection,
  BudgetCategoriesSection,
  BudgetHeader,
  BudgetSummaryCard,
} from "../../components/budget";
import { useBudget } from "../../hooks/useBudget";
import { useAISpendingSuggestions } from "../../hooks/useTransactions";

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

  const {
    data: aiSuggestions,
    isLoading: isLoadingSuggestions,
    error: suggestionsError,
  } = useAISpendingSuggestions();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions", "stats"] });
    queryClient.invalidateQueries({ queryKey: ["aiSuggestions"] });
  };

  const handleSaveSettings = async (newSettings: any) => {
    await updateBudgetSettings(newSettings);
  };

  const handleSettingsPress = () => {
    setSettingsModalVisible(true);
  };

  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <BudgetHeader onSettingsPress={handleSettingsPress} />

      <View style={{ padding: 20 }}>
        <BudgetSummaryCard
          budgetSummary={budgetSummary}
          totalSpentPercentage={totalSpentPercentage}
          isOverBudget={isOverBudget}
        />
      </View>

      <BudgetCategoriesSection budgetSummary={budgetSummary} />

      <AISpendingSuggestionsSection
        suggestions={aiSuggestions}
        isLoading={isLoadingSuggestions}
        error={suggestionsError}
      />

      <BudgetSettingsModal
        visible={settingsModalVisible}
        onClose={closeSettingsModal}
        currentSettings={budgetSettings}
        onSave={handleSaveSettings}
      />
    </ScrollView>
  );
}
