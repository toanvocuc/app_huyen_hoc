import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ManHinh({ tieuDe, phu, children }: {
  tieuDe: string;
  phu?: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-nen" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-4">
        <Text className="text-2xl font-bold text-chu-chinh">{tieuDe}</Text>
        {phu ? <Text className="mt-1 text-sm text-chu-phu">{phu}</Text> : null}
        <View className="mt-6">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Khoi({ children }: { children: React.ReactNode }) {
  return <View className="rounded-2xl bg-nen-nhat p-5">{children}</View>;
}

export function ChuaLam({ viec }: { viec: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-chu-phu/40 p-5">
      <Text className="text-sm text-chu-phu">Chưa làm: {viec}</Text>
    </View>
  );
}
