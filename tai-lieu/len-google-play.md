# Đưa Omora lên Google Play, từng bước

Mở file này cạnh Play Console mà làm. Chữ cần chép nằm ở
`tai-lieu/chu-nop-cho.md`.

Play Console đổi giao diện luôn, nên tên mục có thể lệch vài chữ. Cứ tìm theo ý
nghĩa chứ đừng tìm đúng từng chữ.

---

## Trước khi bắt đầu, chuẩn bị sẵn

| Thứ | Lấy ở đâu |
|---|---|
| File `.aab` | EAS gửi link sau khi đóng gói xong |
| Biểu tượng 512 × 512 | `assets/images/icon.png` |
| Ảnh bìa 1024 × 500 | `tai-lieu/anh-bia-play-1024x500.png` |
| 2–8 ảnh chụp màn | Tự chụp trên điện thoại |
| Chữ mô tả | `tai-lieu/chu-nop-cho.md` |
| Đường dẫn chính sách | https://toanvocuc.github.io/omora/quyen-rieng-tu.html |

---

## Bước 1 — Chụp ảnh màn hình

Chụp trên chính chiếc Vivo Y51 đang cài app. Sáu màn, theo thứ tự này:

1. Lá bài hôm nay
2. Màn rút bài lúc đang lật
3. Kết quả ba lá
4. Tử vi cung hoàng đạo
5. Biểu đồ ngày sinh
6. Độ hợp hai cung

Trước khi chụp: tắt chế độ tiết kiệm pin cho thanh trạng thái sạch sẽ, xoá hết
thông báo đang treo, và đừng để pin dưới 20% vì biểu tượng pin đỏ lọt vào ảnh.

Chuyển sang máy tính bằng Zalo hoặc cáp.

---

## Bước 2 — Mở app trong Play Console

Vào https://play.google.com/console → chọn app **Omora**
(`com.nexusgroup.omora`).

Bên trái có mục **Dashboard**, trong đó là danh sách việc phải hoàn tất. Làm từ
trên xuống.

---

## Bước 3 — Khai nội dung ứng dụng

Vào **Monitor and improve** → **Policy and programmes** → **App content**.
Có một loạt mục, mỗi mục bấm
Start rồi trả lời.

**App access** → chọn *All functionality is available without special access*.
App không bắt đăng nhập, nên không phải cấp tài khoản thử cho người duyệt.

**Ads** → *No, my app does not contain ads*

**Content rating** → điền bảng hỏi. Chọn nhóm **Reference, News, or Education**
hoặc **Entertainment**. Trả lời Không cho tất cả câu về bạo lực, tình dục, ngôn
từ thô tục, ma tuý, cờ bạc, nội dung đáng sợ.

> Câu cờ bạc dễ bị hiểu nhầm. Rút bài Tarot **không phải** cờ bạc: không đặt
> cược, không mất gì, không có phần thưởng ngẫu nhiên trả tiền. Trả lời **Không**.

**Target audience and content** → chọn **18 and over**, không tick bất kỳ nhóm
tuổi nào thấp hơn.

> Tick nhầm một nhóm dưới 18 là app rơi vào chính sách dành cho trẻ em, kéo theo
> cả loạt yêu cầu khác và gần như chắc chắn bị từ chối vì nội dung bói toán.

**News apps** → No
**COVID-19 apps** → No
**Government apps** → No
**Financial features** → *My app doesn't provide any financial features*
**Health apps** → No

**Privacy policy** → dán:
```
https://toanvocuc.github.io/omora/quyen-rieng-tu.html
```

**Data safety** → đây là mục dài nhất. Mở `tai-lieu/khai-bao-du-lieu-cho-hai-cho.md`
và chép theo từng ô. Trong đó đã ghi sẵn mọi lựa chọn cần tick.

---

## Bước 4 — Viết trang giới thiệu

Vào **Grow** → **Store presence** → **Main store listing**.

| Ô | Chép từ |
|---|---|
| App name | mục *Tên ứng dụng* |
| Short description | mục *Mô tả ngắn* |
| Full description | mục *Mô tả đầy đủ* |
| App icon | `assets/images/icon.png` |
| Feature graphic | `tai-lieu/anh-bia-play-1024x500.png` |
| Phone screenshots | ảnh vừa chụp ở bước 1 |

Nhớ bấm **Save** ở góc.

---

## Bước 5 — Chọn nơi phát hành

Vào **Release** → **Production** → thẻ **Countries / regions** → chọn Việt Nam.

Muốn bán ra nước ngoài thì chọn thêm, nhưng nội dung đang toàn tiếng Việt nên
để Việt Nam thôi là hợp lý.

---

## Bước 6 — Tạo bản phát hành

Vào **Release** → **Production** → **Create new release**.

**App signing**: Google sẽ hỏi về khoá ký. Chọn để Google quản lý
(*Play App Signing*). EAS đã ký bản `.aab` bằng khoá tải lên, Google ký lại bằng
khoá phát hành của họ. Đây là cách chuẩn và an toàn nhất.

**App bundle**: kéo thả file `.aab` vào.

**Release name**: để nguyên số Google tự điền.

**Release notes**: viết ngắn, ví dụ:
```
Phiên bản đầu tiên của Omora.
```

Bấm **Next** → **Save** → **Go to overview** → **Send for review**.

---

## Bước 7 — Chờ

Lần đầu Google duyệt có thể mất từ vài ngày tới hai tuần. Tài khoản mới thường
lâu hơn.

Bị trả về thì Google ghi rõ lý do trong email và trong Play Console. Gửi tôi
nguyên văn lý do đó, đừng tóm tắt lại — câu chữ của họ chỉ đúng một chính sách
cụ thể, tóm tắt là mất manh mối.

---

## Mấy chỗ hay vướng

**Tài khoản tổ chức không phải chạy thử nghiệm kín.** Google bắt tài khoản cá
nhân mở sau tháng 11/2023 phải chạy closed testing với 12 người trong 14 ngày
trước khi lên production. Tài khoản tổ chức được miễn. NEXUS là tài khoản tổ
chức. Nếu Play Console vẫn đòi thì báo tôi.

**Tên gói là vĩnh viễn.** `com.nexusgroup.omora` đã khớp. Sau khi phát hành thì
không đổi được nữa, muốn đổi là đăng app mới từ đầu.

**Đừng mất khoá ký.** EAS đang giữ khoá trên máy chủ của họ. Sao lưu bằng
`npx eas-cli credentials`. Mất khoá mà chưa bật Play App Signing là không cập
nhật được app nữa.

**Đổi bảng khai dữ liệu sau khi phát hành thì bị xét lại.** Nên nếu sắp thêm
đăng nhập, cân nhắc thêm trước rồi mới nộp một lần.
