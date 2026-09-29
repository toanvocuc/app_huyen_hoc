import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ManHinh, Nut } from '@/components/nen';
import { MAU } from '@/constants/giao-dien';
import { TINH_THANH } from '@/data/tinh-thanh';
import { boDau } from '@/lib/numerology';
import { luuHoSo } from '@/lib/ho-so';

export default function NoiSinh() {
  const [tim, setTim] = useState('');
  const [chon, setChon] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  // Gõ không dấu vẫn tìm ra, vì phần lớn người dùng gõ nhanh không bỏ dấu.
  const danhSach = useMemo(() => {
    const k = boDau(tim).trim();
    if (!k) return TINH_THANH;
    return TINH_THANH.filter((t) => boDau(t).includes(k));
  }, [tim]);

  async function xong(bo?: boolean) {
    setDangLuu(true);
    try {
      await luuHoSo({ noi_sinh: bo ? null : chon });
      router.replace('/(tabs)');
    } catch (e) {
      console.warn('[noi-sinh]', e);
    } finally {
      setDangLuu(false);
    }
  }

  return (
    <ManHinh
      quayLai
      tieuDe="Nơi sinh"
      phu="Dùng khi lập lá số. Chưa cần ngay thì bỏ qua cũng được.">
      <TextInput
        value={tim}
        onChangeText={setTim}
        placeholder="Tìm tỉnh thành"
        placeholderTextColor={MAU.chuMo}
        className="min-h-[52px] rounded-xl border border-vien bg-nen-nhat px-4 text-base text-chu-chinh"
      />

      <View className="mt-4 overflow-hidden rounded-2xl bg-nen-nhat">
        {danhSach.length === 0 ? (
          <Text className="p-5 text-sm text-chu-phu">Không tìm thấy tỉnh thành nào</Text>
        ) : (
          danhSach.map((t, i) => {
            const dangChon = chon === t;
            return (
              <Pressable
                key={t}
                onPress={() => setChon(t)}
                className={`min-h-[52px] flex-row items-center justify-between px-4 py-3.5 active:opacity-60 ${
                  i > 0 ? 'border-t border-vien' : ''
                }`}>
                <Text className={`text-base ${dangChon ? 'font-semibold text-vang' : 'text-chu-chinh'}`}>
                  {t}
                </Text>
                {dangChon ? <Text className="text-base text-vang">✓</Text> : null}
              </Pressable>
            );
          })
        )}
      </View>

      <View className="mt-7 gap-3">
        <Nut nhan="Xong" tat={!chon} dangChay={dangLuu} onPress={() => xong()} />
        <Nut nhan="Bỏ qua bước này" kieu="nhe" onPress={() => xong(true)} />
      </View>
    </ManHinh>
  );
}
