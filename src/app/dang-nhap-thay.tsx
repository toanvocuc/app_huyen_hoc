/**
 * Đăng nhập dành cho thầy.
 *
 * Tách hẳn khỏi màn đăng nhập của khách, và cố ý KHÔNG có nút đăng ký — tài
 * khoản thầy do công ty cấp, không ai tự tạo được.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { ChuThan, Khoi, ManHinh, Nhan, Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { dangNhapThay, LoiDangNhapThay } from '@/lib/thay';
import { xinQuyen, dangKyMaDay } from '@/lib/thong-bao';

export default function DangNhapThay() {
  const [email, datEmail] = useState('');
  const [matKhau, datMatKhau] = useState('');
  const [dangChay, datDangChay] = useState(false);
  const [loi, datLoi] = useState<string | null>(null);

  async function vao() {
    datLoi(null);
    datDangChay(true);
    try {
      await dangNhapThay(email, matKhau);

      // Xin quyền thông báo NGAY sau khi vào, không để lúc khác.
      //
      // Với khách thì thông báo là thứ có cũng được. Với thầy thì nó CHÍNH LÀ
      // công cụ làm việc — không có nó thì đơn của khách nằm im và không ai
      // biết. Lấy mã thiết bị ngay để máy chủ biết đẩy tin về đâu.
      const duoc = await xinQuyen();
      if (duoc) await dangKyMaDay();

      router.replace('/thay');
    } catch (e) {
      datLoi(
        e instanceof LoiDangNhapThay ? e.message : 'Chưa đăng nhập được. Kiểm tra mạng giúp tôi.'
      );
      datDangChay(false);
    }
  }

  const duDieuKien = email.trim().length > 3 && matKhau.length > 0;

  return (
    <ManHinh quayLai tieuDe="Đăng nhập chuyên gia" phu="Dành cho chuyên gia đã được công ty cấp tài khoản.">
      <View className="gap-4">
        <View>
          <Nhan>Email</Nhan>
          <TextInput
            value={email}
            onChangeText={datEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="email công ty cấp cho bạn"
            placeholderTextColor={MAU.chuMo}
            style={{ fontFamily: CHU.than, color: MAU.chuChinh, borderColor: MAU.vien }}
            className="mt-2 rounded-xl border bg-nen-nhat px-4 py-3.5 text-base"
          />
        </View>

        <View>
          <Nhan>Mật khẩu</Nhan>
          <TextInput
            value={matKhau}
            onChangeText={datMatKhau}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            placeholderTextColor={MAU.chuMo}
            style={{ fontFamily: CHU.than, color: MAU.chuChinh, borderColor: MAU.vien }}
            className="mt-2 rounded-xl border bg-nen-nhat px-4 py-3.5 text-base"
          />
        </View>
      </View>

      {loi ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-5 text-sm leading-5 text-canh">
          {loi}
        </Text>
      ) : null}

      <View className="mt-7">
        <Nut nhan="Vào làm việc" tat={!duDieuKien} dangChay={dangChay} onPress={vao} />
      </View>

      <View className="mt-8">
        <Khoi>
          <Nhan>Chưa có tài khoản?</Nhan>
          <ChuThan>
            Tài khoản chuyên gia do công ty cấp, không tự đăng ký được. Liên hệ người phụ trách
            Omora để được tạo.
          </ChuThan>
        </Khoi>
      </View>
    </ManHinh>
  );
}
