"""
Thêm dòng vào data/tu_vi_mau.csv: python scripts/them-tu-vi.py <file-moi.txt>

File đưa vào là văn bản thường, mỗi khối một nhóm:

    # ngay tong_quan leo
    Câu thứ nhất. Câu thứ hai.
    Câu khác. Câu khác nữa.

    # ngay tinh_cam chung
    ...

Script tự đánh số `thu_tu` tiếp sau số lớn nhất của nhóm đó, giữ nguyên BOM và
xuống dòng kiểu CRLF như file gốc, và từ chối nếu có câu trùng với câu đã có.
"""

import csv
import io
import sys
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent
BANG = GOC / 'data/tu_vi_mau.csv'

KY = {'ngay', 'tuan'}
MUC = {'tong_quan', 'tinh_cam', 'cong_viec', 'suc_khoe'}
CUNG = {
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'chung',
}


def doc_moi(duong: Path) -> list[tuple[str, str, str, str]]:
    ra: list[tuple[str, str, str, str]] = []
    nhom: tuple[str, str, str] | None = None
    for so, dong in enumerate(io.open(duong, encoding='utf-8'), 1):
        d = dong.strip()
        if not d:
            continue
        if d.startswith('#'):
            phan = d[1:].split()
            assert len(phan) == 3, f'dòng {so}: đầu khối phải là "# <ky> <muc> <cung>"'
            ky, muc, cung = phan
            assert ky in KY, f'dòng {so}: ky lạ "{ky}"'
            assert muc in MUC, f'dòng {so}: muc lạ "{muc}"'
            assert cung in CUNG, f'dòng {so}: cung lạ "{cung}"'
            assert not (ky == 'tuan' and muc == 'suc_khoe'), (
                f'dòng {so}: tử vi tuần không có mục sức khoẻ, tu-vi.ts luôn trả null'
            )
            nhom = (ky, muc, cung)
            continue
        assert nhom, f'dòng {so}: có câu trước khi khai nhóm'
        ra.append((*nhom, d))
    return ra


def main() -> None:
    assert len(sys.argv) == 2, 'cần đúng một tham số: đường dẫn file câu mới'
    moi = doc_moi(Path(sys.argv[1]))
    assert moi, 'file rỗng'

    cu = list(csv.DictReader(io.open(BANG, encoding='utf-8-sig')))
    da_co = {x['noi_dung'] for x in cu}
    lon_nhat: dict[tuple[str, str, str], int] = {}
    for x in cu:
        k = (x['ky'], x['muc'], x['cung'])
        lon_nhat[k] = max(lon_nhat.get(k, -1), int(x['thu_tu']))

    trung = [n for *_, n in moi if n in da_co]
    assert not trung, 'trùng với câu đã có:\n  ' + '\n  '.join(trung[:5])
    tu_trung = [n for n in {x[3] for x in moi} if [y[3] for y in moi].count(n) > 1]
    assert not tu_trung, 'trong file mới có câu lặp lại:\n  ' + '\n  '.join(tu_trung[:5])

    them: list[dict[str, str]] = []
    for ky, muc, cung, noi_dung in moi:
        k = (ky, muc, cung)
        lon_nhat[k] = lon_nhat.get(k, -1) + 1
        them.append(
            {'ky': ky, 'muc': muc, 'cung': cung, 'thu_tu': str(lon_nhat[k]), 'noi_dung': noi_dung}
        )

    with io.open(BANG, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['ky', 'muc', 'cung', 'thu_tu', 'noi_dung'])
        w.writeheader()
        for x in cu + them:
            w.writerow({k: x[k] for k in w.fieldnames})

    print(f'thêm {len(them)} dòng, bảng còn {len(cu) + len(them)} dòng')
    for k in sorted({(x['ky'], x['muc'], x['cung']) for x in them}):
        n = sum(1 for x in them if (x['ky'], x['muc'], x['cung']) == k)
        print(f"  {'/'.join(k):32s} +{n}  -> {lon_nhat[k] + 1} câu")


if __name__ == '__main__':
    main()
