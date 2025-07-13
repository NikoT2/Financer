export interface AISpendingSuggestion {
  category: string;
  suggestion: string;
  potentialSavings: number;
  priority: "high" | "medium" | "low";
}

export type AISpendingSuggestions = AISpendingSuggestion[];
