/** Bánh xe cuộn chọn số, kiểu con lăn quay của iOS. */

import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { CHU, MAU } from '@/constants/giao-dien';
import { khoangNamSinh, ngayHopLe, soNgayTrongThang } from '@/lib/ngay-thang';

const CAO_DONG = 44;
/** Số dòng thấy cùng lúc. Luôn để số lẻ, không thì không có dòng nào nằm đúng giữa. */
const SO_DONG = 5;
const CAO_KHUNG = CAO_DONG * SO_DONG;
/** Đệm trên dưới, để dòng đầu và dòng cuối cũng lên được giữa khung. */
const DEM = ((SO_DONG - 1) / 2) * CAO_DONG;

export type MucChon = { gia: number; nhan: string };

/** Dãy số liên tiếp, hiện hai chữ số cho đẹp cột. */
function day(dau: number, cuoi: number, demSo = 2): MucChon[] {
  return Array.from({ length: cuoi - dau + 1 }, (_, i) => ({
    gia: dau + i,
    nhan: String(dau + i).padStart(demSo, '0'),
  }));
}

function Dong({ nhan, i, y }: { nhan: string; i: number; y: SharedValue<number> }) {
  // Càng xa dòng giữa thì càng mờ, càng nhỏ và càng nhạt màu, cho ra cảm giác
  // mặt cong của con lăn chứ không phải một danh sách phẳng.
  const kieu = useAnimatedStyle(() => {
    const xa = Math.abs(y.value / CAO_DONG - i);
    return {
      opacity: Math.max(0.2, 1 - xa * 0.4),
      transform: [{ scale: Math.max(0.74, 1 - xa * 0.14) }],
      color: interpolateColor(Math.min(xa, 1), [0, 1], [MAU.vang, MAU.chuPhu]),
    };
  });

  return (
    <Animated.Text
      style={[
        {
          height: CAO_DONG,
          lineHeight: CAO_DONG,
          textAlign: 'center',
          fontFamily: CHU.thanVua,
          fontSize: 22,
        },
        kieu,
      ]}>
      {nhan}
    </Animated.Text>
  );
}

function BanhXe({ gia, dat, muc }: { gia: number; dat: (v: number) => void; muc: MucChon[] }) {
  const ref = useRef<FlatList<MucChon>>(null);
  const dangKeo = useRef(false);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viTri = Math.max(
    0,
    muc.findIndex((m) => m.gia === gia)
  );
  // Vị trí lúc mới hiện, dùng cho cả initialScrollIndex lẫn giá trị cuộn ban
  // đầu. Thiếu nó thì ngay khi hiện ra mấy dòng trên cùng bị tô như đang chọn.
  const [dauTien] = useState(viTri);
  const y = useSharedValue(dauTien * CAO_DONG);

  const batCuon = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });

  const huyHen = useCallback(() => {
    if (hen.current === null) return;
    clearTimeout(hen.current);
    hen.current = null;
  }, []);

  useEffect(() => huyHen, [huyHen]);

  /**
   * Giá trị đổi từ bên ngoài thì phải quay bánh xe theo, ví dụ đang để ngày 31
   * rồi chuyển sang tháng 2 thì ngày bị kéo về 28. Không quay theo thì số hiện
   * ra một đằng, số lưu một nẻo.
   */
  useEffect(() => {
    if (dangKeo.current) return;
    const dich = viTri * CAO_DONG;
    if (Math.abs(y.value - dich) > CAO_DONG / 2) {
      ref.current?.scrollToOffset({ offset: dich, animated: true });
    }
  }, [viTri, y]);

  const chot = (viTriCuon: number) => {
    const i = Math.round(viTriCuon / CAO_DONG);
    const m = muc[Math.min(Math.max(i, 0), muc.length - 1)];
    if (m && m.gia !== gia) dat(m.gia);
  };

  const ve = useCallback(
    ({ item, index }: { item: MucChon; index: number }) => (
      <Dong nhan={item.nhan} i={index} y={y} />
    ),
    [y]
  );

  const boCuc = useCallback(
    (_: unknown, index: number) => ({ length: CAO_DONG, offset: CAO_DONG * index, index }),
    []
  );

  return (
    <Animated.FlatList
      ref={ref}
      data={muc}
      keyExtractor={(m: MucChon) => String(m.gia)}
      renderItem={ve}
      getItemLayout={boCuc}
      initialScrollIndex={dauTien}
      /**
       * Chỉ dựng những dòng quanh chỗ đang nhìn. Cột năm có hơn trăm dòng, dựng
       * hết thì mỗi dòng kéo theo một phép tính chạy suốt lúc cuộn, máy yếu ì ra.
       */
      initialNumToRender={SO_DONG + 2}
      maxToRenderPerBatch={SO_DONG}
      windowSize={3}
      style={{ flex: 1 }}
      onScroll={batCuon}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      snapToInterval={CAO_DONG}
      disableIntervalMomentum
      decelerationRate="fast"
      // Bánh xe nằm trong màn có thể cuộn dọc. Thiếu cờ này thì trên Android
      // màn ngoài ăn mất cử chỉ, kéo bánh xe không nhúc nhích.
      nestedScrollEnabled
      onScrollBeginDrag={() => {
        huyHen();
        dangKeo.current = true;
      }}
      onScrollEndDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Thả tay chậm, không có đà thì onMomentumScrollEnd không nổ. Thiếu hẹn
        // giờ này thì cờ dangKeo kẹt mãi, bánh xe hết tự chỉnh lại được.
        const viTriCuon = e.nativeEvent.contentOffset.y;
        hen.current = setTimeout(() => {
          hen.current = null;
          dangKeo.current = false;
          chot(viTriCuon);
        }, 350);
      }}
      onMomentumScrollBegin={huyHen}
      onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        huyHen();
        dangKeo.current = false;
        chot(e.nativeEvent.contentOffset.y);
      }}
      contentContainerStyle={{ paddingVertical: DEM }}
    />
  );
}

