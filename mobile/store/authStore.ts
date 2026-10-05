import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { NguoiDung } from '../types/NguoiDung';
const KEY = 'taphoa.employee.session';
type Stored = { token: string; nguoiDung: NguoiDung };
interface AuthState { token: string | null; nguoiDung: NguoiDung | null; hydrated: boolean; hydrate: () => Promise<void>; setAuth: (token: string, nguoiDung: NguoiDung) => Promise<void>; logout: () => Promise<void>; }
export const useAuthStore = create<AuthState>((set) => ({
  token: null, nguoiDung: null, hydrated: false,
  hydrate: async () => { try { const raw = await SecureStore.getItemAsync(KEY); if (raw) set(JSON.parse(raw) as Stored); } finally { set({ hydrated: true }); } },
  setAuth: async (token, nguoiDung) => { await SecureStore.setItemAsync(KEY, JSON.stringify({ token, nguoiDung })); set({ token, nguoiDung }); },
  logout: async () => { await SecureStore.deleteItemAsync(KEY); set({ token: null, nguoiDung: null }); },
}));
