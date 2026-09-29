/** Khung màn hình và mấy mảnh giao diện dùng lại khắp app. */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MAU } from '@/constants/giao-dien';

export function ManHinh({
  tieuDe,
  phu,
  quayLai,
  children,
}: {
  tieuDe?: string;
  phu?: string;
  quayLai?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-nen" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-5 pb-16 pt-3"
        keyboardShouldPersistTaps="handled">
        {quayLai ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="mb-3 -ml-1 h-9 w-9 items-center justify-center rounded-full active:opacity-60">
            <Ionicons name="chevron-back" size={24} color={MAU.chuPhu} />
          </Pressable>
        ) : null}
        {tieuDe ? <Text className="text-2xl font-bold text-chu-chinh">{tieuDe}</Text> : null}
        {phu ? <Text className="mt-1 text-sm leading-5 text-chu-phu">{phu}</Text> : null}
        <View className={tieuDe ? 'mt-6' : ''}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Khoi({ children, vien }: { children: React.ReactNode; vien?: boolean }) {
  return (
    <View
      className={`rounded-2xl bg-nen-nhat p-5 ${vien ? 'border border-vang/30' : ''}`}>
      {children}
    </View>
  );
}

export function Nhan({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-vang">
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
  const nen =
    kieu === 'dac' ? 'bg-vang' : kieu === 'vien' ? 'border border-vang bg-transparent' : 'bg-nen-nhat';
  const chu = kieu === 'dac' ? 'text-nen' : 'text-vang';
  return (
    <Pressable
      onPress={onPress}
      disabled={tat || dangChay}
      className={`min-h-[52px] items-center justify-center rounded-xl px-5 py-3.5 active:opacity-80 ${nen} ${
        tat ? 'opacity-40' : ''
      }`}>
      {dangChay ? (
        <ActivityIndicator color={kieu === 'dac' ? MAU.nen : MAU.vang} />
      ) : (
        <Text className={`text-center text-base font-semibold ${chu}`}>{nhan}</Text>
      )}
    </Pressable>
  );
}

export function DongDanh({
  nhan,
  gia,
  onPress,
}: {
  nhan: string;
  gia?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="min-h-[52px] flex-row items-center justify-between border-b border-vien py-3.5 active:opacity-60">
      <Text className="flex-1 pr-3 text-base text-chu-chinh">{nhan}</Text>
      <View className="flex-row items-center gap-1.5">
        {gia ? <Text className="text-base text-chu-phu">{gia}</Text> : null}
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
    <View className="rounded-2xl border border-dashed border-chu-mo/40 p-5">
      <Text className="text-sm leading-5 text-chu-phu">{loi}</Text>
    </View>
  );
}
