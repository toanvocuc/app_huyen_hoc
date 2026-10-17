/** Khung màn hình và mấy mảnh giao diện dùng lại khắp app. */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChumSaoToa } from '@/components/hieu-ung-sao';
import { BauTroiDong } from '@/components/bau-troi-dong';
import { NutQuayLai } from '@/components/nut-quay-lai';
import { CAO_THANH_TAB, CHU, KHOI_CHUYEN, MAU, NEN_CHUYEN } from '@/constants/giao-dien';

export function ManHinh({
  tieuDe,
  phu,
  quayLai,
  nenPhu,
  onLamMoi,
  dangLamMoi,
  cuonRef,
  children,
}: {
  tieuDe?: string;
  phu?: string;
  quayLai?: boolean;
  /** Lớp ảnh nền đặt dưới nội dung, ví dụ trời sao hay khung hoa văn. */
  nenPhu?: React.ReactNode;
  /**
   * Khai vào là màn kéo xuống được để tải lại.
   *
   * Cần cho mấy màn có dữ liệu đổi ở phía người khác: thầy đang nhìn danh sách
   * đơn thì khách đặt thêm, mà màn chỉ tải lại lúc vừa hiện lên — không có chỗ
   * kéo thì thầy phải thoát ra vào lại mới thấy.
   */
  onLamMoi?: () => void;
  dangLamMoi?: boolean;
  /**
   * Mốc để chỗ gọi tự cuộn tới một chỗ trong trang.
   *
   * Cần cho việc bấm thông báo rồi nhảy tới đúng đơn. Không có mốc này thì
   * ScrollView nằm kín trong đây, bên ngoài không với tới được.
   */
  cuonRef?: React.RefObject<ScrollView | null>;
  children: React.ReactNode;
}) {
  // Chừa chỗ cho thanh tab và thanh điều hướng của máy, không thì dòng cuối
  // trang nằm khuất phía dưới và cuộn hết cỡ vẫn không đọc được.
  const le = useSafeAreaInsets();

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      {nenPhu}
      <BauTroiDong />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          ref={cuonRef}
          contentContainerClassName="px-5 pt-3"
          contentContainerStyle={{ paddingBottom: CAO_THANH_TAB + 16 + le.bottom }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onLamMoi ? (
              <RefreshControl
                refreshing={Boolean(dangLamMoi)}
                onRefresh={onLamMoi}
                tintColor={MAU.vang}
                colors={[MAU.vang]}
                progressBackgroundColor={MAU.nenNhat}
              />
            ) : undefined
          }>
          {quayLai ? (
            <View className="mb-4">
              <NutQuayLai />
            </View>
          ) : null}
          {tieuDe ? (
            <Text style={{ fontFamily: CHU.hoaDam, fontSize: 38, lineHeight: 44 }} className="text-chu-chinh">
              {tieuDe}
            </Text>
          ) : null}
          {phu ? (
            <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">
              {phu}
            </Text>
          ) : null}
          <View className={tieuDe ? 'mt-6' : ''}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export function Khoi({
  children,
  vien,
  vang,
  anhNen,
}: {
  children: React.ReactNode;
  /** Viền vàng mờ, dùng để nhấn một khối giữa nhiều khối giống nhau. */
  vien?: boolean;
  /**
   * Viền vàng đậm trên nền đen.
   *
   * Dùng cho mấy khối mang việc còn sống — đơn đang chờ, thông báo chưa đọc.
   * Tương phản mạnh hơn hẳn nền chuyển sắc xanh, nên mắt bắt được ngay cả khi
   * phía sau là ảnh trời sao.
   */
  vang?: boolean;
  /** Ảnh lót bên trong khối. Chạy dưới một lớp phủ tối để chữ vẫn đọc được. */
  anhNen?: ImageSourcePropType;
}) {
  const vienMau = vang ? MAU.vang : vien ? MAU.vangMo : MAU.vien;
  const khung = { borderRadius: 18, borderWidth: 1, borderColor: vienMau, overflow: 'hidden' as const };

  if (anhNen) {
    return (
      <View style={[khung, { backgroundColor: MAU.nenDen }]}>
        <Image source={anhNen} style={{ position: 'absolute', inset: 0 }} contentFit="cover" />
        {/* Lớp phủ tối: ảnh nào cũng có chỗ sáng, mà chữ trắng đặt lên chỗ sáng
            là mất hút. Phủ rồi thì ảnh thành vân nền chứ không tranh với chữ. */}
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,13,0.62)' }} />
        <View className="p-5">{children}</View>
      </View>
    );
  }

  if (vang) {
    return (
      <View style={[khung, { backgroundColor: MAU.nenDen }]}>
        <View className="p-5">{children}</View>
      </View>
    );
  }

  return (
    <LinearGradient colors={KHOI_CHUYEN} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={khung}>
      <View className="p-5">{children}</View>
    </LinearGradient>
  );
}

/** Đường kẻ mảnh có viên kim cương ở giữa, ngăn hai phần nội dung. */
export function VanNgan() {
  return (
    <View className="my-6 flex-row items-center justify-center gap-3">
      <View style={{ backgroundColor: MAU.vangMo }} className="h-px flex-1" />
      <View style={{ borderColor: MAU.vang }} className="h-2 w-2 rotate-45 border" />
      <View style={{ backgroundColor: MAU.vangMo }} className="h-px flex-1" />
    </View>
  );
}

