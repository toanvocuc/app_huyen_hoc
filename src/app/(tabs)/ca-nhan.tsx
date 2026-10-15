import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { DongPhienBan } from '@/components/dong-phien-ban';
import { KhoiTaiKhoan } from '@/components/khoi-tai-khoan';
import { DangTai } from '@/components/nen';
import { dangHenLaBai } from '@/lib/thong-bao';
import { NenTroiSao } from '@/components/nen-anh';
import { ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CAO_THANH_TAB, CHU, MAU, NEN_CHUYEN } from '@/constants/giao-dien';
import { napTuHoSo } from '@/lib/ban-nhap';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

export default function CaNhan() {
  const { hoSo, dangTai, taiLai } = useHoSo();

  /**
   * Thật sự đang có lời nhắc nào treo không.
   *
   * Trước đây dòng này vẽ một công tắc viết cứng ở trạng thái BẬT, mà gạt nó thì
   * không tắt gì cả, chỉ nhảy sang màn cài đặt. Khách tắt thông báo rồi quay lại
   * vẫn thấy "Mỗi sáng lúc 07:00".
   *
   * Hỏi thẳng hệ điều hành chứ không tin cột `nhac_la_bai` dưới máy chủ: cột đó
   * mặc định là bật, còn lịch thì chỉ có khi khách đã cấp quyền và bật thật.
   */
  const [dangHen, datDangHen] = useState<boolean | null>(null);
  useFocusEffect(
    useCallback(() => {
      dangHenLaBai()
        .then(datDangHen)
        .catch(() => datDangHen(false));
    }, [])
  );
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const le = useSafeAreaInsets();

  return (
    <LinearGradient colors={NEN_CHUYEN} locations={[0, 0.45, 1]} style={{ flex: 1 }}>
      {/* Ảnh trời sao ĐỨNG YÊN, không phải lớp sao nhấp nháy như các màn khác —
          màn này là chỗ chỉnh cài đặt, chữ nhiều và khách dừng lâu, nhấp nháy
          sau lưng chữ chỉ làm rối. Nhưng để trơ nền phẳng thì nó lạc hẳn khỏi
          phần còn lại của app, nên lấy vân ảnh ở mức chìm. */}
      <NenTroiSao mo={0.88} />
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
                onPress={() => {
                  // Nạp hồ sơ đang có vào bản nhập, không thì bước cuối
                  // ghi đè những mục không đi qua bằng giá trị rỗng.
                  napTuHoSo(hoSo);
                  router.push('/nhap-ho-so/ten');
                }}
                style={{ borderColor: MAU.vang }}
                className="mt-4 rounded-full border px-5 py-2 active:opacity-70">
                <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-vang">
                  Chỉnh sửa hồ sơ
                </Text>
              </Pressable>
            </View>

            {/* Hai bộ mặt: đang ẩn danh thì mời gắn tài khoản, đã đăng nhập
                thì hiện đang dùng tài khoản nào kèm nút đăng xuất. */}
            <KhoiTaiKhoan xongThi={taiLai} />

            <Muc nhan="Cá nhân hoá" />
            <Nhom>
              <DongDan
                bieu="notifications-outline"
                ten="Thông báo lá bài"
                gia={
                  dangHen === null
                    ? undefined
                    : dangHen
                      ? `Mỗi sáng lúc ${(hoSo?.gio_nhac ?? '07:00').slice(0, 5)}`
                      : 'Đang tắt'
                }
                onPress={() => router.push('/cai-dat/thong-bao')}
              />
              <Ke />
              <DongDan
                bieu="location-outline"
                ten="Nơi sinh"
                gia={hoSo?.noi_sinh ?? 'Chưa có'}
                onPress={() => {
                  // Nạp hồ sơ đang có vào bản nhập, không thì bước cuối
                  // ghi đè những mục không đi qua bằng giá trị rỗng.
                  napTuHoSo(hoSo);
                  router.push('/nhap-ho-so/noi-sinh');
                }}
              />
              <Ke />
              <DongDan bieu="time-outline" ten="Giờ sinh" gia={hoSo?.gio_sinh ?? 'Chưa có'} />
            </Nhom>

            <Muc nhan="Bảo mật và pháp lý" />
            <Nhom>
              <DongDan
                bieu="shield-checkmark-outline"
                ten="Quyền riêng tư"
                onPress={() => router.push('/cai-dat/phap-ly')}
              />
              <Ke />
              <DongDan
                bieu="trash-outline"
                ten="Xoá tài khoản"
                onPress={() => router.push('/cai-dat/xoa-du-lieu')}
              />
            </Nhom>

            <Text
              style={{ fontFamily: CHU.than }}
              className="mt-9 text-center text-xs leading-5 text-chu-mo">
              Nội dung trong app chỉ mang tính giải trí và tham khảo
            </Text>

            <DongPhienBan />
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

