"""Sinh chuỗi khoá bí mật cho đăng nhập Apple, để dán vào Supabase.

Apple không cho một chuỗi bí mật cố định như Google. Nó bắt tự ký một chuỗi JWT,
và chuỗi đó SỐNG TỐI ĐA SÁU THÁNG. Hết hạn là đăng nhập Apple chết, không báo
trước, không có email nhắc. Khách chỉ thấy đăng nhập xong rồi văng ra.

Chạy lại file này sáu tháng một lần, dán chuỗi mới vào Supabase là xong.

    python scripts/khoa-bi-mat-apple.py \\
        --khoa  D:/khoa-apple/AuthKey_XXXXXXXXXX.p8 \\
        --ma-khoa XXXXXXXXXX \\
        --doi U5PXQTH7K8 \\
        --dich-vu com.nexusgroup.omora.dangnhap

Máy không có thư viện ký JWT nào, nên ký bằng openssl. Openssl trả chữ ký dạng
DER, còn JWT đòi 64 byte thô (r nối s), nên phải bóc ASN.1 ra — đó là phần dài
nhất ở dưới, và cũng là phần dễ sai nhất.
"""

import argparse
import base64
import json
import subprocess
import sys
import time

AUD = 'https://appleid.apple.com'
SAU_THANG = 15777000  # giây, đúng mức tối đa Apple cho


def b64(b: bytes) -> bytes:
    return base64.urlsafe_b64encode(b).rstrip(b'=')


def phan(o: dict) -> bytes:
    return b64(json.dumps(o, separators=(',', ':')).encode())


def so_nguyen(b: bytes, i: int) -> tuple[bytes, int]:
    """Đọc một số nguyên ASN.1, trả về đúng 32 byte."""
    if b[i] != 0x02:
        raise SystemExit('Chữ ký openssl trả về không đúng dạng DER.')
    n = b[i + 1]
    return b[i + 2:i + 2 + n].lstrip(b'\x00').rjust(32, b'\x00'), i + 2 + n


def ky(khoa: str, noi_dung: bytes) -> bytes:
    kq = subprocess.run(
        ['openssl', 'dgst', '-sha256', '-sign', khoa],
        input=noi_dung, capture_output=True
    )
    if kq.returncode != 0:
        raise SystemExit(f'openssl không ký được: {kq.stderr.decode(errors="replace")[:300]}')
    der = kq.stdout
    if not der or der[0] != 0x30:
        raise SystemExit('Không đọc được chữ ký. File .p8 có đúng không?')
    i = 4 if der[1] & 0x80 else 2
    r, i = so_nguyen(der, i)
    s, _ = so_nguyen(der, i)
    return r + s


def main() -> None:
    p = argparse.ArgumentParser(description='Sinh khoá bí mật đăng nhập Apple')
    p.add_argument('--khoa', required=True, help='Đường dẫn file AuthKey_XXXX.p8')
    p.add_argument('--ma-khoa', required=True, help='Key ID, 10 ký tự')
    p.add_argument('--doi', required=True, help='Team ID, 10 ký tự')
    p.add_argument('--dich-vu', required=True, help='Services ID, dạng com.nexusgroup.omora.xxx')
    a = p.parse_args()

    gio = int(time.time())
    dau = (
        phan({'alg': 'ES256', 'kid': a.ma_khoa, 'typ': 'JWT'})
        + b'.'
        + phan({'iss': a.doi, 'iat': gio, 'exp': gio + SAU_THANG,
                'aud': AUD, 'sub': a.dich_vu})
    )
    the = (dau + b'.' + b64(ky(a.khoa, dau))).decode()

    het = time.strftime('%d/%m/%Y', time.localtime(gio + SAU_THANG))
    print(f'\nHết hạn: {het}  — đặt lịch nhắc trước ngày đó một tuần.\n')
    print(the)
    print('\nDán nguyên chuỗi trên vào Supabase: Authentication → Providers → Apple')
    print('→ ô "Secret Key (for OAuth)".')


if __name__ == '__main__':
    sys.exit(main())