export function Nhan({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{ fontFamily: CHU.thanDam, letterSpacing: 1.6 }}
      className="mb-2 text-[11px] uppercase text-vang">
      {children}
    </Text>
  );
}

/** Chữ thân bài, cỡ và giãn dòng thoáng vì dấu tiếng Việt chồng cao. */
export function ChuThan({ children, mo }: { children: React.ReactNode; mo?: boolean }) {
  return (
    <Text
      style={{ fontFamily: CHU.than, fontSize: 15.5, lineHeight: 27 }}
      className={mo ? 'text-chu-phu' : 'text-chu-chinh'}>
      {children}
    </Text>
  );
}

export function Nut({
  nhan,
  onPress,
  kieu = 'dac',
  tat,
  dangChay,
}: {
  nhan: string;
  onPress: () => void;
  kieu?: 'dac' | 'vien' | 'nhe';
  tat?: boolean;
  dangChay?: boolean;
}) {
  const chu = kieu === 'dac' ? MAU.nen : MAU.vang;
  const lucBam = useRef(0);
  const [lanBam, setLanBam] = useState(0);

  /**
   * Chặn cú bấm thứ hai ngay sau cú đầu.
   *
   * Máy yếu chuyển màn mất một lúc, khách tưởng nút chưa ăn nên bấm thêm cái
   * nữa. Hai cú đều chạy router.push, thế là nhảy luôn hai màn.
   */
  const bam = () => {
    const gio = Date.now();
    if (gio - lucBam.current < 800) return;
    lucBam.current = gio;
    setLanBam((n) => n + 1);
    onPress();
  };

  const ben = (
    <View className="min-h-[54px] items-center justify-center px-5 py-3.5">
      {dangChay ? (
        <ActivityIndicator color={chu} />
      ) : (
        <Text style={{ fontFamily: CHU.thanDam, color: chu, letterSpacing: 0.3 }} className="text-base">
          {nhan}
        </Text>
      )}
    </View>
  );

  if (kieu === 'dac') {
    return (
      <Pressable onPress={bam} disabled={tat || dangChay} className={tat ? 'opacity-40' : ''}>
        <View>
          <LinearGradient
            colors={[MAU.vangSang, MAU.vang]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 14 }}>
            {ben}
          </LinearGradient>
          {/* Để ngoài LinearGradient: bo góc của nó cắt mất phần sao bay ra mép. */}
          <ChumSaoToa lan={lanBam} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={bam}
      disabled={tat || dangChay}
      style={{ borderColor: kieu === 'vien' ? MAU.vang : MAU.vien }}
      className={`rounded-[14px] border ${kieu === 'nhe' ? 'bg-nen-nhat' : ''} ${
        tat ? 'opacity-40' : ''
      } active:opacity-70`}>
      {ben}
      <ChumSaoToa lan={lanBam} />
    </Pressable>
  );
}

export function DongDanh({ nhan, gia, onPress }: { nhan: string; gia?: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{ borderBottomColor: MAU.vien }}
      className="min-h-[54px] flex-row items-center justify-between border-b py-3.5 active:opacity-60">
      <Text style={{ fontFamily: CHU.than }} className="flex-1 pr-3 text-base text-chu-chinh">
        {nhan}
      </Text>
      <View className="flex-row items-center gap-1.5">
        {gia ? (
          <Text style={{ fontFamily: CHU.than }} className="text-base text-chu-phu">
            {gia}
          </Text>
        ) : null}
        {onPress ? <Ionicons name="chevron-forward" size={17} color={MAU.chuMo} /> : null}
      </View>
    </Pressable>
  );
}

export function DangTai() {
  return (
    <View className="items-center py-10">
      <ActivityIndicator color={MAU.vang} />
    </View>
  );
}

export function Trong({ loi }: { loi: string }) {
  return (
    <View style={{ borderColor: MAU.vien }} className="rounded-2xl border border-dashed p-5">
      <Text style={{ fontFamily: CHU.than }} className="text-sm leading-6 text-chu-phu">
        {loi}
      </Text>
    </View>
  );
}

/**
 * Dòng miễn trừ ở cuối mỗi màn kết quả luận giải.
 *
 * Đặt ngay dưới phần luận giải chứ không chỉ để ở màn chào và màn Cá nhân: ai
 * mở thẳng một màn kết quả từ thông báo hay từ liên kết chia sẻ thì chưa từng
 * đi qua hai chỗ kia. Và đây cũng là chỗ người ta dễ đọc lời luận giải như một
 * lời khuyên thật nhất, nên câu nhắc phải nằm đúng ở đó.
 */
export function LuuYThamKhao() {
  return (
    <Text
      style={{ fontFamily: CHU.than }}
      className="mt-8 text-center text-[11px] leading-5 text-chu-mo">
      Nội dung này mang tính tham khảo và giải trí, không thay thế lời khuyên y tế, tâm lý,
      tài chính hay pháp lý.
    </Text>
  );
}
