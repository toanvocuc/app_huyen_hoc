import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ManHinh, Nut } from '@/components/nen';
import { NoiDungPhapLy } from '@/components/noi-dung-phap-ly';
import { NenTroiSao } from '@/components/nen-anh';
import { CHU } from '@/constants/giao-dien';

export default function DieuKhoan() {
  const [dongY, setDongY] = useState(false);

  return (
    <ManHinh
      nenPhu={<NenTroiSao />}
      quayLai
      tieuDe="Điều khoản và quyền riêng tư"
      phu="Đọc qua một lượt trước khi bắt đầu.">
      <NoiDungPhapLy />

      <Pressable
        onPress={() => setDongY((v) => !v)}
        className="mt-6 flex-row items-start gap-3 py-2 active:opacity-70">
        <View
          className={`mt-0.5 h-6 w-6 items-center justify-center rounded-md border ${
            dongY ? 'border-vang bg-vang' : 'border-chu-mo'
          }`}>
          {dongY ? <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-nen">✓</Text> : null}
        </View>
        <Text style={{ fontFamily: CHU.than }} className="flex-1 text-sm leading-6 text-chu-phu">
          Tôi đã đọc và đồng ý với điều khoản sử dụng và chính sách quyền riêng tư
        </Text>
      </Pressable>

      <View className="mt-6">
        <Nut nhan="Tiếp tục" tat={!dongY} onPress={() => router.push('/nhap-ho-so/ten')} />
      </View>
    </ManHinh>
  );
}
