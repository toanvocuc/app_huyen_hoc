/**
 * Danh sách quan tâm, và nút gửi nó cho cửa hàng.
 *
 * ─────────────────────────────────────────────────── VÌ SAO CHÉP CHỨ KHÔNG GỬI
 *
 * App không gửi gì lên máy chủ. Bấm gửi thì app chép danh sách ra chữ, khách tự
 * dán vào Zalo và gửi bằng tài khoản của chính mình. Zalo không nhận nội dung
 * tin nhắn kèm trong đường dẫn như WhatsApp, nên chép là đường duy nhất đi được.
 *
 * Và PHẢI có một nhịp dừng giữa chép và mở Zalo. Nhảy thẳng sang Zalo thì khách
 * tới nơi thấy khung chat trắng, không biết mình phải làm gì — mất luôn cả lượt
 * hỏi lẫn thiện cảm.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { ChuThan, DangTai, Khoi, ManHinh, Nut, Trong } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { dungTinNhan, giaTheoSoLuong, tien, tongTien, type DongQuanTam } from '@/lib/gian-hang';
import { boQuanTam, datSoLuong, useQuanTam, xoaHetQuanTam } from '@/lib/quan-tam';
import { anhSanPham, timSanPham, useSanPham } from '@/lib/san-pham';

/** Một dòng trong danh sách, đã ghép mã đã lưu với hàng đọc từ máy chủ. */
type DongHien = DongQuanTam & { ma: string; anh: string | null };

/** Zalo của cửa hàng. Chưa khai thì phần gửi vẫn chép được, chỉ không mở Zalo. */
const ZALO = (process.env.EXPO_PUBLIC_ZALO_CUA_HANG ?? '').trim();

export default function ManQuanTam() {
  const quanTam = useQuanTam();
  const { dong, dangTai } = useSanPham();
  const [daChep, datDaChep] = useState(false);

  /**
   * Ghép mã đã lưu với hàng đọc từ máy chủ.
   *
   * Món bị cửa hàng gỡ khỏi khu trưng bày thì không tìm thấy nữa — bỏ hẳn khỏi
   * danh sách thay vì hiện một dòng trống. Giá cũng lấy theo bản MỚI NHẤT, vì
   * đây là danh sách để hỏi, không phải một đơn đã chốt giá.
   */
  const mon = useMemo<DongHien[]>(() => {
    const ra: DongHien[] = [];
    for (const q of quanTam) {
      const s = timSanPham(dong, q.ma);
      if (!s) continue;
      ra.push({
        ma: s.ma,
        ten: s.ten,
        soLuong: q.soLuong,
        gia: s.gia,
        donVi: s.don_vi,
        bacGia: s.bac_gia,
        anh: anhSanPham(s.anh),
      });
    }
    return ra;
  }, [quanTam, dong]);

  async function chep() {
    const chu = dungTinNhan(mon, new Date());
    if (!chu) return;
    try {
      await Clipboard.setStringAsync(chu);
      datDaChep(true);
    } catch {
      Alert.alert('Chưa chép được', 'Máy không cho chép lúc này. Thử lại giúp tôi.');
    }
  }

  function moZalo() {
    if (!ZALO) {
      Alert.alert(
        'Chưa có kênh Zalo',
        'Cửa hàng chưa khai Zalo trong ứng dụng. Danh sách đã được chép sẵn, bạn dán vào kênh liên lạc của cửa hàng giúp tôi.'
      );
      return;
    }
    const duong = ZALO.startsWith('http') ? ZALO : `https://zalo.me/${ZALO.replace(/\D/g, '')}`;
    Linking.openURL(duong).catch(() =>
      Alert.alert('Chưa mở được Zalo', 'Bạn mở Zalo rồi dán danh sách vào giúp tôi.')
    );
  }

  function hoiXoaHet() {
    Alert.alert('Xoá hết danh sách?', 'Mấy món bạn đã gom sẽ bỏ đi hết.', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Xoá hết',
        style: 'destructive',
        onPress: () => {
          xoaHetQuanTam();
          datDaChep(false);
        },
      },
    ]);
  }

  if (dangTai && quanTam.length > 0) {
    return (
      <ManHinh quayLai tieuDe="Danh sách quan tâm">
        <DangTai />
      </ManHinh>
    );
  }

  if (mon.length === 0) {
    return (
      <ManHinh quayLai tieuDe="Danh sách quan tâm">
        <Trong loi="Bạn chưa gom món nào. Vào khu trưng bày, thấy món nào ưng thì thêm vào đây." />
        <View className="mt-5">
          <Nut nhan="Xem khu trưng bày" onPress={() => router.replace('/trung-bay')} />
        </View>
      </ManHinh>
    );
  }

  return (
    <ManHinh
      quayLai
      tieuDe="Danh sách quan tâm"
      phu="Gom đủ rồi thì gửi một lượt cho cửa hàng.">
      <View className="gap-3">
        {mon.map((m) => (
          <Dong
            key={m.ma}
            mon={m}
            onBot={() => datSoLuong(m.ma, m.soLuong - 1)}
            onThem={() => datSoLuong(m.ma, m.soLuong + 1)}
            onBo={() => boQuanTam(m.ma)}
          />
        ))}
      </View>

      <View
        style={{ borderColor: MAU.vangMo }}
        className="mt-6 flex-row items-center justify-between rounded-2xl border bg-nen-nhat px-4 py-4">
        <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
          Tạm tính {mon.length} món
        </Text>
        <Text style={{ fontFamily: CHU.hoaDam, fontSize: 22, color: MAU.vang }}>
          {tien(tongTien(mon))}
        </Text>
      </View>

      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-2 text-center text-[11px] leading-5 text-chu-mo">
        Tạm tính theo giá đang bày, chưa gồm phí gửi hàng. Cửa hàng báo lại con số cuối.
      </Text>

      {/* Hai bước, cố ý tách rời. Chép xong mới hiện lối mở Zalo, để khách biết
          là mình đang cầm sẵn thứ cần dán. */}
      <View className="mt-7">
        {!daChep ? (
          <Nut nhan="Chép danh sách để gửi" onPress={chep} />
        ) : (
          <View>
            <Khoi vang>
              <View className="mb-2 flex-row items-center gap-2.5">
                <Ionicons name="checkmark-circle" size={18} color={MAU.tot} />
                <Text
                  style={{ fontFamily: CHU.thanDam, letterSpacing: 1.3, color: MAU.tot }}
                  className="text-[11px] uppercase">
                  Đã chép xong
                </Text>
              </View>
              <ChuThan>
                Mở Zalo của cửa hàng rồi dán vào khung chat là gửi được. Cửa hàng sẽ nhắn
                lại giá cuối và cách gửi hàng.
              </ChuThan>
              <View className="mt-5 gap-2.5">
                <Nut nhan="Mở Zalo" onPress={moZalo} />
                <Nut nhan="Chép lại" kieu="nhe" onPress={chep} />
              </View>
            </Khoi>
          </View>
        )}
      </View>

      <Pressable onPress={hoiXoaHet} className="mt-7 self-center px-4 py-2 active:opacity-60">
        <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo underline">
          Xoá hết danh sách
        </Text>
      </Pressable>

      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-6 text-center text-[11px] leading-5 text-chu-mo">
        Danh sách này chỉ nằm trên máy bạn. Omora không gửi nó đi đâu và không lưu lại.
      </Text>
    </ManHinh>
  );
}

