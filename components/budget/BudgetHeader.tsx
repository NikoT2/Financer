import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface BudgetHeaderProps {
  onSettingsPress: () => void;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  onSettingsPress,
}) => {
  return (
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
        onPress={onSettingsPress}
        style={{
          backgroundColor: "#3b82f6",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};
