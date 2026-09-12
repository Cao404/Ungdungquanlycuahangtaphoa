import { create } from 'zustand';
import { NguoiDung } from '../types/NguoiDung';

interface AuthState {
  token: string | null;
  nguoiDung: NguoiDung | null;
  setAuth: (token: string, nguoiDung: NguoiDung) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  nguoiDung: null,

  setAuth: (token, nguoiDung) => set({ token, nguoiDung }),

  logout: () => set({ token: null, nguoiDung: null }),
}));
