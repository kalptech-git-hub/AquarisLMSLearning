import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
  const storedUser = sessionStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to parse stored user", error);
    }
  }

  const token = sessionStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export const getLastLogin = () => {
  const user = getCurrentUser();

  if (!user?.user_last_login) return "Unknown";

  const date = new Date(user.user_last_login);

  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};