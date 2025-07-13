export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  additionalInformation: string | null;
  paidOut: string;
  paidIn: string;
  balance: string;
  type: "income" | "expense";
  documentDate: string | null;
  documentNumber: string | null;
  partnersAccount: string | null;
  partnersName: string | null;
  partnersTaxCode: string | null;
  partnersBankCode: string | null;
  intermediaryBankCode: string | null;
  chargeDetails: string | null;
  taxpayerCode: string | null;
  taxpayerName: string | null;
  treasuryCode: string | null;
  opCode: string | null;
  additionalDescription: string | null;
  transactionId: string | null;
  detectedCategory: string;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateTransactionRequest {
  paidOut: number;
  paidIn: number;
  description: string;
  category: string;
  type: "income" | "expense";
  date: string;
  balance: number;
}

export interface TransactionsStats {
  totalExpenses: number;
  totalIncome: number;
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    expenses: number;
    income: number;
  }[];
  monthlyTrendsPerCategory: {
    category: string;
    trends: {
      month: string;
      amount: number;
    }[];
  }[];
}
