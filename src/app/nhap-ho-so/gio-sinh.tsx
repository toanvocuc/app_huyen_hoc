import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BanhXeGioSinh } from '@/components/banh-xe';
import { KhungBuoc } from '@/components/khung-buoc';
import { CHU, MAU } from '@/constants/giao-dien';
import { datBanNhap, layBanNhap } from '@/lib/ban-nhap';

export default function BuocGioSinh() {
  const b = layBanNhap();
  const [gio, setGio] = useState(b.gio === '' ? 12 : Number(b.gio));
  const [phut, setPhut] = useState(Number(b.phut) || 0);
  // Bánh xe lúc nào cũng có sẵn một giá trị, nên phải có chỗ đánh dấu riêng
  // cho người không nhớ giờ sinh, không thì ai cũng bị gán đại một giờ.
  const [khongNho, setKhongNho] = useState(b.gio === '');

  const dat = useCallback((phan: { gio?: number; phut?: number }) => {
    if (phan.gio !== undefined) setGio(phan.gio);
    if (phan.phut !== undefined) setPhut(phan.phut);
  }, []);

  return (
    <KhungBuoc
      tenMan="Giờ sinh"
      buoc={3}
      hoi="Bạn sinh vào lúc mấy giờ?"
      dan="Giờ sinh chỉ cần khi lập lá số Tử Vi. Không nhớ thì bỏ qua, các phần khác vẫn chạy đủ."
      nhanNut={khongNho ? 'Tôi không nhớ giờ sinh' : 'Tiếp tục'}
      cuon={false}
      onTiep={() => {
        datBanNhap(
          khongNho ? { gio: '', phut: '' } : { gio: String(gio), phut: String(phut) }
        );
        router.push('/nhap-ho-so/noi-sinh');
      }}>
      {/* Tự co theo chỗ còn lại, xem ghi chú ở bước ngày sinh. */}
      <View className="mb-6 items-center justify-center" style={{ flex: 1, maxHeight: 146 }}>
        <Image
          source={require('@/assets/nen/dong-ho-cat.jpg')}
          style={{ flex: 1, aspectRatio: 104 / 146, borderRadius: 14 }}
          contentFit="cover"
        />
      </View>

      <View style={{ flexShrink: 0 }}>
        <View style={{ opacity: khongNho ? 0.3 : 1 }}>
          <BanhXeGioSinh gio={gio} phut={phut} dat={dat} />
        </View>

        {/* Chạm vào bánh xe đang mờ là bật nó lên luôn, khỏi phải đi tìm ô đánh dấu. */}
        {khongNho ? (
          <Pressable
            onPress={() => setKhongNho(false)}
            accessibilityRole="button"
            accessibilityLabel="Tôi nhớ giờ sinh, chọn giờ"
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
        ) : null}
      </View>

      <Pressable
        onPress={() => setKhongNho((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: khongNho }}
        hitSlop={8}
        className="mt-5 flex-row items-center justify-center gap-2.5 py-1 active:opacity-60">
        <View
          style={{
            borderColor: khongNho ? MAU.vang : MAU.vien,
            backgroundColor: khongNho ? MAU.vang : 'transparent',
          }}
          className="h-[22px] w-[22px] items-center justify-center rounded-md border">
          {khongNho ? <Ionicons name="checkmark" size={15} color={MAU.nen} /> : null}
        </View>
        <Text
          style={{ fontFamily: CHU.than }}
          className={khongNho ? 'text-sm text-chu-chinh' : 'text-sm text-chu-phu'}>
          Tôi không nhớ giờ sinh
        </Text>
      </Pressable>
    </KhungBuoc>
  );
}
