/**
 * Khối tài khoản ở màn Cá nhân. Hai bộ mặt tuỳ khách đang là ai.
 *
 *   - Đang ẩn danh  → mời gắn tài khoản thật
 *   - Đã đăng nhập  → hiện đang dùng tài khoản nào, và nút đăng xuất
 *
 * Gộp hai thứ vào một chỗ vì chúng loại trừ nhau, và vì cả hai đều phải hỏi
 * cùng một câu: khách hiện tại là ai. Tách ra là hỏi hai lần.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';

import { NutDangNhap } from '@/components/nut-dang-nhap';
import { CHU, MAU } from '@/constants/giao-dien';
import {
  DaCoHoSoKhac,
  dangXuat,
  ganApple,
  ganGoogle,
  KhachHuy,
  loiDeHieu,
} from '@/lib/dang-nhap';
import { xoaTaiKhoan } from '@/lib/ho-so';
import { tinTaiKhoan, type TinTaiKhoan } from '@/lib/supabase';

const LOI_ICH = ['Đổi máy vẫn giữ nguyên hồ sơ', 'Xem lại mọi lần rút bài cũ'];

const TEN_NHA: Record<string, string> = { google: 'Google', apple: 'Apple' };

export function KhoiTaiKhoan({ xongThi }: { xongThi: () => void }) {
  const [tin, setTin] = useState<TinTaiKhoan | null>(null);
  const [khongDoc, setKhongDoc] = useState(false);
  const [dangChay, setDangChay] = useState<'google' | 'apple' | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  /**
   * Hỏi xem khách hiện tại là ai.
   *
   * PHẢI có nhánh bắt lỗi. `tinTaiKhoan` gọi mạng, và khối này biến mất hẳn khi
   * không có tin — nên hỏng mà không bắt thì cả nút đăng nhập lẫn nút đăng xuất
   * cùng biến mất, không một dòng báo nào. Khách tưởng app mất chức năng.
   */
  const hoiLai = useCallback(() => {
    setKhongDoc(false);
    tinTaiKhoan()
      .then((t) => {
        setTin(t);
        // Có phiên mà đọc ra null nghĩa là hỏi máy chủ không xong, không phải
        // là khách chưa đăng nhập.
        setKhongDoc(t === null);
      })
      .catch((e) => {
        console.warn('[tai-khoan]', e);
        setKhongDoc(true);
      });
  }, []);

  // Đọc lại mỗi lần màn này hiện lên, không chỉ lúc dựng. Khách đăng nhập hay
  // đăng xuất ở chỗ khác rồi quay về thì khối này phải đổi mặt theo.
  useFocusEffect(hoiLai);

  if (khongDoc) {
    return (
      <Pressable
        onPress={hoiLai}
        style={{ borderColor: MAU.vien }}
        className="rounded-2xl border border-dashed p-5 active:opacity-70">
        <Text style={{ fontFamily: CHU.than }} className="text-sm leading-6 text-chu-phu">
          Chưa đọc được tài khoản của bạn. Kiểm tra mạng rồi chạm vào đây để thử lại.
        </Text>
      </Pressable>
    );
  }

  if (!tin) return null;

  async function gan(hang: 'google' | 'apple') {
    setLoi(null);
    setDangChay(hang);
    try {
      await (hang === 'google' ? ganGoogle() : ganApple());
      setTin(await tinTaiKhoan());
      xongThi();
    } catch (e) {
      if (e instanceof DaCoHoSoKhac) hoiChonHoSo(hang);
      else if (!(e instanceof KhachHuy)) setLoi(loiDeHieu(e));
    } finally {
      setDangChay(null);
    }
  }

  /**
   * Tài khoản vừa chọn đã thuộc về một hồ sơ Omora khác.
   *
   * Không phải ngõ cụt, và cũng không phải lỗi của khách. Hai hồ sơ thì không
   * gộp được — gộp tự động là chắc chắn mất một bên mà không ai biết bên nào —
   * nên đưa ra cho khách chọn, và nói thẳng cái giá của mỗi đường.
   */
  /**
   * Tài khoản vừa chọn đã thuộc về một hồ sơ Omora khác.
   *
   * Hai hồ sơ không gộp lại được — gộp tự động là chắc chắn mất một bên mà
   * không ai biết bên nào. Nên đưa ra cho khách chọn, và nói thẳng cái giá.
   */
  function hoiChonHoSo(hang: 'google' | 'apple') {
    const ten = TEN_NHA[hang] ?? hang;
    Alert.alert(
      'Tài khoản này đã có hồ sơ riêng',
      `Bạn từng đăng nhập Omora bằng tài khoản ${ten} này nên nó đã có một hồ sơ ` +
        'riêng. Chuyển qua hồ sơ đó thì hồ sơ ẩn danh đang mở trên máy này sẽ bị xoá đi.',
      [
        {
          text: `Chuyển qua tài khoản ${ten}`,
          style: 'destructive',
          onPress: () => {
            void chuyenSangHoSoCu();
          },
        },
        { text: 'Để sau', style: 'cancel' },
      ]
    );
  }

  /**
   * Bỏ hồ sơ ẩn danh để quay về hồ sơ cũ.
   *
   * XOÁ HẴN chứ không chỉ đăng xuất. Hồ sơ ẩn danh không gắn tài khoản nào, nên
   * đăng xuất là nó thành mồ côi: khách không bao giờ vào lại được, mà dữ liệu
   * vẫn nằm lại trên máy chủ. Đó đúng là cách đã sinh ra hàng chục tài khoản rác
   * phải dọn tay một lần. Nói xoá thì xoá thật.
   *
   * `xoaTaiKhoan` dọn luôn lịch nhắc, mã máy nhận tin và dấu tài khoản thật, rồi
   * đăng xuất. Màn gốc nghe được việc đăng xuất nên tự đưa về màn chọn cách vào.
   */
  async function chuyenSangHoSoCu() {
    setLoi(null);
    try {
      await xoaTaiKhoan();
    } catch (e) {
      setLoi(loiDeHieu(e));
    }
  }

  function hoiRoiThoat() {
    Alert.alert(
      'Đăng xuất?',
      'Hồ sơ và lịch sử rút bài của bạn vẫn nằm nguyên trên máy chủ. ' +
        'Đăng nhập lại bằng tài khoản này là thấy lại đầy đủ.',
      [
        { text: 'Ở lại', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () =>
            dangXuat().catch((e) => setLoi(loiDeHieu(e))),
        },
      ]
    );
  }

  // ---------------------------------------------------------- đã đăng nhập
  if (!tin.anDanh) {
    return (
      <View
        style={{ borderColor: MAU.vien }}
        className="mt-7 rounded-2xl border bg-nen-nhat px-5 py-4">
        <View className="flex-row items-center gap-3">
          <Ionicons name="shield-checkmark-outline" size={20} color={MAU.vang} />
          <View className="flex-1">
            <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-chu-chinh">
              Đã đăng nhập{tin.nha ? ` bằng ${TEN_NHA[tin.nha] ?? tin.nha}` : ''}
            </Text>
            {tin.email ? (
              <Text
                numberOfLines={1}
                style={{ fontFamily: CHU.than }}
                className="mt-0.5 text-xs text-chu-phu">
                {tin.email}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={hoiRoiThoat}
          style={{ borderColor: MAU.vien }}
          className="mt-4 items-center rounded-full border py-2.5 active:opacity-70">
          <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-chu-phu">
            Đăng xuất hoặc đổi tài khoản
          </Text>
        </Pressable>

        {loi ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-3 text-xs leading-5 text-canh">
            {loi}
          </Text>
        ) : null}
      </View>
    );
  }

  // ---------------------------------------------------------- còn ẩn danh
  return (
    <View
      style={{ borderColor: MAU.vangMo }}
      className="mt-7 rounded-2xl border bg-nen-nhat px-5 py-5">
      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 22, lineHeight: 28 }}
        className="text-chu-chinh">
        Giữ lại hồ sơ của bạn
      </Text>
      <Text style={{ fontFamily: CHU.than }} className="mt-1.5 text-sm leading-6 text-chu-phu">
        Hồ sơ này đang gắn với một mình máy bạn. Mất máy là mất luôn.
      </Text>

      <View className="mt-4 gap-2">
        {LOI_ICH.map((d) => (
          <View key={d} className="flex-row items-start gap-2.5">
            <Text style={{ fontFamily: CHU.than }} className="text-sm leading-6 text-vang">
              ✦
            </Text>
            <Text
              style={{ fontFamily: CHU.than }}
              className="flex-1 text-sm leading-6 text-chu-phu">
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-5 gap-3">
        {/* Trên iOS, điều 4.8 của Apple bắt buộc có Sign in with Apple khi đã
            có đăng nhập bên thứ ba khác. Trên Android thì thừa. */}
        {Platform.OS === 'ios' ? (
          <NutDangNhap
            hang="apple"
            nhan="Đăng nhập bằng Apple"
            onPress={() => gan('apple')}
            dangChay={dangChay === 'apple'}
            tat={dangChay !== null}
          />
        ) : null}
        <NutDangNhap
          hang="google"
          nhan="Đăng nhập bằng Google"
          onPress={() => gan('google')}
          dangChay={dangChay === 'google'}
          tat={dangChay !== null}
        />
      </View>

      {loi ? (
        <View className="mt-4 flex-row items-start gap-2">
          <Ionicons name="alert-circle-outline" size={16} color={MAU.canh} />
          <Text style={{ fontFamily: CHU.than }} className="flex-1 text-xs leading-5 text-canh">
            {loi}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
