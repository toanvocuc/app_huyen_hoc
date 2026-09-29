/**
 * Ảnh dải ngân hà trải phía trên màn hình rồi tan dần vào nền.
 *
 * Ảnh gốc là ảnh ngang. Kéo cho đầy màn dọc sẽ méo hoặc cắt mất phần đẹp nhất,
 * nên chỉ đặt ở phần trên rồi phủ một lớp chuyển sắc từ trong suốt xuống màu nền.
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, View } from 'react-native';

import { MAU } from '@/constants/giao-dien';

const RONG = Dimensions.get('window').width;

export function NenSao({
  cao = 420,
  mo = 1,
}: {
  /** Chiều cao phần ảnh, tính cả đoạn tan dần. */
  cao?: number;
  /** Độ đậm của ảnh, hạ xuống khi phía trên có nhiều chữ. */
  mo?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: cao }}>
      <Image
        source={require('@/assets/nen/ngan-ha.jpg')}
        style={{ width: RONG, height: cao, opacity: mo }}
        contentFit="cover"
        contentPosition="top"
      />
      {/* Tan dần vào nền: trong suốt ở trên, đặc màu nền ở dưới. */}
      <LinearGradient
        colors={['transparent', 'transparent', MAU.nen]}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: cao }}
      />
    </View>
  );
}
