/**
 * Ô vuông ba hàng ba cột của biểu đồ ngày sinh.
 *
 * Số trong ô vẽ bằng View thường, mấy đường mũi tên vẽ bằng SVG nằm đè phía sau.
 * Làm ngược lại thì chữ số trong SVG không ăn phông tiếng Việt.
 *
 * Đường mũi tên cắt ngắn hai đầu để chừa chỗ cho chữ số. Kẻ thẳng một mạch từ ô
 * này sang ô kia thì đường chạy xuyên qua chữ, nhìn hệt như gạch bỏ con số.
 */

import { Pressable, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { CHU, MAU } from '@/constants/giao-dien';
import { oCuaSo, type Duong } from '@/lib/bieu-do-ngay-sinh';

/** Một ô chiếm bao nhiêu trong hệ toạ độ 0 tới 100 của SVG. */
const O = 100 / 3;

/** Tâm của một ô. */
function tam(so: number) {
  const { hang, cot } = oCuaSo(so);
  return { x: (cot + 0.5) * O, y: (hang + 0.5) * O };
}

/**
 * Bề ngang một chữ số, tính theo cỡ chữ.
 *
 * Đo trên file phông Be Vietnam Pro 600: chữ số rộng từ 0,415 tới 0,716 lần cỡ
 * chữ. Lấy số lớn nhất để cụm số rộng nhất cũng không tràn ô.
 */
const RONG_MOT_SO = 0.72;

/** Cỡ chữ của một ô, tính theo số lần con số đó lặp lại. Dùng chung cho cả lưới. */
export function cuaChuTrongO(lan: number, oCo: number) {
  // Cả cụm chỉ được chiếm 70% bề ngang ô. Ngày 11/11/1991 cho ra sáu số 1 trong
  // một ô, lúc đó cỡ chữ phải tụt xuống nhiều.
  return Math.min(oCo * 0.4, (oCo * 0.7) / (Math.max(lan, 1) * RONG_MOT_SO));
}

/** Nửa bề ngang của chữ trong ô, cộng thêm một chút cho thoáng. */
function banKinhChu(lan: number) {
  const n = Math.max(lan, 1);
  const cu = cuaChuTrongO(lan, O); // tính luôn trong hệ toạ độ SVG
  return (n * cu * RONG_MOT_SO) / 2 + 3;
}

/** Một đoạn kẻ từ ô này sang ô kia, đã cắt ngắn hai đầu, kèm đầu mũi tên nếu là đoạn cuối. */
function Doan({
  tu,
  den,
  dem,
  day,
  coMui,
}: {
  tu: number;
  den: number;
  dem: Record<number, number>;
  day: boolean;
  coMui: boolean;
}) {
  const a = tam(tu);
  const b = tam(den);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dai = Math.hypot(dx, dy);
  const ux = dx / dai;
  const uy = dy / dai;

  const r1 = banKinhChu(dem[tu] ?? 0);
  const r2 = banKinhChu(dem[den] ?? 0);
  const dauX = a.x + ux * r1;
  const dauY = a.y + uy * r1;
  let cuoiX = b.x - ux * r2;
  let cuoiY = b.y - uy * r2;

  // Hai ô sát nhau mà chữ đều rộng thì không còn chỗ kẻ. Bỏ đoạn đó đi.
  if (Math.hypot(cuoiX - dauX, cuoiY - dauY) < 2) return null;

  const mau = day ? MAU.vang : MAU.canh;
  const dam = day ? 0.55 : 0.4;
  let mui = null;

  if (coMui) {
    const dinhX = cuoiX;
    const dinhY = cuoiY;
    const chanX = dinhX - ux * 4.2;
    const chanY = dinhY - uy * 4.2;
    const w = 2.1;
    mui = (
      <Path
        d={`M ${dinhX} ${dinhY} L ${chanX - uy * w} ${chanY + ux * w} L ${chanX + uy * w} ${
          chanY - ux * w
        } Z`}
        fill={mau}
        fillOpacity={dam}
      />
    );
    // Vạch dừng lại ở chân mũi tên, không thì nó thò ra khỏi đầu nhọn.
    cuoiX = chanX;
    cuoiY = chanY;
  }

  return (
    <>
      <Line
        x1={dauX}
        y1={dauY}
        x2={cuoiX}
        y2={cuoiY}
        stroke={mau}
        strokeWidth={day ? 2.4 : 1.6}
        strokeLinecap="round"
        strokeOpacity={dam}
        strokeDasharray={day ? undefined : '3 3'}
      />
      {mui}
    </>
  );
}

function DuongKe({ duong, dem, day }: { duong: Duong; dem: Record<number, number>; day: boolean }) {
  return (
    <>
      <Doan tu={duong[0]} den={duong[1]} dem={dem} day={day} coMui={false} />
      <Doan tu={duong[1]} den={duong[2]} dem={dem} day={day} coMui />
    </>
  );
}

export function OVuongSinh({
  dem,
  duongDay,
  duongTrong,
  dangChon,
  onChon,
  co = 300,
}: {
  dem: Record<number, number>;
  duongDay: Duong[];
  duongTrong: Duong[];
  dangChon: number | null;
  onChon: (so: number) => void;
  co?: number;
}) {
  // Lưới đọc từ trên xuống: hàng trên là 3 6 9, hàng dưới cùng mới là 1 4 7.
  const hangSo = [
    [3, 6, 9],
    [2, 5, 8],
    [1, 4, 7],
  ];
  const oCo = co / 3;

  return (
    <View style={{ width: co, height: co }}>
      <Svg
        width={co}
        height={co}
        viewBox="0 0 100 100"
        style={{ position: 'absolute' }}
        pointerEvents="none">
        {duongTrong.map((d) => (
          <DuongKe key={`t${d.join('')}`} duong={d} dem={dem} day={false} />
        ))}
        {duongDay.map((d) => (
          <DuongKe key={`d${d.join('')}`} duong={d} dem={dem} day />
        ))}
      </Svg>

      {hangSo.map((hang, i) => (
        <View key={i} style={{ flexDirection: 'row' }}>
          {hang.map((so) => {
            const lan = dem[so] ?? 0;
            const coSo = lan > 0;
            const chon = dangChon === so;
            const cuaChu = cuaChuTrongO(lan, oCo);

            return (
              <Pressable
                key={so}
                onPress={() => onChon(so)}
                style={{ width: oCo, height: oCo, padding: 5 }}
                accessibilityRole="button"
                accessibilityLabel={
                  coSo ? `Số ${so}, có ${lan} lần` : `Số ${so}, không có trong ngày sinh`
                }>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    borderWidth: chon ? 1.6 : 1,
                    borderColor: chon ? MAU.vang : coSo ? MAU.vangMo : MAU.vien,
                    borderStyle: coSo ? 'solid' : 'dashed',
                    // Để trống nền cho đường mũi tên vẽ phía sau lộ ra được.
                    // Tô đục ở đây là hai đầu đoạn kẻ bị ô che mất.
                    backgroundColor: 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      // Phông có chân Cormorant dùng chữ số kiểu cổ: 8 trên 10
                      // chữ số thòng xuống dưới dòng kẻ, mỗi số một chiều cao.
                      // Số 3, 5, 7, 9 tụt 275 phần nghìn em còn số 6 vống lên
                      // 661, nên lưới nhìn như xô lệch. Chữ số ở đây là dữ liệu
                      // chứ không phải tiêu đề, nên dùng phông thân có chữ số
                      // thẳng hàng. Phông kia vẫn giữ cho mọi tiêu đề khác.
                      fontFamily: CHU.thanDam,
                      fontSize: cuaChu,
                      lineHeight: cuaChu * 1.2,
                      color: coSo ? MAU.vangSang : MAU.chuMo,
                      opacity: coSo ? 1 : 0.5,
                    }}>
                    {String(so).repeat(Math.max(lan, 1))}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
