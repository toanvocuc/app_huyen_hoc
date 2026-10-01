import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';

import { DangTai, ManHinh, Nut, Trong } from '@/components/nen';
import { CAO_ANH, RONG_ANH, TY_LE_XEM, TheChiaSe } from '@/components/the-chia-se';
import { CHU } from '@/constants/giao-dien';
import { useBoBai } from '@/lib/kho-noi-dung';
import { layPhien } from '@/lib/phien-rut';
import { maNguoiDung } from '@/lib/supabase';
import { laHomNay, type LaDaRut } from '@/lib/tarot';

export default function ChiaSe() {
  const phien = layPhien();
  const theRef = useRef<View>(null);
  const [dangLam, setDangLam] = useState<'luu' | 'chia-se' | null>(null);

  // Vào thẳng màn này mà chưa rút lần nào thì lấy lá hôm nay, đỡ thành ngõ cụt.
  const { boBai } = useBoBai();
  const [laDuPhong, setLaDuPhong] = useState<LaDaRut | null>(null);
  useEffect(() => {
    if (phien?.cacLa.length || !boBai?.length) return;
    maNguoiDung().then((ma) => ma && setLaDuPhong(laHomNay(boBai, ma)));
  }, [phien, boBai]);

  const la = phien?.cacLa[0] ?? laDuPhong;

  /**
   * Chụp tấm thẻ thành file ảnh, trả về đường dẫn tạm.
   *
   * Nạp thư viện ngay tại đây chứ không nạp ở đầu file: react-native-view-shot và
   * expo-media-library không có bản cho trình duyệt, nạp sớm là vỡ cả màn khi chạy web.
   */
  async function chupAnh() {
    const { captureRef } = await import('react-native-view-shot');
    return captureRef(theRef, {
      format: 'jpg',
      quality: 0.92,
      // Vẽ ở cỡ nhỏ cho vừa màn hình, nhưng chụp ra đúng khổ 1080x1350.
      width: RONG_ANH,
      height: CAO_ANH,
    });
  }

  async function luuVaoMay() {
    setDangLam('luu');
    try {
      const MediaLibrary = await import('expo-media-library');
      const quyen = await MediaLibrary.requestPermissionsAsync();
      if (!quyen.granted) {
        Alert.alert('Chưa có quyền', 'Cho phép app lưu ảnh trong phần cài đặt của máy.');
        return;
      }
      const duong = await chupAnh();
      await MediaLibrary.saveToLibraryAsync(duong);
      Alert.alert('Đã lưu', 'Ảnh nằm trong thư viện ảnh của máy.');
    } catch (e) {
      Alert.alert('Chưa lưu được', e instanceof Error ? e.message : 'Thử lại giúp tôi.');
    } finally {
      setDangLam(null);
    }
  }

  async function chiaSe() {
    setDangLam('chia-se');
    try {
      const Sharing = await import('expo-sharing');
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Máy không chia sẻ được', 'Dùng nút lưu vào máy rồi đăng thủ công.');
        return;
      }
      const duong = await chupAnh();
      await Sharing.shareAsync(duong, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Chia sẻ lá bài',
      });
    } catch (e) {
      Alert.alert('Chưa chia sẻ được', e instanceof Error ? e.message : 'Thử lại giúp tôi.');
    } finally {
      setDangLam(null);
    }
  }

  if (!la) {
    return (
      <ManHinh quayLai tieuDe="Chia sẻ">
        <DangTai />
      </ManHinh>
    );
  }

  // Trình duyệt không chụp được khung nhìn, chỉ máy thật mới làm được.
  const chupDuoc = Platform.OS !== 'web';

  return (
    <ManHinh quayLai tieuDe="Chia sẻ" phu="Xem trước ảnh sẽ đăng.">
      <View className="items-center">
        <TheChiaSe ref={theRef} daRut={la} tyLe={TY_LE_XEM} />
      </View>

      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-4 text-center text-xs leading-5 text-chu-mo">
        Ảnh xuất ra khổ {RONG_ANH} × {CAO_ANH}, vừa khung đứng của Facebook và Instagram
      </Text>

      {chupDuoc ? (
        <View className="mt-7 gap-3">
          <Nut nhan="Chia sẻ" dangChay={dangLam === 'chia-se'} onPress={chiaSe} />
          <Nut nhan="Lưu vào máy" kieu="vien" dangChay={dangLam === 'luu'} onPress={luuVaoMay} />
        </View>
      ) : (
        <View className="mt-7">
          <Trong loi="Mở trên điện thoại để lưu và chia sẻ ảnh. Trình duyệt không chụp được." />
        </View>
      )}
    </ManHinh>
  );
}
