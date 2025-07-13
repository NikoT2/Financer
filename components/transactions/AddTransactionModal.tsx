import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { queryKeys } from "../../api";
import {
  useCreateTransaction,
  useTransactionCategories,
} from "../../hooks/useTransactions";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTransactionModal({
  visible,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const queryClient = useQueryClient();
  const createTransaction = useCreateTransaction();
  const { data: categories } = useTransactionCategories();

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<any[]>([]);

  useEffect(() => {
    if (categories) {
      setCategoryItems(
        categories.map((cat) => ({ label: cat.name, value: cat.id }))
      );
    }
  }, [categories]);

  useEffect(() => {
    if (categories && categories.length > 0 && categoryId === null) {
      const other = categories.find((cat) => cat.name === "Other");
      if (other) setCategoryId(other.id);
    }
  }, [categories, categoryId]);

  const handleAddTransaction = () => {
    if (!amount || !type || !categoryId) return;

    const transactionData = {
      paidOut: type === "expense" ? parseFloat(amount) : 0,
      paidIn: type === "income" ? parseFloat(amount) : 0,
      description: "Manual Entry",
      category: String(categoryId),
      type,
      date: new Date().toISOString().split("T")[0],
      balance: 0,
    };

    createTransaction.mutate(transactionData, {
      onSuccess: (newTransaction) => {
        try {
          if (
            newTransaction &&
            typeof newTransaction === "object" &&
            newTransaction.id
          ) {
            queryClient.setQueryData(
              queryKeys.transactions.lists(),
              (oldData: any) => {
                if (!oldData) {
                  return {
                    transactions: [newTransaction],
                    total: 1,
                    page: 1,
                    totalPages: 1,
                  };
                }

                const existingTransactions = Array.isArray(oldData.transactions)
                  ? oldData.transactions
                  : [];

                return {
                  ...oldData,
                  transactions: [newTransaction, ...existingTransactions],
                  total: oldData.total + 1,
                };
              }
            );
          } else {
            console.warn("Invalid transaction response:", newTransaction);
          }
        } catch (error) {
          console.error("Error updating cache:", error);
        }

        queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: ["transactions", "stats"],
        });

        setAmount("");
        setType("expense");
        setCategoryId(null);
        setOpen(false);

        onClose();
      },
      onError: (error) => {
        console.error("Failed to add transaction:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      },
    });
  };

  const resetForm = () => {
    setAmount("");
    setType("expense");
    setCategoryId(null);
    setOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isLoading = createTransaction.status === "pending";
  const isFormValid = amount && type && categoryId;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 340,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View style={{ marginBottom: 20, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: 4,
              }}
            >
              Add Transaction
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Record a new income or expense
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Amount
            </Text>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                fontWeight: "400",
                backgroundColor: "#ffffff",
                color: "#1f2937",
              }}
              autoComplete="off"
              textContentType="none"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Type
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: type === "expense" ? "#ef4444" : "#ffffff",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: type === "expense" ? "#ef4444" : "#d1d5db",
                }}
                onPress={() => setType("expense")}
              >
                <Text
                  style={{
                    color: type === "expense" ? "#ffffff" : "#6b7280",
                    textAlign: "center",
                    fontWeight: "400",
                    fontSize: 14,
                  }}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: type === "income" ? "#10b981" : "#ffffff",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: type === "income" ? "#10b981" : "#d1d5db",
                }}
                onPress={() => setType("income")}
              >
                <Text
                  style={{
                    color: type === "income" ? "#ffffff" : "#6b7280",
                    textAlign: "center",
                    fontWeight: "400",
                    fontSize: 14,
                  }}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Category
            </Text>
            <DropDownPicker
              open={open}
              value={categoryId}
              items={categoryItems}
              setOpen={setOpen}
              setValue={(v) => setCategoryId(v)}
              setItems={setCategoryItems}
              searchable={false}
              placeholder="Select category"
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                backgroundColor: "#ffffff",
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 44,
              }}
              dropDownContainerStyle={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                backgroundColor: "#ffffff",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 3,
              }}
              textStyle={{
                fontSize: 14,
                color: "#374151",
              }}
              placeholderStyle={{
                color: "#9ca3af",
              }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#d1d5db",
                justifyContent: "center",
              }}
              disabled={isLoading}
            >
              <Text
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  fontWeight: "400",
                  fontSize: 14,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddTransaction}
              style={{
                flex: 1,
                backgroundColor: isFormValid ? "#3b82f6" : "#d1d5db",
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                justifyContent: "center",
              }}
              disabled={!isFormValid || isLoading}
            >
              <Text
                style={{
                  color: "#ffffff",
                  textAlign: "center",
                  fontWeight: "400",
                  fontSize: 14,
                }}
              >
                {isLoading ? "Adding..." : "Add Transaction"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
