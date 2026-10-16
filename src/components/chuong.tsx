/**
 * Chuông thông báo: bong bóng nổi kéo được, kiểu bong bóng tin nhắn Messenger.
 *
 * VÌ SAO LÀ BONG BÓNG NỔI CHỨ KHÔNG PHẢI NÚT Ở THANH TIÊU ĐỀ
 *
 * App không có thanh tiêu đề chung — mỗi màn tự dựng phần đầu của mình, và màn
 * rút bài thì không có phần đầu nào cả. Nhét nút vào từng màn là sửa tám chỗ và
 * vẫn sót. Bong bóng nổi lên trên tất cả, có mặt ở mọi màn, và khách tự kéo đi
 * chỗ khác khi nó che mất thứ đang xem.
 *
 * Dựng chung ngay từ đầu, không gắn gì vào việc đặt lịch. Sắp tới shop có đơn
 * hàng thì đổ vào đúng hộp này, máy chủ chỉ cần ghi thêm một dòng.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHU, MAU } from '@/constants/giao-dien';
import { luc, useHopThongBao, type ThongBao } from '@/lib/hop-thong-bao';

const CO = 52;
/** Cách mép màn hình khi đã hít vào cạnh. */
const LE = 12;

/**
 * Nhớ chỗ khách đã kéo tới, giữ qua các lần chuyển màn.
 *
 * Để ở cấp module chứ không trong component: component dựng lại mỗi lần đổi màn,
 * mà bong bóng nhảy về chỗ cũ sau mỗi lần chuyển màn thì khách kéo làm gì.
 * Cố ý KHÔNG lưu xuống máy — mở app lần sau nó về chỗ mặc định, chỗ đó tốt cho
 * người mới mà không cản ai.
 */
const cho = { x: -1, y: -1 };

/**
 * Ghi lại chỗ vừa thả. Để NGOÀI component vì React Compiler cấm sửa giá trị
 * bắt từ phạm vi module ngay trong thân component — và nó bắt đúng: sửa ở đó
 * thì mỗi lần vẽ lại là một lần ghi đè ngầm, rất khó lần ra khi hỏng.
 */
function nhoCho(nx: number, ny: number) {
  cho.x = nx;
  cho.y = ny;
}

