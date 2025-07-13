import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BudgetCategory,
  BudgetData,
  BudgetSettings,
  BudgetSummary,
  DEFAULT_CATEGORY_LIMITS,
  DEFAULT_MONTHLY_BUDGET,
} from "../types/budget";
import { TransactionsStats } from "../types/transactions";

const BUDGET_SETTINGS_KEY = "budget_settings";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GEL",
  }).format(amount);
};

export const getMostRecentMonth = (
  monthlyTrendsPerCategory: TransactionsStats["monthlyTrendsPerCategory"]
): string => {
  let mostRecentMonth = "";

  monthlyTrendsPerCategory.forEach((categoryData) => {
    categoryData.trends.forEach((trend) => {
      if (trend.month > mostRecentMonth) {
        mostRecentMonth = trend.month;
      }
    });
  });

  return mostRecentMonth;
};

export const getCurrentMonthSpending = (
  categoryName: string,
  monthlyTrendsPerCategory: TransactionsStats["monthlyTrendsPerCategory"],
  currentMonth: string
): number => {
  const categoryData = monthlyTrendsPerCategory.find(
    (cat) => cat.category === categoryName
  );

  if (!categoryData) return 0;

  const currentMonthData = categoryData.trends.find(
    (trend) => trend.month === currentMonth
  );

  return currentMonthData ? currentMonthData.amount : 0;
};

export const getLatestMonthForCategory = (
  categoryName: string,
  monthlyTrendsPerCategory: TransactionsStats["monthlyTrendsPerCategory"]
): string => {
  const categoryData = monthlyTrendsPerCategory.find(
    (cat) => cat.category === categoryName
  );

  if (!categoryData || categoryData.trends.length === 0) return "";

  return categoryData.trends.reduce((latest, current) => {
    return current.month > latest ? current.month : latest;
  }, categoryData.trends[0].month);
};

export const filterCurrentMonthCategories = (
  monthlyTrendsPerCategory: TransactionsStats["monthlyTrendsPerCategory"]
): TransactionsStats["monthlyTrendsPerCategory"] => {
  const mostRecentMonth = getMostRecentMonth(monthlyTrendsPerCategory);

  return monthlyTrendsPerCategory.filter((categoryData) => {
    const latestMonth = getLatestMonthForCategory(
      categoryData.category,
      monthlyTrendsPerCategory
    );
    return latestMonth === mostRecentMonth;
  });
};

export const calculateBudgetSummary = (data: BudgetData): BudgetSummary => {
  const remaining = data.monthlyBudget - data.totalSpent;

  return {
    monthlyBudget: data.monthlyBudget,
    totalSpent: data.totalSpent,
    remaining,
    categories: data.categories,
  };
};

export const calculateCategoryProgress = (category: BudgetCategory): number => {
  return Math.min((category.spent / category.limit) * 100, 100);
};

export const getCategoryColor = (category: BudgetCategory): string => {
  return category.spent > category.limit ? "#ef4444" : "#10b981";
};

export const isCategoryOverBudget = (category: BudgetCategory): boolean => {
  return category.spent > category.limit;
};

export const saveBudgetSettings = async (
  settings: BudgetSettings
): Promise<void> => {
  try {
    await AsyncStorage.setItem(BUDGET_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving budget settings:", error);
  }
};

export const loadBudgetSettings = async (): Promise<BudgetSettings> => {
  try {
    const settings = await AsyncStorage.getItem(BUDGET_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error("Error loading budget settings:", error);
  }

  return {
    monthlyBudget: DEFAULT_MONTHLY_BUDGET,
    categoryLimits: { ...DEFAULT_CATEGORY_LIMITS },
  };
};

export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Groceries: "Groceries",
    Restaurants: "Restaurants",
    Transportation: "Transportation",
    Entertainment: "Entertainment",
    Utilities: "Utilities",
    Pharmacy: "Pharmacy",
    Electronics: "Electronics",
    Other: "Other",
    Uncategorized: "Uncategorized",
  };

  return categoryMap[category] || category;
};

export const convertExpensesToBudgetCategories = (
  monthlyTrendsPerCategory: TransactionsStats["monthlyTrendsPerCategory"],
  budgetSettings: BudgetSettings
): BudgetCategory[] => {
  const currentMonth = getMostRecentMonth(monthlyTrendsPerCategory);
  const filteredCategories = filterCurrentMonthCategories(
    monthlyTrendsPerCategory
  );

  return filteredCategories.map((categoryData, index) => {
    const displayName = getCategoryDisplayName(categoryData.category);
    const currentMonthSpending = getCurrentMonthSpending(
      categoryData.category,
      monthlyTrendsPerCategory,
      currentMonth
    );
    const limit =
      budgetSettings.categoryLimits[displayName] ||
      DEFAULT_CATEGORY_LIMITS[displayName] ||
      100;

    return {
      id: `category-${index}`,
      name: displayName,
      spent: currentMonthSpending,
      limit: limit,
      color: currentMonthSpending > limit ? "#ef4444" : "#10b981",
    };
  });
};

export const createBudgetDataFromStats = (
  transactionStats: TransactionsStats,
  budgetSettings: BudgetSettings
): BudgetData => {
  const categories = convertExpensesToBudgetCategories(
    transactionStats.monthlyTrendsPerCategory,
    budgetSettings
  );

  const currentMonthTotalSpent = categories.reduce(
    (total, category) => total + category.spent,
    0
  );

  return {
    monthlyBudget: budgetSettings.monthlyBudget,
    totalSpent: currentMonthTotalSpent,
    categories,
  };
};
