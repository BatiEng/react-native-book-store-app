import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  backendURL: "http://localhost:3000/api/",
  isCheckingAuth: true,

  register: async (username, email, password) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(get().backendURL + "auth/register", {
        username,
        email,
        password,
      });
      if (response.data.success) {
        console.log(response.data.message);
        set({ user: response.data.user, token: response.data.token });
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        await AsyncStorage.setItem("token", response.data.token);
        return { success: true };
      } else {
        console.log(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.log(error.response.data.message);
      return { success: false, message: error.response.data.message };
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(
        "https://react-native-bookworm-backend.onrender.com/api/auth/login",
        { email, password }
      );
      if (response.data.success) {
        console.log(response.data.message);
        set({ user: response.data.user, token: response.data.token });
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        await AsyncStorage.setItem("token", response.data.token);
        return { success: true };
      } else {
        console.log(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.log(error.response.data.message);
      return { success: false, message: error.response.data.message };
    } finally {
      set({ isLoading: false });
    }
  },
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      set({ user, token });
    } catch (error) {
      console.log("Auth check failed " + error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      set({ user: null, token: null });
    } catch (error) {
      console.log(error);
    }
  },
}));
