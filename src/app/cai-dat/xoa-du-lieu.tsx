import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Khoi, ManHinh, Nut } from '@/components/nen';
import { xoaSachDuLieu } from '@/lib/ho-so';

export default function XoaDuLieu() {
  // Hỏi xác nhận hai lần. Thao tác này không lùi lại được.
  const [buoc, setBuoc] = useState<1 | 2>(1);
  const [dangXoa, setDangXoa] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function xoa() {
    setDangXoa(true);
    try {
      await xoaSachDuLieu();
      router.replace('/nhap-ho-so');
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Chưa xoá được, thử lại giúp tôi');
      setDangXoa(false);
    }
  }

  return (
    <ManHinh quayLai tieuDe="Xoá toàn bộ dữ liệu">
      <Khoi>
        <Text className="text-base leading-7 text-chu-chinh">
          {buoc === 1
            ? 'Hồ sơ, ngày sinh và toàn bộ lịch sử rút bài sẽ bị xoá khỏi máy chủ. Không có bản sao nào được giữ lại.'
            : 'Xác nhận lần cuối. Sau khi xoá thì không lấy lại được, kể cả khi bạn cài lại app.'}
        </Text>
      </Khoi>

      {loi ? <Text className="mt-5 text-sm leading-5 text-canh">{loi}</Text> : null}

      <View className="mt-7 gap-3">
        {buoc === 1 ? (
          <Nut nhan="Tôi muốn xoá" kieu="vien" onPress={() => setBuoc(2)} />
        ) : (
          <Nut nhan="Xoá vĩnh viễn" dangChay={dangXoa} onPress={xoa} />
        )}
        <Nut nhan="Giữ lại dữ liệu" kieu="nhe" onPress={() => router.back()} />
      </View>
    </ManHinh>
  );
}
