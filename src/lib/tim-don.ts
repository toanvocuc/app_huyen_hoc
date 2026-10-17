/**
 * Bấm thông báo thì thấy ngay đúng đơn, không phải đầu danh sách.
 *
 * ──────────────────────────────────────────────────────────── CHUYỆN ĐÃ HỎNG
 *
 * Mọi dòng thông báo về đặt lịch đều trỏ về '/thay' hoặc '/lich-cua-toi' — cả
 * danh sách, không phải một đơn. Thầy có mười đơn, nhận tin về đơn thứ bảy, bấm
 * vào thì app mở ở đầu trang rồi bỏ đó. Thông báo gọi được người ta tới, nhưng
 * tới rồi lại để họ tự dò.
 *
 * Từ migration 0025, đường dẫn mang theo `?don=<mã>`.
 *
 * ───────────────────────────────────── VÌ SAO KHÔNG CÒN ĐO VÀ CUỘN NỮA
 *
 * Ba bản trước đều là: tìm thẻ, đo xem nó nằm ở đâu, rồi cuộn tới. Ba bản đều
 * hỏng, và mỗi lần hỏng một kiểu khác nhau:
 *
 *   1. Hẹn giờ 420ms — nổ trước khi mục Lịch sử kịp dựng.
 *   2. Cổng mở bằng một hiệu ứng — hiệu ứng chạy SAU layout, nên lượt đo duy
 *      nhất bị chặn lại.
 *   3. Đọc `onLayout.y` — con số đó so với thẻ cha, không phải so với vùng cuộn.
 *   4. Đếm lượt + `measureLayout` — đo đúng, cuộn đúng, rồi màn hình vẫn trôi
 *      ngược lên đầu. Danh sách bị nạp lại, nội dung co lại, vị trí cuộn bị hệ
 *      thống kẹp về 0, và bản sửa chỉ việc chạy đua với thứ mình không thấy.
 *
 * Điểm chung: cuộn tới một chỗ là CHẠY ĐUA với bố cục. Mỗi lần tôi thắng được
 * một đường đua thì lại lòi ra đường khác, và lần nào phép thử cũng báo xanh.
 *
 * Nên bỏ hẳn cuộc đua. Đơn cần tìm được GHIM LÊN ĐẦU danh sách, ngay chỗ mắt
 * đang nhìn. Không đo gì, không hẹn giờ gì, không có gì để trôi mất. Phần còn
 * lại của danh sách vẫn nguyên ở dưới, nên thầy vẫn lật lại được đơn cũ.
 */

import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';

export function useTimDon() {
  const { don } = useLocalSearchParams<{ don?: string }>();
  const cuon = useRef<ScrollView>(null);
  /** Mã đơn người dùng đã bấm "Xem cả danh sách" để bỏ ghim. */
  const [daBo, datDaBo] = useState<string | null>(null);

  // Bấm thông báo lúc đang cuộn dở thì kéo về đầu, vì thẻ ghim nằm trên đó.
  // Cuộn về 0 là phép tính không cần đo gì nên không hỏng được — khác hẳn mấy
  // bản trước phải tìm cho ra một thẻ rồi đo xem nó nằm đâu.
  useEffect(() => {
    if (!don) return;
    cuon.current?.scrollTo({ y: 0, animated: false });
  }, [don]);

  const boQua = useCallback(() => datDaBo(don ?? null), [don]);

  return { don: don && don !== daBo ? don : null, cuon, boQua };
}
