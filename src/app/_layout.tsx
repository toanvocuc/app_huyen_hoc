import '@/global.css';

import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
} from '@expo-google-fonts/be-vietnam-pro';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Chuong } from '@/components/chuong';
import { CHU, MAU } from '@/constants/giao-dien';
import { khiDoiTaiKhoan } from '@/lib/doi-tai-khoan';
import { datCoHoSo, docHoSo, ngheCoHoSo } from '@/lib/ho-so';
import { goHetNhacHen } from '@/lib/nhac-hen';
import { hoSoThayCuaToi } from '@/lib/thay';
import { batHienKhiDangMo, doiLoiNhac, dongBoNhacLaBai } from '@/lib/thong-bao';
import { useTraLoiThongBao, xoaTraLoiThongBao } from '@/lib/tra-loi-thong-bao';
import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

SplashScreen.preventAutoHideAsync();

// Khai một lần lúc nạp app, trước khi vẽ gì. Khai bên trong component thì thông
// báo nổ trước lúc component đó dựng xong sẽ vẫn bị nuốt.
batHienKhiDangMo();

export default function RootLayout() {
  const [xong, setXong] = useState(false);
  const [coHoSo, setCoHoSo] = useState(false);
  const [coPhien, setCoPhien] = useState(false);
  /**
   * Tài khoản đang đăng nhập có phải thầy không.
   *
   * Phải biết ngay lúc mở app. Thầy không có hồ sơ khách — không ngày sinh,
   * không cung — nên nếu chỉ xét `coHoSo` thì mở app lên là thầy bị đá thẳng
   * vào luồng nhập hồ sơ của khách và không thoát ra được.
   */
  const [laThay, setLaThay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  /**
   * Lượt dựng này là do máy vừa đổi sang người khác, không phải do mở app.
   *
   * Dùng ref chứ không dùng trạng thái: nó chỉ đổi cách `khoiDong` chạy, không
   * có gì để vẽ ra, mà đặt trạng thái ở đây là kéo thêm một vòng vẽ thừa.
   */
  const doiNguoi = useRef(false);
  const doan = useSegments();
  const [phongXong] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  /**
   * Mở app thì chỉ ĐỌC xem đã có phiên chưa, không tạo gì cả.
   *
   * Trước đây chỗ này tự tạo tài khoản ẩn danh ngay lần mở đầu. Làm vậy thì
   * khách không bao giờ được hỏi, và người muốn đăng nhập thật để hồ sơ theo
   * được sang máy khác thì đã lỡ mang một tài khoản ẩn danh rồi.
   */
  const khoiDong = useCallback(() => {
    setLoi(null);
    setXong(false);
    (XEM_THU
      ? Promise.resolve(true)
      : supabase.auth.getSession().then(({ data }) => Boolean(data.session))
    )
      .then(async (co) => {
        setCoPhien(co);
        if (!co) return null;
        // Hỏi tư cách thầy TRƯỚC khi đọc hồ sơ khách. Thầy thì không có hồ sơ
        // khách để mà đọc, hỏi cũng chỉ tốn một lượt gọi máy chủ.
        const thay = await hoSoThayCuaToi().catch(() => null);
        setLaThay(Boolean(thay));
        return thay ? null : docHoSo();
      })
      .then((h) => {
        const co = Boolean(h?.ngay_sinh);
        setCoHoSo(co);
        datCoHoSo(co);
        if (doiNguoi.current) {
          doiNguoi.current = false;
          // Đổi người thì phải hẹn LẠI theo hồ sơ người mới, không chỉ đổi câu
          // chữ: lịch nhắc nằm ở hệ điều hành nên nó sống qua cả lần đăng xuất.
          void dongBoNhacLaBai(h);
        } else {
          // Hẹn lại lời nhắc sáng bằng một câu khác. Lịch lặp hằng ngày giữ nguyên
          // chữ đã hẹn, nên không làm ở đây thì khách đọc đúng một câu suốt đời.
          // Hàm tự bỏ qua khi không có lịch nào đang treo.
          doiLoiNhac(h?.gio_nhac ?? null);
        }
      })
      .catch((e) => setLoi(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        setXong(true);
        SplashScreen.hideAsync();
      });
  }, []);

  useEffect(khoiDong, [khoiDong]);

  /**
   * Máy đổi sang người khác thì dựng lại từ đầu, y như vừa mở app.
   *
   * Trước đây chỗ này không có gì. Đăng xuất rồi đăng nhập bằng tài khoản khác
   * thì `coHoSo` vẫn mang giá trị của người cũ, nên người mới được thả thẳng
   * vào mấy thẻ tab — trong khi mọi màn ở đó đang đọc hồ sơ của người cũ.
   *
   * `khoiDong` đặt `xong` về false, nên màn hình quay về vòng xoay cho tới khi
   * đọc xong người mới là ai. Nhờ vậy không có nhịp nào lọt ra ngoài với dữ
   * liệu nửa cũ nửa mới, và cũng không có cảnh nháy qua màn nhập hồ sơ.
   */
  useEffect(
    () =>
      khiDoiTaiKhoan(() => {
        doiNguoi.current = true;
        // Lời nhắc trước buổi hẹn mang theo tên khách và tên thầy. Gỡ hết ngay,
        // đừng để máy của người mới réo tên người cũ.
        void goHetNhacHen();
        khoiDong();
      }),
    [khoiDong]
  );

  /**
   * Bấm vào thông báo thì mở đúng màn nó nói tới.
   *
   * Trước đây app KHÔNG đọc gì từ thông báo. Lời nhắc sáng vẫn gắn sẵn
   * `data: { man: '/' }` từ lâu mà không ai dùng tới, nên bấm vào chỉ mở app ra
   * chỗ cũ. Với thầy thì chuyện này không chấp nhận được: báo có đơn mới mà bấm
   * vào không ra đơn thì thông báo chỉ còn là tiếng chuông.
   *
   * `useLastNotificationResponse` bắt được CẢ hai đường: bấm lúc app đang mở, và
   * bấm lúc app đã tắt hẳn — trường hợp sau là thường gặp nhất, mà một bộ lắng
   * nghe thường thì bỏ lỡ vì nó gắn vào sau khi app đã dựng xong.
   */
  const traLoiThongBao = useTraLoiThongBao();
  useEffect(() => {
    if (!xong || !phongXong) return;
    const man = traLoiThongBao?.notification?.request?.content?.data?.man;
    if (typeof man !== 'string' || !man.startsWith('/')) return;
    // Chờ một nhịp cho chồng màn hình dựng xong. Đẩy ngay trong lúc nó đang
    // dựng thì lệnh trôi mất — đúng con bug đã gặp ở màn hứng đăng nhập.
    const hen = setTimeout(() => {
      router.push(man as never);
      // Xửa xong lần bấm này đi, không thì nó còn nằm đó mãi: mọi lần mở app sau
      // này đều đọc lại đúng lần bấm cũ rồi nhảy vào đúng màn ấy.
      xoaTraLoiThongBao();
    }, 80);
    return () => clearTimeout(hen);
  }, [traLoiThongBao, xong, phongXong]);

  // Nhập hồ sơ xong thì ho-so.ts báo lại, nhờ vậy không bị đá ngược về phần nhập.
  useEffect(() => ngheCoHoSo(setCoHoSo), []);

  // Màn đăng nhập tạo phiên xong thì báo về đây, nhờ vậy không bị đá ngược ra.
  // Nghe thẳng Supabase chứ không tự gọi lại, vì cách này bắt được cả lúc đăng
  // xuất lẫn lúc phiên hết hạn.
  useEffect(() => {
    if (XEM_THU) return;
    const { data } = supabase.auth.onAuthStateChange((_, phien) => {
      setCoPhien(Boolean(phien));
      if (!phien) {
        setLaThay(false);
        return;
      }
      // Đăng nhập xong phải hỏi lại tư cách. Thiếu chỗ này thì thầy vừa đăng
      // nhập là bị đá vào luồng nhập hồ sơ cho tới lần mở app sau.
      hoSoThayCuaToi()
        .then((t) => setLaThay(Boolean(t)))
        .catch(() => {});
    });
    return () => data.subscription.unsubscribe();
  }, []);

  /**
   * Hai màn được phép đứng khi chưa có phiên.
   *
   * `dang-nhap-xong` là màn hứng đường dẫn trình duyệt trả về. Đoạn đường của nó
   * là 'dang-nhap-xong' chứ KHÔNG phải 'dang-nhap' — thiếu nó ở đây thì lúc
   * khách đăng nhập Google lần đầu, deep link vừa về tới nơi mà việc đổi mã lấy
   * thẻ còn đang chạy, hiệu ứng này thấy chưa có phiên và đá ngược ra màn đăng
   * nhập. Đúng con bug "bị dịch chuyển" đã gặp một lần rồi.
   */
  const DUOC_DUNG_KHI_CHUA_CO_PHIEN = ['dang-nhap', 'dang-nhap-xong', 'dang-nhap-thay'];

  /**
   * Hai màn của thầy. Để ngoài phép kiểm hồ sơ khách, và cũng là chỗ tránh một
   * cuộc đua: ngay sau khi thầy đăng nhập, `laThay` còn đang hỏi máy chủ nên
   * vẫn là false — không chừa hai màn này ra thì hiệu ứng điều hướng kịp đá
   * thầy đi trước khi câu trả lời về.
   */
  const MAN_CUA_THAY = ['thay', 'dang-nhap-thay'];

  /**
   * Gian hàng KHÔNG cần hồ sơ.
   *
   * Điều 5.1.1(v) của Apple: "Apps may not require users to enter personal
   * information to function, except when directly relevant to the core
   * functionality of the app". Giờ sinh và nơi sinh liên quan trực tiếp tới
   * phần chiêm tinh nên hỏi ở đó là chính đáng — nhưng chúng không liên quan
   * gì tới việc xem một cái vòng tay.
   *
   * Và cũng không có lý do kỹ thuật nào: luật khoá dòng của bảng `san_pham` là
   * `using (hien)`, đọc được mà không cần phiên nào; còn danh sách quan tâm thì
   * nằm trên máy khách, không cần danh tính.
   *
   * `/trung-bay` nằm trong nhóm thẻ tab nên `doan[0]` của nó là '(tabs)', phải
   * xét tới đoạn thứ hai mới nhận ra.
   */
  const MAN_GIAN_HANG = ['san-pham', 'quan-tam'];

  useEffect(() => {
    if (!xong || !phongXong || loi) return;
    const dau = doan[0];
    // Chưa có phiên thì phải chọn cách vào trước, chưa bàn tới hồ sơ.
    if (!coPhien) {
      if (!DUOC_DUNG_KHI_CHUA_CO_PHIEN.includes(dau)) router.replace('/dang-nhap');
      return;
    }
    const trongGianHang =
      MAN_GIAN_HANG.includes(dau) || (dau === '(tabs)' && doan[1] === 'trung-bay');
    // Thầy đi đường riêng, không đụng tới hồ sơ khách.
    if (laThay) {
      if (!MAN_CUA_THAY.includes(dau)) router.replace('/thay');
      return;
    }
    if (
      !coHoSo &&
      dau !== 'nhap-ho-so' &&
      dau !== 'dang-nhap-xong' &&
      !MAN_CUA_THAY.includes(dau) &&
      !trongGianHang
    ) {
      // Mang theo chỗ họ vừa định vào, để màn chào nói đúng vì sao lại hỏi hồ
      // sơ — thay vì đá về một màn trắng không giải thích gì.
      router.replace(`/nhap-ho-so?vi=${dau === '(tabs)' ? (doan[1] ?? 'index') : dau}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xong, phongXong, loi, coPhien, coHoSo, laThay, doan]);

  if (!xong || !phongXong) {
    return (
      <View className="flex-1 items-center justify-center bg-nen">
        <ActivityIndicator color={MAU.vang} />
      </View>
    );
  }

  if (loi) {
    return (
      <View className="flex-1 items-center justify-center bg-nen px-8">
        <Text style={{ fontFamily: CHU.thanDam }} className="mb-2 text-center text-lg text-chu-chinh">
          Chưa nối được máy chủ
        </Text>
        <Text
          style={{ fontFamily: CHU.than }}
          className="text-center text-sm leading-5 text-chu-phu">
          {loi}
        </Text>

        {/* Không có nút này thì mất mạng lúc mở app là khách kẹt luôn ở màn này,
            phải thoát hẳn app rồi mở lại mới thử lại được. */}
        <Pressable
          onPress={khoiDong}
          className="mt-7 rounded-xl bg-vang px-7 py-3 active:opacity-80">
          <Text style={{ fontFamily: CHU.thanDam }} className="text-center text-nen">
            Thử lại
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: MAU.nen },
          // Mờ dần thay vì trượt ngang. Trượt làm màn mới xô màn cũ đi, hợp với
          // app công cụ; app này toàn nền trời sao nên mờ dần liền mạch hơn, và
          // chùm sao bắn ra lúc bấm còn kịp cháy hết trong lúc màn cũ nhạt đi.
          animation: 'fade',
          animationDuration: 220,
        }}
      />

      {/* Bong bóng thông báo, nổi trên mọi màn.
          Chỉ hiện khi đã có phiên và đã qua phần nhập hồ sơ — người đang đăng
          nhập hay đang khai ngày sinh thì chưa có thông báo nào để xem, mà một
          bong bóng lạ nổi lên lúc đó chỉ làm họ phân tâm. */}
      {coPhien && (coHoSo || laThay) ? <Chuong /> : null}
    </GestureHandlerRootView>
  );
}
