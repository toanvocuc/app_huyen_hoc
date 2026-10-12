/**
 * Lời mời gắn tài khoản thật, hiện ở màn Cá nhân.
 *
 * Chỉ hiện khi khách đang dùng tài khoản ẩn danh. Đăng nhập rồi thì khối này
 * biến mất hẳn, không để lại nút chết nào.
 *
 * Gọi `ganGoogle` chứ KHÔNG gọi `dangNhapGoogle`. Hai hàm nhìn giống nhau
 * nhưng khác hẳn: hàm kia tạo một tài khoản mới và bỏ lại hồ sơ cũ ở tài khoản
 * ẩn danh, khách mở lên thấy trắng trơn. Hàm này giữ nguyên mã người dùng.
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { NutDangNhap } from '@/components/nut-dang-nhap';
import { CHU, MAU } from '@/constants/giao-dien';
import { ganApple, ganGoogle, KhachHuy, loiDeHieu } from '@/lib/dang-nhap';
import { laAnDanh } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { Platform } from 'react-native';

const LOI_ICH = [
  'Đổi máy hay cài lại app, hồ sơ vẫn còn',
  'Xem lại mọi lần rút bài trước đây',
];

export function MoiDangNhap({ xongThi }: { xongThi: () => void }) {
  const [anDanh, setAnDanh] = useState<boolean | null>(null);
  const [dangChay, setDangChay] = useState<'google' | 'apple' | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  // Đọc lại mỗi lần màn này hiện lên, không chỉ lúc dựng. Khách đăng nhập ở
  // màn khác rồi quay về thì khối này phải tự biến mất.
  useFocusEffect(
    useCallback(() => {
      laAnDanh().then(setAnDanh);
    }, [])
  );

  if (anDanh !== true) return null;

  async function gan(hang: 'google' | 'apple') {
    setLoi(null);
    setDangChay(hang);
    try {
      await (hang === 'google' ? ganGoogle() : ganApple());
      setAnDanh(false);
      xongThi();
    } catch (e) {
      if (!(e instanceof KhachHuy)) setLoi(loiDeHieu(e));
    } finally {
      setDangChay(null);
    }
  }

  return (
    <View
      style={{ borderColor: MAU.vangMo }}
      className="mt-7 rounded-2xl border bg-nen-nhat px-5 py-5">
      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 22, lineHeight: 28 }}
        className="text-chu-chinh">
        Giữ lại hồ sơ của bạn
      </Text>
      <Text style={{ fontFamily: CHU.than }} className="mt-1.5 text-sm leading-6 text-chu-phu">
        Hồ sơ này đang gắn với một mình máy bạn. Mất máy là mất luôn.
      </Text>

      <View className="mt-4 gap-2">
        {LOI_ICH.map((d) => (
          <View key={d} className="flex-row items-start gap-2.5">
            <Text style={{ fontFamily: CHU.than }} className="text-sm leading-6 text-vang">
              ✦
            </Text>
            <Text
              style={{ fontFamily: CHU.than }}
              className="flex-1 text-sm leading-6 text-chu-phu">
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-5 gap-3">
        {/* Apple bắt buộc có mặt trên iOS khi đã có đăng nhập bên thứ ba khác
            (điều 4.8). Trên Android thì thừa, nên giấu đi. */}
        {Platform.OS === 'ios' ? (
          <NutDangNhap
            hang="apple"
            nhan="Đăng nhập bằng Apple"
            onPress={() => gan('apple')}
            dangChay={dangChay === 'apple'}
            tat={dangChay !== null}
          />
        ) : null}
        <NutDangNhap
          hang="google"
          nhan="Đăng nhập bằng Google"
          onPress={() => gan('google')}
          dangChay={dangChay === 'google'}
          tat={dangChay !== null}
        />
      </View>

      {loi ? (
        <View className="mt-4 flex-row items-start gap-2">
          <Ionicons name="alert-circle-outline" size={16} color={MAU.canh} />
          <Text style={{ fontFamily: CHU.than }} className="flex-1 text-xs leading-5 text-canh">
            {loi}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
