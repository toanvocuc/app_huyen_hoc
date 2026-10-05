/** Khung chung cho năm bước nhập hồ sơ: thanh tiêu đề, thanh tiến trình, nội dung, nút dưới. */

import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NenTroiSao } from '@/components/nen-anh';
import { Nut } from '@/components/nen';
import { BuocTienTrinh, ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CHU, MAU, NEN_CHUYEN } from '@/constants/giao-dien';

export function KhungBuoc({
  tenMan,
  buoc,
  tong = 5,
  hoi,
  dan,
  children,
  nhanNut = 'Tiếp tục',
  tat,
  onTiep,
  duoi,
  cuon = true,
}: {
  tenMan: string;
  buoc: number;
  tong?: number;
  hoi: string;
  dan?: string;
  children: React.ReactNode;
  nhanNut?: string;
  tat?: boolean;
  onTiep: () => void;
  duoi?: React.ReactNode;
  /**
   * Tắt khi nội dung có bánh xe cuộn.
   *
   * Bánh xe chỉ dựng những dòng quanh chỗ đang nhìn, mà cơ chế đó hỏng nếu bên
   * ngoài cũng là một vùng cuộn dọc — React Native báo lỗi đỏ đúng chuyện này.
   * Mấy bước đó vừa khít một màn nên không cần cuộn ngoài.
   */
  cuon?: boolean;
}) {
  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      <NenTroiSao />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ThanhTieuDe ten={tenMan} />
        <BuocTienTrinh buoc={buoc} tong={tong} nhanPhai={buoc === 1 ? 'Khởi tạo' : undefined} />

        <Ben cuon={cuon}>
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 30, lineHeight: 36 }}
            className="text-center text-chu-chinh">
            {hoi}
          </Text>
          {dan ? (
            <Text
              style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 22 }}
              className="mx-auto mt-2 max-w-[300px] text-center text-chu-phu">
              {dan}
            </Text>
          ) : null}

          <View className={cuon ? 'mt-7' : 'mt-7 flex-1 justify-center'}>{children}</View>
          {duoi}
        </Ben>

        <View style={{ borderTopColor: MAU.vien }} className="border-t px-5 pb-2 pt-4">
          <Nut nhan={nhanNut} tat={tat} onPress={onTiep} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

/** Vùng nội dung: cuộn được, hoặc đứng yên khi bên trong đã có bánh xe cuộn. */
function Ben({ cuon, children }: { cuon: boolean; children: React.ReactNode }) {
  if (!cuon) return <View className="flex-1 px-5 pb-8 pt-7">{children}</View>;
  return (
    <ScrollView contentContainerClassName="px-5 pb-8 pt-7" keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}
