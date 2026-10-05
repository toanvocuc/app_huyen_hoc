/** Hai kiểu nền ảnh phủ cả màn hình, dùng chung cho các nhóm màn. */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';


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
 * Khung hoa văn viền quanh màn. Ảnh nền đã đen sẵn nên không cần phủ thêm lớp tối.
 *
 * `mo` hạ độ đậm của ảnh xuống. Hai khung số và khung cung có hoa văn ăn khá sâu
 * vào trong lề, nội dung chạy đè lên là rối mắt, nên chúng chạy mờ hơn khung Tarot.
 */
function NenKhung({ nguon, mo = 1 }: { nguon: number; mo?: number }) {
  return (
    <Image
      source={nguon}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: mo }}
      contentFit="cover"
      pointerEvents="none"
    />
  );
}

/** Khung hoa văn vàng, dùng cho phần Tarot. */
export function NenKhungVan() {
  return <NenKhung nguon={require('@/assets/nen/khung-hoa-van.jpg')} />;
}

/** Khung có các con số quanh viền, dùng cho phần Thần số học. */
export function NenKhungSo() {
  return <NenKhung nguon={require('@/assets/nen/khung-so.jpg')} mo={0.55} />;
}

/** Khung có mười hai biểu tượng hoàng đạo quanh viền, dùng cho phần cung hoàng đạo. */
export function NenKhungCung() {
  return <NenKhung nguon={require('@/assets/nen/khung-cung.jpg')} mo={0.55} />;
}
