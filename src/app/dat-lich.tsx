/**
 * Màn đặt lịch tư vấn.
 *
 * Đây là phần ruột của app sau khi đổi trục. Trước đây bấm vào thầy là mở thẳng
 * Zalo — làm vậy thì app không có việc gì của riêng mình, chỉ là lối tắt sang
 * ứng dụng khác, và Apple có điều 4.2 dành riêng cho loại đó.
 *
 * Thứ tự ở đây có chủ ý: GHI XUỐNG MÁY CHỦ TRƯỚC, mở Zalo sau. Hỏng bước Zalo
 * thì yêu cầu vẫn nằm đó, thầy vẫn thấy, khách vẫn theo dõi được trong mục Lịch
 * của tôi. Làm ngược lại là khách nhắn xong mà app không có dấu vết gì.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ChuThan, Khoi, ManHinh, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { luuHoSo, useHoSo } from '@/lib/ho-so';
import { useChuyenGia } from '@/lib/kho-noi-dung';
import { guiYeuCau, KHUNG_GIO, tachChuDe } from '@/lib/yeu-cau';

/** Dài tối thiểu cho câu hỏi. Ngắn hơn thì thầy không có gì để bắt đầu. */
const TOI_THIEU = 15;

/**
 * Dài tối thiểu cho ô liên lạc.
 *
 * Số điện thoại Việt Nam ngắn nhất cũng chín chữ số. Không kiểm chặt hơn: khách
 * có thể dán đường dẫn Zalo, số có dấu chấm, hay số nước ngoài — bắt đúng khuôn
 * thì chặn nhầm người thật, mà người gõ bừa thì vẫn gõ bừa được.
 */
const TOI_THIEU_LIEN_HE = 9;

/**
 * Chọn được trong bao nhiêu ngày tới.
 *
 * 30 ngày: xa hơn thì thầy không giữ lịch nổi, mà khách cũng không biết tháng
 * sau mình bận gì. Ngày sớm nhất là hôm nay.
 */
