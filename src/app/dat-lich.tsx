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
import { useEffect, useMemo, useState } from 'react';
import { Alert, AppState, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { BanhXeGioHen } from '@/components/banh-xe';
import { ChuThan, Khoi, ManHinh, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { cauThieu, thieuHoSo } from '@/lib/ho-so-thieu';
import { luuHoSo, useHoSo } from '@/lib/ho-so';
import { useChuyenGia } from '@/lib/kho-noi-dung';
import { tienGoi, useGoiTuVan } from '@/lib/goi';
import {
  GIO_MUON,
  GIO_SOM,
  gioSomNhat,
  hetGioHomNay,
  khungConDat,
} from '@/lib/nhac-hen-gio';
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

const hai = (n: number) => String(n).padStart(2, '0');

/**
 * Hôm nay dạng yyyy-mm-dd, theo giờ MÁY.
 *
 * Không dùng `toISOString().slice(0, 10)`: hàm đó đổi sang UTC trước khi cắt, nên
 * ở Việt Nam mọi lúc trước 7 giờ sáng đều ra ngày hôm trước.
 */
function homNay(): string {
  const d = new Date();
  return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
}

/** Dãy ngày tính từ một mốc cho trước, kèm nhãn ngắn để vẽ. */
function dayNgay(moc: string) {
  const [n, t, g] = moc.split('-').map(Number);
  // Dựng bằng ba con số chứ không truyền chuỗi vào `new Date`: truyền chuỗi
  // 'yyyy-mm-dd' thì Date hiểu theo UTC và cả dãy lệch một ngày.
  const hom = new Date(n, t - 1, g);
  return Array.from({ length: SO_NGAY_CHON }, (_, i) => {
    const d = new Date(hom.getTime() + i * 86400000);
    return {
      gia: `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`,
      thu: i === 0 ? 'Hôm nay' : i === 1 ? 'Mai' : THU[d.getDay()],
      ngay: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });
}

export default function DatLich() {
  const { thay: maThay, goi: maGoi } = useLocalSearchParams<{ thay: string; goi?: string }>();
  const { dong } = useChuyenGia();
  const { hoSo } = useHoSo();
  const thay = useMemo(() => dong?.find((t) => t.ma === maThay) ?? null, [dong, maThay]);

  // Thầy không khai ô `chuyen_sau` thì vẫn phải đặt được lịch.
  //
  // Trước đây chỗ này thành ngõ cụt kín: danh sách chủ đề rỗng nên phần chọn
  // bị ẩn đi (chỉ hiện khi có từ hai chủ đề), mà `chuDeThat` cũng không bao giờ
  // có giá trị nên nút GỬi nằm tắt vĩnh viễn — khách không có cách nào biết
  // thiếu gì, và cũng không phải lỗi của họ.
  const { dong: cacGoi } = useGoiTuVan(maThay);
  const [chonGoi, datChonGoi] = useState<string | null>(null);
  // Gói từ đường dẫn là gói khách vừa bấm bên hồ sơ; sau đó họ đổi ý ngay tại đây
  // cũng được, không phải quay ra bấm lại.
  const goi = cacGoi.find((g) => g.ma === (chonGoi ?? maGoi)) ?? null;

  const chuDe = tachChuDe(thay?.chuyen_sau);
  const chuDeChon = chuDe.length > 0 ? chuDe : ['Tư vấn chung'];
  const [chonChuDe, datChonChuDe] = useState<string | null>(null);
  const [chonGio, datChonGio] = useState<string | null>(null);
  /**
   * Giờ chính xác, khi khách muốn hẹn đúng một giờ chứ không phải một khoảng.
   *
   * Khoảng hai tiếng thì cả hai bên đều không giữ được giờ giấc, mà lời nhắc
   * trước buổi hẹn cũng chỉ đoán được giờ bắt đầu khung.
   */
  const [tuChonGio, datTuChonGio] = useState(false);
  const [gio, datGio] = useState(19);
  const [phut, datPhut] = useState(0);

  /**
   * Mốc "hôm nay", đọc lại mỗi khi app quay lại từ nền.
   *
   * Để app mở qua nửa đêm thì dãy ngày cũ bắt đầu từ HÔM QUA, ô đầu tiên vẫn
   * đề chợ "Hôm nay", và bấm Gửi là ghi xuống máy chủ một buổi hẹn đã trôi qua.
   * Không ai báo gì cả, vì về mặt dữ liệu thì đó vẫn là một ngày hợp lệ.
   */
  const [moc, datMoc] = useState(homNay);
  useEffect(() => {
    const o = AppState.addEventListener('change', (t) => {
      if (t === 'active') datMoc(homNay());
    });
    return () => o.remove();
  }, []);

  const cacNgay = useMemo(() => dayNgay(moc), [moc]);
  const [chonNgay, datChonNgay] = useState<string>(moc);
  // Chọn hôm qua rồi để sang ngày mới thì ó đã rớt khỏi dãy. Suy ra ở đây chứ
  // không đặt lại trạng thái trong hiệu ứng: đặt trong hiệu ứng là thêm một vòng
  // vẽ, mà eslint cũng bắt.
  const ngayThat = cacNgay.some((n) => n.gia === chonNgay) ? chonNgay : cacNgay[0].gia;

  /**
   * Khoảng giờ còn đặt được cho NGÀY ĐANG CHỌN.
   *
   * Hôm nay thì lùi theo đồng hồ: 8 giờ tối rồi mà vẫn chọn được 6 giờ sáng là
   * đặt một buổi hẹn nằm trong quá khứ, mà chẳng ai báo gì cả. Ngày mai trở đi
   * thì cứ từ giờ làm việc sớm nhất.
   */
  const gioSom = gioSomNhat(ngayThat, moc === homNay() ? new Date() : new Date(`${ngayThat}T00:00:00`));
  const hetGio = hetGioHomNay(ngayThat);
  // Kẹp lại cho khỏi rơi ra ngoài khoảng khi khách đổi sang ngày khác.
  const gioThat = Math.min(Math.max(gio, gioSom), GIO_MUON);
  const phutThat = gioThat >= GIO_MUON ? 0 : phut;
  const gioHen =
    tuChonGio && !hetGio
      ? `${String(gioThat).padStart(2, '0')}:${String(phutThat).padStart(2, '0')}`
      : null;
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
  const chuDeThat = chonChuDe ?? (chuDeChon.length === 1 ? chuDeChon[0] : null);

  /**
   * Còn thiếu gì, nói thành chứ.
   *
   * Trước đây chỉ có đúng một câu gợi ý, và câu đó chỉ nói về độ dài câu
   * hỏi. Bỏ trống ô liên lạc thì nút cứ nằm tắt, mà khách đã gõ câu hỏi xong
   * rồi nên họ tưởng app đang hỏng.
   */
  const thieu: string[] = [];
  if (cacGoi.length > 0 && !goi) thieu.push('chọn gói');
  if (!chuDeThat) thieu.push('chọn chủ đề');
  if (tuChonGio ? !gioHen : !chonGio) thieu.push('chọn giờ');
  if (lienHe.trim().length < TOI_THIEU_LIEN_HE) thieu.push('điền số điện thoại hoặc Zalo');
  if (cauHoi.trim().length < TOI_THIEU) thieu.push('viết câu hỏi dài thêm một chút');
  const duDieuKien = thieu.length === 0;

  /**
   * Hỏi trước khi gửi, nếu hồ sơ còn trống chỗ nào.
   *
   * KHÔNG chặn. Khách thiếu hồ sơ vẫn gửi được đơn — chặn lại là mất luôn người
   * muốn đặt. Chỉ nói thẳng họ đang thiếu gì, và rằng chuyên gia có thể phải
   * huỷ đơn vì không đủ thông tin để xem. Quyết định là của khách.
   *
   * Bấm "để tôi điền thêm" thì chỉ cho biết chỗ điền rồi thôi, không tự kéo họ
   * đi đâu cả: họ đang gõ dở một câu hỏi trên màn này, kéo đi là mất.
   */
  function bamGui() {
    const con = thieuHoSo(hoSo);
    if (con.length === 0) {
      void guiThat();
      return;
    }
    Alert.alert(
      'Hồ sơ của bạn còn thiếu',
      `Bạn chưa có ${cauThieu(con)}.\n\nVẫn gửi đơn được, nhưng chuyên gia có thể phải huỷ vì không đủ thông tin để xem cho bạn.`,
      [
        {
          text: 'Để tôi điền thêm',
          style: 'cancel',
          onPress: () =>
            Alert.alert(
              'Điền ở mục Cá nhân',
              'Bạn vào mục Cá nhân để điền thêm thông tin, rồi quay lại đặt lịch.',
              [{ text: 'OK' }]
            ),
        },
        { text: 'Vẫn gửi đơn', style: 'destructive', onPress: () => void guiThat() },
      ]
    );
  }

  async function guiThat() {
    if (!thay || !chuDeThat) return;
    if (tuChonGio ? !gioHen : !chonGio) return;
    if (cacGoi.length > 0 && !goi) return;
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
        // `khung_gio` là cột bắt buộc có, nên khách chọn giờ chính xác thì ghi
        // luôn giờ đó vào đây để mấy chỗ cũ chỉ đọc `khung_gio` vẫn hiện đúng.
        khungGio: gioHen ?? chonGio!,
        gioHen,
        ngayHen: ngayThat,
        cauHoi,
        // Chép tên sang đơn để thầy biết xưng hô với ai. Thầy không đọc được
        // bảng hồ sơ của khách — luật khoá dòng chặn — nên không chép là thầy
        // chỉ thấy một dãy ký tự.
        tenKhach: hoSo?.ho_ten,
        goi: goi?.ten ?? null,
        giaGoi: goi?.gia ?? null,
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
      {/* Gói đặt trên cùng: đó là thứ quyết định giá và thời lượng, nên khách cần
          thấy mình đang đặt cái gì trước khi khai mấy thứ còn lại. */}
      {cacGoi.length > 0 ? (
        <View className="mb-7">
          <Nhan>Bạn đặt gói nào</Nhan>
          <View className="mt-2 gap-2">
            {cacGoi.map((g) => {
              const chon = goi?.ma === g.ma;
              return (
                <Pressable
                  key={g.ma}
                  onPress={() => datChonGoi(g.ma)}
                  style={{
                    borderColor: chon ? MAU.vang : MAU.vien,
                    backgroundColor: chon ? MAU.vangRatMo : 'transparent',
                  }}
                  className="flex-row items-center justify-between gap-3 rounded-xl border px-4 py-3 active:opacity-70">
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: chon ? CHU.thanDam : CHU.than }}
                      className={`text-sm ${chon ? 'text-vang' : 'text-chu-chinh'}`}>
                      {g.ten}
                    </Text>
                    {g.phut ? (
                      <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-xs text-chu-mo">
                        {g.phut} phút
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={{ fontFamily: CHU.thanDam, color: chon ? MAU.vang : MAU.chuPhu }}
                    className="text-sm">
                    {tienGoi(g.gia)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ fontFamily: CHU.than }} className="mt-2 text-xs leading-5 text-chu-mo">
            Tiền trả thẳng cho thầy sau buổi tư vấn. Omora không thu hộ.
          </Text>
        </View>
      ) : null}

      {chuDeChon.length > 1 ? (
        <View className="mb-7">
          <Nhan>Bạn muốn hỏi về</Nhan>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {chuDeChon.map((c) => (
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
            const chon = ngayThat === n.gia;
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
            <O
              key={g}
              nhan={g}
              chon={!tuChonGio && chonGio === g}
              // Khung đã trôi qua trong hôm nay thì không bấm được. Tám giờ
              // tối mà vẫn đặt được 'Sáng, 9h tới 11h' của hôm nay là đặt vào
              // quá khứ.
              tat={!khungConDat(g, ngayThat)}
              onPress={() => {
                datTuChonGio(false);
                datChonGio(g);
              }}
            />
          ))}
          {/* Lựa chọn thứ năm: hẹn đúng một giờ thay vì một khoảng hai tiếng.
              Khoảng thì cả hai bên đều khó giữ giờ giấc, mà lời nhắc trước buổi
              hẹn cũng chỉ đoán được giờ bắt đầu khung. */}
          <O
            nhan={tuChonGio && gioHen ? `Đúng ${gioHen}` : 'Chọn giờ chính xác'}
            chon={tuChonGio}
            tat={hetGio}
            onPress={() => {
              datTuChonGio(true);
              datChonGio(null);
            }}
          />
        </View>

        {tuChonGio ? (
          <View className="mt-4">
            <BanhXeGioHen
              gio={gioThat}
              phut={phutThat}
              gioSom={gioSom}
              gioMuon={GIO_MUON}
              dat={(v: { gio?: number; phut?: number }) => {
                if (v.gio !== undefined) datGio(v.gio);
                if (v.phut !== undefined) datPhut(v.phut);
              }}
            />
            <Text
              style={{ fontFamily: CHU.than }}
              className="mt-2 text-xs leading-5 text-chu-mo">
              Nhận từ {GIO_SOM} giờ tới {GIO_MUON} giờ. Thầy sẽ thấy đúng giờ này trong đơn,
              và máy bạn nhắc trước một tiếng.
            </Text>
          </View>
        ) : null}

        {/* Hôm nay hết giờ nhận thì nói thẳng, đừng để khách ngồi đoán vì sao
            mọi ô đều bấm không được. */}
        {hetGio ? (
          <Text
            style={{ fontFamily: CHU.than }}
            className="mt-3 text-xs leading-5 text-canh">
            Hôm nay đã qua giờ nhận tư vấn ({GIO_SOM} giờ tới {GIO_MUON} giờ). Bạn chọn một
            ngày khác ở trên giúp tôi.
          </Text>
        ) : null}
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
          có sẵn mấy nơi liên hệ của thầy để bạn nhắn trực tiếp.
        </ChuThan>
      </Khoi>

      {loi ? (
        <Text style={{ fontFamily: CHU.than }} className="mt-5 text-sm leading-5 text-canh">
          {loi}
        </Text>
      ) : null}

      <VanNgan />

      <Nut nhan="Gửi yêu cầu" tat={!duDieuKien} dangChay={dangGui} onPress={bamGui} />
      {!duDieuKien ? (
        <Text
          style={{ fontFamily: CHU.than }}
          className="mt-3 text-center text-xs leading-5 text-chu-mo">
          Còn thiếu: {thieu.join(', ')}.
        </Text>
      ) : null}
    </ManHinh>
  );
}

/** Một ô chọn. Dùng chung cho chủ đề và khung giờ nên không đặt tên theo việc nào cả. */
function O({
  nhan,
  chon,
  tat,
  onPress,
}: {
  nhan: string;
  chon: boolean;
  /** Khung giờ đã trôi qua trong ngày đang chọn thì mờ đi và không bấm được. */
  tat?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={tat ? undefined : onPress}
      disabled={tat}
      accessibilityState={{ disabled: Boolean(tat), selected: chon }}
      // Nền và viền đặt bằng style chứ không bằng lớp Tailwind: bộ màu trong
      // tailwind.config.js không khai vangRatMo, mà lớp không có thật thì
      // NativeWind bỏ qua im lặng — ô được chọn trông y hệt ô chưa chọn.
      style={{
        borderColor: chon ? MAU.vang : MAU.vien,
        backgroundColor: chon ? MAU.vangRatMo : 'transparent',
        opacity: tat ? 0.32 : 1,
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
