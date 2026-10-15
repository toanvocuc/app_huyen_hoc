/**
 * Màn làm việc của thầy.
 *
 * Bản này cố ý để trống phần danh sách đơn — thứ đó làm sau. Giờ nó chỉ có ba
 * việc, và cả ba đều cần thiết:
 *
 *   1. Nói rõ đang đăng nhập với tư cách ai. Thầy và khách dùng chung một app,
 *      không nói rõ là lẫn.
 *   2. Cho biết thông báo đã bật chưa. Thông báo CHÍNH LÀ công cụ làm việc ở
 *      bản này — tắt nó là đơn nằm im và không ai biết.
 *   3. Đăng xuất.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Nut, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { supabase } from '@/lib/supabase';
import { useLaThay } from '@/lib/thay';
import { daCoQuyen, dangKyMaDay, xinQuyen } from '@/lib/thong-bao';

export default function ManThay() {
  const { thay, xong } = useLaThay();
  const [coQuyen, datCoQuyen] = useState<boolean | null>(null);
  const [dangXin, datDangXin] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Phải có nhánh bắt lỗi: màn này vẽ vòng xoay khi chưa biết quyền, hỏng mà
      // không bắt là nó quay mãi.
      daCoQuyen()
        .then(datCoQuyen)
        .catch(() => datCoQuyen(false));
    }, [])
  );

  async function bat() {
    datDangXin(true);
    try {
      const duoc = await xinQuyen();
      datCoQuyen(duoc);
      if (duoc) await dangKyMaDay();
      else {
        Alert.alert(
          'Máy đang chặn thông báo',
          'Hộp thoại xin quyền của hệ điều hành chỉ hiện một lần. Vào phần cài đặt của máy, tìm Omora rồi bật thông báo giúp tôi.'
        );
      }
    } finally {
      datDangXin(false);
    }
  }

  function thoat() {
    Alert.alert('Đăng xuất?', 'Bạn sẽ không nhận được thông báo đơn mới nữa.', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () =>
          supabase.auth
            .signOut()
            .then(() => router.replace('/dang-nhap'))
            .catch(() => Alert.alert('Chưa đăng xuất được', 'Kiểm tra mạng rồi thử lại.')),
      },
    ]);
  }

  if (!xong) {
    return (
      <ManHinh tieuDe="Chuyên gia">
        <DangTai />
      </ManHinh>
    );
  }

  if (!thay) {
    return (
      <ManHinh tieuDe="Chuyên gia">
        <Khoi>
          <ChuThan>
            Tài khoản này chưa được cấp quyền chuyên gia. Liên hệ người phụ trách Omora giúp tôi.
          </ChuThan>
        </Khoi>
        <View className="mt-6">
          <Nut nhan="Về màn đăng nhập" kieu="vien" onPress={() => router.replace('/dang-nhap')} />
        </View>
      </ManHinh>
    );
  }

  return (
    <ManHinh tieuDe="Chế độ chuyên gia" phu={`Đang làm việc với tư cách ${thay.ten}`}>
      <Khoi vien={coQuyen !== true}>
        <View className="mb-2 flex-row items-center gap-2.5">
          <Ionicons
            name={coQuyen ? 'notifications' : 'notifications-off-outline'}
            size={18}
            color={coQuyen ? MAU.tot : MAU.canh}
          />
          <Text
            style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4, color: coQuyen ? MAU.tot : MAU.canh }}
            className="text-[11px] uppercase">
            {coQuyen === null ? 'Đang kiểm' : coQuyen ? 'Thông báo đang bật' : 'Thông báo đang tắt'}
          </Text>
        </View>

        <ChuThan>
          {coQuyen
            ? 'Có khách đặt lịch là máy báo ngay, kèm chủ đề, khung giờ và câu hỏi của khách.'
            : 'Chưa bật thông báo thì đơn của khách nằm im, bạn sẽ không biết. Đây là cách duy nhất để nhận tin ở bản này.'}
        </ChuThan>

        {coQuyen === false ? (
          <View className="mt-5">
            <Nut nhan="Bật thông báo" dangChay={dangXin} onPress={bat} />
          </View>
        ) : null}
      </Khoi>

      <VanNgan />

      <Khoi>
        <Nhan>Sắp có</Nhan>
        <ChuThan>
          Danh sách đơn và lịch sử tư vấn ngay trong màn này. Hiện tại thông tin từng buổi nằm
          trong thông báo gửi về máy.
        </ChuThan>
      </Khoi>

      <View className="mt-8">
        <Nut nhan="Đăng xuất" kieu="nhe" onPress={thoat} />
      </View>
    </ManHinh>
  );
}
