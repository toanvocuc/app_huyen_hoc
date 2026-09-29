import { Text, View } from 'react-native';

import { LaBai } from '@/components/la-bai';
import { ManHinh, Nut, Trong } from '@/components/nen';
import { layPhien } from '@/lib/phien-rut';

export default function ChiaSe() {
  const phien = layPhien();
  const la = phien?.cacLa[0];

  return (
    <ManHinh quayLai tieuDe="Chia sẻ" phu="Xem trước ảnh sẽ đăng.">
      {!la ? (
        <Trong loi="Chưa có kết quả nào để chia sẻ." />
      ) : (
        <View>
          <View className="items-center rounded-2xl bg-nen-nhat px-6 py-8">
            <LaBai daRut={la} rong={150} />
            <Text className="mt-5 text-center text-xl font-bold text-chu-chinh">{la.la.tenVi}</Text>
            <Text className="mt-1.5 text-center text-xs font-semibold uppercase tracking-widest text-vang">
              {la.la.tuKhoa}
            </Text>
            <Text className="mt-4 text-center text-sm leading-6 text-chu-phu" numberOfLines={3}>
              {la.la.yNghiaXuoi}
            </Text>
            <Text className="mt-6 text-xs text-chu-mo">Huyền Học</Text>
          </View>

          {/* Còn thiếu: kết xuất khối trên thành ảnh rồi lưu và chia sẻ, mục G01 và G02 */}
          <View className="mt-6 gap-3">
            <Nut nhan="Lưu vào máy" onPress={() => {}} />
            <Nut nhan="Chia sẻ" kieu="vien" onPress={() => {}} />
          </View>
        </View>
      )}
    </ManHinh>
  );
}
