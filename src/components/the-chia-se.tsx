/**
 * Tấm ảnh khách đăng lên mạng xã hội.
 *
 * Đây là thứ duy nhất trong app đi ra ngoài, nên mỗi lần khách chia sẻ là một lần
 * quảng cáo. Vì vậy nó dựng theo khổ ảnh đứng của mạng xã hội chứ không theo khổ
 * màn hình, và luôn có tên app ở chân.
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { Text, View } from 'react-native';

import { LaBai } from '@/components/la-bai';
import { Logo } from '@/components/logo';
import { CHU, MAU } from '@/constants/giao-dien';
import { yNghia, type LaDaRut } from '@/lib/tarot';

/** Khổ 4:5, khổ đứng mà Facebook và Instagram đều hiện trọn không cắt. */
export const RONG_ANH = 1080;
export const CAO_ANH = 1350;

/** Tỷ lệ thu nhỏ để xem trước vừa màn hình, lúc chụp thì phóng lại. */
export const TY_LE_XEM = 0.3;

export const TheChiaSe = forwardRef<View, { daRut: LaDaRut; tyLe?: number }>(
  function TheChiaSe({ daRut, tyLe = 1 }, ref) {
    const p = (n: number) => n * tyLe; // đổi cỡ theo tỷ lệ đang vẽ

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{ width: RONG_ANH * tyLe, height: CAO_ANH * tyLe, backgroundColor: MAU.nen }}>
        <Image
          source={require('@/assets/nen/khung-hoa-van.jpg')}
          style={{ position: 'absolute', width: RONG_ANH * tyLe, height: CAO_ANH * tyLe }}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(11,18,32,0.25)', 'rgba(11,18,32,0.75)']}
          style={{ position: 'absolute', width: RONG_ANH * tyLe, height: CAO_ANH * tyLe }}
        />

        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: p(100), paddingVertical: p(72) }}>
          <Text
            style={{
              fontFamily: CHU.thanDam,
              fontSize: p(26),
              letterSpacing: p(7),
              color: MAU.vang,
              textTransform: 'uppercase',
            }}>
            Lá bài của bạn
          </Text>

          <View style={{ marginTop: p(44) }}>
            <LaBai daRut={daRut} rong={p(340)} />
          </View>

          <Text
            style={{
              fontFamily: CHU.hoaDam,
              fontSize: p(80),
              lineHeight: p(92),
              color: MAU.chuChinh,
              marginTop: p(44),
              textAlign: 'center',
            }}>
            {daRut.la.tenEn}
            {daRut.nguoc ? ' (ngược)' : ''}
          </Text>

          <Text
            style={{
              fontFamily: CHU.thanDam,
              fontSize: p(26),
              letterSpacing: p(4),
              color: MAU.vang,
              marginTop: p(16),
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
            {daRut.la.tuKhoa}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              fontFamily: CHU.than,
              fontSize: p(34),
              lineHeight: p(54),
              color: MAU.chuPhu,
              marginTop: p(32),
              textAlign: 'center',
            }}>
            {yNghia(daRut)}
          </Text>

          <View style={{ flex: 1 }} />

          <View style={{ alignItems: 'center' }}>
            <Logo rong={p(230)} />
          </View>
        </View>
      </View>
    );
  }
);
