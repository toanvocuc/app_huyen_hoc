import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { MAU } from '@/constants/giao-dien';

/**
 * Chỗ hứng địa chỉ `omora://dang-nhap-xong` mà trình duyệt trả về.
 *
 * Màn này gần như không ai thấy — nó chỉ chớp qua. Nhưng phải có, và phải cư xử
 * đúng, vì đã sập hai lần ở đây:
 *
 *   Lần 1 — KHÔNG có màn này: hệ điều hành đẩy đường dẫn vào app, expo-router
 *   không biết nó là gì nên hiện trang "không tìm thấy". Khách đăng nhập xong
 *   thấy màn lỗi, tưởng hỏng.
 *
 *   Lần 2 — có màn này nhưng đá thẳng về màn chủ: khách đang ở mục Cá nhân, bấm
 *   đăng nhập, xong bị quăng ra trang Hôm nay. Mất dấu chỗ mình đang đứng.
 *
 * Giờ quay lại đúng chỗ vừa rời đi. Phần đổi mã lấy thẻ đăng nhập do
 * `lib/dang-nhap.ts` lo, nó nghe song song nên không phụ thuộc màn này.
 */
export default function DangNhapXong() {
  useEffect(() => {
    // Chờ một nhịp cho chồng màn hình ổn định rồi mới lùi. Lùi ngay trong lúc
    // nó đang dựng thì lệnh trôi mất.
    const hen = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace('/');
    }, 60);
    return () => clearTimeout(hen);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-nen">
      <ActivityIndicator color={MAU.vang} />
    </View>
  );
}
