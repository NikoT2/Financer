import { Transaction, TransactionsStats } from "../types";

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
}

export function formatAmount(
  paidOut: string,
  paidIn: string,
  type: "income" | "expense"
) {
  const amount = type === "income" ? parseFloat(paidIn) : parseFloat(paidOut);
  const sign = type === "income" ? "+" : "-";
  return `${sign}₾${Math.abs(amount).toFixed(2)}`;
}

export const formatTransactionForDashboard = (transaction: Transaction) => {
  return {
    description: transaction.description,
    time: formatDate(transaction.date),
    amount: formatAmount(
      transaction.paidOut,
      transaction.paidIn,
      transaction.type
    ),
  };
};

export function formatCurrency(amount: number | undefined): string {
  if (amount == null) return "0.00";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDiff(diff: number | null): string {
  if (diff == null) return "";
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  return `${sign}₾${Math.abs(diff).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} vs last month`;
}

export function getMonthDiff(
  stats: TransactionsStats | undefined,
  type: "income" | "expense"
): number | null {
  if (!stats || !stats.monthlyTrends || stats.monthlyTrends.length < 2)
    return null;
  const trends = stats.monthlyTrends;
  const current = trends[trends.length - 1];
  const prev = trends[trends.length - 2];
  if (!current || !prev) return null;
  const diff =
    type === "income"
      ? current.income - prev.income
      : current.expenses - prev.expenses;
  return diff;
}
