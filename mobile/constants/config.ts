import Constants from 'expo-constants';

/**
 * API_BASE_URL được app.config.js đọc từ EXPO_PUBLIC_API_BASE_URL trong file .env.
 *
 * Điện thoại thật không truy cập được localhost của máy tính. Hãy dùng IP LAN,
 * ví dụ http://192.168.1.100:8080/api, rồi khởi động lại Expo.
 */
const configuredUrl = Constants.expoConfig?.extra?.API_BASE_URL as string | undefined;

export const API_BASE_URL = (configuredUrl ?? '').replace(/\/$/, '');

export const APP_NAME = 'Quản Lý Tạp Hóa';
