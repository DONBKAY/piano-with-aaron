import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import MainTabs from "./MainTabs";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import CourseDetailScreen from "../screens/CourseDetailScreen";
import LessonPlayerScreen from "../screens/LessonPlayerScreen";
import PaymentCheckoutScreen from "../screens/PaymentCheckoutScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "MainTabs" : "Login"}
        screenOptions={{ headerTintColor: colors.ink }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{ title: "Course" }}
        />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        {user && (
          <>
            <Stack.Screen
              name="LessonPlayer"
              component={LessonPlayerScreen}
              options={{ title: "Lessons" }}
            />
            <Stack.Screen
              name="PaymentCheckout"
              component={PaymentCheckoutScreen}
              options={{ title: "Checkout" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
