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
    name: 'THÙNG MÌ TÔM HẢO HẢO CHUA CAY 30 GÓI',
    price: 135000,
    category: 'Thực phẩm',
    fallbackIcon: '🍜',
    image: require('../assets/mitom.jpg'),
  },
  {
    id: 'lon-coca',
    name: 'NƯỚC NGỌT COCACOLA LON 330ML',
    price: 10000,
    category: 'Đồ uống',
    fallbackIcon: '🥤',
    image: require('../assets/coca.jpg'),
  },
  {
    id: 'bot-giat-aba',
    name: 'Bột giặt ABA SẠCH TINH TƯƠM 500G',
    price: 15000,
    category: 'Giặt xả',
    fallbackIcon: '🧺',
    image: require('../assets/botgiat.png'),
  },
  {
    id: 'nuoc-rua-bat',
    name: 'NƯỚC RỬA BÁT SUNLIGHT HƯƠNG CHANH 300ML',
    price: 30000,
    category: 'Gia dụng',
    fallbackIcon: '🧴',
    image: require('../assets/nuocruabat.webp'),
  },
  {
    id: 'sua-tuoi-vinamilk',
    name: 'Sữa tươi Vinamilk hộp 1L',
    price: 38000,
    category: 'Đồ uống',
    fallbackIcon: '🥛',
    image: null,
  },
  {
    id: 'nuoc-mam-nam-ngu',
    name: 'Nước mắm Nam Ngư chai 500ml',
    price: 35000,
    category: 'Gia dụng',
    fallbackIcon: '🍶',
    image: null,
  },
  {
    id: 'dau-an-simply',
    name: 'Dầu ăn Simply chai 1L',
    price: 58000,
    category: 'Gia dụng',
    fallbackIcon: '🫗',
    image: null,
  },
  {
    id: 'banh-oreo',
    name: 'Bánh Oreo vani gói 133g',
    price: 18000,
    category: 'Thực phẩm',
    fallbackIcon: '🍪',
    image: null,
  },
  {
    id: 'giay-ve-sinh',
    name: 'Giấy vệ sinh Bless You 10 cuộn',
    price: 65000,
    category: 'Gia dụng',
    fallbackIcon: '🧻',
    image: null,
  },
  {
    id: 'kem-danh-rang',
    name: 'Kem đánh răng P/S 180g',
    price: 32000,
    category: 'Gia dụng',
    fallbackIcon: '🪥',
    image: null,
  },
];
