# ui-catalog — Từ điển UI (Element & Component)

**Bản đã triển khai: <https://ui-catalog-two.vercel.app>**

Từ điển tra cứu **mọi chủng loại element / component** của một trang web và một
app mobile — hiện có **89 mục, chia 10 nhóm**. Mỗi mục có đủ 4 phần cốt lõi +
3 phần bổ sung:

| Phần | Nội dung |
| --- | --- |
| **Tên gọi** | Tên tiếng Anh (chuẩn để nói chuyện với dev/designer) + tên tiếng Việt + các tên gọi khác (alias) |
| **Demo** | Bấm/gõ được thật, xem ở cả bản **Web** lẫn bản **Mobile** (trong khung điện thoại) |
| **Diễn giải** | Nó *là* cái gì |
| **Công dụng** | Dùng để *làm gì*, khi nào nên chọn nó thay vì cái khác |
| Biến thể & trạng thái | default / hover / focus / disabled / error / loading… |
| Nên – Không nên | Các lỗi hay gặp nhất khi dùng sai component |
| Tên native | Tên tương đương trên iOS và Android |

Ngoài ra mỗi mục có tab **Code** để copy đoạn JSX/HTML mẫu.

## Chạy

```bash
npm install
npm run dev
```

Dev server ở http://localhost:5179 (đã đăng ký trong `.claude/launch.json` ở
thư mục gốc với tên `ui-catalog`).

```bash
npm run build      # tsc -b rồi vite build -> dist/
npm run typecheck
npm run lint
```

## Cách dùng

- **Trang chủ** (`#/`, hoặc bấm logo) là thư viện toàn bộ 89 component xếp thành
  lưới thẻ theo nhóm. Mỗi thẻ là một **demo chạy thật** — bấm, gõ, kéo ngay trên
  trang chủ, không cần mở trang chi tiết. Thẻ chỉ có demo + tên; diễn giải, công
  dụng và đoạn code nằm ở trang chi tiết.
- **Tìm kiếm** ở đầu cột trái: tìm theo tên Anh/Việt, alias, và cả nội dung mô
  tả. Gõ **không dấu** vẫn ra kết quả (`o nhap` → *Ô nhập văn bản*).
- **Hai bộ lọc** (nhóm, nền tảng) đều là combobox gõ-để-tìm, có ↑ ↓ Enter Esc.
- **Link chia sẻ**: mỗi component có URL riêng dạng `#/<id>`, ví dụ
  http://localhost:5179/#/bottom-sheet — dán vào chat là người kia mở đúng mục.
- **Nhật ký thay đổi** (`#/changelog`) hiển thị ngay trong app, đọc thẳng từ
  `CHANGELOG.md` lúc build — sửa file đó là trang trong app đổi theo.
- **Nút ☾ / ☀** ở góc phải đổi sáng/tối, dùng để kiểm tra component ở cả hai chế độ.

## Quy trình phát hành

> **Bắt buộc: cập nhật [`CHANGELOG.md`](CHANGELOG.md) trước mỗi lần `git push`.**

1. Sửa code.
2. Thêm mục vào phần `[Chưa phát hành]` của `CHANGELOG.md`, dùng đúng một trong
   6 nhãn: Thêm mới / Thay đổi / Ngừng dùng / Gỡ bỏ / Sửa lỗi / Bảo mật.
3. Khi cắt phiên bản: đổi `[Chưa phát hành]` thành `[x.y.z] – yyyy-mm-dd`, tạo
   lại mục `[Chưa phát hành]` rỗng, cập nhật `version` trong `package.json`.
4. `npm run prepush` (typecheck + lint + kiểm tra changelog) rồi mới push.

Việc này được **cưỡng chế bằng git hook**, không chỉ là quy ước:

```bash
npm run hooks:install
```

Hook `pre-push` chặn push khi có thay đổi trong `src/`, `public/`, `index.html`,
`package.json` hoặc `vite.config.ts` mà `CHANGELOG.md` không đổi trong cùng
khoảng commit. Commit chỉ sửa tài liệu thì không bị chặn.

| Lệnh | Việc |
| --- | --- |
| `npm run hooks:install` | Cài hook `pre-push` (chạy một lần sau khi `git init` / `git clone`) |
| `npm run changelog:check` | Kiểm tra tay, so `HEAD` với nhánh upstream |
| `npm run prepush` | typecheck + lint + kiểm tra changelog |
| `SKIP_CHANGELOG=1 git push` | Bỏ qua trong trường hợp khẩn cấp — hạn chế dùng |

