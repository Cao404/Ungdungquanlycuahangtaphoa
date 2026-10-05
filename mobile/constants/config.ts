import Constants from 'expo-constants';

/**
 * API_BASE_URL đọc từ app.json > extra > API_BASE_URL
 *
 * Khi test trên điện thoại thật (không phải emulator):
 *   - KHÔNG dùng localhost hoặc 127.0.0.1
 *   - Dùng IP LAN của máy tính chạy backend, VD: http://192.168.1.100:8080/api
 *   - Kiểm tra IP: Windows dùng ipconfig, Mac/Linux dùng ifconfig
 *   - Cập nhật trong app.json > extra > API_BASE_URL rồi restart expo
 */
const extra = Constants.expoConfig?.extra ?? {};
// LDPlayer is currently loading Expo over the LAN address, so API traffic must
// use that exact reachable host address as well. 10.0.2.2 only works in some
// Android SDK emulator configurations and is not the active LDPlayer route.
export const API_BASE_URL: string = (extra.API_BASE_URL as string | undefined) ?? '';

export const APP_NAME = 'Quản Lý Tạp Hóa';
