-- Khởi tạo cơ sở dữ liệu cho bản đầu.
--
-- Quy tắc của dự án: mọi bảng đều bật khoá dòng dữ liệu NGAY trong lần tạo,
-- ở cùng một file với lệnh tạo bảng. Không để "lát nữa bật".
-- Bảng chưa bật khoá là bảng ai cầm khoá công khai cũng đọc được toàn bộ,
-- mà khoá công khai thì nằm sẵn trong app, ai tải về cũng moi ra được.

-- ============================================================ nội dung dùng chung
-- Mấy bảng này ai đọc cũng được, nhưng không ai ghi được từ app.
-- Nạp nội dung vào bằng file trong thư mục data/, chạy từ máy hoặc từ Edge Function.

create table la_bai (
  ma            text primary key,
  bo            text not null,
  so            int  not null,
  ten_vi        text not null,
  ten_en        text not null,
  tu_khoa       text not null,
  y_nghia_xuoi  text not null,
  y_nghia_nguoc text not null,
  tinh_cam      text not null,
  cong_viec     text not null,
  loi_khuyen    text not null
);

create table so_chu_dao (
  so         int primary key,
  ten        text not null,
  tinh_cach  text not null,
  diem_manh  text not null,
  diem_yeu   text not null,
  loi_khuyen text not null
);

create table so_van_menh (
  so         int primary key,
  ten        text not null,
  y_nghia    text not null,
  loi_khuyen text not null
);

create table cung_hoang_dao (
  ma        text primary key,
  ten       text not null,
  ten_en    text not null,
  tu_ngay   text not null,
  den_ngay  text not null,
  nguyen_to text not null,
  tinh_chat text not null,
  tinh_cach text not null,
  diem_manh text not null,
  diem_yeu  text not null
);

create table do_hop_cung (
  cung_a   text not null references cung_hoang_dao(ma),
  cung_b   text not null references cung_hoang_dao(ma),
  diem     int  not null check (diem between 1 and 5),
  loi_binh text not null,
  primary key (cung_a, cung_b)
);

alter table la_bai          enable row level security;
alter table so_chu_dao      enable row level security;
alter table so_van_menh     enable row level security;
alter table cung_hoang_dao  enable row level security;
alter table do_hop_cung     enable row level security;

create policy "ai cung doc duoc" on la_bai         for select using (true);
create policy "ai cung doc duoc" on so_chu_dao     for select using (true);
create policy "ai cung doc duoc" on so_van_menh    for select using (true);
create policy "ai cung doc duoc" on cung_hoang_dao for select using (true);
create policy "ai cung doc duoc" on do_hop_cung    for select using (true);
-- Không có luật cho insert/update/delete, nghĩa là từ app không ai sửa được nội dung.

-- ============================================================ dữ liệu của từng người

create table ho_so (
  nguoi_dung uuid primary key references auth.users(id) on delete cascade,
  ho_ten     text,
  ngay_sinh  date,
  gio_sinh   time,
  gioi_tinh  text check (gioi_tinh in ('nam', 'nu', 'khac')),
  gio_nhac   time default '07:00',
  tao_luc    timestamptz not null default now(),
  sua_luc    timestamptz not null default now()
);

create table lan_rut (
  id         bigint generated always as identity primary key,
  nguoi_dung uuid not null references auth.users(id) on delete cascade,
  kieu_trai  text not null check (kieu_trai in ('mot-la', 'ba-la', 'la-hom-nay')),
  cac_la     jsonb not null,
  cau_hoi    text,
  tao_luc    timestamptz not null default now()
);

create index lan_rut_nguoi_dung_idx on lan_rut (nguoi_dung, tao_luc desc);

-- Đếm phễu: khách xem xong kết quả, nhìn thấy mục hỏi chuyên gia, rồi bấm.
-- Mã theo dõi sinh ra ở đây để người trực Zalo khớp lại được.
create table su_kien (
  id          bigint generated always as identity primary key,
  nguoi_dung  uuid not null references auth.users(id) on delete cascade,
  loai        text not null check (loai in ('xem_ket_qua', 'thay_muc_hoi', 'bam_zalo')),
  man_hinh    text,
  ma_theo_doi text,
  tao_luc     timestamptz not null default now()
);

create index su_kien_loai_idx on su_kien (loai, tao_luc desc);
create unique index su_kien_ma_theo_doi_idx on su_kien (ma_theo_doi) where ma_theo_doi is not null;

alter table ho_so   enable row level security;
alter table lan_rut enable row level security;
alter table su_kien enable row level security;

-- Mỗi người chỉ đụng được vào dòng của chính mình.
create policy "doc ho so cua minh"  on ho_so for select using (auth.uid() = nguoi_dung);
create policy "tao ho so cua minh"  on ho_so for insert with check (auth.uid() = nguoi_dung);
create policy "sua ho so cua minh"  on ho_so for update using (auth.uid() = nguoi_dung);
create policy "xoa ho so cua minh"  on ho_so for delete using (auth.uid() = nguoi_dung);

create policy "doc lan rut cua minh" on lan_rut for select using (auth.uid() = nguoi_dung);
create policy "ghi lan rut cua minh" on lan_rut for insert with check (auth.uid() = nguoi_dung);

-- Sự kiện chỉ ghi vào, không đọc ra từ app. Muốn xem số liệu thì đọc từ máy chủ.
create policy "ghi su kien cua minh" on su_kien for insert with check (auth.uid() = nguoi_dung);

-- ============================================================ kiểm lại
-- Sau khi chạy file này, tự thử một lần cho chắc:
--   1. Lấy khoá công khai gọi thẳng vào REST API, chọn bảng ho_so.
--   2. Phải trả về mảng rỗng, hoặc chỉ đúng dòng của tài khoản đang đăng nhập.
--   3. Nếu trả về dòng của người khác thì khoá dòng chưa ăn. Dừng lại và sửa ngay.
