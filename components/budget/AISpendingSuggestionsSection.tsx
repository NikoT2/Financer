import React from "react";
import { Text, View } from "react-native";
import { AISpendingSuggestion } from "../../types/aiSuggestions";

interface AISpendingSuggestionsSectionProps {
  suggestions: AISpendingSuggestion[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

export const AISpendingSuggestionsSection: React.FC<
  AISpendingSuggestionsSectionProps
> = ({ suggestions, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <View
          style={{
            backgroundColor: "#ffffff",
            padding: 40,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Analyzing your spending patterns...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View
          style={{
            backgroundColor: "#ffffff",
            padding: 40,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              color: "#ef4444",
            }}
          >
            Unable to load AI suggestions. Please try again later.
          </Text>
        </View>
      );
    }

    if (!suggestions || suggestions.length === 0) {
      return (
        <View
          style={{
            backgroundColor: "#ffffff",
            padding: 40,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No AI suggestions available at this time.
          </Text>
        </View>
      );
    }

    return suggestions.map((suggestion, index) => (
      <View
        key={index}
        style={{
          backgroundColor: "#ffffff",
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#1e293b",
            }}
          >
            {suggestion.category}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                backgroundColor: getPriorityColor(suggestion.priority),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#ffffff",
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {suggestion.priority}
              </Text>
            </View>
            {suggestion.potentialSavings > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#10b981",
                  fontWeight: "600",
                }}
              >
                Save ₾{formatAmount(suggestion.potentialSavings)}
              </Text>
            )}
          </View>
        </View>
        <Text
          style={{
            fontSize: 14,
            color: "#6b7280",
            lineHeight: 20,
          }}
        >
          {suggestion.suggestion}
        </Text>
      </View>
    ));
  };

  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#1e293b",
          marginBottom: 16,
        }}
      >
        AI Spending Suggestions
      </Text>
      {renderContent()}
    </View>
  );
};
