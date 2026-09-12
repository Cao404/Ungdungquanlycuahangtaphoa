import type { ImageSourcePropType } from 'react-native';

/**
 * Thay `null` bằng `require('../assets/ten-anh.jpg')` để đổi hai banner.
 * Có thể dùng PNG, JPG hoặc WEBP đặt trong thư mục mobile/assets.
 */
export const HOME_BANNER_IMAGES: {
  main: ImageSourcePropType | null;
  secondary: ImageSourcePropType | null;
} = {
  main: require('../assets/banner1.jpg'),
  secondary: require('../assets/banner2.jpg'),
};
