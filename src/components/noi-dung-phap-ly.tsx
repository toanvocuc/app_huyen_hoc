/**
 * Nội dung điều khoản và quyền riêng tư, dùng chung cho hai chỗ.
 *
 * Màn trong luồng tạo tài khoản bắt khách tích đồng ý rồi mới đi tiếp. Màn
 * trong phần Cá nhân chỉ cho đọc lại.
 *
 * Để chung một chỗ vì tách ra hai bản thì sớm muộn chúng lệch nhau, và lúc đó
 * thứ khách đọc lại không còn là thứ khách đã đồng ý.
 */

import { Text, View } from 'react-native';

import { Khoi } from '@/components/nen';
import { CHU } from '@/constants/giao-dien';

const MUC = [
  {
    ten: 'App lưu những gì',
    noi: 'Họ tên, ngày sinh, giờ sinh và nơi sinh bạn tự nhập. Những thứ này dùng để tính cung hoàng đạo, số chủ đạo và chọn lá bài của ngày.',
  },
  {
    ten: 'App không lưu những gì',
    noi: 'Không đọc danh bạ, không đọc ảnh, không lấy vị trí. Không có quảng cáo và không bán dữ liệu cho bên thứ ba.',
  },
  {
    ten: 'Xoá lúc nào cũng được',
    noi: 'Vào mục Cá nhân, chọn xoá dữ liệu. Mọi thứ biến mất khỏi máy chủ ngay, không giữ lại bản sao.',
  },
];

export function NoiDungPhapLy() {
  return (
    <Khoi>
      {MUC.map((m, i) => (
        <View key={m.ten} className={i === 0 ? '' : 'mt-4'}>
          <Text style={{ fontFamily: CHU.thanVua }} className="text-base leading-6 text-chu-chinh">
            {m.ten}
          </Text>
          <Text style={{ fontFamily: CHU.than }} className="mt-2 text-sm leading-6 text-chu-phu">
            {m.noi}
          </Text>
        </View>
      ))}
    </Khoi>
  );
}
