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

- **Gộp app chart-catalog vào đây — một app, hai khu vực.** Header có hai tab
  *Component (93)* và *Biểu đồ (56)*; đổi tab là sidebar đổi luôn sang danh sách
  nhóm của khu đó, nên mỗi lúc vẫn chỉ nhìn một danh sách ngắn.
  - Đường dẫn khu Biểu đồ: `#/chart` (tất cả), `#/chart/nhom/<id>` (nhóm),
    `#/chart/<id>` (chi tiết), `#/chart/kien-thuc`, `#/chart/nguyen-tac`.
  - **Ô tìm kiếm tìm cả hai khu cùng lúc**, kết quả tách thành hai phần
    *Component* và *Biểu đồ*.
  - CSS của khu Biểu đồ được đưa hết vào `.chart-scope` bằng script, kể cả token
    màu riêng (`--ink`, `--plane`, `--grid`…), nên hai khu không giẫm chân nhau
    dù trùng tên class (`.card`, `.main`, `.badge`…).
  - Nút sáng/tối dùng chung: đổi theme sẽ phát sự kiện để biểu đồ vẽ lại đúng
    bảng màu của chế độ đó.
  - **Bundle đầu không hề nặng thêm** (498 kB, trước khi gộp là 492 kB): ECharts
    (~1 MB) và toàn bộ code demo biểu đồ chỉ tải khi mở khu Biểu đồ hoặc khi gõ
    tìm kiếm.

### Thay đổi

- **Bố cục tổng đổi sang 3 cấp: trang chủ → trang nhóm → trang chi tiết**, học
  từ app chart-catalog cùng bộ.
  - **Sidebar gọn còn 13 dòng** (296px → 232px): *Tất cả*, 10 nhóm kèm số lượng,
    *Nhật ký thay đổi*. Trước đây cột trái liệt kê cả 93 component nên cuộn mãi
    không hết; giờ danh sách nằm ở trang nhóm. Sidebar cũng bỏ nền và viền phải
    cho nhẹ mắt.
  - **Trang riêng cho từng nhóm** (`#/nhom/<id>`) — chỉ component của nhóm đó,
    kèm chip lọc **Tất cả / Web / Mobile** ngay trong trang.
  - **Trang chi tiết có link `← <tên nhóm>`** để quay lại đúng chỗ vừa rời đi.
  - **Ô tìm kiếm chuyển lên thanh trên cùng**; gõ vào là khung nội dung thành
    trang kết quả gom theo nhóm, thay vì lọc danh sách ở cột trái. Đi tới bất kỳ
    trang nào cũng tự thoát khỏi kết quả tìm kiếm.
  - Trên màn hẹp, sidebar thành một dải nhóm cuộn ngang thay vì chiếm 40% chiều
    cao màn hình.
  - **Tên app trên header to và rõ hơn** (17px): bỏ dòng phụ “93 component · 10
    nhóm” — số lượng đã có sẵn ngay cạnh từng nhóm ở sidebar.

### Gỡ bỏ

- **Hai combobox lọc (nhóm, nền tảng) ở đầu sidebar** — lọc nhóm nay là chính
  sidebar, lọc nền tảng thành chip trong trang nhóm. `Combobox.tsx` và phần CSS
  `.combo-*` đã xoá.
- Dải chip “nhảy tới nhóm” và nút *Chỉ xem nhóm này* ở trang chủ — thay bằng
  link *Mở nhóm (N) →* và tiêu đề nhóm bấm được.

### Thêm mới

- **Trang “Mới cập nhật”** (`#/moi`) — xem nhanh đợt nào vừa thêm những gì, xếp
  mới nhất trước, mỗi đợt kèm ngày, số mục và các nhóm bị ảnh hưởng. Trước đây
  muốn biết có gì mới phải đọc changelog rồi tự đi tìm từng mục.
  - Mỗi entry mang trường `since` (phiên bản xuất hiện lần đầu), gán theo lô ở
    `src/data/index.ts` nên thêm mục mới không phải sửa từng entry.
  - Thẻ của component thuộc đợt mới nhất có nhãn **Mới**; sidebar hiện số lượng
    trong chip màu nhấn.
- **4 component xem dữ liệu theo thời gian và theo thẻ** (`src/data/dataViz.tsx`)
  — thư viện lên **93 mục**:
  - **Gantt Chart** — thanh công việc trên trục 14 ngày, đường “hôm nay”, phần
    tô theo % hoàn thành, bấm một việc để xem người phụ trách và việc nó phụ
    thuộc.
  - **Timeline View** (kiểu Notion) — bản ghi có ngày thành thanh trên trục thời
    gian, gom theo làn người phụ trách, đổi mức **Ngày / Tuần / Tháng**; zoom xa
    thì thanh bỏ nhãn, giữ màu và tooltip.
  - **Gallery / Card View** — chế độ xem dạng lưới thẻ của một bảng dữ liệu, đổi
    cỡ thẻ (2 ↔ 3 cột) và bật/tắt hiển thị thuộc tính.
  - **Horizontal Card Rail** — dải thẻ kéo ngang có `scroll-snap`, nút ‹ › tự mờ
    khi chạm đầu/cuối, vệt mờ ở mép và thanh chỉ vị trí.
- **9 component nhóm ảnh** (`src/data/gallery.tsx`) — bổ sung vào nhóm *Media &
  tệp*, nâng thư viện từ 80 lên **89 mục**. Mỗi mục là demo chạy thật, ảnh minh
  hoạ vẽ bằng gradient + SVG nên không phụ thuộc mạng:
  - **Lightbox / Image Viewer** — mở ảnh lớn trên lớp phủ, có ‹ ›, số thứ tự,
    đóng bằng Esc / ✕ / bấm ra nền.
  - **Image Gallery / Photo Grid** — lưới thumbnail vuông, ô cuối “+N” bấm để
    xem toàn bộ.
  - **Photo Slideshow / Thumbnail Strip** — ảnh lớn + dải thumbnail cuộn ngang,
    có nút tự chạy.
  - **Image Comparison Slider** — thanh kéo so sánh ảnh trước/sau, điều khiển
    bằng `<input type="range">` nên dùng được bàn phím.
  - **Zoom & Pan Viewer** — phóng to bằng nút/thanh trượt rồi kéo xem, có chặn
    biên để ảnh không trôi khỏi khung.
  - **Image Cropper** — khung cắt khoá tỷ lệ 1:1 / 4:3 / 16:9, lưới ba phần,
    kéo và phóng để chọn phần giữ lại.
  - **Masonry Gallery** — lưới so le giữ đúng tỷ lệ gốc từng ảnh.
  - **Image Picker with Preview** — xem trước ảnh đã chọn, bỏ ảnh, đổi thứ tự
    bằng nút ← →, đặt ảnh bìa.
  - **Story / Fullscreen Photo Viewer** (mobile) — ảnh tự chuyển kèm dải thanh
    tiến độ, chạm nửa trái/phải để lùi/tiến, có nút tạm dừng.
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
