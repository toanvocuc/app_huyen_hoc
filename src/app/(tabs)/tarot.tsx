import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { DangTai, ManHinh, Nhan, Nut, Trong } from '@/components/nen';
import { MAU } from '@/constants/giao-dien';
import { useBoBai } from '@/lib/kho-noi-dung';
import type { KieuTrai } from '@/lib/tarot';

const KIEU: { ma: KieuTrai; ten: string; mo: string; so: number }[] = [
  { ma: 'mot-la', ten: 'Một lá', mo: 'Cho một câu hỏi nhanh', so: 1 },
  { ma: 'ba-la', ten: 'Ba lá', mo: 'Quá khứ, hiện tại, tương lai', so: 3 },
];

export default function ChonKieuTrai() {
  const { boBai, dangTai } = useBoBai();
  const [kieu, setKieu] = useState<KieuTrai>('mot-la');
  const [cauHoi, setCauHoi] = useState('');

  return (
    <ManHinh tieuDe="Rút bài" phu="Nghĩ về câu hỏi của bạn rồi chọn kiểu trải.">
      {dangTai ? <DangTai /> : null}
      {boBai?.length === 0 ? <Trong loi="Kho lá bài đang trống, chưa rút được." /> : null}

      <View className="gap-3">
        {KIEU.map((k) => {
          const chon = kieu === k.ma;
          return (
            <Pressable
              key={k.ma}
              onPress={() => setKieu(k.ma)}
              className={`flex-row items-center gap-4 rounded-2xl border p-5 active:opacity-80 ${
                chon ? 'border-vang bg-vang/10' : 'border-vien bg-nen-nhat'
              }`}>
              <View className="h-14 w-14 flex-row items-center justify-center gap-1">
                {Array.from({ length: k.so }).map((_, i) => (
                  <View
                    key={i}
                    style={{ borderColor: chon ? MAU.vang : MAU.chuMo }}
                    className="h-11 w-6 rounded border"
                  />
                ))}
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold ${chon ? 'text-vang' : 'text-chu-chinh'}`}>
                  {k.ten}
                </Text>
                <Text className="mt-0.5 text-sm text-chu-phu">{k.mo}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-7">
        <Nhan>Câu hỏi của bạn</Nhan>
        <TextInput
          value={cauHoi}
          onChangeText={setCauHoi}
          placeholder="Không bắt buộc"
          placeholderTextColor={MAU.chuMo}
          multiline
          className="min-h-[88px] rounded-xl border border-vien bg-nen-nhat px-4 py-3.5 text-base leading-6 text-chu-chinh"
          textAlignVertical="top"
        />
      </View>

      <View className="mt-7">
        <Nut
          nhan="Bắt đầu rút bài"
          tat={!boBai?.length}
          onPress={() =>
            router.push({ pathname: '/tarot/rut', params: { kieu, cauHoi } })
          }
        />
      </View>
    </ManHinh>
  );
}
