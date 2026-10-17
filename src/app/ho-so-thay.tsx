/**
 * Hồ sơ một thầy: giới thiệu, cách làm việc, nút nhắn, và phần đánh giá.
 *
 * Ô nào chưa có dữ liệu thì GIẤU HẲN, không hiện "đang cập nhật". Lúc dựng màn
 * này công ty chưa hỏi được thầy giá bao nhiêu hay mấy năm trong nghề, nên một
 * nửa hồ sơ còn trống — mà chỗ trống kèm chữ "đang cập nhật" nhìn còn tệ hơn là
 * không có dòng đó.
 *
 * Phần bình luận: chữ do khách viết phải DUYỆT mới hiện cho người khác. Xem lý
 * do ở `lib/danh-gia.ts` — tóm lại là luật về nội dung người dùng tạo của Apple.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { DangTai, Khoi, ManHinh, Nhan, Trong } from '@/components/nen';
import { NoiLienHe } from '@/components/noi-lien-he';
import { Sao, SaoKemSo } from '@/components/sao';
import { tienGoi, useGoiTuVan, type Goi } from '@/lib/goi';
import { CHU, MAU } from '@/constants/giao-dien';
import { chamSao, useDiemCuaToi } from '@/lib/danh-gia';
import { useChuyenGia } from '@/lib/kho-noi-dung';

function tien(d: number): string {
  return `${d.toLocaleString('vi-VN')}đ`;
}

export default function HoSoChuyenGia() {
  const { ma = '' } = useLocalSearchParams<{ ma: string }>();
  const { dong, dangTai } = useChuyenGia();
  const thay = dong?.find((t) => t.ma === ma) ?? null;

  if (dangTai) {
    return (
      <ManHinh quayLai tieuDe="Hồ sơ">
        <DangTai />
      </ManHinh>
    );
  }
  if (!thay) {
    return (
      <ManHinh quayLai tieuDe="Hồ sơ">
        <Trong loi="Không tìm thấy người này. Có thể thầy đã tạm nghỉ nhận khách." />
      </ManHinh>
    );
  }

  return (
    <ManHinh quayLai tieuDe={thay.ten}>
      <ThongTin thay={thay} />
      <PhanDanhGia maThay={thay.ma} diemTb={thay.diem_tb} soLuot={thay.so_danh_gia} />
    </ManHinh>
  );
}

// ------------------------------------------------------------------ phần trên

export function ThongTin({
  thay,
}: {
  thay: NonNullable<ReturnType<typeof useChuyenGia>['dong']>[number];
}) {
  const { dong: cacGoi } = useGoiTuVan(thay.ma);

  const soLieu = [
    thay.nam_kinh_nghiem ? `${thay.nam_kinh_nghiem} năm trong nghề` : null,
    thay.so_nguoi_da_xem
      ? `đã xem cho hơn ${thay.so_nguoi_da_xem.toLocaleString('vi-VN')} người`
      : null,
  ].filter(Boolean);

  const cachLamViec = (
    [
      // Ô `gom_gi` cố ý KHÔNG còn bày ở đây nữa: nội dung của nó giờ là danh
      // sách gói bấm được bên dưới. Giữ cả hai là khách đọc hai lần cùng một thứ.
      cacGoi.length === 0 && thay.gia_tu
        ? ['Giá', `từ ${tien(thay.gia_tu)} một lượt`]
        : null,
      cacGoi.length === 0 && thay.gom_gi ? ['Một lượt gồm', thay.gom_gi] : null,
      thay.thoi_gian_tra_loi ? ['Thường trả lời', thay.thoi_gian_tra_loi] : null,
      thay.gio_lam_viec ? ['Giờ làm việc', thay.gio_lam_viec] : null,
    ].filter(Boolean) as [string, string][]
  );

  /**
   * Dẫn sang màn đặt lịch chứ KHÔNG mở Zalo thẳng như trước.
   *
   * Mở Zalo thẳng thì app không giữ lại gì: thầy không có hồ sơ yêu cầu, khách
   * không biết mình đã gửi hay chưa, và chức năng chính của app rút lại thành
   * một cái nút chuyển sang ứng dụng khác.
   */
  function datLich(maGoi?: string) {
    router.push({
      pathname: '/dat-lich',
      params: maGoi ? { thay: thay.ma, goi: maGoi } : { thay: thay.ma },
    });
  }

  return (
    <Khoi vang anhNen={require('@/assets/nen/khoi-thay.jpg')}>
      <View className="items-center">
        {thay.anh ? (
          <Image
            source={{ uri: thay.anh }}
            style={{ width: 88, height: 88, borderRadius: 44 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{ borderColor: MAU.vien }}
            className="h-[88px] w-[88px] items-center justify-center rounded-full border bg-nen">
            <Ionicons name="person-outline" size={36} color={MAU.chuMo} />
          </View>
        )}

        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
          className="mt-3 text-center text-chu-chinh">
          {thay.ten}
        </Text>
        {thay.chuyen_sau ? (
          <Text style={{ fontFamily: CHU.thanVua }} className="mt-1 text-sm text-vang">
            {thay.chuyen_sau}
          </Text>
        ) : null}
        <View className="mt-2">
          <SaoKemSo diem={thay.diem_tb} soLuot={thay.so_danh_gia} co={15} />
        </View>
        {soLieu.length ? (
          <Text
            style={{ fontFamily: CHU.than }}
            className="mt-1.5 text-center text-xs leading-5 text-chu-mo">
            {soLieu.join(' · ')}
          </Text>
        ) : null}
      </View>

      {thay.hoc_tu ? (
        <Text
          style={{ fontFamily: CHU.than }}
          className="mt-5 text-center text-sm leading-6 text-chu-phu">
          Học từ {thay.hoc_tu}
        </Text>
      ) : null}

      <Text style={{ fontFamily: CHU.than }} className="mt-5 text-[15px] leading-7 text-chu-chinh">
        {thay.gioi_thieu}
      </Text>

      {/* Mấy nơi công khai của thầy. Để đây vì khách muốn tự kiểm chứng trước
          khi trả tiền cho một người lạ — một kênh có người theo dõi nói được
          nhiều hơn mọi lời tự giới thiệu. Cũng là chỗ khách nhắn sau khi đặt. */}
      <View className="mt-5">
        <Nhan>Liên hệ và theo dõi</Nhan>
        <View className="mt-2">
          <NoiLienHe thay={thay} gon />
        </View>
      </View>

      {cachLamViec.length ? (
        <View
          style={{ borderColor: MAU.vien }}
          className="mt-5 gap-2.5 rounded-xl border bg-nen px-4 py-3.5">
          {cachLamViec.map(([nhan, gia]) => (
            <View key={nhan} className="flex-row gap-3">
              <Text
                style={{ fontFamily: CHU.than }}
                className="w-[104px] text-xs leading-5 text-chu-mo">
                {nhan}
              </Text>
              <Text
                style={{ fontFamily: CHU.thanVua }}
                className="flex-1 text-xs leading-5 text-chu-chinh">
                {gia}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Bảng gói. Mỗi gói là một thứ bấm được, đi thẳng sang màn đặt lịch với gói
          đó chọn sẵn. Trước đây ba mức giá nằm chung một đoạn văn, khách đọc
          xong vẫn phải tự nhắn hỏi muốn gói nào. */}
      {cacGoi.length > 0 ? (
        <View className="mt-5">
          <Nhan>Chọn một gói</Nhan>
          <View className="mt-2.5 gap-2.5">
            {cacGoi.map((g) => (
              <TheGoi key={g.ma} goi={g} onPress={() => datLich(g.ma)} />
            ))}
          </View>
          <Text
            style={{ fontFamily: CHU.than }}
            className="mt-3 text-center text-xs leading-5 text-chu-mo">
            Tiền trả thẳng cho thầy sau buổi tư vấn. Omora không thu hộ.
          </Text>
        </View>
      ) : (
        <>
          <Pressable
            onPress={() => datLich()}
            className="mt-5 rounded-xl bg-vang px-5 py-3.5 active:opacity-80">
            <Text style={{ fontFamily: CHU.thanDam }} className="text-center text-nen">
              Đặt lịch với {thay.ten}
            </Text>
          </Pressable>
          <Text style={{ fontFamily: CHU.than }} className="mt-2.5 text-center text-xs text-chu-mo">
            Bạn chọn khung giờ và gửi câu hỏi, thầy nhận rồi sẽ hẹn bạn
          </Text>
        </>
      )}
    </Khoi>
  );
}

// ------------------------------------------------------------------ chấm sao

/**
 * Chỉ chấm sao, không có ô viết chữ.
 *
 * Bấm một ngôi là gửi luôn, không có nút xác nhận. Thao tác nhẹ tới mức không
 * đáng bắt khách bấm thêm một nút nữa, mà chấm nhầm thì bấm lại là xong.
 */
function PhanDanhGia({
  maThay,
  diemTb,
  soLuot,
}: {
  maThay: string;
  diemTb: number | null;
  soLuot: number;
}) {
  const { sao, xong, taiLai } = useDiemCuaToi(maThay);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function cham(n: number) {
    if (dangGui) return;
    setLoi(null);
    setDangGui(true);
    try {
      await chamSao(maThay, n);
      taiLai();
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Chưa gửi được, thử lại giúp tôi.');
    } finally {
      setDangGui(false);
    }
  }

  return (
    <View className="mt-7">
      <Nhan>Đánh giá</Nhan>
      <View
        style={{ borderColor: MAU.vien }}
        className="mt-3 items-center rounded-2xl border bg-nen-nhat px-5 py-5">
        <SaoKemSo diem={diemTb} soLuot={soLuot} co={15} />

        <Text
          style={{ fontFamily: CHU.thanVua }}
          className="mt-5 text-sm text-chu-chinh">
          {sao ? 'Bạn đã chấm' : 'Bạn thấy thế nào?'}
        </Text>

        <View className="mt-3">
          {xong ? (
            <Sao diem={sao ?? 0} onChon={cham} />
          ) : (
            <ActivityIndicator color={MAU.vang} />
          )}
        </View>

        {dangGui ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-3 text-xs text-chu-mo">
            Đang gửi...
          </Text>
        ) : sao ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-3 text-xs text-chu-mo">
            Bấm ngôi khác để đổi
          </Text>
        ) : null}

        {loi ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-3 text-center text-xs leading-5 text-canh">
            {loi}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Một gói tư vấn.
 *
 * Giá đặt bên phải cùng hàng với tên chứ không nép xuống dưới phần mô tả:
 * khách so gói bằng cách lướt cột giá, để giá lẫn trong chữ là bắt họ đọc hết
 * mới so được.
 */
function TheGoi({ goi, onPress }: { goi: Goi; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ borderColor: MAU.vangMo }}
      className="rounded-xl border bg-nen px-4 py-3.5 active:opacity-70">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text style={{ fontFamily: CHU.thanDam }} className="text-[15px] text-chu-chinh">
            {goi.ten}
          </Text>
          {goi.phut ? (
            <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-xs text-chu-mo">
              {goi.phut} phút
            </Text>
          ) : null}
        </View>
        <Text style={{ fontFamily: CHU.thanDam, color: MAU.vang }} className="text-[15px]">
          {tienGoi(goi.gia)}
        </Text>
      </View>
      {goi.mo_ta ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-2 text-sm leading-6 text-chu-phu">
          {goi.mo_ta}
        </Text>
      ) : null}
      <View className="mt-2.5 flex-row items-center gap-1.5">
        <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-vang">
          Đặt gói này
        </Text>
        <Ionicons name="chevron-forward" size={13} color={MAU.vang} />
      </View>
    </Pressable>
  );
}
