/**
 * Bấm thông báo thì nhảy tới đúng đơn, không phải đầu danh sách.
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
 * ───────────────────────────────────── VÌ SAO measureLayout CHỨ KHÔNG onLayout
 *
 * Bản đầu tôi đọc `e.nativeEvent.layout.y` trong `onLayout` rồi cuộn tới đó.
 * Sai, và đo ra mới thấy: `layout.y` là toạ độ so với THẺ CHA, không phải so
 * với vùng cuộn.
 *
 * Đơn đang chờ nằm ngay dưới đầu trang nên hai con số gần bằng nhau, nhìn qua
 * tưởng chạy đúng. Đơn trong mục Lịch sử thì nằm sâu trong hai lớp View, toạ độ
 * lệch hẳn — màn hình đứng im ở đầu trang trong khi thẻ vẫn sáng lên, nên nhìn
 * lại càng giống như đã chạy.
 *
 * `measureLayout` đo đúng khoảng cách tới vùng cuộn, bao nhiêu lớp cũng đúng.
 */

import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScrollView, View } from 'react-native';

/** Chừa một khoảng phía trên thẻ, để nó không dính sát mép màn. */
const CHUA_TREN = 90;

/** Tô sáng bao lâu rồi tắt. Đủ để mắt bắt được, không lâu tới mức phiền. */
const SANG_TRONG = 2600;

/**
 * Cho cuộn lại nhiều nhất bao nhiêu lượt cho mỗi đơn.
 *
 * ĐẾM LƯỢT chứ không hẹn giờ. Bản trước tôi mở một cửa sổ 2,5 giây tính từ lúc
 * nhận mã đơn, và nó hỏng ở màn thầy: màn đó gọi `lamMoi()` mỗi lần hiện lên,
 * lệnh ấy xoá danh sách về rỗng rồi nạp lại — thẻ bị tháo ra dựng lại sau khi
 * cửa sổ đã đóng, nên không còn lượt nào để cuộn. Màn hình đứng ở đầu trang.
 *
 * Tệ hơn: ở chế độ xem thử `lamMoi` là lệnh rỗng, nên phép thử của tôi không
 * bao giờ đi qua đường đó và báo là chạy tốt.
 *
 * Đếm lượt thì không phụ thuộc thời gian: nạp lại bao nhiêu lần cũng còn lượt.
 * `onLayout` chỉ nổ khi bố cục thật sự đổi, nên lúc mọi thứ đứng yên là hết nổ
 * — không có chuyện giành giật với tay khách đang tự cuộn.
 */
const SO_LUOT = 8;

export function useTimDon() {
  const { don } = useLocalSearchParams<{ don?: string }>();
  const cuon = useRef<ScrollView>(null);
  /** Chỉ thẻ CẦN TÌM mới mang mốc này, mấy thẻ khác không cần đo đạc gì. */
  const the = useRef<View>(null);
  const conLuot = useRef(0);
  const maCu = useRef<string | null>(null);
  const [sang, datSang] = useState<string | null>(null);

  // Tắt đèn sau một lúc.
  useEffect(() => {
    if (!sang) return;
    const hen = setTimeout(() => datSang(null), SANG_TRONG);
    return () => clearTimeout(hen);
  }, [sang]);

  const khiLayout = useCallback(() => {
    if (!don) return;

    // So mã NGAY TRONG hàm này chứ không trong một hiệu ứng: hiệu ứng chạy sau
    // layout, nên lượt đo đầu tiên của đơn mới sẽ đọc phải số lượt cũ đã cạn.
    if (maCu.current !== don) {
      maCu.current = don;
      conLuot.current = SO_LUOT;
    }
    if (conLuot.current <= 0) return;
    conLuot.current -= 1;

    const node = the.current;
    const khung = cuon.current;
    if (!node || !khung) return;

    // ScrollView bọc nội dung trong một lớp nữa; đo so với lớp đó mới ra đúng
    // khoảng cần cuộn. Kiểu của React Native không khai hàm lấy lớp trong nên
    // phải hỏi mềm, và lùi về chính ScrollView khi không có.
    const trong =
      (khung as unknown as { getInnerViewNode?: () => unknown }).getInnerViewNode?.() ?? khung;

    node.measureLayout(
      trong as never,
      (_x, y) => {
        khung.scrollTo({ y: Math.max(0, y - CHUA_TREN), animated: true });
        datSang(don);
      },
      () => {
        // Đo hỏng thì thôi, vẫn tô sáng để mắt tự tìm.
        datSang(don);
      }
    );
  }, [don]);

  /**
   * Gắn vào thẻ đơn. Chỉ thẻ đúng mã cần tìm mới nhận mốc và hàm đo;
   * mấy thẻ còn lại nhận một vật rỗng nên không tốn gì.
   */
  const ganThe = useCallback(
    (ma: string) => (don && ma === don ? { ref: the, onLayout: khiLayout } : {}),
    [don, khiLayout]
  );

  return { don: don ?? null, cuon, ganThe, sang };
}
