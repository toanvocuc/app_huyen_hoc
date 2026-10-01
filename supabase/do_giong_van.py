# -*- coding: utf-8 -*-
"""
Đo giọng văn của kho nội dung, bắt mấy nếp viết lộ rõ là máy đẻ ra.

Chạy: python do_giong_van.py
"""
import collections
import re
import sys


def nap():
    from tarot_an_chinh import AN_CHINH
    from tarot_coc import COC
    from tarot_gay import GAY
    from tarot_kiem import KIEM
    from tarot_tien import TIEN
    return [("Ẩn Chính", AN_CHINH), ("Cốc", COC), ("Gậy", GAY),
            ("Kiếm", KIEM), ("Tiền", TIEN)]


# Những nếp viết hay gặp ở văn máy sinh ra.
NEP_XAU = {
    "câu dẫn 'Lá này'": r"Lá này",
    "câu dẫn 'nói về'": r"nói về",
    "câu dẫn 'gắn với'": r"gắn với",
    "gạch ngang chèn ý": r" — ",
    "khuôn 'không phải X mà là Y'": r"không phải .{3,40} mà (là|chỉ)",
    "hai chấm rồi mới hé": r"\w: [a-zà-ỹ]",
    "'Đây là'": r"\bĐây là\b",
    "'xuất hiện khi'": r"xuất hiện khi",
}


def do(ten_bo, la_bai):
    xuoi = [r[5] for r in la_bai]
    nguoc = [r[6] for r in la_bai]
    ca = xuoi + nguoc
    n = len(la_bai)

    print("\n=== %s (%d lá) ===" % (ten_bo, n))

    xau = 0
    for ten, mau in NEP_XAU.items():
        dem = sum(1 for t in ca if re.search(mau, t))
        if dem:
            xau += dem
            print("  %-32s %d chỗ" % (ten, dem))
    if xau == 0:
        print("  không dính nếp xấu nào")

    so_cau = collections.Counter(len(re.split(r"(?<=[.!?])\s+", t.strip())) for t in xuoi)
    print("  số câu mỗi lá: %s" % dict(sorted(so_cau.items())))

    mo = collections.Counter(" ".join(t.split()[:2]) for t in ca)
    lap = [(k, v) for k, v in mo.most_common(4) if v > 2]
    print("  cụm mở đầu lặp quá 2 lần: %s" % (lap or "không có"))

    dai = [len(t) for t in xuoi]
    print("  độ dài nghĩa xuôi: %d tới %d, trung bình %d" % (min(dai), max(dai), sum(dai) // len(dai)))
    return xau


if __name__ == "__main__":
    tong = 0
    for ten, bo in nap():
        tong += do(ten, bo)
    print("\n==> Tổng chỗ dính nếp xấu: %d" % tong)
    sys.exit(0 if tong == 0 else 1)
