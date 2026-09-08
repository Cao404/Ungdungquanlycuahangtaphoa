import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { NguoiDung } from '../types/NguoiDung';
import { authService } from '../services/auth.service';

// --- State & Actions ---
interface AuthState {
  nguoiDung: NguoiDung | null;
  dangTai: boolean;
  loi: string | null;
}

type AuthAction =
  | { type: 'DANG_NHAP_THANH_CONG'; payload: NguoiDung }
  | { type: 'DANG_TAI' }
  | { type: 'LOI'; payload: string }
  | { type: 'DANG_XUAT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'DANG_TAI':    return { ...state, dangTai: true, loi: null };
    case 'DANG_NHAP_THANH_CONG': return { nguoiDung: action.payload, dangTai: false, loi: null };
    case 'LOI':         return { ...state, dangTai: false, loi: action.payload };
    case 'DANG_XUAT':   return { nguoiDung: null, dangTai: false, loi: null };
    default:            return state;
  }
}

// --- Context ---
const AuthContext = createContext<{
  state: AuthState;
  dangNhap: (ten: string, mk: string) => Promise<void>;
  dangXuat: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    nguoiDung: null,
    dangTai: false,
    loi: null,
  });

  const dangNhap = async (tenDangNhap: string, matKhau: string) => {
    dispatch({ type: 'DANG_TAI' });
    try {
      const data = await authService.dangNhap(tenDangNhap, matKhau);
      dispatch({ type: 'DANG_NHAP_THANH_CONG', payload: data });
    } catch (e: any) {
      dispatch({ type: 'LOI', payload: e.message });
    }
  };

  const dangXuat = () => {
    authService.dangXuat();
    dispatch({ type: 'DANG_XUAT' });
  };

  return (
    <AuthContext.Provider value={{ state, dangNhap, dangXuat }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}
