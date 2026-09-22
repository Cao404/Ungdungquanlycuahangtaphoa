import { create } from 'zustand';
import { NguoiDung } from '../types/NguoiDung';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useGioHangStore } from './gioHangStore';

export function tokenConHan(token: string): boolean {
  try {
    const { exp } = jwtDecode(token);
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch { return false; }
}

interface AuthState {
  token: string | null;
  nguoiDung: NguoiDung | null;
  hydrated: boolean;
  setAuth: (token: string, nguoiDung: NguoiDung) => void;
  logout: () => void;
}

// Khôi phục phiên còn hạn; giỏ hàng được gắn riêng với tài khoản.
export const useAuthStore = create<AuthState>()(persist((set) => ({
  token: null,
  nguoiDung: null,
  hydrated: false,

  setAuth: (token, nguoiDung) => set(tokenConHan(token) ? { token, nguoiDung } : { token: null, nguoiDung: null }),

  logout: () => set({ token: null, nguoiDung: null }),
}), {
  name: 'auth',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({ token: state.token, nguoiDung: state.nguoiDung }),
  onRehydrateStorage: () => async (state) => {
    try {
      await useGioHangStore.persist.rehydrate();
      if (state?.token && state.nguoiDung) {
        useGioHangStore.getState().ganNguoiDung(state.nguoiDung.id);
      }
      if (state?.token && !tokenConHan(state.token)) state.logout();
    } finally {
      useAuthStore.setState({ hydrated: true });
    }
  },
}));
