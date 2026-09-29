/** Khung màn hình và mấy mảnh giao diện dùng lại khắp app. */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHU, KHOI_CHUYEN, MAU, NEN_CHUYEN } from '@/constants/giao-dien';

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
  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      {nenPhu}
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerClassName="px-5 pb-16 pt-3" keyboardShouldPersistTaps="handled">
          {quayLai ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              className="mb-3 -ml-1 h-9 w-9 items-center justify-center rounded-full active:opacity-60">
              <Ionicons name="chevron-back" size={24} color={MAU.chuPhu} />
            </Pressable>
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
      <Pressable onPress={onPress} disabled={tat || dangChay} className={tat ? 'opacity-40' : ''}>
        <LinearGradient
          colors={[MAU.vangSang, MAU.vang]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 14 }}>
          {ben}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={tat || dangChay}
      style={{ borderColor: kieu === 'vien' ? MAU.vang : MAU.vien }}
      className={`rounded-[14px] border ${kieu === 'nhe' ? 'bg-nen-nhat' : ''} ${
        tat ? 'opacity-40' : ''
      } active:opacity-70`}>
      {ben}
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
