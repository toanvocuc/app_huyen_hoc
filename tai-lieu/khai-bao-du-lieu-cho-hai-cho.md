# Khai báo dữ liệu cho Google Play và App Store

Hai chợ đều bắt khai app thu thập gì trước khi duyệt. Khai sai bị gỡ app, nên
file này chép đúng theo những gì trong mã nguồn đang thật sự gửi lên Supabase.

Nguồn đối chiếu: `trang-web/quyen-rieng-tu.html` mục 2, và `src/lib/`.

---

## Phần chung: app thật sự gửi đi những gì

| Dữ liệu | Khi nào gửi | Bắt buộc |
|---|---|---|
| Họ và tên | Lúc lập hồ sơ | Có |
| Ngày sinh | Lúc lập hồ sơ | Có |
| Giờ sinh | Lúc lập hồ sơ | Không |
| Nơi sinh | Lúc lập hồ sơ | Không |
| Giới tính | Lúc lập hồ sơ | Có |
| Câu hỏi gõ khi rút bài | Khi người dùng tự gõ | Không |
| Lịch sử rút bài | Mỗi lần rút | Có |
| Mã tài khoản ẩn danh | Lần mở app đầu tiên | Có |
| Mã thiết bị nhận thông báo | Chỉ khi người dùng bật thông báo | Không |
| Ba mốc sử dụng (xem hết kết quả, thấy mục hỏi chuyên gia, bấm vào đó) | Tự động | Có |

**Không** có: vị trí, danh bạ, ảnh, micro, camera, lịch sử duyệt web, quảng cáo,
thanh toán, email, mật khẩu.

**Không** bán dữ liệu cho ai. **Không** theo dõi người dùng sang app khác.

---

## Google Play — mục "Data safety"

Đường đi: Play Console → app → **Policy and programmes** → **App content** →
**Data safety** → Start / Manage.

### Bước 1 — hai câu hỏi mở đầu

| Câu hỏi | Trả lời |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (app nối Supabase qua HTTPS) |
| Do you provide a way for users to request that their data be deleted? | **Yes** — chọn tiếp *Users can request that data is deleted* |
| URL xoá dữ liệu | Để đường dẫn trang chính sách, mục 8 |

### Bước 2 — chọn loại dữ liệu

Tick đúng bốn nhóm dưới, không tick gì thêm.

#### Personal info → Name
| Trường | Chọn |
|---|---|
| Collected | Yes |
| Shared | **No** |
| Processed ephemerally | No |
| Required or optional | **Required** |
| Purposes | App functionality, Personalisation |

#### Personal info → Other info
*(gộp ngày sinh, giờ sinh, nơi sinh, giới tính)*

| Trường | Chọn |
|---|---|
| Collected | Yes |
| Shared | **No** |
| Processed ephemerally | No |
| Required or optional | **Required** |
| Purposes | App functionality, Personalisation |

#### App activity → Other user-generated content
*(câu hỏi khách gõ khi rút bài, và lịch sử rút bài)*

| Trường | Chọn |
|---|---|
| Collected | Yes |
| Shared | **No** |
| Processed ephemerally | No |
| Required or optional | **Optional** |
| Purposes | App functionality |

#### App activity → App interactions
*(ba mốc sử dụng)*

| Trường | Chọn |
|---|---|
| Collected | Yes |
| Shared | **No** |
| Processed ephemerally | No |
| Required or optional | **Required** |
| Purposes | **Analytics**, App functionality |

#### Device or other IDs → Device or other IDs
*(mã tài khoản ẩn danh và mã thiết bị nhận thông báo)*

| Trường | Chọn |
|---|---|
| Collected | Yes |
| Shared | **No** |
| Processed ephemerally | No |
| Required or optional | **Required** |
| Purposes | App functionality |

> Supabase và Expo là **nhà cung cấp hạ tầng xử lý thay mình**, không tính là
> "shared" theo định nghĩa của Google. Vì vậy mọi dòng đều trả lời Shared = No.
> Lý do này đã ghi rõ ở mục 5 trang chính sách, phòng khi người duyệt hỏi.

### Bước 3 — các mục khác cùng trang App content

