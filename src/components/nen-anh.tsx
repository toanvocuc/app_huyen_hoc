/** Hai kiểu nền ảnh phủ cả màn hình, dùng chung cho các nhóm màn. */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { MAU } from '@/constants/giao-dien';

/**
 * Bầu trời sao dọc, phủ cả màn.
 * Phủ thêm một lớp màu nền mờ để chữ trắng vẫn đọc rõ trên vùng sáng của ảnh.
 */
export function NenTroiSao({ mo = 0.72 }: { mo?: number }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
      <Image
        source={require('@/assets/nen/sao-doc.jpg')}
        style={{ flex: 1 }}
        contentFit="cover"
      />
      <LinearGradient
        colors={[`rgba(11,18,32,${mo})`, `rgba(11,18,32,${Math.min(1, mo + 0.2)})`]}
        style={{ position: 'absolute', inset: 0 }}
      />
    </View>
  );
}

/**
 * Khung hoa văn vàng viền quanh màn, dùng cho phần Tarot.
 * Ảnh nền đã đen sẵn nên không cần phủ thêm lớp tối.
 */
export function NenKhungVan() {
  return (
    <Image
      source={require('@/assets/nen/khung-hoa-van.jpg')}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      contentFit="cover"
      pointerEvents="none"
    />
  );
}
