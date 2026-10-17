/**
 * Một món hàng: ảnh to, mô tả, thông số, giá và bậc giá theo số lượng.
 *
 * Hai lối đi ra, cố ý khác nhau:
 *   • Thêm vào danh sách quan tâm — gom lại hỏi một lượt sau
 *   • Hỏi riêng món này           — mở thẳng danh sách với mỗi món này
 *
 * Không có nút nào tên là "mua", vì app không bán gì bên trong. Việc mua bán
 * diễn ra giữa khách và cửa hàng ở ngoài Zalo.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ChuThan, DangTai, Khoi, ManHinh, Nhan, Nut, Trong } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { dongBacGia, giaKemDonVi, giaTheoSoLuong, tien } from '@/lib/gian-hang';
import { dangQuanTam, themQuanTam, useQuanTam } from '@/lib/quan-tam';
import { anhSanPham, timSanPham, useSanPham } from '@/lib/san-pham';

export default function ManSanPham() {
  const { ma } = useLocalSearchParams<{ ma: string }>();
  const { dong, loi, dangTai } = useSanPham();
  // Đọc danh sách quan tâm để nút đổi mặt ngay khi vừa thêm xong.
  useQuanTam();
  const [soLuong, datSoLuong] = useState(1);
  const [vuaThem, datVuaThem] = useState(false);

  const mon = timSanPham(dong, ma);

  if (dangTai) {
    return (
      <ManHinh quayLai tieuDe="Đang mở">
        <DangTai />
      </ManHinh>
    );
  }

  if (!mon) {
    return (
      <ManHinh quayLai tieuDe="Không thấy món này">
        <Trong loi={loi ?? 'Món này không còn được bày nữa, hoặc đường dẫn đã cũ.'} />
        <View className="mt-5">
          <Nut nhan="Về khu trưng bày" kieu="vien" onPress={() => router.replace('/trung-bay')} />
        </View>
      </ManHinh>
    );
  }

  const anh = anhSanPham(mon.anh);
  const bac = dongBacGia(mon.bac_gia, mon.don_vi);
  const donGia = giaTheoSoLuong(mon.gia, mon.bac_gia, soLuong);
  const thongSo = (mon.thong_so ?? '')
    .split('\n')
    .map((d) => d.trim())
    .filter(Boolean);

  function them() {
    const duoc = themQuanTam(mon!.ma, soLuong);
    datVuaThem(duoc);
  }

  const daCo = dangQuanTam(mon.ma);

  return (
    <ManHinh quayLai tieuDe={mon.ten}>
      {anh ? (
        <Image
          source={{ uri: anh }}
          style={{ width: '100%', height: 320, borderRadius: 18 }}
          contentFit="cover"
        />
      ) : null}

      <View className="mt-5">
        <Text style={{ fontFamily: CHU.hoaDam, fontSize: 26, color: MAU.vang }}>
          {giaKemDonVi(mon.gia, mon.don_vi)}
        </Text>
        {bac.length > 0 ? (
          <View className="mt-2 gap-1">
            {bac.map((d) => (
              <Text key={d} style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
                {d}
              </Text>
            ))}
          </View>
        ) : null}
        {!mon.con_hang ? (
          <Text style={{ fontFamily: CHU.thanDam }} className="mt-2 text-sm text-canh">
            Tạm hết hàng. Bạn vẫn hỏi được, cửa hàng sẽ báo khi có lại.
          </Text>
        ) : null}
      </View>

      {mon.mo_ta ? (
        <View className="mt-6">
          <Nhan>Mô tả</Nhan>
          <ChuThan>{mon.mo_ta}</ChuThan>
        </View>
      ) : null}

      {thongSo.length > 0 ? (
        <View className="mt-6">
          <Nhan>Thông số</Nhan>
          <View className="mt-2 gap-2">
            {thongSo.map((d) => {
              const [nhan, ...con] = d.split(':');
              const gia = con.join(':').trim();
              return (
                <View key={d} className="flex-row gap-3">
                  <Text
                    style={{ fontFamily: CHU.than }}
                    className="w-[118px] text-xs leading-5 text-chu-mo">
                    {gia ? nhan.trim() : '•'}
                  </Text>
                  <Text
                    style={{ fontFamily: CHU.than }}
                    className="flex-1 text-sm leading-5 text-chu-chinh">
                    {gia || d}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View className="mt-7">
        <Nhan>Bạn muốn hỏi mấy {mon.don_vi}</Nhan>
        <View className="mt-2 flex-row items-center gap-4">
          <NutSo ky="remove" onPress={() => datSoLuong((n) => Math.max(1, n - 1))} tat={soLuong <= 1} />
          <Text
            style={{ fontFamily: CHU.thanDam, fontSize: 22 }}
            className="min-w-[48px] text-center text-chu-chinh">
            {soLuong}
          </Text>
          <NutSo ky="add" onPress={() => datSoLuong((n) => Math.min(99, n + 1))} tat={soLuong >= 99} />
          <View className="flex-1 items-end">
            <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
              Tạm tính
            </Text>
            <Text style={{ fontFamily: CHU.thanDam, color: MAU.vang }} className="text-base">
              {tien(donGia * soLuong)}
            </Text>
          </View>
        </View>
        {donGia !== mon.gia ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-2 text-xs leading-5 text-tot">
            Đã tính theo giá {tien(donGia)} một {mon.don_vi} cho mức số lượng này.
          </Text>
        ) : null}
      </View>

      <View className="mt-7 gap-2.5">
        <Nut
          nhan={daCo ? 'Thêm nữa vào danh sách quan tâm' : 'Thêm vào danh sách quan tâm'}
          kieu="vien"
          onPress={them}
        />
        <Nut nhan="Xem danh sách quan tâm" onPress={() => router.push('/quan-tam')} />
      </View>

      {vuaThem ? (
        <View className="mt-4 flex-row items-center justify-center gap-2">
          <Ionicons name="checkmark-circle" size={15} color={MAU.tot} />
          <Text style={{ fontFamily: CHU.than, color: MAU.tot }} className="text-xs">
            Đã thêm vào danh sách quan tâm
          </Text>
        </View>
      ) : null}

      <Khoi>
        <ChuThan>
          Omora chỉ bày hàng, không bán trong ứng dụng. Bạn gửi danh sách quan tâm cho cửa
          hàng qua Zalo, rồi hai bên thống nhất giá và cách gửi hàng ở ngoài đó.
        </ChuThan>
      </Khoi>
    </ManHinh>
  );
}

function NutSo({ ky, onPress, tat }: { ky: 'add' | 'remove'; onPress: () => void; tat?: boolean }) {
  return (
    <Pressable
      onPress={tat ? undefined : onPress}
      disabled={tat}
      style={{ borderColor: tat ? MAU.vien : MAU.vang, opacity: tat ? 0.4 : 1 }}
      className="h-12 w-12 items-center justify-center rounded-full border active:opacity-60">
      <Ionicons name={ky} size={20} color={tat ? MAU.chuMo : MAU.vang} />
    </Pressable>
  );
}
