import { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { paymentApi } from "../api/lesson";
import { colors } from "../theme/colors";

export default function PaymentCheckoutScreen({ route, navigation }) {
  const { checkoutUrl, reference, courseSlug } = route.params;
  const [status, setStatus] = useState("checkout"); // checkout | verifying | success | failed

  // The backend's CLIENT_URL/payment/callback is a web route (used by the
  // Next.js app). On mobile we don't navigate there — instead we watch for
  // the WebView loading that same URL pattern and intercept it ourselves.
  function handleNavigationChange(navState) {
    if (navState.url.includes("/payment/callback") && status === "checkout") {
      setStatus("verifying");
      verify();
    }
  }

  async function verify() {
    try {
      const res = await paymentApi.verify(reference);
      if (res.status === "SUCCESS") {
        setStatus("success");
      } else if (res.status === "FAILED") {
        setStatus("failed");
      } else {
        // Give the webhook a moment, then check once more
        setTimeout(async () => {
          try {
            const retry = await paymentApi.verify(reference);
            setStatus(retry.status === "SUCCESS" ? "success" : "failed");
          } catch {
            setStatus("failed");
          }
        }, 2500);
      }
    } catch {
      setStatus("failed");
    }
  }

  if (status === "verifying") {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
        <Text style={styles.message}>Confirming your payment...</Text>
      </View>
    );
  }

  if (status === "success") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>You're enrolled! 🎉</Text>
        <Text style={styles.message}>Your payment was successful.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.replace("LessonPlayer", { slug: courseSlug })
          }
        >
          <Text style={styles.buttonText}>Start learning</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === "failed") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Payment didn't go through</Text>
        <Text style={styles.message}>No charge was completed. You can try again.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to course</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: checkoutUrl }}
      onNavigationStateChange={handleNavigationChange}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink, marginBottom: 8, textAlign: "center" },
  message: { color: colors.ink, opacity: 0.7, textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 24 },
  buttonText: { fontWeight: "700", color: colors.ink },
});
