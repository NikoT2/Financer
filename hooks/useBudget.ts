import { useEffect, useMemo, useState } from "react";
import { BudgetData, BudgetSettings, BudgetSummary } from "../types/budget";
import {
  calculateBudgetSummary,
  createBudgetDataFromStats,
  loadBudgetSettings,
  saveBudgetSettings,
} from "../utils/budgetUtils";
import { useTransactionsStats } from "./useTransactions";

export const useBudget = () => {
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings | null>(
    null
  );
  const {
    data: transactionStats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useTransactionsStats();

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await loadBudgetSettings();
      setBudgetSettings(settings);
    };
    loadSettings();
  }, []);

  const budgetData = useMemo((): BudgetData | null => {
    if (!transactionStats || !budgetSettings) return null;

    return createBudgetDataFromStats(transactionStats, budgetSettings);
  }, [transactionStats, budgetSettings]);

  const budgetSummary = useMemo((): BudgetSummary | null => {
    if (!budgetData) return null;
    return calculateBudgetSummary(budgetData);
  }, [budgetData]);

  const totalSpentPercentage = useMemo(() => {
    if (!budgetSummary) return 0;
    return (budgetSummary.totalSpent / budgetSummary.monthlyBudget) * 100;
  }, [budgetSummary]);

  const isOverBudget = useMemo(() => {
    if (!budgetSummary) return false;
    return budgetSummary.remaining < 0;
  }, [budgetSummary]);

  const updateBudgetSettings = async (newSettings: BudgetSettings) => {
    setBudgetSettings(newSettings);
    await saveBudgetSettings(newSettings);
  };

  const updateMonthlyBudget = async (amount: number) => {
    if (!budgetSettings) return;
    const newSettings = { ...budgetSettings, monthlyBudget: amount };
    await updateBudgetSettings(newSettings);
  };

  const updateCategoryLimit = async (categoryName: string, limit: number) => {
    if (!budgetSettings) return;
    const newSettings = {
      ...budgetSettings,
      categoryLimits: {
        ...budgetSettings.categoryLimits,
        [categoryName]: limit,
      },
    };
    await updateBudgetSettings(newSettings);
  };

  return {
    budgetSummary,
    totalSpentPercentage,
    isOverBudget,
    isLoading: isStatsLoading || !budgetSettings,
    error: statsError,
    budgetSettings,
    updateMonthlyBudget,
    updateCategoryLimit,
    updateBudgetSettings,
  };
};
