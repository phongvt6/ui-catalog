/* eslint-disable react-refresh/only-export-components -- demo components được đặt cạnh dữ liệu catalog cho dễ đối chiếu */
import { useEffect, useRef, useState } from 'react'
import type { CatalogEntry } from '../types'

/* -------------------------------------------------------------------------- */
/* Demos                                                                       */
/* -------------------------------------------------------------------------- */

type PinMode = 'static' | 'sticky' | 'fixed'

const PIN_MODES: { id: PinMode; label: string }[] = [
  { id: 'static', label: 'static' },
  { id: 'sticky', label: 'sticky' },
  { id: 'fixed', label: 'fixed' },
]

const PIN_NOTE: Record<PinMode, string> = {
  static:
    'Nằm trong luồng, cuộn đi mất. Cuộn tới giữa bảng là không còn biết cột nào là cột nào.',
  sticky:
    'Vẫn CHIẾM CHỖ trong luồng, chỉ dính khi chạm mốc `top` — và bị giới hạn trong khối cha: tiêu đề nhóm bị tiêu đề kế tiếp đẩy ra.',
  fixed:
    'Ra khỏi luồng: không chiếm chỗ nên đè lên nội dung (dòng đầu bị che), và neo theo VIEWPORT chứ không theo khung cuộn này.',
}

const PIN_GROUPS = [
  { id: 'mien-nam', label: 'Miền Nam', rows: ['CN-07 Quận 1', 'CN-12 Thủ Đức', 'CN-03 Dĩ An'] },
  { id: 'mien-trung', label: 'Miền Trung', rows: ['CN-19 Hải Châu', 'CN-22 Nha Trang'] },
  { id: 'mien-bac', label: 'Miền Bắc', rows: ['CN-01 Hoàn Kiếm', 'CN-05 Cầu Giấy', 'CN-08 Hải An'] },
]

