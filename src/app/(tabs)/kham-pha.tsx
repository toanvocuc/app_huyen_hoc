import { ChuaLam, ManHinh } from '@/components/man-hinh';
import { View } from 'react-native';

export default function KhamPha() {
  return (
    <ManHinh tieuDe="Khám phá" phu="Chiêm tinh và thần số học">
      <View className="gap-4">
        {/* Logic đã có sẵn trong lib/zodiac.ts và lib/numerology.ts, chỉ còn phần màn hình. */}
        <ChuaLam viec="Cung hoàng đạo — tính cách, điểm mạnh, điểm yếu, độ hợp hai cung" />
        <ChuaLam viec="Thần số học — số chủ đạo và số vận mệnh" />
      </View>
    </ManHinh>
  );
}
