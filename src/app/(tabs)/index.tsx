/**
 * Danh sách chuyên gia — MÀN MỞ ĐẦU của app.
 *
 * Trước đây màn này nằm sâu bên trong, mở app ra là lá bài hôm nay. Apple từ
 * chối theo điều 4.3(b) vì app "chủ yếu là tarot và chiêm tinh", một danh mục
 * họ coi là đã bão hoà. Thứ không app nào trùng được là CON NGƯỜI của công ty,
 * nên giờ họ đứng ở ngay cửa.
 *
 * Mỗi thẻ chỉ hiện thứ cần để chọn: tên, mảng chuyên sâu, điểm sao, giá. Phần
 * dài dòng để trong hồ sơ riêng.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { DangTai, ManHinh, Trong } from '@/components/nen';
import { SaoKemSo } from '@/components/sao';
import { CHU, MAU } from '@/constants/giao-dien';
import { useChuyenGia, type DongChuyenGia } from '@/lib/kho-noi-dung';

export function tien(d: number): string {
  return `${d.toLocaleString('vi-VN')}đ`;
}

export default function DanhSachChuyenGia() {
  const { dong, loi, dangTai } = useChuyenGia();

  return (
    <ManHinh
      tieuDe="Chuyên gia của Omora"
      phu="Chọn người bạn muốn hỏi, rồi đặt một buổi tư vấn.">
      {dangTai ? (
        <DangTai />
      ) : loi ? (
        <Trong loi={`Chưa tải được danh sách. ${loi}`} />
      ) : !dong || dong.length === 0 ? (
        <Trong loi="Hiện chưa có ai nhận tư vấn. Bạn quay lại sau giúp nhé." />
      ) : (
        <View className="gap-3">
          {dong.map((t) => (
            <TheGon key={t.ma} thay={t} />
          ))}
        </View>
      )}
    </ManHinh>
  );
}

function TheGon({ thay }: { thay: DongChuyenGia }) {
  const phu = [
    thay.nam_kinh_nghiem ? `${thay.nam_kinh_nghiem} năm nghề` : null,
    thay.so_nguoi_da_xem
      ? `${thay.so_nguoi_da_xem.toLocaleString('vi-VN')} người đã xem`
      : null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/ho-so-thay', params: { ma: thay.ma } })}
      style={{ borderColor: MAU.vien }}
      className="flex-row items-center gap-4 rounded-2xl border bg-nen-nhat px-4 py-4 active:opacity-75">
      {thay.anh ? (
        <Image
          source={{ uri: thay.anh }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ borderColor: MAU.vien }}
          className="h-14 w-14 items-center justify-center rounded-full border bg-nen">
          <Ionicons name="person-outline" size={24} color={MAU.chuMo} />
        </View>
      )}

      <View className="flex-1">
        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 20, lineHeight: 26 }}
          className="text-chu-chinh">
          {thay.ten}
        </Text>
        {thay.chuyen_sau ? (
          <Text style={{ fontFamily: CHU.thanVua }} className="mt-0.5 text-xs text-vang">
            {thay.chuyen_sau}
          </Text>
        ) : null}

        <View className="mt-1.5">
          <SaoKemSo diem={thay.diem_tb} soLuot={thay.so_danh_gia} />
        </View>

        {phu.length ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-1 text-xs text-chu-mo">
            {phu.join(' · ')}
          </Text>
        ) : null}
        {thay.gia_tu ? (
          <Text style={{ fontFamily: CHU.thanVua }} className="mt-1 text-xs text-chu-phu">
            Từ {tien(thay.gia_tu)} một lượt
          </Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={MAU.chuMo} />
    </Pressable>
  );
}
