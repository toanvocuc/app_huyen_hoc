import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, Switch, Text, View } from 'react-native';

import { DangTai, Khoi, ManHinh, Nhan, Trong } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { luuHoSo, useHoSo } from '@/lib/ho-so';
import {
  daCoQuyen,
  dangKyMaDay,
  datLichLaBai,
  huyLichLaBai,
  vuongMacMaDay,
  xinQuyen,
} from '@/lib/thong-bao';

const GIO = ['06:00', '07:00', '08:00', '20:00', '21:00'];

export default function CaiDatThongBao() {
  const { hoSo, setHoSo } = useHoSo();
  const [coQuyen, setCoQuyen] = useState<boolean | null>(null);
  const [dangXin, setDangXin] = useState(false);

  // Khách có thể sang phần cài đặt của máy rồi quay lại, nên đọc lại quyền mỗi lần
  // màn này hiện lên chứ không chỉ đọc một lần lúc dựng.
  useFocusEffect(
    useCallback(() => {
      daCoQuyen().then(setCoQuyen);
    }, [])
  );

  const laBai = hoSo?.nhac_la_bai ?? true;
  const tinTuc = hoSo?.nhac_tin_tuc ?? false;
  const dangChon = (hoSo?.gio_nhac ?? '07:00').slice(0, 5);
  const vuongMac = vuongMacMaDay();

  /** Lưu một thay đổi, cập nhật màn hình ngay rồi mới gửi lên máy chủ. */
  async function luu(phan: Parameters<typeof luuHoSo>[0]) {
    setHoSo((h) => (h ? { ...h, ...phan } : h));
    try {
      await luuHoSo(phan);
    } catch (e) {
      console.warn('[thong-bao]', e);
    }
  }

  async function doiLaBai(bat: boolean) {
    if (bat) {
      // Chỉ hỏi quyền đúng lúc khách vừa tỏ ý muốn nhận, không hỏi lúc mở app.
      const duoc = await xinQuyen();
      setCoQuyen(duoc);
      if (!duoc) return; // Khách từ chối thì công tắc giữ nguyên ở vị trí tắt.
      await datLichLaBai(hoSo?.gio_nhac ?? '07:00');
    } else {
      await huyLichLaBai();
    }
    await luu({ nhac_la_bai: bat });
  }

  async function doiTinTuc(bat: boolean) {
    if (bat) {
      const duoc = await xinQuyen();
      setCoQuyen(duoc);
      if (!duoc) return;
      await dangKyMaDay();
    }
    await luu({ nhac_tin_tuc: bat });
  }

  async function doiGio(g: string) {
    await luu({ gio_nhac: g });
    if (laBai && coQuyen) await datLichLaBai(g);
  }

  async function batQuyen() {
    setDangXin(true);
    try {
      const duoc = await xinQuyen();
      setCoQuyen(duoc);
      if (duoc) {
        if (laBai) await datLichLaBai(hoSo?.gio_nhac ?? '07:00');
        await dangKyMaDay();
      } else {
        // Hộp thoại của hệ điều hành chỉ hiện một lần. Từ lần sau phải vào cài đặt máy.
        Linking.openSettings().catch(() => {});
      }
    } finally {
      setDangXin(false);
    }
  }

  // Chưa đọc xong quyền thì chưa vẽ gì. Vẽ sớm là lần sơn đầu tiên hiện công tắc ở
  // trạng thái bật rồi mới nhảy về tắt, khách kịp nhìn thấy cái nháy đó.
  if (coQuyen === null) {
    return (
      <ManHinh quayLai tieuDe="Thông báo">
        <DangTai />
      </ManHinh>
    );
  }

  return (
    <ManHinh quayLai tieuDe="Thông báo">
      {coQuyen === false ? (
        <View className="mb-5">
          <Khoi vien>
            <Nhan>Chưa bật thông báo</Nhan>
            <Text
              style={{ fontFamily: CHU.than }}
              className="text-[15px] leading-7 text-chu-chinh">
              Mỗi sáng app gửi cho bạn một lá bài của ngày. Chỉ một tin, đúng giờ bạn chọn, và
              tắt lúc nào cũng được.
            </Text>
            <Pressable
              onPress={batQuyen}
              disabled={dangXin}
              className="mt-4 min-h-[48px] justify-center rounded-xl bg-vang px-5 active:opacity-80">
              <Text style={{ fontFamily: CHU.thanDam }} className="text-center text-nen">
                {dangXin ? 'Đang xin quyền…' : 'Bật thông báo'}
              </Text>
            </Pressable>
          </Khoi>
        </View>
      ) : null}

      <Khoi>
        <Dong
          nhan="Lá bài hôm nay"
          mo="Mỗi sáng một lá"
          gia={coQuyen && laBai}
          tat={!coQuyen}
          dat={doiLaBai}
        />
        <View className="h-px bg-vien" />
        <Dong
          nhan="Tin từ ứng dụng"
          mo="Thỉnh thoảng, không nhiều"
          gia={coQuyen && tinTuc}
          tat={!coQuyen}
          dat={doiTinTuc}
        />
      </Khoi>

      <View className="mt-7">
        <Nhan>Giờ nhận lá bài</Nhan>
        <View className="flex-row flex-wrap gap-2">
          {GIO.map((g) => {
            const chon = dangChon === g;
            return (
              <Pressable
                key={g}
                onPress={() => doiGio(g)}
                className={`min-h-[44px] justify-center rounded-xl border px-5 active:opacity-70 ${
                  chon ? 'border-vang bg-vang/15' : 'border-vien bg-nen-nhat'
                }`}>
                <Text
                  style={{ fontFamily: chon ? CHU.thanDam : CHU.than }}
                  className={`text-base ${chon ? 'text-vang' : 'text-chu-phu'}`}>
                  {g}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {vuongMac && tinTuc ? (
        <View className="mt-5">
          <Trong loi={vuongMac} />
        </View>
      ) : null}

      <Text style={{ fontFamily: CHU.than }} className="mt-7 text-xs leading-5 text-chu-mo">
        Tắt hết thông báo ở đây vẫn không gỡ được quyền đã cấp cho app. Muốn gỡ hẳn thì vào phần
        cài đặt của máy.
      </Text>
    </ManHinh>
  );
}

function Dong({
  nhan,
  mo,
  gia,
  dat,
  tat,
}: {
  nhan: string;
  mo: string;
  gia: boolean;
  dat: (v: boolean) => void;
  /** Chưa có quyền thì công tắc mờ đi và không bấm được. */
  tat?: boolean;
}) {
  return (
    <View
      style={{ opacity: tat ? 0.45 : 1 }}
      className="min-h-[56px] flex-row items-center justify-between py-2">
      <View className="flex-1 pr-4">
        <Text style={{ fontFamily: CHU.thanVua }} className="text-base text-chu-chinh">
          {nhan}
        </Text>
        <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-sm text-chu-phu">
          {mo}
        </Text>
      </View>
      <Switch
        value={gia}
        onValueChange={dat}
        disabled={tat}
        trackColor={{ false: MAU.vien, true: MAU.vang }}
        thumbColor={MAU.chuChinh}
      />
    </View>
  );
}
