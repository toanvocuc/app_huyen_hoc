import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Khoi, ManHinh, Nut } from '@/components/nen';
import { CHU } from '@/constants/giao-dien';
import { xoaTaiKhoan } from '@/lib/ho-so';

export default function XoaTaiKhoan() {
  // Hỏi xác nhận hai lần. Thao tác này không lùi lại được.
  const [buoc, setBuoc] = useState<1 | 2>(1);
  const [dangXoa, setDangXoa] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function xoa() {
    setDangXoa(true);
    try {
      await xoaTaiKhoan();
      // Tài khoản không còn, nên về màn đăng nhập chứ không về phần nhập hồ sơ.
      // Về nhập hồ sơ thì bước cuối sẽ cần một phiên mà giờ không còn phiên nào.
      router.replace('/dang-nhap');
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Chưa xoá được, thử lại giúp tôi');
      setDangXoa(false);
    }
  }

  return (
    <ManHinh quayLai tieuDe="Xoá tài khoản">
      <Khoi>
        <Text style={{ fontFamily: CHU.than }} className="text-base leading-7 text-chu-chinh">
          {buoc === 1
            ? 'Tài khoản của bạn sẽ bị xoá hẳn, cùng với hồ sơ, ngày sinh, lịch sử rút bài và mọi yêu cầu tư vấn đã gửi. Không có bản sao nào được giữ lại.'
            : 'Xác nhận lần cuối. Sau khi xoá thì không lấy lại được, kể cả khi bạn đăng nhập lại bằng đúng tài khoản cũ.'}
        </Text>
      </Khoi>

      {loi ? <Text style={{ fontFamily: CHU.than }} className="mt-5 text-sm leading-5 text-canh">{loi}</Text> : null}

      <View className="mt-7 gap-3">
        {buoc === 1 ? (
          <Nut nhan="Tôi muốn xoá tài khoản" kieu="vien" onPress={() => setBuoc(2)} />
        ) : (
          <Nut nhan="Xoá vĩnh viễn" dangChay={dangXoa} onPress={xoa} />
        )}
        <Nut nhan="Giữ lại tài khoản" kieu="nhe" onPress={() => router.back()} />
      </View>
    </ManHinh>
  );
}
