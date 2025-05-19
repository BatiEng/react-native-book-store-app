import { View, Text, TouchableOpacity, Alert } from "react-native";
import styles from "../assets/styles/profile.styles";
import { useAuthStore } from "../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
const LogutButton = () => {
  const { logout } = useAuthStore();
  const confirmLogut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogut}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
};

export default LogutButton;
