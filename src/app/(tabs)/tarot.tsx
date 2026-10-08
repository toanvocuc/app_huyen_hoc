import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatSau } from '@/components/mat-sau';
import { NenKhungVan } from '@/components/nen-anh';
import { DangTai, Nut, Trong } from '@/components/nen';
import { CAO_THANH_TAB, CHU, KHOI_CHUYEN, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { useBoBai } from '@/lib/kho-noi-dung';
import { SO_LUOT_MOI_NGAY, useLuotRut } from '@/lib/luot-rut';
import type { KieuTrai } from '@/lib/tarot';

const KIEU: { ma: KieuTrai; ten: string; mo: string; so: number }[] = [
  { ma: 'mot-la', ten: 'Một lá', mo: 'Cho một câu hỏi nhanh', so: 1 },
  { ma: 'ba-la', ten: 'Ba lá', mo: 'Quá khứ, hiện tại, tương lai', so: 3 },
];

export default function ChonKieuTrai() {
  const { boBai, loi, dangTai } = useBoBai();
  const [kieu, setKieu] = useState<KieuTrai>('mot-la');
  const le = useSafeAreaInsets();
  const { conLai, hetLuot, taiLai } = useLuotRut();

  // Đếm lại mỗi lần màn này hiện lên. Rút xong khách quay về đây, không đọc lại
  // thì số lượt còn lại vẫn là số cũ.
  useFocusEffect(useCallback(() => taiLai(), [taiLai]));

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      <NenKhungVan />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerClassName="px-5 pt-4"
          contentContainerStyle={{ paddingBottom: CAO_THANH_TAB + 16 + le.bottom }}
          keyboardShouldPersistTaps="handled">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 40, lineHeight: 46, color: MAU.vang }}
            className="text-center">
            Rút bài
          </Text>
          <Text
            style={{ fontFamily: CHU.than, fontSize: 15, lineHeight: 23 }}
            className="mt-1 text-center text-chu-phu">
            Nghĩ về câu hỏi của bạn{'\n'}rồi chọn kiểu trải
          </Text>

          {dangTai ? <DangTai /> : null}
          {loi ? (
            <View className="mt-6">
              <Trong loi={`Chưa tải được nội dung. ${loi}`} />
            </View>
          ) : null}
          {boBai?.length === 0 ? (
            <View className="mt-6">
              <Trong loi="Kho lá bài đang trống, chưa rút được." />
            </View>
          ) : null}

          <View className="mt-5 gap-3">
            {KIEU.map((k) => (
              <TheKieu
                key={k.ma}
                ten={k.ten}
                mo={k.mo}
                so={k.so}
                chon={kieu === k.ma}
                onPress={() => setKieu(k.ma)}
              />
            ))}
          </View>

          <View className="mt-5">
            <Nut
              nhan={hetLuot ? 'Hết lượt hôm nay' : 'Bắt đầu rút bài'}
              tat={!boBai?.length || hetLuot}
              onPress={() => router.push({ pathname: '/tarot/rut', params: { kieu } })}
            />
            {hetLuot ? (
              <Text
                style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 22 }}
                className="mt-3 text-center text-chu-phu">
                Hôm nay bạn đã rút đủ {SO_LUOT_MOI_NGAY} lần. Hỏi đi hỏi lại một chuyện thì quẻ
                loãng dần, nên mai hẵng rút tiếp. Lá bài hôm nay vẫn xem được bình thường.
              </Text>
            ) : (
              <Text
                style={{ fontFamily: CHU.than, fontSize: 13 }}
                className="mt-3 text-center text-chu-mo">
                Còn {conLai} trên {SO_LUOT_MOI_NGAY} lượt hôm nay
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function TheKieu({
  ten,
  mo,
  so,
  chon,
  onPress,
}: {
  ten: string;
  mo: string;
  so: number;
  chon: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <LinearGradient
        colors={chon ? ['#241D3A', '#171227'] : KHOI_CHUYEN}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          borderRadius: 20,
          borderWidth: chon ? 1.5 : 1,
          borderColor: chon ? MAU.vang : MAU.vien,
        }}>
        <View className="items-center px-5 pb-4 pt-5">
          {/* Nút tròn xác nhận, góc trên bên phải */}
          <View
            style={{
              borderColor: chon ? MAU.vang : MAU.vien,
              backgroundColor: chon ? MAU.vang : 'transparent',
            }}
            className="absolute right-4 top-4 h-6 w-6 items-center justify-center rounded-full border">
            {chon ? <Ionicons name="checkmark" size={14} color={MAU.nen} /> : null}
          </View>

          <HinhLa so={so} />

          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
            className={chon ? 'mt-3 text-vang' : 'mt-3 text-chu-chinh'}>
            {ten}
          </Text>
          <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-sm text-chu-phu">
            {mo}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Xem trước: một lá đứng thẳng, hoặc ba lá xoè nhẹ. */
function HinhLa({ so }: { so: number }) {
  const rong = 54;
  if (so === 1) return <MatSau rong={rong} />;

  return (
    <View
      style={{ height: rong / 0.57 + 10, width: rong * 2.1 }}
      className="items-center justify-center">
      {[-1, 0, 1].map((i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            transform: [
              { translateX: i * rong * 0.62 },
              { translateY: Math.abs(i) * 5 },
              { rotate: `${i * 11}deg` },
            ],
            zIndex: i === 0 ? 3 : 1,
          }}>
          <MatSau rong={rong} />
        </View>
      ))}
    </View>
  );
}
