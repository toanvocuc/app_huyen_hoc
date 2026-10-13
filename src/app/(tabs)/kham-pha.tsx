import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { ManHinh, Nhan, Trong } from '@/components/nen';
import { NenTinhVan } from '@/components/nen-anh';
import { CHU, MAU } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { soChuDao } from '@/lib/numerology';
import { cungTheoNgay, timCung, type MaCung } from '@/lib/zodiac';

export default function KhamPha() {
  const { hoSo } = useHoSo();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = ma ? timCung(ma) : null;
  const so = ns ? soChuDao(ns.ngay, ns.thang, ns.nam) : null;

  return (
    <ManHinh
      tieuDe="Khám phá"
      phu="Chiêm tinh phương Tây và thần số học."
      nenPhu={<NenTinhVan />}>
      {!ns ? (
        <Trong loi="Chưa có ngày sinh. Vào mục Cá nhân điền ngày sinh rồi quay lại." />
      ) : (
        <View>
          {ma && cung ? <HuyHieu ma={ma} ten={cung.ten} /> : null}

          <View className="gap-4">
            {/* Không nhắc lại tên cung ở đây: huy hiệu ngay phía trên đã nói
                rồi, đọc liền hai lần nghe như máy lặp. */}
            <The
              nhan="Cung hoàng đạo"
              ten="Tử vi và tính cách"
              mo={`Hôm nay, tuần này, và ${cung ? cung.ten : 'cung của bạn'} vốn là người thế nào`}
              onPress={() => router.push('/cung')}
            />
            <The
              nhan="Độ hợp"
              ten="Bạn và người ấy"
              mo="So hai cung hoàng đạo với nhau"
              onPress={() => router.push('/cung/do-hop')}
            />
            <The
              nhan="Thần số học"
              ten={so ? `Số chủ đạo ${so}` : ''}
              mo="Số chủ đạo từ ngày sinh và số vận mệnh từ họ tên"
              onPress={() => router.push('/than-so')}
            />
            <The
              nhan="Hỏi người thật"
              ten="Chuyên gia"
              mo="Khi muốn hỏi một câu cụ thể mà app chưa trả lời được"
              onPress={() => router.push('/chuyen-gia')}
            />
          </View>
        </View>
      )}
    </ManHinh>
  );
}

/**
 * Huy hiệu cung của khách, đặt làm vật thể lớn mở đầu màn.
 *
 * Ảnh vòng hoàng đạo CHỈ làm vân nền chứ không làm vai chính: đo ra độ sáng
 * trung bình của nó là 27 trên 255, chỗ sáng nhất cũng chỉ tới 106 — thu về
 * đường kính 190 thì gần như là một khoanh đen. Ký hiệu cung vẽ bằng nét SVG
 * vàng mới là thứ nhìn ra được, nên nó nằm trên cùng và ăn phần lớn vòng tròn.
 */
function HuyHieu({ ma, ten }: { ma: MaCung; ten: string }) {
  return (
    <View className="mb-8 items-center">
      <View
        style={{ borderColor: MAU.vangMo }}
        className="h-[196px] w-[196px] items-center justify-center overflow-hidden rounded-full border">
        <Image
          source={require('@/assets/nen/vong-hoang-dao.jpg')}
          style={{ position: 'absolute', width: 196, height: 196 }}
          contentFit="cover"
        />
        {/* Vòng trong, để ký hiệu không trôi nổi giữa một mảng vân. */}
        <View
          style={{ borderColor: MAU.vangMo }}
          className="h-[118px] w-[118px] items-center justify-center rounded-full border bg-nen/70">
          <BieuTuongCung ma={ma} co={62} />
        </View>
      </View>
      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
        className="mt-4 text-chu-chinh">
        {ten}
      </Text>
      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1.6 }}
        className="mt-1 text-[11px] uppercase text-vang">
        Cung của bạn
      </Text>
    </View>
  );
}

function The({ nhan, ten, mo, onPress }: { nhan: string; ten: string; mo: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl bg-nen-nhat p-5 active:opacity-70">
      <View className="flex-1 pr-3">
        <Nhan>{nhan}</Nhan>
        {ten ? <Text style={{ fontFamily: CHU.thanDam }} className="text-lg text-chu-chinh">{ten}</Text> : null}
        <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">{mo}</Text>
      </View>
      <Text style={{ fontFamily: CHU.than }} className="text-lg text-vang">›</Text>
    </Pressable>
  );
}
