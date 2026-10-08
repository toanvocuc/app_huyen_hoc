import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ManHinh, Nut } from '@/components/nen';
import { NenTroiSao } from '@/components/nen-anh';
import { NoiDungPhapLy } from '@/components/noi-dung-phap-ly';
import { CHU } from '@/constants/giao-dien';

/**
 * Xem lại điều khoản đã đồng ý. Chỉ để đọc.
 *
 * Trước đây mục này trong Cá nhân trỏ thẳng vào màn điều khoản của luồng tạo
 * tài khoản. Màn đó có ô tích đồng ý và nút Tiếp tục dẫn sang phần nhập tên,
 * nên khách chỉ muốn đọc lại thì bị kéo vào nhập lại cả hồ sơ và ghi đè lên
 * thứ đang có. Tệ hơn: bản nhập tạm đã bị dọn sau lần tạo tài khoản đầu, nên
 * đi hết luồng đó sẽ ghi xuống máy chủ một ngày sinh không có thật.
 */
export default function PhapLy() {
  return (
    <ManHinh
      nenPhu={<NenTroiSao />}
      quayLai
      tieuDe="Quyền riêng tư"
      phu="Những điều bạn đã đồng ý khi tạo tài khoản.">
      <NoiDungPhapLy />

      <View
        className="mt-5 flex-row items-start gap-2 rounded-xl border border-vang/30 bg-vang/[0.06] px-4 py-3">
        <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-vang">
          ✓
        </Text>
        <Text style={{ fontFamily: CHU.than }} className="flex-1 text-sm leading-6 text-chu-phu">
          Bạn đã đồng ý với những điều trên khi tạo tài khoản.
        </Text>
      </View>

      <View className="mt-6">
        <Nut
          nhan="Xoá toàn bộ dữ liệu"
          kieu="vien"
          onPress={() => router.push('/cai-dat/xoa-du-lieu')}
        />
      </View>
    </ManHinh>
  );
}
