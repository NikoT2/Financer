import React from "react";
import { Text, View } from "react-native";

interface BalanceCardProps {
  title: string;
  amount: string;
  subtitle: string;
  subtitleColor?: string;
}

export const BalanceCard = ({
  title,
  amount,
  subtitle,
  subtitleColor = "#10b981",
}: BalanceCardProps) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: "#64748b",
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#1e293b",
          marginBottom: 4,
        }}
      >
        {amount}
      </Text>
      <Text style={{ fontSize: 11, color: subtitleColor }}>{subtitle}</Text>
    </View>
  );
};