const SO_NGAY_CHON = 30;

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Dãy ngày từ hôm nay, kèm nhãn ngắn để vẽ. Tính theo giờ máy, không theo UTC. */
function dayNgay() {
  const hom = new Date();
  hom.setHours(0, 0, 0, 0);
  return Array.from({ length: SO_NGAY_CHON }, (_, i) => {
    const d = new Date(hom.getTime() + i * 86400000);
    const hai = (n: number) => String(n).padStart(2, '0');
    return {
      // yyyy-mm-dd theo giờ máy. Dùng toISOString là lệch một ngày với mọi múi
      // giờ phía đông, mà Việt Nam thì lệch bảy tiếng.
      gia: `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`,
      thu: i === 0 ? 'Hôm nay' : i === 1 ? 'Mai' : THU[d.getDay()],
      ngay: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });
}

export default function DatLich() {
  const { thay: maThay } = useLocalSearchParams<{ thay: string }>();
  const { dong } = useChuyenGia();
  const { hoSo } = useHoSo();
  const thay = useMemo(() => dong?.find((t) => t.ma === maThay) ?? null, [dong, maThay]);

  const chuDe = tachChuDe(thay?.chuyen_sau);
  const [chonChuDe, datChonChuDe] = useState<string | null>(null);
  const [chonGio, datChonGio] = useState<string | null>(null);
  const cacNgay = useMemo(() => dayNgay(), []);
  const [chonNgay, datChonNgay] = useState<string>(() => dayNgay()[0].gia);
  const [cauHoi, datCauHoi] = useState('');
  // Điền sẵn từ hồ sơ. Khách đặt lần hai không phải gõ lại số của mình.
  const [lienHe, datLienHe] = useState('');
  const [daNapLienHe, datDaNapLienHe] = useState(false);
  const [dangGui, datDangGui] = useState(false);
  const [loi, datLoi] = useState<string | null>(null);

  // Hồ sơ về sau lúc nào cũng được, nên nạp một lần khi nó tới chứ không đọc
  // thẳng trong giá trị khởi tạo — lúc dựng màn nó thường còn null.
  if (!daNapLienHe && hoSo) {
    if (hoSo.lien_he) datLienHe(hoSo.lien_he);
    datDaNapLienHe(true);
  }

  // Thầy chỉ khai một mảng thì không có gì để chọn, tự lấy luôn.
  const chuDeThat = chonChuDe ?? (chuDe.length === 1 ? chuDe[0] : null);
  const duDieuKien = Boolean(
    chuDeThat &&
      chonGio &&
      chonNgay &&
      cauHoi.trim().length >= TOI_THIEU &&
      lienHe.trim().length >= TOI_THIEU_LIEN_HE
  );

  async function gui() {
    if (!thay || !chuDeThat || !chonGio) return;
    datLoi(null);
    datDangGui(true);
    try {
      // Lưu đường liên lạc vào hồ sơ TRƯỚC khi gửi đơn. Thầy đọc nó từ hồ sơ
      // chứ không từ đơn, nên chưa lưu kịp là thầy mở đơn ra thấy trống.
      if (lienHe.trim() && lienHe.trim() !== hoSo?.lien_he) {
        await luuHoSo({ lien_he: lienHe.trim() });
      }

      await guiYeuCau({
        chuyenGia: thay.ma,
        chuDe: chuDeThat,
        khungGio: chonGio,
        ngayHen: chonNgay,
        cauHoi,
        // Chép tên sang đơn để thầy biết xưng hô với ai. Thầy không đọc được
        // bảng hồ sơ của khách — luật khoá dòng chặn — nên không chép là thầy
        // chỉ thấy một dãy ký tự.
        tenKhach: hoSo?.ho_ten,
      });
      // Sang thẳng mục Lịch của tôi, KHÔNG tự mở Zalo nữa.
      //
      // Tự mở là chọn hộ khách một kênh — khách không dùng Zalo thì bị đẩy sang
      // một ứng dụng họ không có — và nó hất khách ra khỏi app đúng lúc vừa đặt
      // xong, chưa kịp nhìn thấy đơn của mình nằm đâu. Bên Lịch của tôi có đủ
      // mấy nơi liên hệ của thầy để khách tự chọn.
      router.replace('/lich-cua-toi');
    } catch (e) {
      datLoi(e instanceof Error ? e.message : 'Chưa gửi được, thử lại giúp tôi.');
      datDangGui(false);
    }
  }

  if (!thay) {
    return (
      <ManHinh quayLai tieuDe="Đặt lịch">
        <Trong loi="Không tìm thấy chuyên gia này. Quay lại danh sách rồi chọn lại giúp tôi." />
      </ManHinh>
    );
  }

  return (
    <ManHinh quayLai tieuDe="Đặt lịch tư vấn" phu={`Với ${thay.ten}`}>
      {chuDe.length > 1 ? (
        <View className="mb-7">
          <Nhan>Bạn muốn hỏi về</Nhan>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {chuDe.map((c) => (
              <O key={c} nhan={c} chon={chuDeThat === c} onPress={() => datChonChuDe(c)} />
            ))}
          </View>
        </View>
      ) : null}

      <View className="mb-7">
        <Nhan>Bạn muốn gặp ngày nào</Nhan>
        {/* Dải ngang chứ không phải bánh xe ba cột như lúc nhập ngày sinh: ở đây
            chỉ chọn trong 30 ngày tới, lướt ngang nhanh hơn quay ba con lăn. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2 -mx-5"
          contentContainerClassName="px-5 gap-2">
          {cacNgay.map((n) => {
            const chon = chonNgay === n.gia;
            return (
              <Pressable
                key={n.gia}
                onPress={() => datChonNgay(n.gia)}
                style={{
                  borderColor: chon ? MAU.vang : MAU.vien,
                  backgroundColor: chon ? MAU.vangRatMo : 'transparent',
                }}
                className="min-w-[66px] items-center rounded-xl border px-3 py-2.5 active:opacity-70">
                <Text
                  style={{ fontFamily: CHU.than }}
                  className={`text-[11px] ${chon ? 'text-vang' : 'text-chu-mo'}`}>
                  {n.thu}
                </Text>
                <Text
                  style={{ fontFamily: chon ? CHU.thanDam : CHU.than }}
                  className={`mt-0.5 text-sm ${chon ? 'text-vang' : 'text-chu-chinh'}`}>
                  {n.ngay}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="mb-7">
        <Nhan>Trong ngày đó bạn rảnh lúc nào</Nhan>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {KHUNG_GIO.map((g) => (
            <O key={g} nhan={g} chon={chonGio === g} onPress={() => datChonGio(g)} />
          ))}
        </View>
      </View>

      <View className="mb-7">
        <Nhan>Thầy liên lạc với bạn bằng gì</Nhan>
        <Text style={{ fontFamily: CHU.than }} className="mb-2 mt-1 text-xs leading-5 text-chu-mo">
          Số điện thoại hoặc đường dẫn Zalo. Chỉ thầy bạn chọn mới thấy được.
        </Text>
        <TextInput
          value={lienHe}
          onChangeText={datLienHe}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="0912345678 hoặc zalo.me/..."
          placeholderTextColor={MAU.chuMo}
          style={{ fontFamily: CHU.than, color: MAU.chuChinh, borderColor: MAU.vien }}
          className="rounded-2xl border bg-nen-nhat px-4 py-3.5 text-base"
        />
      </View>

      <View className="mb-7">
        <Nhan>Câu hỏi của bạn</Nhan>
        <Text style={{ fontFamily: CHU.than }} className="mb-2 mt-1 text-xs leading-5 text-chu-mo">
          Viết càng rõ hoàn cảnh thì thầy càng trả lời được sát. Chỉ mình thầy đọc được.
        </Text>
        <TextInput
          value={cauHoi}
          onChangeText={datCauHoi}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          placeholder="Ví dụ: em đang phân vân giữa hai lời mời làm việc…"
          placeholderTextColor={MAU.chuMo}
          style={{
            fontFamily: CHU.than,
            color: MAU.chuChinh,
            borderColor: MAU.vien,
            minHeight: 120,
          }}
          className="rounded-2xl border bg-nen-nhat p-4 text-base leading-6"
        />
      </View>

      <Khoi>
        <Nhan>Sau khi gửi</Nhan>
        <ChuThan>
          Yêu cầu nằm trong mục Lịch của tôi, bạn theo dõi được thầy đã nhận chưa. Ở đó cũng
          có sẵn mấy nơi liên hệ của thầy để bạn nhắn trực tiếp. Tiền trả thẳng cho thầy,
          Omora không thu hộ.
        </ChuThan>
      </Khoi>

      {loi ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-5 text-sm leading-5 text-canh">
          {loi}
        </Text>
      ) : null}

      <VanNgan />

      <Nut nhan="Gửi yêu cầu" tat={!duDieuKien} dangChay={dangGui} onPress={gui} />
      {!duDieuKien && cauHoi.trim().length > 0 && cauHoi.trim().length < TOI_THIEU ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-3 text-center text-xs text-chu-mo">
          Viết thêm vài chữ nữa giúp tôi.
        </Text>
      ) : null}
    </ManHinh>
  );
}

/** Một ô chọn. Dùng chung cho chủ đề và khung giờ nên không đặt tên theo việc nào cả. */
function O({ nhan, chon, onPress }: { nhan: string; chon: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      // Nền và viền đặt bằng style chứ không bằng lớp Tailwind: bộ màu trong
      // tailwind.config.js không khai vangRatMo, mà lớp không có thật thì
      // NativeWind bỏ qua im lặng — ô được chọn trông y hệt ô chưa chọn.
      style={{
        borderColor: chon ? MAU.vang : MAU.vien,
        backgroundColor: chon ? MAU.vangRatMo : 'transparent',
      }}
      className="rounded-xl border px-4 py-2.5 active:opacity-70">
      <Text
        style={{ fontFamily: chon ? CHU.thanDam : CHU.than }}
        className={`text-sm ${chon ? 'text-vang' : 'text-chu-chinh'}`}>
        {nhan}
      </Text>
    </Pressable>
  );
}
