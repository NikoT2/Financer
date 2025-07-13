import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BudgetSettings } from "../../types/budget";

interface BudgetSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  currentSettings: BudgetSettings;
  onSave: (settings: BudgetSettings) => Promise<void>;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  visible,
  onClose,
  currentSettings,
  onSave,
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState(
    currentSettings.monthlyBudget.toString()
  );
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>(
    {}
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setMonthlyBudget(currentSettings.monthlyBudget.toString());
      const stringLimits: Record<string, string> = {};
      for (const [category, limit] of Object.entries(
        currentSettings.categoryLimits
      )) {
        stringLimits[category] = limit.toString();
      }
      setCategoryLimits(stringLimits);
    }
  }, [visible, currentSettings]);

  const handleSave = async () => {
    const budgetAmount = parseFloat(monthlyBudget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      Alert.alert("Error", "Please enter a valid monthly budget amount");
      return;
    }

    const validLimits: Record<string, number> = {};
    let totalCategoryLimits = 0;

    for (const [category, limit] of Object.entries(categoryLimits)) {
      const numericLimit = parseFloat(limit);
      if (isNaN(numericLimit) || numericLimit < 0) {
        Alert.alert("Error", `Please enter a valid limit for ${category}`);
        return;
      }
      validLimits[category] = numericLimit;
      totalCategoryLimits += numericLimit;
    }

    if (totalCategoryLimits > budgetAmount) {
      const formattedTotal = totalCategoryLimits.toLocaleString();
      const formattedBudget = budgetAmount.toLocaleString();
      Alert.alert(
        "Budget Exceeded",
        `The sum of category limits (${formattedTotal}) exceeds your monthly budget (${formattedBudget}). Please adjust your category limits to stay within your budget.`
      );
      return;
    }

    setSaving(true);
    try {
      await onSave({
        monthlyBudget: budgetAmount,
        categoryLimits: validLimits,
      });
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save budget settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateCategoryLimit = (category: string, value: string) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const calculateBudgetSummary = () => {
    const budgetAmount = parseFloat(monthlyBudget) || 0;
    let totalAllocated = 0;

    for (const limit of Object.values(categoryLimits)) {
      const numericLimit = parseFloat(limit) || 0;
      totalAllocated += numericLimit;
    }

    const remaining = budgetAmount - totalAllocated;
    const isOverBudget = remaining < 0;

    return {
      budgetAmount,
      totalAllocated,
      remaining,
      isOverBudget,
    };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
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
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, color: "#6b7280" }}>Cancel</Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Budget Settings
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text
                style={{
                  fontSize: 16,
                  color: saving ? "#9ca3af" : "#3b82f6",
                  fontWeight: "600",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
              <View
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: 12,
                  }}
                >
                  Monthly Budget
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: "#1e293b",
                  }}
                  value={monthlyBudget}
                  onChangeText={setMonthlyBudget}
                  placeholder="Enter monthly budget"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={{ padding: 20, paddingTop: 0 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1e293b",
                  marginBottom: 16,
                }}
              >
                Category Limits
              </Text>

              {(() => {
                const summary = calculateBudgetSummary();
                return (
                  <View
                    style={{
                      backgroundColor: "#ffffff",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: summary.isOverBudget ? "#ef4444" : "#e5e7eb",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>
                        Monthly Budget:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {summary.budgetAmount.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>
                        Total Allocated:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {summary.totalAllocated.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>
                        Remaining:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: summary.isOverBudget ? "#ef4444" : "#10b981",
                        }}
                      >
                        {summary.remaining.toLocaleString()}
                      </Text>
                    </View>
                    {summary.isOverBudget ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#ef4444",
                          marginTop: 8,
                          fontStyle: "italic",
                        }}
                      >
                        Category limits exceed monthly budget
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#10b981",
                          marginTop: 8,
                          fontStyle: "italic",
                        }}
                      >
                        Category limits are within monthly budget
                      </Text>
                    )}
                  </View>
                );
              })()}

              {Object.entries(categoryLimits).map(([category, limit]) => (
                <View
                  key={category}
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#1e293b",
                      marginBottom: 8,
                    }}
                  >
                    {category}
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#d1d5db",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      color: "#1e293b",
                    }}
                    value={limit}
                    onChangeText={(value) =>
                      updateCategoryLimit(category, value)
                    }
                    placeholder="Enter limit"
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