export function Chuong() {
  const { dong, chuaDoc, taiLai, danhDauDoc, xoa } = useHopThongBao();
  const [mo, datMo] = useState(false);
  const [daChon, datDaChon] = useState<string[]>([]);
  const giamChuyenDong = useReducedMotion();
  const { width: rong, height: cao } = useWindowDimensions();
  const le = useSafeAreaInsets();

  const traiNhat = LE;
  const phaiNhat = rong - CO - LE;
  const trenNhat = le.top + 8;
  const duoiNhat = cao - CO - le.bottom - 90;

  const x = useSharedValue(cho.x >= 0 ? cho.x : phaiNhat);
  const y = useSharedValue(cho.y >= 0 ? cho.y : cao * 0.62);
  const nghieng = useSharedValue(0);
  const dangKeo = useSharedValue(0);

  // Lắc đúng MỘT lần mỗi khi số tin chưa đọc tăng. Lắc lặp vô tận thì làm người
  // ta khó chịu chứ không làm họ bấm vào.
  useEffect(() => {
    if (chuaDoc === 0 || giamChuyenDong) return;
    const b = (g: number, t: number) =>
      withTiming(g, { duration: t, easing: Easing.inOut(Easing.quad) });
    nghieng.value = withSequence(b(-14, 70), b(14, 110), b(-9, 90), b(9, 80), b(0, 70));
  }, [chuaDoc, giamChuyenDong, nghieng]);

  const keo = Gesture.Pan()
    .onStart(() => {
      dangKeo.value = 1;
    })
    .onChange((e) => {
      x.value += e.changeX;
      y.value += e.changeY;
    })
    .onEnd(() => {
      dangKeo.value = 0;
      // Hít vào cạnh gần nhất, giống bong bóng tin nhắn. Thả giữa màn thì nó
      // che mất nội dung, mà khách cũng không cố ý để nó ở đó.
      const giua = x.value + CO / 2;
      const dich = giua < rong / 2 ? traiNhat : phaiNhat;
      x.value = withSpring(dich, { damping: 18, stiffness: 180 });
      y.value = withSpring(Math.min(duoiNhat, Math.max(trenNhat, y.value)), {
        damping: 18,
        stiffness: 180,
      });
      runOnJS(nhoCho)(dich, Math.min(duoiNhat, Math.max(trenNhat, y.value)));
    });

  const cham = Gesture.Tap()
    .maxDistance(8)
    .onEnd(() => {
      runOnJS(taiLai)();
      runOnJS(datMo)(true);
    });

  // Kéo thắng chạm: nhích tay một chút lúc bấm thì vẫn tính là bấm, nhờ
  // maxDistance ở trên.
  const cuChi = Gesture.Exclusive(keo, cham);

  const kieuBong = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: withTiming(dangKeo.value ? 1.12 : 1, { duration: 120 }) },
    ],
    opacity: withTiming(dangKeo.value ? 1 : 0.94, { duration: 120 }),
  }));

  const kieuChuong = useAnimatedStyle(() => ({
    transform: [{ rotate: `${nghieng.value}deg` }],
  }));

  function dongHop() {
    datMo(false);
    datDaChon([]);
  }

  function bamVao(t: ThongBao) {
    danhDauDoc(t.ma);
    if (!t.duong_dan) return;
    dongHop();
    // Chờ một nhịp cho hộp đóng hẳn rồi mới chuyển màn. Chuyển ngay lúc nó đang
    // đóng thì lệnh trôi mất — đúng con bug đã gặp ở màn hứng đăng nhập.
    setTimeout(() => router.push(t.duong_dan as never), 120);
  }

  function doiChon(ma: string) {
    datDaChon((ds) => (ds.includes(ma) ? ds.filter((v) => v !== ma) : [...ds, ma]));
  }

  const chonHet = daChon.length > 0 && daChon.length === dong.length;

  return (
    <>
      {/* box-none: lớp phủ không ăn chạm, chỉ mình bong bóng ăn. Thiếu nó là cả
          màn hình bên dưới bấm không được. */}
      <View pointerEvents="box-none" style={{ position: 'absolute', inset: 0 }}>
        <GestureDetector gesture={cuChi}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: CO,
                height: CO,
                borderRadius: CO / 2,
                backgroundColor: MAU.nenDen,
                borderWidth: 1,
                borderColor: MAU.vang,
                alignItems: 'center',
                justifyContent: 'center',
                // Bóng đổ để nó tách khỏi nền, nhìn ra là lớp nổi bên trên.
                shadowColor: '#000',
                shadowOpacity: 0.45,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              },
              kieuBong,
            ]}>
            <Animated.View style={kieuChuong}>
              <Ionicons name="notifications-outline" size={24} color={MAU.vang} />
            </Animated.View>

            {chuaDoc > 0 ? (
              <View
                style={{ backgroundColor: MAU.canh, borderColor: MAU.nen }}
                className="absolute right-1 top-1 h-[11px] w-[11px] rounded-full border-2"
              />
            ) : null}
          </Animated.View>
        </GestureDetector>
      </View>

      <Modal visible={mo} transparent animationType="fade" onRequestClose={dongHop}>
        {/* Chạm ra ngoài là đóng. Thiếu lớp này thì trên Android chỉ còn nút Back,
            mà nhiều máy giờ dùng cử chỉ vuốt nên khách tưởng bị kẹt. */}
        <Pressable onPress={dongHop} className="flex-1 bg-black/60" />

        <View
          style={{ borderColor: MAU.vang, backgroundColor: MAU.nenDen, top: le.top + 56 }}
          className="absolute inset-x-3 max-h-[64%] overflow-hidden rounded-2xl border">
          <View
            style={{ borderBottomColor: MAU.vangMo }}
            className="flex-row items-center justify-between border-b px-4 py-3">
            <Text style={{ fontFamily: CHU.thanDam }} className="text-base text-chu-chinh">
              Thông báo{chuaDoc > 0 ? ` (${chuaDoc} mới)` : ''}
            </Text>
            <Pressable onPress={dongHop} hitSlop={10} className="active:opacity-60">
              <Ionicons name="close" size={20} color={MAU.chuMo} />
            </Pressable>
          </View>

          {dong.length === 0 ? (
            <Text
              style={{ fontFamily: CHU.than }}
              className="px-4 py-10 text-center text-sm leading-6 text-chu-mo">
              Chưa có thông báo nào.
            </Text>
          ) : (
            <>
              <ScrollView>
                {dong.map((t) => (
                  <Dong
                    key={t.ma}
                    tb={t}
                    chon={daChon.includes(t.ma)}
                    dangChonNhieu={daChon.length > 0}
                    onBam={() => (daChon.length > 0 ? doiChon(t.ma) : bamVao(t))}
                    onGiu={() => doiChon(t.ma)}
                  />
                ))}
              </ScrollView>

              <View
                style={{ borderTopColor: MAU.vangMo }}
                className="flex-row items-center justify-between border-t px-4 py-3">
                <Pressable
                  onPress={() => datDaChon(chonHet ? [] : dong.map((t) => t.ma))}
                  hitSlop={8}
                  className="active:opacity-60">
                  <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
                    {chonHet ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    xoa(daChon);
                    datDaChon([]);
                  }}
                  disabled={daChon.length === 0}
                  hitSlop={8}
                  className={daChon.length === 0 ? 'opacity-40' : 'active:opacity-60'}>
                  <Text
                    style={{
                      fontFamily: CHU.thanDam,
                      color: daChon.length ? MAU.canh : MAU.chuMo,
                    }}
                    className="text-sm">
                    Xoá{daChon.length ? ` (${daChon.length})` : ''}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

function Dong({
  tb,
  chon,
  dangChonNhieu,
  onBam,
  onGiu,
}: {
  tb: ThongBao;
  chon: boolean;
  dangChonNhieu: boolean;
  onBam: () => void;
  onGiu: () => void;
}) {
  return (
    <Pressable
      onPress={onBam}
      onLongPress={onGiu}
      style={{ borderBottomColor: MAU.vangRatMo }}
      className="flex-row items-start gap-3 border-b px-4 py-3.5 active:opacity-70">
      {dangChonNhieu ? (
        <View className="pt-0.5">
          <Ionicons
            name={chon ? 'checkbox' : 'square-outline'}
            size={18}
            color={chon ? MAU.vang : MAU.chuMo}
          />
        </View>
      ) : (
        <View className="pt-1.5">
          {/* Chấm vàng cho tin chưa đọc. Đọc rồi để trống chứ không vẽ chấm xám —
              một hàng chấm xám trông như vẫn còn việc phải làm. */}
          <View
            style={{ backgroundColor: tb.da_doc ? 'transparent' : MAU.vang }}
            className="h-2 w-2 rounded-full"
          />
        </View>
      )}

      <View className="flex-1">
        <Text
          style={{ fontFamily: tb.da_doc ? CHU.than : CHU.thanDam }}
          className={`text-sm leading-5 ${tb.da_doc ? 'text-chu-mo' : 'text-chu-chinh'}`}>
          {tb.tieu_de}
        </Text>
        {tb.noi_dung ? (
          <Text
            style={{ fontFamily: CHU.than }}
            className={`mt-1 text-xs leading-5 ${tb.da_doc ? 'text-chu-mo' : 'text-chu-phu'}`}>
            {tb.noi_dung}
          </Text>
        ) : null}
        <Text style={{ fontFamily: CHU.than }} className="mt-1.5 text-[11px] text-chu-mo">
          {luc(tb.tao_luc)}
        </Text>
      </View>
    </Pressable>
  );
}
