/**
 * Khu trưng bày — hàng của cửa hàng.
 *
 * App chỉ BÀY RA. Không có giỏ hàng gửi lên máy chủ, không có đơn, không hỏi tên
 * hay số điện thoại của ai. Khách gom món vào danh sách nằm ngay trên máy mình
 * rồi tự hỏi cửa hàng qua Zalo. Xem migration 0027 để biết vì sao ranh giới đó
 * là thứ quyết định cả thiết kế.
 *
 * Hai phần: dải NỔI BẬT TUẦN NÀY trên đầu, rồi tất cả hàng phía dưới. Món nổi
 * bật vẫn nằm luôn trong phần tất cả — khách cuộn từ trên xuống không phải nhớ
 * món nào đã thấy rồi.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DangTai, ManHinh, Nhan, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { giaKemDonVi, tien } from '@/lib/gian-hang';
import { useQuanTam } from '@/lib/quan-tam';
import { anhSanPham, useSanPham, type SanPham } from '@/lib/san-pham';

export default function TrungBay() {
  const { dong, loi, dangTai } = useSanPham();
  const quanTam = useQuanTam();

  const { noiBat, tatCa } = useMemo(() => {
    const ds = dong ?? [];
    return { noiBat: ds.filter((x) => x.noi_bat), tatCa: ds };
  }, [dong]);

  const soMon = quanTam.reduce((t, m) => t + m.soLuong, 0);

  return (
    <ManHinh tieuDe="Trưng bày" phu="Đá phong thuỷ, ngọc và đồ bày của cửa hàng.">
      {/* Lối vào danh sách quan tâm. Chỉ hiện khi đã gom được món nào — chưa gom
          gì mà bày một cái thùng rỗng ra thì chỉ tổ làm khách thắc mắc. */}
      {soMon > 0 ? (
        <Pressable
          onPress={() => router.push('/quan-tam')}
          style={{ borderColor: MAU.vang }}
          className="mb-6 flex-row items-center justify-between rounded-2xl border bg-nen-nhat px-4 py-3.5 active:opacity-70">
          <View className="flex-1 flex-row items-center gap-2.5">
            <Ionicons name="bookmark" size={17} color={MAU.vang} />
            <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-chu-chinh">
              Danh sách quan tâm
            </Text>
            <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo">
              {soMon} món
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={MAU.vang} />
        </Pressable>
      ) : null}

      {dangTai ? <DangTai /> : null}

      {loi ? <Trong loi={`Chưa tải được danh sách hàng. ${loi}`} /> : null}

      {dong && tatCa.length === 0 ? (
        <Trong loi="Cửa hàng chưa bày món nào. Quay lại sau giúp tôi." />
      ) : null}

      {noiBat.length > 0 ? (
        <View className="mb-2">
          <Nhan>Nổi bật tuần này</Nhan>
          <View className="mt-3 gap-4">
            {noiBat.map((s) => (
              <TheNgang key={s.ma} mon={s} />
            ))}
          </View>
          <VanNgan />
        </View>
      ) : null}

      {tatCa.length > 0 ? (
        <View>
          <Nhan>Tất cả hàng ({tatCa.length})</Nhan>
          <View className="mt-3 gap-3">
            {tatCa.map((s) => (
              <TheDoc key={s.ma} mon={s} />
            ))}
          </View>
        </View>
      ) : null}

      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-10 text-center text-[11px] leading-5 text-chu-mo">
        Giá có thể đổi theo từng đợt hàng. Bạn gửi danh sách quan tâm cho cửa hàng để được
        báo giá và cách gửi hàng.
      </Text>
    </ManHinh>
  );
}

/** Thẻ to, ảnh nằm trên — dùng cho dải nổi bật. */
function TheNgang({ mon }: { mon: SanPham }) {
  const anh = anhSanPham(mon.anh);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/san-pham', params: { ma: mon.ma } })}
      style={{ borderColor: MAU.vangMo }}
      className="overflow-hidden rounded-2xl border bg-nen-nhat active:opacity-80">
      {anh ? (
        <Image source={{ uri: anh }} style={{ width: '100%', height: 210 }} contentFit="cover" />
      ) : null}
      <View className="px-4 py-3.5">
        <Text
          numberOfLines={2}
          style={{ fontFamily: CHU.hoaDam, fontSize: 19, lineHeight: 25 }}
          className="text-chu-chinh">
          {mon.ten}
        </Text>
        <Text style={{ fontFamily: CHU.thanDam, color: MAU.vang }} className="mt-1 text-sm">
          {giaKemDonVi(mon.gia, mon.don_vi)}
        </Text>
      </View>
    </Pressable>
  );
}

/** Thẻ gọn, ảnh vuông bên trái — dùng cho danh sách tất cả hàng. */
function TheDoc({ mon }: { mon: SanPham }) {
  const anh = anhSanPham(mon.anh);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/san-pham', params: { ma: mon.ma } })}
      style={{ borderColor: MAU.vien }}
      className="flex-row items-center gap-3.5 overflow-hidden rounded-2xl border bg-nen-nhat p-3 active:opacity-70">
      {anh ? (
        <Image
          source={{ uri: anh }}
          style={{ width: 74, height: 74, borderRadius: 12 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: 74, height: 74, borderRadius: 12, backgroundColor: MAU.nen }}
          className="items-center justify-center">
          <Ionicons name="image-outline" size={22} color={MAU.chuMo} />
        </View>
      )}
      <View className="flex-1">
        <Text
          numberOfLines={2}
          style={{ fontFamily: CHU.thanDam }}
          className="text-sm leading-5 text-chu-chinh">
          {mon.ten}
        </Text>
        <Text style={{ fontFamily: CHU.thanDam, color: MAU.vang }} className="mt-1 text-sm">
          {tien(mon.gia)}
          <Text style={{ fontFamily: CHU.than, color: MAU.chuMo }}> / {mon.don_vi}</Text>
        </Text>
        {!mon.con_hang ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-xs text-canh">
            Tạm hết hàng
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={MAU.chuMo} />
    </Pressable>
  );
}
