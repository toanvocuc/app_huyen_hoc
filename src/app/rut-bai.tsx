import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BauTroiDong } from '@/components/bau-troi-dong';
import { MatSau } from '@/components/mat-sau';
import { NenKhungVan, SAU_HOA_VAN } from '@/components/nen-anh';
import { NutQuayLai } from '@/components/nut-quay-lai';
import { DangTai, Nut, Trong } from '@/components/nen';
import { CHU, KHOI_CHUYEN, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { useBoBai } from '@/lib/kho-noi-dung';
import { SO_LUOT_MOI_NGAY, useLuotRut } from '@/lib/luot-rut';
import type { KieuTrai } from '@/lib/tarot';

/**
 * Câu mở đầu, bốc ngẫu nhiên mỗi lần khách vào màn này.
 *
 * Trước đây chỉ có một dòng cố định "Nghĩ về câu hỏi của bạn rồi chọn kiểu trải"
 * — đúng việc nhưng cộc lốc, và đọc tới lần thứ ba thì thành một cái nhãn.
 *
 * Mấy câu này dùng phông CÓ CHÂN chứ không dùng phông thân như chữ khác trong
 * app. Đây là chỗ duy nhất trên màn mang giọng nghi lễ, nên để nó khác hẳn.
 */
const CAU_MO = [
  'Vũ trụ đang lắng nghe.',
  'Những lá bài đang chờ được lật mở.',
  'Có những lời hồi đáp đến từ sự tĩnh lặng.',
  'Đêm nay, những vì sao muốn kể bạn nghe một điều.',
  'Đôi khi, định mệnh bắt đầu bằng một câu hỏi.',
  'Hãy để trực giác dẫn lối.',
  'Mỗi lá bài là một cánh cửa chưa mở.',
  'Có những điều chỉ trái tim mới thấu hiểu.',
  'Những bí mật đang chờ được hé lộ.',
  'Có lẽ, đây là lúc bạn cần một lời hồi đáp.',
  'Vũ trụ luôn có cách riêng để thì thầm.',
  'Điều bạn tìm kiếm có thể gần hơn bạn nghĩ.',
  'Hãy để những vì sao soi sáng con đường phía trước.',
  'Một thông điệp đang chờ bạn khám phá.',
  'Đôi khi, điều chưa biết lại chứa đựng câu trả lời.',
  'Hãy lắng nghe điều mà tâm trí thường bỏ qua.',
  'Mọi hành trình khám phá đều bắt đầu từ bên trong.',
  'Có những câu trả lời chỉ xuất hiện khi ta sẵn sàng.',
  'Hãy để màn đêm kể câu chuyện của riêng bạn.',
  'Một khoảnh khắc tĩnh lặng, một cánh cửa mới.',
];

const KIEU: { ma: KieuTrai; ten: string; mo: string; so: number }[] = [
  { ma: 'mot-la', ten: 'Một lá', mo: 'Cho một câu hỏi nhanh', so: 1 },
  { ma: 'ba-la', ten: 'Ba lá', mo: 'Quá khứ, hiện tại, tương lai', so: 3 },
];

export default function ChonKieuTrai() {
  const { boBai, loi, dangTai } = useBoBai();
  const [kieu, setKieu] = useState<KieuTrai>('mot-la');
  const le = useSafeAreaInsets();
  const { conLai, hetLuot, taiLai } = useLuotRut();

  const [cauMo, setCauMo] = useState(() => CAU_MO[Math.floor(Math.random() * CAU_MO.length)]);

  // Đếm lại mỗi lần màn này hiện lên. Rút xong khách quay về đây, không đọc lại
  // thì số lượt còn lại vẫn là số cũ. Tiện thể bốc câu mở đầu mới, để lần nào
  // vào cũng gặp một câu khác.
  useFocusEffect(
    useCallback(() => {
      taiLai();
      setCauMo(CAU_MO[Math.floor(Math.random() * CAU_MO.length)]);
    }, [taiLai])
  );

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      <NenKhungVan />
      {/* Lớp sao động nằm trên nền, dưới nội dung. Không nhận chạm nên không
          cản khách bấm vào thẻ phía dưới. */}
      <BauTroiDong />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerClassName="px-5"
          // flexGrow để nội dung giãn đầy màn hình. Không có nó thì mọi thứ dồn
          // lên đỉnh, chừa một mảng trống to dưới nút bắt đầu.
          contentContainerStyle={{
            flexGrow: 1,
            // Đẩy chữ xuống dưới đường kẻ vàng của khung. Chữ "Rút bài" cũng
            // màu vàng, rơi đúng lên đường kẻ thì hai thứ cùng màu chồng nhau
            // và không đọc ra cái nào. Máy có tai thỏ thì lề trên đã đủ sâu
            // nên không cộng thêm nữa.
            paddingTop: Math.max(16, SAU_HOA_VAN.van + 8 - le.top),
            paddingBottom: 24 + le.bottom,
          }}
          keyboardShouldPersistTaps="handled">
          {/* Màn này từng là một thẻ tab nên không cần đường lui. Giờ nó nằm
              trong chồng màn hình, thiếu nút này là khách kẹt lại. */}
          <View className="mb-2 self-start">
            <NutQuayLai />
          </View>
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 40, lineHeight: 46, color: MAU.vang }}
            className="text-center">
            Rút bài
          </Text>
          <Text
            style={{ fontFamily: CHU.hoa, fontSize: 23, lineHeight: 31 }}
            className="mt-3 px-2 text-center text-chu-chinh">
            {cauMo}
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

          <View className="min-h-[20px] flex-1" />

          <View className="gap-3">
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

          <View className="min-h-[20px] flex-1" />

          <View>
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
