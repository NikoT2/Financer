import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSignUp } from "../../hooks/useAuth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [maskedPassword, setMaskedPassword] = useState("");
  const [maskedConfirmPassword, setMaskedConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const signUpMutation = useSignUp();

  const handlePasswordChange = (text: string) => {
    if (text.length < maskedPassword.length) {
      const newPassword = password.slice(0, text.length);
      setPassword(newPassword);
      setMaskedPassword(
        showPassword ? newPassword : "*".repeat(newPassword.length)
      );
    } else {
      const newChar = text.slice(-1);
      const newPassword = password + newChar;
      setPassword(newPassword);
      setMaskedPassword(
        showPassword ? newPassword : "*".repeat(newPassword.length)
      );
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    if (text.length < maskedConfirmPassword.length) {
      const newConfirmPassword = confirmPassword.slice(0, text.length);
      setConfirmPassword(newConfirmPassword);
      setMaskedConfirmPassword(
        showPassword
          ? newConfirmPassword
          : "*".repeat(newConfirmPassword.length)
      );
    } else {
      const newChar = text.slice(-1);
      const newConfirmPassword = confirmPassword + newChar;
      setConfirmPassword(newConfirmPassword);
      setMaskedConfirmPassword(
        showPassword
          ? newConfirmPassword
          : "*".repeat(newConfirmPassword.length)
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setMaskedPassword(showPassword ? "*".repeat(password.length) : password);
    setMaskedConfirmPassword(
      showPassword ? "*".repeat(confirmPassword.length) : confirmPassword
    );
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signUpMutation.mutateAsync({ email, password, name });
      router.replace("/(app)");
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
      console.log(error);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: 8,
            }}
          >
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Join Financer and start managing your finances
          </Text>
        </View>

        <View style={{ width: "100%" }}>
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Full Name
            </Text>
            <TextInput
              style={{
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#1f2937",
              }}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9ca3af"
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#1f2937",
              }}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#9ca3af"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#1f2937",
                }}
                value={maskedPassword}
                onChangeText={handlePasswordChange}
                placeholderTextColor="#9ca3af"
                placeholder="Create a password"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={{ marginLeft: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Confirm Password
            </Text>
            <TextInput
              style={{
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#1f2937",
              }}
              value={maskedConfirmPassword}
              onChangeText={handleConfirmPasswordChange}
              placeholderTextColor="#9ca3af"
              placeholder="Confirm your password"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: signUpMutation.isPending ? "#9ca3af" : "#3b82f6",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 24,
            }}
            onPress={handleRegister}
            disabled={signUpMutation.isPending}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {signUpMutation.isPending
                ? "Creating Account..."
                : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "#d1d5db",
              }}
            />
            <Text
              style={{
                marginHorizontal: 16,
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              or
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "#d1d5db",
              }}
            />
          </View>

          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={handleBackToLogin}
          >
            <Text
              style={{
                color: "#3b82f6",
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
