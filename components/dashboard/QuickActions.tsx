import { useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { Alert, View } from "react-native";
import { useImportTransactionsCSV } from "../../hooks/useTransactions";
import { QuickActionButton } from "./QuickActionButton";

interface QuickActionsProps {
  onAddTransaction: () => void;
}

export function QuickActions({ onAddTransaction }: QuickActionsProps) {
  const queryClient = useQueryClient();
  const importCSVMutation = useImportTransactionsCSV();
  const isImporting = importCSVMutation.status === "pending";

  const handleImportCSV = async (bankCode: "tbc" | "bog") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      await importCSVMutation.mutateAsync({ bankCode, file });

      Alert.alert(
        "Success",
        `${bankCode.toUpperCase()} CSV imported successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to import CSV"
      );
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20 }}>
      <QuickActionButton
        title="Add Transaction"
        onPress={onAddTransaction}
        disabled={isImporting}
      />
      <QuickActionButton
        title="Add TBC Transactions"
        onPress={() => handleImportCSV("tbc")}
        disabled={isImporting}
        isLoading={isImporting}
        backgroundColor="#00ADEE"
      />
      <QuickActionButton
        title="Add BOG Transactions"
        backgroundColor="#ff5c0a"
        onPress={() => handleImportCSV("bog")}
        disabled={isImporting}
        isLoading={isImporting}
      />
    </View>
  );
}
