-- Gian hàng: khu TRƯNG BÀY đồ phong thuỷ.
--
-- ──────────────────────────────────────────────────── ĐÂY KHÔNG PHẢI SÀN BÁN HÀNG
--
-- App chỉ TRƯNG BÀY. Không có giỏ hàng gửi lên máy chủ, không có đơn hàng, không
-- hỏi tên, số điện thoại hay địa chỉ của ai. Khách gom vào một danh sách nằm
-- NGAY TRÊN MÁY HỌ, rồi tự gửi danh sách đó cho cửa hàng qua Zalo bằng chính tài
-- khoản Zalo của mình.
--
-- Nói rõ chỗ này vì nó quyết định cả thiết kế: bảng dưới đây chỉ có HÀNG, không
-- có đơn và không có người mua. Ngày nào bật đặt hàng thật trong app thì mới
-- thêm bảng đơn — và lúc đó phải làm thủ tục thông báo với Bộ Công Thương trước,
-- vì từ Nghị định 85/2021 thì chức năng đặt hàng trực tuyến mới là thứ kích hoạt
-- nghĩa vụ đó, chứ không phải việc hiện giá.

create table if not exists san_pham (
  ma          text primary key,
  ten         text not null,
  mo_ta       text,
  -- Mỗi dòng một thông số, xuống dòng ngăn cách. Ví dụ:
  --   Đường kính: 17 cm
  --   Trọng lượng: 7,28 kg
  thong_so    text,
  gia         integer not null check (gia >= 0),
  -- 'vòng', 'chuỗi', 'bộ', 'tượng', 'viên'… Hiện ngay sau giá: "280.000đ / vòng".
  don_vi      text not null default 'cái',
  /**
   * Bậc giá theo số lượng, dạng [{"tu": 10, "gia": 249000}].
   *
   * Để jsonb chứ không tách bảng riêng: cả gian hàng có vài chục món, mà mỗi
   * món nhiều nhất hai ba bậc. Tách bảng là thêm một lượt nối chỉ để đọc ra
   * hai dòng chữ.
   */
  bac_gia     jsonb,
  anh         text,
  con_hang    boolean not null default true,
  -- Hiện ở dải "Nổi bật tuần này" trên đầu khu trưng bày.
  noi_bat     boolean not null default false,
  -- Số nhỏ lên trước. Để thưa (10, 20, 30…) cho dễ chèn món mới vào giữa.
  thu_tu      integer not null default 100,
  -- Tắt một món mà không xoá, để giữ nguyên mọi thứ đã trỏ tới nó.
  hien        boolean not null default true,
  tao_luc     timestamptz not null default now(),
  cap_nhat_luc timestamptz not null default now()
);

create index if not exists san_pham_bay_ra on san_pham (hien, noi_bat, thu_tu);

drop trigger if exists san_pham_doi_thi_cham_gio on san_pham;
create trigger san_pham_doi_thi_cham_gio
before update on san_pham
for each row execute function cham_cap_nhat_luc();

alter table san_pham enable row level security;

-- Đọc: ai cũng được, kể cả khách chưa đăng nhập. Đây là hàng bày ra cho người ta
-- xem, không phải dữ liệu riêng của ai. Giống hệt bảng `goi_tu_van`.
--
-- Món đã tắt thì không ai đọc được, kể cả khi biết mã — lọc ở luật khoá dòng chứ
-- không lọc ở máy khách, vì lọc ở máy khách là thứ ai cũng gỡ được.
drop policy if exists "ai cung xem duoc hang dang bay" on san_pham;
create policy "ai cung xem duoc hang dang bay" on san_pham for select
  using (hien);

-- KHÔNG có luật insert/update/delete nào. Hàng do bên quản trị nhập bằng khoá
-- quản trị, không qua app. Chừng nào chưa có màn quản lý gian hàng trong app thì
-- đừng mở lỗ ghi nào cả.

-- ─────────────────────────────────────────────────────────── hàng của cửa hàng
--
-- Giá ghi theo đúng bảng giá cửa hàng gửi, đơn vị đồng. "k" trong bảng gốc là
-- nghìn đồng, đã quy ra đủ số 0 ở đây.
--
-- ──────────────────────────────────── MÔ TẢ CHỈ NÓI MÓN ĐÓ LÀ GÌ, KHÔNG HỨA GÌ
--
-- Không một dòng nào ở đây nói món hàng mang lại điều gì cho người mua: không
-- may mắn, không tài lộc, không bình an, và tuyệt đối không sức khoẻ. Mô tả chỉ
-- nói chất liệu, hình dáng, kích thước — những thứ nhìn vào ảnh là kiểm được.
--
-- Lý do không phải chỉ vì Apple. Một lời hứa không kiểm chứng được nằm cạnh một
-- cái giá là thứ pháp luật quảng cáo soi tới, mà cũng là thứ khách bực nhất khi
-- nhận hàng. Tên món như "Bát tụ bảo" hay chữ "Phát Tài" khắc trên thân thì giữ
-- nguyên: đó là tên gọi và là thứ có thật trên món hàng, không phải lời hứa.

