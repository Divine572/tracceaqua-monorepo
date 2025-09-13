import { create } from "zustand";

const initialState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  walletAddress: null,
  lastActivity: null,
};