> Hook nằm trong `.git/hooks/`, **không** đi theo repo. Mỗi lần clone mới phải
> chạy lại `npm run hooks:install`.

## Cấu trúc

```
src/
  types.ts               Kiểu CatalogEntry + danh sách 10 nhóm (CATEGORIES)
  data/
    index.ts             Gộp tất cả entry + hàm bỏ dấu tiếng Việt cho tìm kiếm
    inputs.tsx           Nhập liệu + Chọn lựa
    inputsAdvanced.tsx   OTP, ô nhập tiền, chọn giờ, chọn màu, soạn thảo định dạng
    actions.tsx          Hành động + Điều hướng
    actionsAdvanced.tsx  Nút kép, nhóm nút, bảng lệnh ⌘K, mục lục trong trang
    feedback.tsx         Phản hồi
    feedbackAdvanced.tsx Hộp thông báo, hướng dẫn lần đầu, dải báo kết nối
    dataDisplay.tsx      Hiển thị dữ liệu + Bố cục
    dataAdvanced.tsx     Cây phân cấp, Kanban, lịch tháng, luồng bình luận
    overlay.tsx          Lớp phủ
    mediaMobile.tsx      Media & tệp + Đặc thù mobile
    mediaAdvanced.tsx    Video, bản đồ, thanh nút cố định đáy, hỏi quyền truy cập
    gallery.tsx          Xem ảnh: lightbox, gallery, slide ảnh, cắt/zoom ảnh, story
  lib/
    clipboard.ts         copyText() — có phương án dự phòng khi clipboard bị chặn
  components/
    Combobox.tsx         Dropdown gõ-để-tìm dùng cho bộ lọc
    PhoneFrame.tsx       Khung điện thoại bọc demo mobile
    HomePage.tsx         Trang chủ: lưới thẻ demo sống của toàn bộ component
    ChangelogPage.tsx    Hiển thị CHANGELOG.md trong app (parser markdown tối giản)
    EntryDetail.tsx      Trang chi tiết một component
  App.tsx                Shell: header + sidebar lọc + main
  index.css              Design token + shell + thư viện primitive `.d-*` cho demo
scripts/
  check-changelog.sh     Logic kiểm tra changelog (dùng chung cho hook + lệnh tay)
  pre-push               Git hook, gọi lại script trên
  install-hooks.sh       Cài hook vào .git/hooks/
CHANGELOG.md             Bắt buộc cập nhật trước khi push
```

## Thêm một component mới

1. Mở file `src/data/<nhóm>.tsx` tương ứng.
2. Viết một component demo (đặt ở khối *Demos* đầu file), dùng các class
   primitive có sẵn trong `index.css`: `.d-btn`, `.d-field`, `.d-card`,
   `.d-badge`, `.d-alert`, `.d-table`, `.d-avatar`, `.d-spinner`, `.d-skeleton`…
   Đừng hard-code màu — dùng biến CSS (`var(--accent)`, `var(--fg-muted)`) để
   component hiển thị đúng ở cả chế độ sáng lẫn tối.
3. Thêm một object `CatalogEntry` vào mảng export ở cuối file. `id` phải là
   duy nhất trong toàn catalog vì nó chính là URL `#/<id>`.
4. Nếu bản mobile khác hẳn bản web thì viết thêm `mobileDemo`; bỏ trống thì
   demo web sẽ được dùng lại bên trong khung điện thoại.
5. Ghi một dòng vào `[Chưa phát hành]` trong `CHANGELOG.md`.

**Dữ liệu mẫu phải trung tính.** App này dùng chung cho nhiều dự án nên demo
không được gắn bối cảnh của một khách hàng cụ thể. Bộ từ vựng đang dùng: đơn vị
là *chi nhánh* (`CN-07 Quận 1`), phân loại là *danh mục* (Thiết bị / Vật tư /
Dịch vụ), thương hiệu giả định là *Acme*, người dùng là *Nguyễn Văn A / Trần Thị
B*. Giữ nguyên bộ này khi thêm demo mới.

Muốn thêm nhóm mới: thêm một mục vào `CATEGORIES` trong `src/types.ts` và bổ
sung id đó vào union `CategoryId`.