function StickyVsFixedDemo() {
  const [mode, setMode] = useState<PinMode>('sticky')

  const barStyle =
    mode === 'fixed'
      ? ({ position: 'absolute', top: 0, right: 0, left: 0, zIndex: 3 } as const)
      : mode === 'sticky'
        ? ({ position: 'sticky', top: 0, zIndex: 3 } as const)
        : ({ position: 'static' } as const)

  return (
    <div className="d-panel d-stack" style={{ maxWidth: 460 }}>
      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 13 }}>Cùng một thanh, ba kiểu định vị</strong>
        <div className="d-row" style={{ gap: 4 }}>
          {PIN_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              className={mode === m.id ? 'd-btn is-sm' : 'd-btn is-secondary is-sm'}
              onClick={() => setMode(m.id)}
              style={{ padding: '2px 9px', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Khung cuộn đóng vai "viewport" của ví dụ. Với `fixed` thật, mốc neo là
          viewport của trình duyệt — ở đây mô phỏng bằng absolute để thấy đúng
          cái khác biệt quan trọng: ra khỏi luồng, không chiếm chỗ. */}
      <div
        style={{
          position: 'relative',
          height: 210,
          overflow: 'auto',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
        }}
      >
        <div
          style={{
            ...barStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span>Chi nhánh · 8 mục</span>
          <span
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 10,
              color: 'var(--fg-subtle)',
            }}
          >
            position: {mode}
          </span>
        </div>

        {PIN_GROUPS.map((g) => (
          <section key={g.id}>
            <h4
              style={{
                // Tiêu đề nhóm luôn sticky — để thấy đặc tính "bị khối cha giữ
                // lại": nhóm sau tới là nhóm trước bị đẩy ra, không chồng lên.
                position: mode === 'static' ? 'static' : 'sticky',
                top: mode === 'sticky' ? 34 : 0,
                zIndex: 2,
                margin: 0,
                padding: '5px 10px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {g.label}
            </h4>
            {g.rows.map((r) => (
              <div
                key={r}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 10px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12,
                }}
              >
                <span>{r}</span>
                <span style={{ color: 'var(--fg-subtle)', fontVariantNumeric: 'tabular-nums' }}>
                  {(r.charCodeAt(3) * 7) % 90} tỷ đ
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>

      <p className="d-hint" style={{ minHeight: 34 }}>
        {PIN_NOTE[mode]}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

interface Person {
  id: string
  name: string
  handle: string
  role: string
  initials: string
  stats: { label: string; value: string }[]
  align: 'left' | 'right'
}

const PEOPLE: Person[] = [
  {
    id: 'ha',
    name: 'Nguyễn Thu Hà',
    handle: '@thuha',
    role: 'Kế toán trưởng · Khối Miền Nam',
    initials: 'TH',
    stats: [
      { label: 'Chi nhánh phụ trách', value: '12' },
      { label: 'Báo cáo đã duyệt', value: '48' },
    ],
    align: 'left',
  },
  {
    id: 'nam',
    name: 'Trần Văn Nam',
    handle: '@vannam',
    role: 'Chuyên viên đối soát',
    initials: 'VN',
    stats: [
      { label: 'Phiếu đối soát', value: '213' },
      { label: 'Đang chờ xử lý', value: '6' },
    ],
    align: 'right',
  },
]

const OPEN_DELAY = 350
const CLOSE_DELAY = 220

function HoverCardDemo() {
  const [open, setOpen] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const clear = () => window.clearTimeout(timer.current)
  useEffect(() => clear, [])

  // Mở có ĐỘ TRỄ để lướt chuột ngang qua không bung thẻ; đóng cũng có độ trễ
  // để con trỏ kịp đi từ tên xuống thẻ mà không rơi mất.
  const schedule = (id: string) => {
    clear()
    setPending(id)
    timer.current = window.setTimeout(() => {
      setPending(null)
      setOpen(id)
    }, OPEN_DELAY)
  }

  const dismiss = () => {
    clear()
    setPending(null)
    timer.current = window.setTimeout(() => setOpen(null), CLOSE_DELAY)
  }

  const keep = () => clear()

  return (
    <div
      className="d-panel d-stack"
      /* Chừa sẵn chỗ cho thẻ bung xuống — thẻ định vị tuyệt đối nên không tự
         đẩy khung cao ra. */
      style={{ maxWidth: 460, minHeight: 268, alignContent: 'start' }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          clear()
          setOpen(null)
          setPending(null)
        }
      }}
    >
      {/* Đoạn văn dựng bằng div: thẻ bung ra có cấu trúc riêng (div, p, nút),
          không hợp lệ nếu nằm trong một <p>. */}
      <div style={{ fontSize: 13, lineHeight: 2.1 }}>
        Báo cáo quý III do{' '}
        {PEOPLE.map((p, i) => (
          <span key={p.id}>
            {i > 0 && ' đối soát cùng '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                className="d-btn is-ghost is-sm"
                aria-expanded={open === p.id}
                aria-describedby={open === p.id ? `hc-${p.id}` : undefined}
                onMouseEnter={() => schedule(p.id)}
                onMouseLeave={dismiss}
                onFocus={() => {
                  clear()
                  setOpen(p.id)
                }}
                onBlur={dismiss}
                onClick={() => {
                  clear()
                  setOpen((v) => (v === p.id ? null : p.id))
                }}
                style={{
                  padding: '1px 5px',
                  color: 'var(--accent)',
                  fontSize: 13,
                  textDecoration: 'underline',
                  textDecorationStyle: pending === p.id ? 'dotted' : 'solid',
                  textUnderlineOffset: 3,
                }}
              >
                {p.name}
              </button>

              {open === p.id && (
                <div
                  id={`hc-${p.id}`}
                  role="dialog"
                  aria-label={`Thông tin ${p.name}`}
                  onMouseEnter={keep}
                  onMouseLeave={dismiss}
                  className="d-card"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    [p.align]: 0,
                    zIndex: 10,
                    width: 236,
                    padding: 12,
                    boxShadow: 'var(--shadow-lg)',
                    textAlign: 'left',
                    lineHeight: 1.5,
                  }}
                >
                  <div className="d-row" style={{ gap: 9, alignItems: 'flex-start' }}>
                    <span
                      aria-hidden
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 34,
                        height: 34,
                        flex: '0 0 auto',
                        borderRadius: '50%',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {p.initials}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: 13 }}>{p.name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{p.handle}</span>
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--fg-muted)' }}>
                    {p.role}
                  </p>
                  <div className="d-row" style={{ gap: 14, marginTop: 8 }}>
                    {p.stats.map((s) => (
                      <span key={s.label}>
                        <strong style={{ fontSize: 13 }}>{s.value}</strong>{' '}
                        <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{s.label}</span>
                      </span>
                    ))}
                  </div>
                  <div className="d-row" style={{ gap: 6, marginTop: 10 }}>
                    <button type="button" className="d-btn is-sm">
                      Nhắn tin
                    </button>
                    <button type="button" className="d-btn is-secondary is-sm">
                      Xem hồ sơ
                    </button>
                  </div>
                </div>
              )}
            </span>
          </span>
        ))}{' '}
        lập ngày 21/07.
      </div>

      <p className="d-hint">
        Rê chuột lên tên và giữ {OPEN_DELAY}ms — hoặc dùng Tab để mở bằng bàn phím, Esc để đóng.
        Thẻ vẫn mở khi con trỏ đi vào trong nó.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Entries                                                                     */
/* -------------------------------------------------------------------------- */

export const positioningEntries: CatalogEntry[] = [
  {
    id: 'sticky-vs-fixed',
    nameEn: 'Sticky vs. Fixed Positioning',
    nameVi: 'Định vị dính (sticky) và cố định (fixed)',
    aliases: [
      'sticky',
      'fixed',
      'position sticky',
      'thanh dính',
      'header cố định',
      'pinned header',
      'sticky header',
      'freeze pane',
      'đóng băng cột',
    ],
    category: 'layout',
    platforms: ['web', 'mobile'],
    description:
      'Hai cách giữ một phần tử ở trong tầm mắt khi cuộn. `sticky` là phần tử bình thường nằm trong luồng, chỉ “dính” khi chạm mốc offset và bị giới hạn trong khối cha. `fixed` bị lấy hẳn ra khỏi luồng và neo theo viewport, không quan tâm tới khối cha hay khung cuộn nào.',
    purpose:
      'Dùng khi cần giữ tiêu đề bảng, tiêu đề nhóm, thanh lọc hay thanh nút chính trong tầm mắt của một danh sách dài. Chọn `sticky` cho thứ thuộc về một khối nội dung (tiêu đề nhóm, header bảng); chọn `fixed` cho thứ thuộc về cả màn hình (thanh nút chính, nút nổi, thanh tab).',
    states: [
      { name: 'Chưa dính', note: 'Cuộn chưa tới mốc — phần tử nằm yên trong luồng như thường.' },
      {
        name: 'Đang dính',
        note: 'Đã chạm mốc `top`/`bottom`. Nên đổi nền/đổ bóng để tách khỏi nội dung trượt bên dưới.',
      },
      {
        name: 'Bị đẩy ra',
        note: 'Chỉ có ở sticky: khối cha cuộn hết, tiêu đề nhóm sau đẩy tiêu đề trước đi.',
      },
      {
        name: 'Xếp chồng nhiều tầng',
        note: 'Thanh lọc top: 0 và tiêu đề nhóm top: 34 — mốc sau phải cộng đúng chiều cao mốc trước.',
      },
      {
        name: 'Bàn phím mở (mobile)',
        note: 'Thanh fixed đáy phải nổi lên trên bàn phím, nếu không sẽ bị che.',
      },
    ],
    dos: [
      'Ưu tiên `sticky` khi phần tử thuộc về một khối: nó tự nhả ra đúng lúc, không cần JS đo scroll.',
      'Với `fixed`, chừa padding tương ứng cho nội dung — nó không chiếm chỗ nên sẽ đè lên phần đầu/cuối trang.',
      'Đổi nền hoặc thêm bóng khi đã dính, để người dùng thấy đây là lớp nổi chứ không phải nội dung.',
      'Chừa vùng an toàn: `padding-bottom: env(safe-area-inset-bottom)` cho thanh đáy.',
      'Cộng dồn offset khi có nhiều tầng dính, và đặt `z-index` tăng dần từ trong ra ngoài.',
    ],
    donts: [
      '`position: sticky` không có tác dụng nếu thiếu mốc (`top`/`bottom`), nếu tổ tiên có `overflow: hidden/auto` cắt mất, hoặc nếu khối cha không cao hơn phần tử — ba nguyên nhân của gần như mọi ca “sticky không chạy”.',
      'Đừng dùng `fixed` bên trong tổ tiên có `transform`, `filter` hay `will-change`: nó sẽ neo theo tổ tiên đó chứ không theo viewport nữa.',
      'Đừng để phần dính chiếm quá ~25% chiều cao màn hình mobile — còn lại quá ít chỗ để đọc.',
      'Đừng dùng đồng thời thanh fixed đáy và thanh tab điều hướng — hai dải nút chồng nghĩa nhau.',
      'Đừng dựng lại sticky bằng JS nghe sự kiện scroll: giật khung hình, và hỏng khi zoom hoặc đổi hướng màn.',
    ],
    nativeNames: {
      ios: 'Section header (UITableView .plain) / safeAreaLayoutGuide',
      android: 'AppBarLayout pinned / CollapsingToolbarLayout',
    },
    demo: () => <StickyVsFixedDemo />,
    code: `/* sticky — trong luồng, dính khi chạm mốc, bị khối cha giữ lại */
.filter-bar    { position: sticky; top: 0;  z-index: 3; background: var(--surface-2); }
.group-header  { position: sticky; top: 34px; z-index: 2; } /* cộng dồn chiều cao tầng trên */

/* fixed — ra khỏi luồng, neo theo viewport → phải tự chừa chỗ */
.action-bar { position: fixed; right: 0; bottom: 0; left: 0; z-index: 40;
  padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
body { padding-bottom: 64px; }   /* nếu không, thanh sẽ đè lên dòng cuối */

/* Ba lý do sticky "không chạy":
   1. thiếu top/bottom;
   2. tổ tiên có overflow: hidden | auto | scroll;
   3. khối cha không cao hơn chính phần tử.
   Và một lý do fixed "không chạy": tổ tiên có transform/filter/will-change
   → phần tử neo theo tổ tiên đó, không phải viewport. */

/* Biết lúc nào đang dính, không cần nghe scroll: */
const el = document.querySelector('.filter-bar')
new IntersectionObserver(
  ([e]) => el.classList.toggle('is-pinned', e.intersectionRatio < 1),
  { threshold: [1] },
).observe(el)`,
  },
  {
    id: 'hover-card',
    nameEn: 'Hover Card',
    nameVi: 'Thẻ xem nhanh khi rê chuột',
    aliases: [
      'hover card',
      'hovercard',
      'preview card',
      'thẻ xem trước',
      'rich tooltip',
      'link preview',
      'profile card',
      'peek',
    ],
    category: 'overlay',
    platforms: ['web'],
    description:
      'Thẻ nội dung phong phú bung ra khi rê chuột (hoặc focus) lên một tên người, đường dẫn hay mã đối tượng: ảnh đại diện, vài chỉ số, một hai nút hành động. Khác tooltip ở chỗ nó có cấu trúc và có thứ bấm được — nên phải với tới được bằng con trỏ lẫn bàn phím.',
    purpose:
      'Dùng để xem nhanh ngữ cảnh mà không rời trang: hồ sơ người dùng sau một @mention, tóm tắt chi nhánh sau một mã CN-07, xem trước tài liệu sau một đường dẫn. Nếu người dùng phải mở tab mới chỉ để trả lời “ai đây / cái gì đây” thì đó là chỗ của hover card.',
    states: [
      { name: 'Idle', note: 'Chỉ có gạch chân mảnh gợi ý là có thể xem nhanh.' },
      { name: 'Pending', note: `Đang đếm ${OPEN_DELAY}ms trước khi mở — lướt qua thì không bung.` },
      { name: 'Open', note: 'Thẻ hiện, có tiêu điểm nội dung và nút hành động.' },
      { name: 'Loading', note: 'Nạp dữ liệu sau khi mở — dùng skeleton, giữ nguyên kích thước thẻ.' },
      { name: 'Error', note: 'Không tải được — một dòng ngắn kèm nút Thử lại, không đóng sập thẻ.' },
      { name: 'Đang rời', note: `Chờ ${CLOSE_DELAY}ms để con trỏ kịp đi từ tên xuống thẻ.` },
    ],
    dos: [
      'Có độ trễ mở (~300–500ms) và độ trễ đóng (~200ms) — không có hai độ trễ này thì thẻ bung loạn khi lướt chuột và tuột mất khi với tay vào.',
      'Mở được bằng bàn phím (focus) và đóng bằng Esc; nội dung bên trong phải Tab vào được.',
      'Đặt thẻ sao cho khoảng trống giữa mỏ neo và thẻ vẫn nằm trong vùng “an toàn” của con trỏ.',
      'Tự lật hướng khi chạm mép màn hình.',
      'Nạp dữ liệu khi mở, và nhớ kết quả cho lần rê sau.',
    ],
    donts: [
      'Đừng đặt hành động CHỈ có trong hover card — thiết bị cảm ứng không có trạng thái hover, phải có đường đi khác (bấm vào mở trang hồ sơ).',
      'Đừng dùng thay tooltip cho phần giải thích một dòng: tooltip nhẹ hơn và không cần với tay vào.',
      'Đừng nhét form, tab hay danh sách cuộn vào — quá ngưỡng đó thì dùng popover mở bằng cú bấm.',
      'Đừng để thẻ che mất chính mỏ neo hoặc phần văn bản người dùng đang đọc.',
      'Đừng mở ngay lập tức khi vừa chạm con trỏ vào: đọc một đoạn có 5 mention sẽ thành 5 lần chớp thẻ.',
    ],
    demo: () => <HoverCardDemo />,
    code: `const OPEN_DELAY = 350   // lướt ngang qua thì không bung
const CLOSE_DELAY = 220  // đủ để con trỏ đi từ tên xuống thẻ

const schedule = (id) => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(id), OPEN_DELAY) }
const dismiss  = ()   => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(null), CLOSE_DELAY) }

<span className="hc-anchor">
  <button
    aria-expanded={open === p.id}
    onMouseEnter={() => schedule(p.id)} onMouseLeave={dismiss}
    onFocus={() => setOpen(p.id)}       onBlur={dismiss}   {/* bàn phím: mở ngay */}
    onClick={() => setOpen(v => v === p.id ? null : p.id)} {/* cảm ứng: bấm */}
  >{p.name}</button>

  {open === p.id && (
    /* Thẻ cũng nghe mouseenter/leave — nếu không, con trỏ vừa rời tên là thẻ biến mất */
    <div role="dialog" onMouseEnter={keep} onMouseLeave={dismiss} className="hc-card">…</div>
  )}
</span>`,
  },
]