insert into san_pham (ma, ten, mo_ta, thong_so, gia, don_vi, bac_gia, anh, noi_bat, thu_tu) values
(
  'vong-lam-ngoc-jade-10ly',
  'Vòng Lam Ngọc Jade type A',
  'Vòng tay đá lam ngọc jade loại A, hạt tròn đều, sắc xanh lam pha lục nhẹ.',
  E'Loại: Jade type A\nKích thước hạt: 10 ly',
  280000, 'vòng',
  '[{"tu": 10, "gia": 249000}]'::jsonb,
  'vong-lam-ngoc-jade-10ly.jpg', true, 10
),
(
  'vong-hoa-sen-thach-anh-toc-do',
  'Vòng hoa sen thạch anh tóc đỏ',
  'Vòng dây đỏ kết hạt thạch anh tóc đỏ chạm hình hoa sen, kèm chi tiết đồng.',
  E'Chất liệu: Thạch anh tóc đỏ\nKiểu: Dây đỏ, chạm hoa sen',
  230000, 'vòng',
  null,
  'vong-hoa-sen-thach-anh-toc-do.jpg', true, 20
),
(
  'bat-tu-bao-ngoc-hoang-long-phat-tai',
  'Bát tụ bảo Ngọc Hoàng Long chữ Phát Tài',
  'Bát tụ bảo bằng đá ngọc hoàng long, khắc chữ Phát Tài màu đỏ, kèm đế gỗ.',
  E'Kích thước: 10 cm\nChất liệu: Đá ngọc hoàng long',
  360000, 'bộ',
  '[{"tu": 5, "gia": 320000}]'::jsonb,
  'bat-tu-bao-ngoc-hoang-long-phat-tai.jpg', true, 30
),
(
  'tuong-di-lac-da-luu-ly',
  'Tượng Di Lặc đứng đá lưu ly',
  'Tượng Di Lặc đứng nâng thỏi vàng, đá lưu ly màu hổ phách trong.',
  E'Kích thước: Cao 12 cm, ngang 7 cm\nChất liệu: Đá lưu ly',
  860000, 'tượng',
  null,
  'tuong-di-lac-da-luu-ly.jpg', false, 40
),
(
  'chuoi-bach-ngoc-cam-thach-hoa-mai',
  'Chuỗi bạch ngọc cẩm thạch A charm hoa mai',
  'Chuỗi bạch ngọc cẩm thạch loại A nếp hoá mi, charm hoa mai bạch ngọc, hồ lô băng lục bạc S925 và bi băng lục.',
  E'Loại: Cẩm thạch A, nếp hoá mi\nKích thước hạt: 4 ly\nPhụ kiện: Bạc S925',
  2020000, 'chuỗi',
  null,
  'chuoi-bach-ngoc-cam-thach-hoa-mai.jpg', false, 50
),
(
  'bo-am-chen-onix-trang',
  'Bộ ấm chén Onix trắng',
  'Bộ ấm chén đá onix trắng, vẽ hoa sen và viền kim loại. Có sẵn nhiều mẫu. Kèm hộp gỗ và túi quà.',
  E'Chất liệu: Đá onix trắng\nKèm theo: Hộp gỗ, túi quà',
  2100000, 'bộ',
  null,
  'bo-am-chen-onix-trang.jpg', false, 60
),
(
  'bo-am-tra-da-ngoc-hoang-long',
  'Bộ ấm trà đá ngọc hoàng long chạm đào',
  'Bộ ấm trà chạm khắc từ đá ngọc hoàng long, thân bình chạm hình cây đào, kèm đĩa và ly.',
  E'Bình: Cao 10 cm, ngang 17 cm\nLy: Cao 3 cm, đường kính 4,5 cm\nChất liệu: Đá ngọc hoàng long',
  2600000, 'bộ',
  null,
  'bo-am-tra-da-ngoc-hoang-long.jpg', false, 70
),
(
  'bi-cau-thach-anh-den-17cm',
  'Bi cầu thạch anh đen 17 cm',
  'Bi cầu thạch anh đen nguyên khối, vân tơ trắng chạy khắp thân, kèm đế gỗ.',
  E'Đường kính: 17 cm\nTrọng lượng: 7,28 kg\nKèm theo: Đế gỗ',
  4660000, 'viên',
  null,
  'bi-cau-thach-anh-den-17cm.jpg', false, 80
)
on conflict (ma) do update set
  ten = excluded.ten,
  mo_ta = excluded.mo_ta,
  thong_so = excluded.thong_so,
  gia = excluded.gia,
  don_vi = excluded.don_vi,
  bac_gia = excluded.bac_gia,
  anh = excluded.anh,
  noi_bat = excluded.noi_bat,
  thu_tu = excluded.thu_tu;
