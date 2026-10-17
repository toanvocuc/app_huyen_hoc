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
 * Bám theo layout trong bao lâu, tính từ lúc nhận mã đơn.
 *
 * Cuộn đúng một lần là chưa đủ: mục Lịch sử mở ra sau, mấy thẻ trong đó vẽ dần,
 * nên nội dung còn xô lên xô xuống sau cú cuộn đầu. Mỗi lần layout đổi là đo
 * lại và cuộn lại, tới khi nó thôi đổi. Hết thời gian thì buông, để khách tự
 * cuộn không bị giật lại.
 */
const BAM_THEO = 2500;

export function useTimDon() {
  const { don } = useLocalSearchParams<{ don?: string }>();
  const cuon = useRef<ScrollView>(null);
  /** Chỉ thẻ CẦN TÌM mới mang mốc này, mấy thẻ khác không cần đo đạc gì. */
  const the = useRef<View>(null);
  // 0 = chưa bắt đầu đếm. Gọi Date.now() ngay trong lúc vẽ là gọi hàm không
  // thuần giữa kỳ vẽ, trình biên dịch React chặn — và chặn có lý.
  const batDau = useRef(0);
  const maCu = useRef<string | null>(null);
  const [sang, datSang] = useState<string | null>(null);

  useEffect(() => {
    if (maCu.current !== don) {
      maCu.current = don ?? null;
      // Đặt lại 0 để lượt layout đầu tiên của đơn mới tự bắt đầu đếm.
      batDau.current = 0;
    }
  }, [don]);

  // Tắt đèn tính từ lúc nhận mã đơn, không tính từ cú cuộn cuối — không thì
  // mỗi lần layout nhúc nhích là đèn lại sáng thêm một lượt.
  useEffect(() => {
    if (!don) return;
    const hen = setTimeout(() => datSang(null), BAM_THEO + SANG_TRONG);
    return () => clearTimeout(hen);
  }, [don]);

  const khiLayout = useCallback(() => {
    if (!don) return;
    // 0 nghĩa là đây chính là lượt layout đầu tiên — bắt đầu đếm từ đây.
    //
    // Bản trước tôi để hiệu ứng đặt mốc, mà hiệu ứng chạy SAU layout. Nên
    // cú đo duy nhất bị chính cổng thời gian này chặn lại: màn hình đứng yên
    // trong khi thẻ vẫn sáng lên, nên nhìn qua lại tưởng đã chạy đúng.
    if (batDau.current === 0) batDau.current = Date.now();
    else if (Date.now() - batDau.current > BAM_THEO) return;
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
