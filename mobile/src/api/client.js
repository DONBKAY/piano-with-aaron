import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:4000/api";
const TOKEN_KEY = "pwa_token";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function saveToken(token) {
  return AsyncStorage.setItem(TOKEN_KEY, token);
}
export async function clearToken() {
  return AsyncStorage.removeItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}
