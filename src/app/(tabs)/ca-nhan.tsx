import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { DangTai } from '@/components/nen';
import { ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CAO_THANH_TAB, CHU, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

export default function CaNhan() {
  const { hoSo, dangTai } = useHoSo();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const le = useSafeAreaInsets();

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThanhTieuDe ten="Cá nhân" quayLai={false} />

        {dangTai ? (
          <DangTai />
        ) : (
          <ScrollView
            contentContainerClassName="px-5 pt-7"
            contentContainerStyle={{ paddingBottom: CAO_THANH_TAB + 16 + le.bottom }}>
            <View className="items-center">
              <View
                style={{ borderColor: MAU.vangMo }}
                className="h-24 w-24 items-center justify-center rounded-full border bg-nen-nhat">
                {ma ? (
                  <BieuTuongCung ma={ma} co={44} />
                ) : (
                  <Ionicons name="person-outline" size={38} color={MAU.chuMo} />
                )}
              </View>

              <Text
                style={{ fontFamily: CHU.hoaDam, fontSize: 30, lineHeight: 36 }}
                className="mt-4 text-center text-chu-chinh">
                {hoSo?.ho_ten ?? 'Chưa đặt tên'}
              </Text>
              <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-sm text-chu-phu">
                {ma ? timCung(ma).ten : '—'}
                {ns ? ` · ${ns.ngay}/${ns.thang}/${ns.nam}` : ''}
              </Text>

              <Pressable
                onPress={() => router.push('/nhap-ho-so/ten')}
                style={{ borderColor: MAU.vang }}
                className="mt-4 rounded-full border px-5 py-2 active:opacity-70">
                <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-vang">
                  Chỉnh sửa hồ sơ
                </Text>
              </Pressable>
            </View>

            <Muc nhan="Cá nhân hoá" />
            <Nhom>
              <DongBat
                bieu="notifications-outline"
                ten="Thông báo lá bài"
                mo={`Mỗi sáng lúc ${(hoSo?.gio_nhac ?? '07:00').slice(0, 5)}`}
                onPress={() => router.push('/cai-dat/thong-bao')}
              />
              <Ke />
              <DongDan
                bieu="location-outline"
                ten="Nơi sinh"
                gia={hoSo?.noi_sinh ?? 'Chưa có'}
                onPress={() => router.push('/nhap-ho-so/noi-sinh')}
              />
              <Ke />
              <DongDan bieu="time-outline" ten="Giờ sinh" gia={hoSo?.gio_sinh ?? 'Chưa có'} />
            </Nhom>

            <Muc nhan="Bảo mật và pháp lý" />
            <Nhom>
              <DongDan
                bieu="shield-checkmark-outline"
                ten="Quyền riêng tư"
                onPress={() => router.push('/nhap-ho-so/dieu-khoan')}
              />
              <Ke />
              <DongDan
                bieu="trash-outline"
                ten="Xoá toàn bộ dữ liệu"
                onPress={() => router.push('/cai-dat/xoa-du-lieu')}
              />
            </Nhom>

            <Text
              style={{ fontFamily: CHU.than }}
              className="mt-9 text-center text-xs leading-5 text-chu-mo">
              Nội dung trong app chỉ mang tính giải trí và tham khảo
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function Muc({ nhan }: { nhan: string }) {
  return (
    <Text
      style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4 }}
      className="mb-2.5 mt-8 text-[10px] uppercase text-vang">
      {nhan}
    </Text>
  );
}

function Nhom({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{ borderColor: MAU.vien }}
      className="overflow-hidden rounded-2xl border bg-nen-nhat">
      {children}
    </View>
  );
}

function Ke() {
  return <View style={{ backgroundColor: MAU.vien }} className="ml-14 h-px" />;
}

function DongDan({
  bieu,
  ten,
  gia,
  onPress,
}: {
  bieu: keyof typeof Ionicons.glyphMap;
  ten: string;
  gia?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="min-h-[58px] flex-row items-center gap-3.5 px-4 py-3.5 active:opacity-60">
      <Ionicons name={bieu} size={19} color={MAU.vang} />
      <Text style={{ fontFamily: CHU.than }} className="flex-1 text-base text-chu-chinh">
        {ten}
      </Text>
      {gia ? (
        <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
          {gia}
        </Text>
      ) : null}
      {onPress ? <Ionicons name="chevron-forward" size={16} color={MAU.chuMo} /> : null}
    </Pressable>
  );
}

function DongBat({
  bieu,
  ten,
  mo,
  onPress,
}: {
  bieu: keyof typeof Ionicons.glyphMap;
  ten: string;
  mo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[62px] flex-row items-center gap-3.5 px-4 py-3 active:opacity-60">
      <Ionicons name={bieu} size={19} color={MAU.vang} />
      <View className="flex-1">
        <Text style={{ fontFamily: CHU.than }} className="text-base text-chu-chinh">
          {ten}
        </Text>
        <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-xs text-chu-mo">
          {mo}
        </Text>
      </View>
      <Switch
        value
        onValueChange={onPress}
        trackColor={{ false: MAU.vien, true: MAU.vang }}
        thumbColor={MAU.chuChinh}
      />
    </Pressable>
  );
}
