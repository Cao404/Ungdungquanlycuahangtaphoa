import type { ImageSourcePropType } from 'react-native';

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  fallbackIcon: string;
  image: ImageSourcePropType | null;
}

/**
 * Để thay ảnh, đặt ảnh trong mobile/assets rồi đổi `null`, ví dụ:
 * image: require('../assets/mi-hao-hao.jpg')
 */
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'thung-mi-hao-hao',
    name: 'Thùng mì tôm Hảo Hảo',
    price: 135000,
    category: 'Thực phẩm',
    fallbackIcon: '🍜',
    image: require('../assets/sanpham1.jpg'),
  },
  {
    id: 'lon-coca',
    name: 'Lon Coca',
    price: 10000,
    category: 'Đồ uống',
    fallbackIcon: '🥤',
    image: null,
  },
  {
    id: 'bot-giat-aba',
    name: 'Bột giặt ABA',
    price: 15000,
    category: 'Giặt xả',
    fallbackIcon: '🧺',
    image: null,
  },
  {
    id: 'nuoc-rua-bat',
    name: 'Nước rửa bát',
    price: 30000,
    category: 'Gia dụng',
    fallbackIcon: '🧴',
    image: null,
  },
];