function Dong({
  mon,
  onBot,
  onThem,
  onBo,
}: {
  mon: DongHien;
  onBot: () => void;
  onThem: () => void;
  onBo: () => void;
}) {
  const don = giaTheoSoLuong(mon.gia, mon.bacGia, mon.soLuong);
  return (
    <View
      style={{ borderColor: MAU.vien }}
      className="flex-row gap-3.5 rounded-2xl border bg-nen-nhat p-3">
      {mon.anh ? (
        <Image
          source={{ uri: mon.anh }}
          style={{ width: 66, height: 66, borderRadius: 12 }}
          contentFit="cover"
        />
      ) : null}

      <View className="flex-1">
        <Text
          numberOfLines={2}
          style={{ fontFamily: CHU.thanDam }}
          className="text-sm leading-5 text-chu-chinh">
          {mon.ten}
        </Text>
        <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-xs text-chu-mo">
          {tien(don)} / {mon.donVi}
          {don !== mon.gia ? ' · đã tính giá số lượng' : ''}
        </Text>

        <View className="mt-2 flex-row items-center gap-3">
          <NutNho ky="remove" onPress={onBot} />
          <Text style={{ fontFamily: CHU.thanDam }} className="min-w-[26px] text-center text-base text-chu-chinh">
            {mon.soLuong}
          </Text>
          <NutNho ky="add" onPress={onThem} />
          <View className="flex-1 items-end">
            <Text style={{ fontFamily: CHU.thanDam, color: MAU.vang }} className="text-sm">
              {tien(don * mon.soLuong)}
            </Text>
          </View>
        </View>
      </View>

      <Pressable onPress={onBo} hitSlop={10} className="self-start active:opacity-60">
        <Ionicons name="close" size={17} color={MAU.chuMo} />
      </Pressable>
    </View>
  );
}

function NutNho({ ky, onPress }: { ky: 'add' | 'remove'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={{ borderColor: MAU.vien }}
      className="h-8 w-8 items-center justify-center rounded-full border active:opacity-60">
      <Ionicons name={ky} size={15} color={MAU.vang} />
    </Pressable>
  );
}