/** Khung bọc mấy cột: dải sáng ở giữa, hai đầu mờ dần cho ra mặt cong. */
function Khung({ nhan, children }: { nhan: string[]; children: React.ReactNode }) {
  return (
    <View>
      <View className="mb-2 flex-row">
        {nhan.map((n) => (
          <Text
            key={n}
            style={{ fontFamily: CHU.thanDam, letterSpacing: 1.3 }}
            className="flex-1 text-center text-[10px] uppercase text-chu-mo">
            {n}
          </Text>
        ))}
      </View>

      <View
        style={{ height: CAO_KHUNG, borderColor: MAU.vien }}
        className="flex-row overflow-hidden rounded-2xl border bg-nen-nhat">
        {/* Dải chọn vẽ trước nên nằm dưới chữ, và không chắn tay người dùng. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: DEM,
            height: CAO_DONG,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: MAU.vangMo,
            backgroundColor: MAU.vangRatMo,
          }}
        />
        {children}
        <LinearGradient
          pointerEvents="none"
          colors={[MAU.nenNhat, 'rgba(20,30,51,0)']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: DEM }}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(20,30,51,0)', MAU.nenNhat]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: DEM }}
        />
      </View>
    </View>
  );
}

const NAM = khoangNamSinh();

export function BanhXeNgaySinh({
  ngay,
  thang,
  nam,
  dat,
}: {
  ngay: number;
  thang: number;
  nam: number;
  dat: (phan: { ngay?: number; thang?: number; nam?: number }) => void;
}) {
  const soNgay = soNgayTrongThang(thang, nam);
  const mucNgay = useMemo(() => day(1, soNgay), [soNgay]);
  const mucThang = useMemo(() => day(1, 12), []);
  const mucNam = useMemo(() => day(NAM.dau, NAM.cuoi, 4), []);

  // Đang để 31 rồi chuyển sang tháng chỉ có 30 ngày thì kéo về ngày cuối tháng.
  useEffect(() => {
    if (ngay > soNgay) dat({ ngay: soNgay });
  }, [ngay, soNgay, dat]);

  return (
    <Khung nhan={['Ngày', 'Tháng', 'Năm']}>
      <BanhXe gia={ngayHopLe(ngay, thang, nam)} dat={(v) => dat({ ngay: v })} muc={mucNgay} />
      <BanhXe gia={thang} dat={(v) => dat({ thang: v })} muc={mucThang} />
      <BanhXe gia={nam} dat={(v) => dat({ nam: v })} muc={mucNam} />
    </Khung>
  );
}

export function BanhXeGioSinh({
  gio,
  phut,
  dat,
}: {
  gio: number;
  phut: number;
  dat: (phan: { gio?: number; phut?: number }) => void;
}) {
  const mucGio = useMemo(() => day(0, 23), []);
  const mucPhut = useMemo(() => day(0, 59), []);

  return (
    <Khung nhan={['Giờ', 'Phút']}>
      <BanhXe gia={gio} dat={(v) => dat({ gio: v })} muc={mucGio} />
      <BanhXe gia={phut} dat={(v) => dat({ phut: v })} muc={mucPhut} />
    </Khung>
  );
}