| Mục | Trả lời |
|---|---|
| Privacy policy | Dán đường dẫn `quyen-rieng-tu.html` sau khi đăng web |
| Ads | **No ads** |
| App access | All functionality available without special access — app không cần đăng nhập |
| Content rating | Khai bảng hỏi, chọn nhóm **Reference / News** hoặc **Entertainment**; trả lời No cho mọi câu về bạo lực, tình dục, cờ bạc, chất kích thích |
| Target audience | **18 and over** — không tick bất kỳ nhóm tuổi trẻ em nào |
| News app | No |
| COVID-19 apps | No |
| Data safety | Như trên |
| Government apps | No |
| Financial features | **None** |
| Health apps | No |

> Phần **Target audience** quan trọng. Chọn nhầm có nhóm dưới 18 là rơi vào
> *Families policy*, kéo theo cả loạt yêu cầu khác và gần như chắc chắn bị từ chối
> vì nội dung bói toán.

---

## App Store — mục "App Privacy"

Đường đi: App Store Connect → app → **App Privacy** → Get Started.

### Câu hỏi đầu tiên
> Do you or your third-party partners collect data from this app?

→ **Yes, we collect data from this app**

### Chọn loại dữ liệu

Apple hỏi ba thứ cho mỗi loại: dùng làm gì, có gắn với danh tính người dùng
không (*Linked to You*), có dùng để theo dõi không (*Tracking*).

**Mọi loại dưới đây đều trả lời Tracking = No.** App không theo dõi người dùng
sang app hay website khác, và không chia sẻ dữ liệu cho mạng quảng cáo nào.

| Loại dữ liệu Apple | Tương ứng | Purpose | Linked to You | Tracking |
|---|---|---|---|---|
| Contact Info → **Name** | Họ và tên | App Functionality | **Yes** | No |
| User Content → **Other User Content** | Câu hỏi khi rút bài, lịch sử rút bài | App Functionality | **Yes** | No |
| Identifiers → **User ID** | Mã tài khoản ẩn danh | App Functionality | **Yes** | No |
| Identifiers → **Device ID** | Mã thiết bị nhận thông báo | App Functionality | **Yes** | No |
| Usage Data → **Product Interaction** | Ba mốc sử dụng | Analytics, App Functionality | **Yes** | No |
| Other Data → **Other Data Types** | Ngày sinh, giờ sinh, nơi sinh, giới tính | App Functionality, Personalisation | **Yes** | No |

Ở ô mô tả của **Other Data Types**, gõ:

> Ngày sinh, giờ sinh, nơi sinh và giới tính, dùng để tính cung hoàng đạo, thần
> số học và chọn nội dung luận giải phù hợp.

> **Linked to You = Yes** cho tất cả, vì mọi dòng đều gắn với mã tài khoản của
> máy đó. Tài khoản tuy ẩn danh nhưng vẫn là một mã định danh ổn định, Apple
> tính là linked.

> Vì Tracking = No ở mọi dòng, app **không cần** bảng xin phép App Tracking
> Transparency. Không được thêm `NSUserTrackingUsageDescription` vào app.

### Các mục khác của App Store Connect

| Mục | Trả lời |
|---|---|
| Privacy Policy URL | Đường dẫn `quyen-rieng-tu.html` |
| Age Rating | **17+** hoặc **18+** (Apple có mục *Horoscopes* trong bảng hỏi, chọn Frequent/Intense) |
| Content Rights | Xác nhận có quyền dùng toàn bộ nội dung |
| Does your app use encryption? | **Yes**, nhưng chỉ là HTTPS chuẩn → chọn tiếp *exempt* theo mục 740.17(b) |

> Câu về mã hoá làm nhiều người vướng. App chỉ gọi HTTPS thông thường nên thuộc
> diện miễn khai báo xuất khẩu. **Chỗ này đã xử lý sẵn trong `app.json`** bằng
> `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`, nên App Store Connect sẽ
> không hỏi lại mỗi lần nộp bản mới.

---

## Những chỗ dễ bị từ chối

| Rủi ro | Cách tránh |
|---|---|
| Nội dung bói toán bị coi là lừa dối | Câu tuyên bố "chỉ mang tính giải trí" phải **hiện trong app**, không chỉ nằm ở điều khoản. Hiện đã có ở màn kết quả. |
| Khai Target audience có trẻ em | Chọn 18+ ở cả hai chợ |
| Chính sách chưa đăng web | Chợ bấm thử đường dẫn. Phải mở được công khai, không cần đăng nhập. |
| Tên công ty trên chợ khác tên trong chính sách | Phải thống nhất trước khi nộp |
| Apple hỏi "app này có gì khác web" | Omora có thông báo đẩy, lưu hồ sơ ngoại tuyến, xuất ảnh chia sẻ. Trả lời được. |
