import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ManHinh, Nhan, Nut } from '@/components/nen';
import { MAU } from '@/constants/giao-dien';
import { kiemNgaySinh, luuHoSo, type GioiTinh } from '@/lib/ho-so';

const GIOI: { ma: GioiTinh; ten: string }[] = [
  { ma: 'nam', ten: 'Nam' },
  { ma: 'nu', ten: 'Nữ' },
  { ma: 'khac', ten: 'Khác' },
];

export default function ThongTin() {
  const [hoTen, setHoTen] = useState('');
  const [ngay, setNgay] = useState('');
  const [thang, setThang] = useState('');
  const [nam, setNam] = useState('');
  const [gio, setGio] = useState('');
  const [phut, setPhut] = useState('');
  const [gioiTinh, setGioiTinh] = useState<GioiTinh | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const duNgay = ngay.length > 0 && thang.length > 0 && nam.length === 4;
  const choPhep = hoTen.trim().length > 0 && duNgay && gioiTinh !== null;

  async function tiep() {
    const bao = kiemNgaySinh(Number(ngay), Number(thang), Number(nam));
    if (bao) {
      setLoi(bao);
      return;
    }
    setLoi(null);
    setDangLuu(true);
    try {
      await luuHoSo({
        ho_ten: hoTen.trim(),
        ngay_sinh: `${nam}-${thang.padStart(2, '0')}-${ngay.padStart(2, '0')}`,
        gio_sinh: gio ? `${gio.padStart(2, '0')}:${(phut || '0').padStart(2, '0')}` : null,
        gioi_tinh: gioiTinh,
      });
      router.push('/nhap-ho-so/noi-sinh');
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Chưa lưu được, thử lại giúp tôi');
    } finally {
      setDangLuu(false);
    }
  }

  return (
    <ManHinh quayLai tieuDe="Đôi điều về bạn" phu="Cần ngày sinh để tính cung và số chủ đạo.">
      <Nhan>Họ và tên</Nhan>
      <TextInput
        value={hoTen}
        onChangeText={setHoTen}
        placeholder="Nguyễn Văn An"
        placeholderTextColor={MAU.chuMo}
        className="min-h-[52px] rounded-xl border border-vien bg-nen-nhat px-4 text-base text-chu-chinh"
      />

      <View className="mt-6">
        <Nhan>Ngày sinh</Nhan>
        <View className="flex-row gap-3">
          <OSo gia={ngay} dat={setNgay} goi="Ngày" dai={2} />
          <OSo gia={thang} dat={setThang} goi="Tháng" dai={2} />
          <OSo gia={nam} dat={setNam} goi="Năm" dai={4} rong />
        </View>
      </View>

      <View className="mt-6">
        <Nhan>Giờ sinh</Nhan>
        <View className="flex-row gap-3">
          <OSo gia={gio} dat={setGio} goi="Giờ" dai={2} />
          <OSo gia={phut} dat={setPhut} goi="Phút" dai={2} />
          <View className="flex-1 justify-center">
            <Text className="text-xs leading-4 text-chu-mo">
              Không nhớ thì bỏ trống. Chỉ cần khi lập lá số.
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-6">
        <Nhan>Giới tính</Nhan>
        <View className="flex-row gap-3">
          {GIOI.map((g) => {
            const chon = gioiTinh === g.ma;
            return (
              <Pressable
                key={g.ma}
                onPress={() => setGioiTinh(g.ma)}
                className={`min-h-[52px] flex-1 items-center justify-center rounded-xl border active:opacity-70 ${
                  chon ? 'border-vang bg-vang/10' : 'border-vien bg-nen-nhat'
                }`}>
                <Text className={`text-base ${chon ? 'font-semibold text-vang' : 'text-chu-phu'}`}>
                  {g.ten}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loi ? <Text className="mt-5 text-sm leading-5 text-canh">{loi}</Text> : null}

      <View className="mt-7">
        <Nut nhan="Tiếp tục" tat={!choPhep} dangChay={dangLuu} onPress={tiep} />
      </View>
    </ManHinh>
  );
}

function OSo({
  gia,
  dat,
  goi,
  dai,
  rong,
}: {
  gia: string;
  dat: (v: string) => void;
  goi: string;
  dai: number;
  rong?: boolean;
}) {
  return (
    <TextInput
      value={gia}
      onChangeText={(v) => dat(v.replace(/[^0-9]/g, '').slice(0, dai))}
      placeholder={goi}
      placeholderTextColor={MAU.chuMo}
      keyboardType="number-pad"
      maxLength={dai}
      className={`min-h-[52px] rounded-xl border border-vien bg-nen-nhat px-4 text-center text-base text-chu-chinh ${
        rong ? 'flex-[1.4]' : 'flex-1'
      }`}
    />
  );
}
