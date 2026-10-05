"""
Dựng bộ biểu tượng app từ logo Omora: python scripts/lam-bieu-tuong.py

Có logo mới thì thay assets/logo/omora-vuong.png rồi chạy lại, đừng sửa tay
từng file trong assets/images/ — sáu file đó phải khớp nhau.

Vì sao mỗi file một cỡ và một cách cắt:

  icon.png            iOS và ảnh nộp chợ. Không bị cắt xén nên nét để lớn.
  android-icon-*      Android ghép ba lớp rồi cắt theo hình máy chọn: tròn,
                      vuông bo góc, giọt nước... Chỉ vòng tròn giữa chiếm 66
                      trên 108 phần là chắc chắn không bị cắt, nên nét phải
                      nằm gọn trong đó.
  monochrome          Lớp cho giao diện đổi màu theo hình nền của Android 13+.
                      Hệ thống tự tô màu, nên ở đây chỉ cần hình bóng.
  favicon.png         Bản web.
  splash-icon.png     Màn chờ lúc mở app, nền để trong suốt vì màu nền đã đặt
                      trong app.json.
"""

from pathlib import Path

from PIL import Image

GOC = Path(__file__).resolve().parent.parent
LOGO = GOC / 'assets/logo/omora-vuong.png'
RA = GOC / 'assets/images'

# Nền lấy đúng hai đầu dải màu nền của app trong constants/giao-dien.ts.
NEN_GIUA = (24, 36, 64)    # #182440
NEN_MEP = (11, 18, 32)     # #0B1220 — MAU.nen

# Vòng an toàn của biểu tượng Android: 66 trên 108 phần.
AN_TOAN_ANDROID = 66 / 108


def net(duong: Path) -> Image.Image:
    """Cắt sát nét vẽ, bỏ phần trong suốt thừa quanh logo."""
    im = Image.open(duong).convert('RGBA')
    bb = im.split()[3].getbbox()
    assert bb, 'logo rỗng, không có nét nào'
    return im.crop(bb)


def nen(co: int) -> Image.Image:
    """Nền chuyển sắc toả tròn, sáng ở giữa như dải nền trong app."""
    # radial_gradient cho 0 ở tâm, 255 ở mép — dùng thẳng làm mặt nạ trộn.
    mat_na = Image.radial_gradient('L').resize((co, co), Image.LANCZOS)
    return Image.composite(
        Image.new('RGB', (co, co), NEN_MEP),
        Image.new('RGB', (co, co), NEN_GIUA),
        mat_na,
    ).convert('RGBA')


def dat_giua(phong: Image.Image, hinh: Image.Image, phan: float) -> Image.Image:
    """Thu hình cho cạnh dài nhất chiếm `phan` của khung rồi dán vào giữa."""
    co = phong.size[0]
    ty = (co * phan) / max(hinh.size)
    moi = hinh.resize((max(1, round(hinh.width * ty)), max(1, round(hinh.height * ty))), Image.LANCZOS)
    ra = phong.copy()
    ra.alpha_composite(moi, ((co - moi.width) // 2, (co - moi.height) // 2))
    return ra


def trong(co: int) -> Image.Image:
    return Image.new('RGBA', (co, co), (0, 0, 0, 0))


def bong(hinh: Image.Image) -> Image.Image:
    """Hình bóng trắng, giữ nguyên độ trong suốt. Android tự tô màu lên."""
    trang = Image.new('RGBA', hinh.size, (255, 255, 255, 255))
    trang.putalpha(hinh.split()[3])
    return trang


def main() -> None:
    n = net(LOGO)
    print(f'nét logo {n.width} x {n.height}')

    ra: list[tuple[str, Image.Image]] = [
        # iOS và chợ: không bị cắt nên để nét lớn.
        ('icon.png', dat_giua(nen(1024), n, 0.78)),
        # Android: nét phải nằm trong vòng an toàn, trừ hao thêm một chút.
        ('android-icon-foreground.png', dat_giua(trong(512), n, AN_TOAN_ANDROID * 0.92)),
        ('android-icon-background.png', nen(512)),
        ('android-icon-monochrome.png', dat_giua(trong(432), bong(n), AN_TOAN_ANDROID * 0.92)),
        ('favicon.png', dat_giua(nen(48), n, 0.78)),
        # Màn chờ: nền trong suốt, màu nền đã đặt trong app.json.
        ('splash-icon.png', dat_giua(trong(512), n, 0.92)),
    ]

    for ten, im in ra:
        d = RA / ten
        im.save(d)
        print(f'  {ten:30s} {im.width} x {im.height}')

    print(f'xong, ghi {len(ra)} file vào {RA}')


if __name__ == '__main__':
    main()
