/**
 * Khung bọc đơn được ghim lên đầu sau khi bấm một thông báo.
 *
 * Dùng chung cho màn thầy và màn Lịch của tôi. Hai màn vẽ thẻ đơn khác nhau nên
 * chỗ này chỉ lo phần khung: cái nhãn nói vì sao đơn lại nằm trên đầu, và lối
 * thoát về danh sách đầy đủ.
 *
 * Phải có lối thoát. Ghim mà không gỡ được thì mỗi lần mở lại từ thông báo là
 * một đơn nằm chắn trên đầu, và người dùng không hiểu nó tới từ đâu.
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';

export function DonGhim({
  onBoQua,
  children,
}: {
  onBoQua: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-7">
      <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <Ionicons name="notifications" size={14} color={MAU.vang} />
          <Text
            style={{ fontFamily: CHU.thanDam, letterSpacing: 1.3, color: MAU.vang }}
            className="text-[11px] uppercase">
            Đơn trong thông báo
          </Text>
        </View>
        <Pressable onPress={onBoQua} hitSlop={10} className="active:opacity-60">
          <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu underline">
            Xem cả danh sách
          </Text>
        </Pressable>
      </View>

      {/* Viền vàng ôm lấy thẻ, để mắt tách ngay nó khỏi mấy thẻ bên dưới. */}
      <View
        style={{ borderColor: MAU.vang, borderWidth: 2, borderRadius: 18, padding: 2, margin: -4 }}>
        {children}
      </View>
    </View>
  );
}

/**
 * Bấm thông báo mà không còn thấy đơn đó đâu.
 *
 * Xảy ra thật: thầy dọn một đơn đã xong rồi bấm lại thông báo cũ của chính đơn
 * ấy. Im lặng thì thầy tưởng thông báo hỏng và bấm đi bấm lại.
 */
export function KhongConDon({ onBoQua }: { onBoQua: () => void }) {
  return (
    <View
      style={{ borderColor: MAU.vien }}
      className="mb-7 flex-row items-start gap-3 rounded-xl border bg-nen-nhat px-4 py-3.5">
      <Ionicons name="information-circle-outline" size={18} color={MAU.chuMo} />
      <View className="flex-1">
        <Text style={{ fontFamily: CHU.than }} className="text-sm leading-6 text-chu-phu">
          Đơn trong thông báo đó không còn trong danh sách này nữa.
        </Text>
        <Pressable onPress={onBoQua} hitSlop={8} className="mt-1 self-start active:opacity-60">
          <Text style={{ fontFamily: CHU.than }} className="text-sm text-vang underline">
            Đóng
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
