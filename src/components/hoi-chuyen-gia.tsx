/**
 * Mục hỏi chuyên gia, đặt ở CUỐI màn kết quả chứ không phải nút nổi ở góc màn hình.
 * Đặt ở đây vì khách vừa đọc xong lời luận giải và đang muốn hỏi một câu cụ thể.
 *
 * Lời mời phải viết theo đúng thứ khách vừa xem, truyền vào qua `loiMoi`.
 * Dùng chung một câu cho mọi màn thì khách nhìn ra ngay là quảng cáo.
 *
 * Nút này DẪN SANG DANH SÁCH CHUYÊN GIA, không mở Zalo thẳng như trước. Nhắn cho
 * một cái tên chung chung thì ai cũng ngại bấm; xem qua người mình sắp hỏi rồi
 * mới quyết định là bước tự nhiên hơn.
 *
 * Danh sách đó giờ là thẻ tab đầu tiên, nên đường dẫn là '/' chứ không còn là
 * '/chuyen-gia' như trước khi đổi trục.
 *
 * Khối này cố ý KHÔNG gọi máy chủ. Nó nằm ở cuối gần như mọi màn kết quả, nên
 * thêm một lượt hỏi ở đây là thêm một lượt cho mỗi lần khách xem bất cứ thứ gì.
 * Phần hồ sơ và điểm sao để màn danh sách lo.
 */

import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CHU } from '@/constants/giao-dien';
import { ghiSuKien } from '@/lib/su-kien';

type Props = {
  /** Câu mời viết riêng theo lá bài hoặc cung khách vừa xem. */
  loiMoi: string;
  /** Tên màn hình, để biết khách bấm từ đâu. */
  manHinh: string;
};

export function HoiChuyenGia({ loiMoi, manHinh }: Props) {
  const daGhiHienThi = useRef(false);

  useEffect(() => {
    if (daGhiHienThi.current) return;
    daGhiHienThi.current = true;
    ghiSuKien({ loai: 'thay_muc_hoi', manHinh });
  }, [manHinh]);

  return (
    <View className="mt-8 rounded-2xl border border-vang/30 bg-nen-nhat p-5">
      <Text style={{ fontFamily: CHU.than }} className="mb-4 text-base leading-6 text-chu-chinh">
        {loiMoi}
      </Text>
      <Pressable
        onPress={() => router.push('/')}
        className="rounded-xl bg-vang px-5 py-3 active:opacity-80">
        <Text style={{ fontFamily: CHU.thanDam }} className="text-center text-nen">
          Xem người có thể trả lời bạn
        </Text>
      </Pressable>
    </View>
  );
}
