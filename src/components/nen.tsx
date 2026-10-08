/** Khung màn hình và mấy mảnh giao diện dùng lại khắp app. */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChumSaoToa } from '@/components/hieu-ung-sao';
import { NutQuayLai } from '@/components/nut-quay-lai';
import { CAO_THANH_TAB, CHU, KHOI_CHUYEN, MAU, NEN_CHUYEN } from '@/constants/giao-dien';

export function ManHinh({
  tieuDe,
  phu,
  quayLai,
  nenPhu,
  children,
}: {
  tieuDe?: string;
  phu?: string;
  quayLai?: boolean;
  /** Lớp ảnh nền đặt dưới nội dung, ví dụ trời sao hay khung hoa văn. */
  nenPhu?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Chừa chỗ cho thanh tab và thanh điều hướng của máy, không thì dòng cuối
  // trang nằm khuất phía dưới và cuộn hết cỡ vẫn không đọc được.
  const le = useSafeAreaInsets();

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      {nenPhu}
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerClassName="px-5 pt-3"
          contentContainerStyle={{ paddingBottom: CAO_THANH_TAB + 16 + le.bottom }}
          keyboardShouldPersistTaps="handled">
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

export function Khoi({ children, vien }: { children: React.ReactNode; vien?: boolean }) {
  return (
    <LinearGradient
      colors={KHOI_CHUYEN}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 18, borderWidth: 1, borderColor: vien ? MAU.vangMo : MAU.vien }}>
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
