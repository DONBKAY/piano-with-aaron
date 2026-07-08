import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  if (!user) {
    return (
      <View style={styles.loggedOutContainer}>
        <Text style={styles.title}>You're not logged in</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "?"}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Account type</Text>
        <Text style={styles.cardValue}>{user?.role === "ADMIN" ? "Admin" : "Student"}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 24, alignItems: "center", paddingTop: 60 },
  loggedOutContainer: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink, marginBottom: 16 },
  loginText: { color: colors.ink, fontWeight: "700" },
  loginButton: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: colors.ink },
  name: { fontSize: 20, fontWeight: "700", color: colors.ink },
  email: { color: colors.ink, opacity: 0.6, marginBottom: 24 },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  cardLabel: { fontSize: 12, color: colors.ink, opacity: 0.6, marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: "600", color: colors.ink },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  logoutText: { color: colors.danger, fontWeight: "700" },
});
