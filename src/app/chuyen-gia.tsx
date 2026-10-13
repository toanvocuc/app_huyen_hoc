/**
 * Hồ sơ thầy tư vấn.
 *
 * Dựng cho nhiều thầy ngay từ đầu dù hiện mới có một: với một người thì nó đọc
 * như một trang giới thiệu, với nhiều người thì thành danh sách. Không phải viết
 * lại khi công ty mời thêm thầy.
 *
 * Mọi ô ngoài tên và lời giới thiệu đều có thể trống, vì lúc dựng màn này chưa
 * hỏi được thầy giá bao nhiêu hay có mấy năm trong nghề. Dòng nào chưa có thì
 * giấu hẳn — để chỗ trống với chữ "đang cập nhật" nhìn còn tệ hơn là không có.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DangTai, Khoi, ManHinh, Trong } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { useChuyenGia, type DongChuyenGia } from '@/lib/kho-noi-dung';
import { moZalo } from '@/lib/nhan-zalo';

/** Viết số tiền kiểu người Việt đọc: 200.000đ. */
function tien(d: number): string {
  return `${d.toLocaleString('vi-VN')}đ`;
}

export default function ChuyenGia() {
  const { dong, loi, dangTai } = useChuyenGia();

  return (
    <ManHinh
      quayLai
      tieuDe="Người sẽ trả lời bạn"
      phu="Xem qua trước khi nhắn, để biết mình đang hỏi ai.">
      {dangTai ? (
        <DangTai />
      ) : loi ? (
        <Trong loi={`Chưa tải được danh sách. ${loi}`} />
      ) : !dong || dong.length === 0 ? (
        <Trong loi="Hiện chưa có ai nhận tư vấn. Bạn quay lại sau giúp nhé." />
      ) : (
        <View className="gap-4">
          {dong.map((t) => (
            <The key={t.ma} thay={t} />
          ))}
        </View>
      )}
    </ManHinh>
  );
}

function The({ thay }: { thay: DongChuyenGia }) {
  const [dangMo, setDangMo] = useState(false);

  // Mấy dòng này chỉ hiện khi thật sự có dữ liệu.
  const soLieu = [
    thay.nam_kinh_nghiem ? `${thay.nam_kinh_nghiem} năm trong nghề` : null,
    thay.so_nguoi_da_xem ? `đã xem cho hơn ${thay.so_nguoi_da_xem.toLocaleString('vi-VN')} người` : null,
  ].filter(Boolean);

  const cachLamViec = [
    thay.gia_tu ? ['Giá', `từ ${tien(thay.gia_tu)} một lượt`] : null,
    thay.gom_gi ? ['Một lượt gồm', thay.gom_gi] : null,
    thay.thoi_gian_tra_loi ? ['Thường trả lời', thay.thoi_gian_tra_loi] : null,
    thay.gio_lam_viec ? ['Giờ làm việc', thay.gio_lam_viec] : null,
  ].filter(Boolean) as [string, string][];

  async function nhan() {
    if (dangMo) return;
    setDangMo(true);
    try {
      await moZalo(thay.zalo, 'chuyen-gia');
    } finally {
      setDangMo(false);
    }
  }

  return (
    <Khoi vien>
      <View className="flex-row items-center gap-4">
        {thay.anh ? (
          <Image
            source={{ uri: thay.anh }}
            style={{ width: 72, height: 72, borderRadius: 36 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{ borderColor: MAU.vien }}
            className="h-[72px] w-[72px] items-center justify-center rounded-full border bg-nen">
            <Ionicons name="person-outline" size={30} color={MAU.chuMo} />
          </View>
        )}

        <View className="flex-1">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 24, lineHeight: 30 }}
            className="text-chu-chinh">
            {thay.ten}
          </Text>
          {thay.chuyen_sau ? (
            <Text
              style={{ fontFamily: CHU.thanVua }}
              className="mt-0.5 text-sm leading-5 text-vang">
              {thay.chuyen_sau}
            </Text>
          ) : null}
          {soLieu.length ? (
            <Text style={{ fontFamily: CHU.than }} className="mt-1 text-xs leading-5 text-chu-phu">
              {soLieu.join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>

      {thay.hoc_tu ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-4 text-sm leading-6 text-chu-phu">
          Học từ {thay.hoc_tu}
        </Text>
      ) : null}

      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-4 text-[15px] leading-7 text-chu-chinh">
        {thay.gioi_thieu}
      </Text>

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

      <Pressable
        onPress={nhan}
        disabled={dangMo}
        className="mt-5 rounded-xl bg-vang px-5 py-3.5 active:opacity-80">
        <Text style={{ fontFamily: CHU.thanDam }} className="text-center text-nen">
          Nhắn cho {thay.ten} qua Zalo
        </Text>
      </Pressable>
      <Text style={{ fontFamily: CHU.than }} className="mt-2.5 text-center text-xs text-chu-mo">
        Lời nhắn đã được chép sẵn, bạn chỉ cần dán vào Zalo
      </Text>
    </Khoi>
  );
}
