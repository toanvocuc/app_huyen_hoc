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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

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
          <DaiNoiBat ds={noiBat} />
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

/** Đệm hai bên của `ManHinh`, cần để tính bề ngang một thẻ. */
const LE_MAN = 20;
/** Khe giữa hai thẻ trong dải. */
const KHE = 12;
/** Không ai vuốt trong bấy nhiêu mili giây thì tự sang món kế. */
const CHO_TU_CHAY = 4000;

/**
 * Dải NỔI BẬT TUẦN NÀY: vuốt ngang, và tự chạy khi không ai đụng tới.
 *
 * ───────────────────────────────────────── VÌ SAO HẸN GIỜ CHỨ KHÔNG ĐẶT NHỊP
 *
 * `setInterval` thì nhịp chạy đều bất kể người dùng làm gì: vừa vuốt xong là
 * có thể bị nhảy tiếp ngay sau một phần mười giây, vì nhịp cũ sắp tới. Yêu cầu
 * là "không vuốt trong 4 giây", tức là đếm lại từ lần đụng cuối — mà cái đó chỉ
 * có hẹn giờ đặt lại được mới làm đúng.
 *
 * `dungLai` là TRẠNG THÁI chứ không phải mốc: đổi trạng thái thì hiệu ứng chạy
 * lại và dọn luôn hẹn giờ cũ. Để mốc thì hẹn giờ cũ vẫn nổ giữa lúc tay đang
 * vuốt.
 *
 * Máy bật mục giảm chuyển động thì KHÔNG tự chạy. Một thứ tự động trượt ngang
 * là đúng loại chuyển động mà mục đó sinh ra để tắt.
 */
function DaiNoiBat({ ds }: { ds: SanPham[] }) {
  const { width } = useWindowDimensions();
  const rong = Math.max(240, width - LE_MAN * 2);
  const buoc = rong + KHE;
  const cuon = useRef<ScrollView>(null);
  const [o, datO] = useState(0);
  const [dungLai, datDungLai] = useState(false);
  const giamChuyenDong = useReducedMotion();

  const tuChay = ds.length > 1 && !giamChuyenDong && !dungLai;

  useEffect(() => {
    if (!tuChay) return;
    const hen = setTimeout(() => {
      const moi = (o + 1) % ds.length;
      datO(moi);
      cuon.current?.scrollTo({ x: moi * buoc, animated: true });
    }, CHO_TU_CHAY);
    return () => clearTimeout(hen);
  }, [tuChay, o, ds.length, buoc]);

  // Màn xoay ngang hay đổi bề rộng thì giữ nguyên món đang xem.
  useEffect(() => {
    cuon.current?.scrollTo({ x: o * buoc, animated: false });
    // Chỉ chạy khi bề ngang đổi, không chạy theo `o` — `o` đã có hẹn giờ lo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buoc]);

  const xongVuot = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const moi = Math.round(e.nativeEvent.contentOffset.x / buoc);
      datO(Math.min(ds.length - 1, Math.max(0, moi)));
      // Thả tay ra thì đếm lại từ đầu bốn giây.
      datDungLai(false);
    },
    [buoc, ds.length]
  );

  return (
    <View className="mt-3">
      <ScrollView
        ref={cuon}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={buoc}
        snapToAlignment="start"
        decelerationRate="fast"
        onScrollBeginDrag={() => datDungLai(true)}
        onMomentumScrollEnd={xongVuot}
        // Vuốt xong mà không có quán tính thì `onMomentumScrollEnd` không nổ,
        // và dải sẽ đứng im mãi. Bắt thêm ở đây cho chắc.
        onScrollEndDrag={xongVuot}>
        {ds.map((mon, i) => (
          <View key={mon.ma} style={{ width: rong, marginRight: i === ds.length - 1 ? 0 : KHE }}>
            <TheNoiBat mon={mon} />
          </View>
        ))}
      </ScrollView>

      {/* Mấy chấm cho biết đang ở món thứ mấy. Không có thì khách vuốt mà
          không biết còn bao nhiêu món nữa. */}
      {ds.length > 1 ? (
        <View className="mt-3 flex-row justify-center gap-1.5">
          {ds.map((mon, i) => (
            <View
              key={mon.ma}
              style={{
                width: i === o ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === o ? MAU.vang : MAU.vien,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Thẻ to, ảnh nằm trên — một món trong dải nổi bật. */
function TheNoiBat({ mon }: { mon: SanPham }) {
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
