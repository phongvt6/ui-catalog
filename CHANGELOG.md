# Changelog

Mọi thay đổi đáng kể của **ui-catalog** được ghi ở đây.

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/),
đánh số phiên bản theo [Semantic Versioning](https://semver.org/lang/vi/).

Nhóm thay đổi dùng đúng 6 nhãn sau: **Thêm mới** (tính năng mới) ·
**Thay đổi** (sửa hành vi/nội dung đã có) · **Ngừng dùng** (sắp gỡ) ·
**Gỡ bỏ** (đã gỡ) · **Sửa lỗi** · **Bảo mật**.

> ⚠️ **Bắt buộc:** cập nhật mục `[Chưa phát hành]` bên dưới **trước mỗi lần
> `git push`**. Xem [Quy trình phát hành](README.md#quy-trình-phát-hành).

## [Chưa phát hành]

### Thêm mới

- **Trang chủ dạng thư viện** (`#/`) — liệt kê toàn bộ 80 component thành lưới
  thẻ, gom theo 10 nhóm. Mỗi thẻ chứa **demo chạy thật, bấm/gõ được ngay tại
  chỗ** (không phải ảnh tĩnh), kèm tên Anh/Việt và link *Xem chi tiết*. Thẻ cố ý
  giữ gọn — phần diễn giải, công dụng và code nằm ở trang chi tiết.
  - Dải chip nhảy nhanh tới từng nhóm, kèm số lượng.
  - Nút *Chỉ xem nhóm này* đặt luôn bộ lọc nhóm ở sidebar.
  - Trang chủ tôn trọng bộ lọc và ô tìm kiếm ở sidebar.
  - Demo chỉ dựng khi thẻ lọt vào tầm nhìn (`IntersectionObserver`) — tránh
    chạy 80 demo và hàng loạt `setInterval` cùng lúc.
- **Trang Nhật ký thay đổi ngay trong app** (`#/changelog`) — mọi người theo dõi
  app có gì mới mà không cần mở repo. Trang này **đọc thẳng `CHANGELOG.md`**
  (`?raw` lúc build) nên không có nguy cơ lệch nội dung: hook `pre-push` kiểm
  tra đúng file mà trang hiển thị.
  - Kèm bộ dựng markdown tối giản, chỉ hỗ trợ đúng cú pháp file này dùng
    (tiêu đề, gạch đầu dòng 2 cấp, trích dẫn, đậm/nghiêng/code/link) — không
    phải thêm thư viện markdown nào.
  - Nhãn nhóm thay đổi được tô màu theo mức độ: Thêm mới xanh lá, Thay đổi xanh
    dương, Sửa lỗi đỏ…
- Mục **Trang chủ** và **Nhật ký thay đổi** ở đầu sidebar; logo trên header bấm
  được để về trang chủ.
- `src/lib/clipboard.ts` — hàm `copyText` dùng chung.

### Thay đổi

- Vào app không kèm hash thì mở **trang chủ**, thay vì tự nhảy vào component
  đầu tiên như trước.
- Chọn một component sẽ cuộn khung nội dung về đầu trang.

### Sửa lỗi

- **Nút sao chép code thất bại trong im lặng.** `navigator.clipboard.writeText`
  có thể bị từ chối (không phải secure context, tài liệu không được focus) —
  trước đây promise bị bỏ rơi, giao diện không báo gì cả. Nay có phương án dự
  phòng bằng `document.execCommand('copy')` và trạng thái *✕ Không chép được*
  khi cả hai cách đều hỏng. Áp dụng cho cả trang chủ lẫn trang chi tiết.
- **Demo Cây phân cấp không mở sẵn cấp con.** Sót lại từ lần đổi dữ liệu mẫu ở
  0.3.0: `useState` vẫn mở nút `dong-nai` trong khi id đã đổi thành `hcm`, làm
  nhánh TP. Hồ Chí Minh hiện ra ở trạng thái đóng.

## [0.3.0] – 2026-07-22

### Thay đổi

- **Toàn bộ dữ liệu mẫu chuyển sang trung tính, không gắn với dự án cụ thể** —
  app dùng chung được cho nhiều dự án khác nhau:
  - Đơn vị nghiệp vụ: “trạm dừng nghỉ / VRS-07 Long Thành” → “chi nhánh /
    CN-07 Quận 1”.
  - Danh mục: “ngành hàng: Xăng dầu / Cửa hàng tiện lợi / Nhà hàng” →
    “danh mục: Thiết bị / Vật tư / Dịch vụ”.
  - Thương hiệu trong demo Navbar và hộp thoại xin quyền: “VRS” → “Acme”.
  - Cây phân cấp: Miền Nam → TP. Hồ Chí Minh / Bình Dương; Miền Trung → Đà Nẵng.
  - Danh sách trong demo Ô tìm kiếm: đồ ăn uống → thiết bị văn phòng.
  - Địa chỉ mẫu: “Km 32 cao tốc HCM – Long Thành” → “Số 12 Lê Lợi, Quận 1, TP.HCM”.
  - Định danh trong đoạn code mẫu: `stop` / `stops` → `branch` / `branches`.

### Thêm mới

- `CHANGELOG.md` này, kèm quy trình bắt buộc cập nhật trước khi push.
- Script `scripts/pre-push` và lệnh `npm run changelog:check` để chặn push khi
  changelog chưa được cập nhật.

## [0.2.0] – 2026-07-22

### Thêm mới

- **20 component mới, nâng tổng số từ 60 lên 80:**
  - _Nhập liệu:_ OTP / mã xác thực, Ô nhập tiền (định dạng khi gõ), Bộ chọn giờ,
    Bộ chọn màu, Trình soạn thảo định dạng (WYSIWYG).
  - _Hành động:_ Nút kép có menu (Split Button), Nhóm nút / Thanh công cụ.
  - _Điều hướng:_ Bảng lệnh nhanh (⌘K), Mục lục trong trang (scrollspy).
  - _Phản hồi:_ Hộp thông báo, Hướng dẫn lần đầu (coach mark),
    Dải báo kết nối / đồng bộ.
  - _Hiển thị dữ liệu:_ Cây phân cấp, Bảng Kanban, Lịch tháng, Luồng bình luận.
  - _Media:_ Trình phát video, Bản đồ có ghim.
  - _Đặc thù mobile:_ Thanh nút cố định đáy, Hỏi quyền truy cập.
- 5 file dữ liệu mới: `inputsAdvanced`, `actionsAdvanced`, `feedbackAdvanced`,
  `dataAdvanced`, `mediaAdvanced`.

## [0.1.0] – 2026-07-22

### Thêm mới

- Bản đầu tiên: **60 component, chia 10 nhóm** (Nhập liệu, Chọn lựa, Hành động,
  Điều hướng, Phản hồi, Hiển thị dữ liệu, Bố cục, Lớp phủ, Media & tệp,
  Đặc thù mobile).
- Mỗi mục gồm 7 phần: tên Anh/Việt + alias, demo tương tác, diễn giải, công dụng,
  biến thể & trạng thái, Nên / Không nên, tên tương đương trên iOS & Android.
- Chuyển đổi **Web ↔ Mobile** cho mỗi demo; bản mobile hiển thị trong khung
  điện thoại mô phỏng (`PhoneFrame`).
- Tab **Code** kèm nút sao chép đoạn JSX mẫu.
- Tìm kiếm theo tên, alias và nội dung mô tả, **gõ không dấu vẫn ra kết quả**.
- Hai bộ lọc (nhóm, nền tảng) dạng combobox gõ-để-tìm, điều khiển bằng
  ↑ ↓ Enter Esc.
- Định tuyến bằng hash `#/<id>` — mỗi component có link chia sẻ riêng, mở link
  thì sidebar tự cuộn tới đúng mục.
- Chế độ sáng / tối, ghi nhớ lựa chọn trong `localStorage`.
- Thư viện primitive `.d-*` trong `index.css` để viết demo mới nhanh và đồng nhất.

[Chưa phát hành]: https://example.com/ui-catalog/compare/v0.3.0...HEAD
[0.3.0]: https://example.com/ui-catalog/releases/tag/v0.3.0
[0.2.0]: https://example.com/ui-catalog/releases/tag/v0.2.0
[0.1.0]: https://example.com/ui-catalog/releases/tag/v0.1.0
