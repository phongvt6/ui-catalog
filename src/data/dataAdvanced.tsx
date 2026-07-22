/* eslint-disable react-refresh/only-export-components -- demo components được đặt cạnh dữ liệu catalog cho dễ đối chiếu */
import { useState } from 'react'
import type { CatalogEntry } from '../types'

/* -------------------------------------------------------------------------- */
/* Demos                                                                       */
/* -------------------------------------------------------------------------- */

type Node = { id: string; label: string; children?: Node[] }

const TREE: Node[] = [
  {
    id: 'mien-nam',
    label: 'Miền Nam',
    children: [
      {
        id: 'hcm',
        label: 'TP. Hồ Chí Minh',
        children: [
          { id: 'cn-07', label: 'CN-07 Quận 1' },
          { id: 'cn-12', label: 'CN-12 Thủ Đức' },
        ],
      },
      { id: 'binh-duong', label: 'Bình Dương', children: [{ id: 'cn-03', label: 'CN-03 Dĩ An' }] },
    ],
  },
  {
    id: 'mien-trung',
    label: 'Miền Trung',
    children: [{ id: 'da-nang', label: 'Đà Nẵng', children: [{ id: 'cn-19', label: 'CN-19 Hải Châu' }] }],
  },
]

function TreeBranch({
  nodes,
  depth,
  open,
  toggle,
  selected,
  select,
}: {
  nodes: Node[]
  depth: number
  open: Set<string>
  toggle: (id: string) => void
  selected: string
  select: (id: string) => void
}) {
  return (
    <ul role={depth === 0 ? 'tree' : 'group'} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {nodes.map((n) => {
        const hasKids = !!n.children?.length
        const isOpen = open.has(n.id)
        return (
          <li key={n.id} role="treeitem" aria-expanded={hasKids ? isOpen : undefined}>
            <button
              type="button"
              onClick={() => (hasKids ? toggle(n.id) : select(n.id))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                padding: '4px 8px',
                paddingLeft: 8 + depth * 16,
                border: 0,
                borderRadius: 6,
                background: selected === n.id ? 'var(--accent-soft)' : 'transparent',
                color: selected === n.id ? 'var(--accent)' : 'inherit',
                font: 'inherit',
                fontSize: 13,
                fontWeight: selected === n.id ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 12, color: 'var(--fg-subtle)' }}>
                {hasKids ? (isOpen ? '▾' : '▸') : ''}
              </span>
              <span>{hasKids ? '🗀' : '▤'}</span>
              {n.label}
            </button>
            {hasKids && isOpen && (
              <TreeBranch
                nodes={n.children!}
                depth={depth + 1}
                open={open}
                toggle={toggle}
                selected={selected}
                select={select}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

function TreeDemo() {
  const [open, setOpen] = useState(new Set(['mien-nam', 'hcm']))
  const [selected, setSelected] = useState('cn-07')
  return (
    <div className="d-card d-panel" style={{ maxWidth: 320 }}>
      <TreeBranch
        nodes={TREE}
        depth={0}
        open={open}
        selected={selected}
        select={setSelected}
        toggle={(id) =>
          setOpen((s) => {
            const next = new Set(s)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })
        }
      />
    </div>
  )
}

const COLS = [
  { id: 'draft', title: 'Nháp', color: 'var(--fg-subtle)' },
  { id: 'review', title: 'Chờ duyệt', color: 'var(--warning)' },
  { id: 'done', title: 'Đã duyệt', color: 'var(--success)' },
]

function KanbanDemo() {
  const [cards, setCards] = useState([
    { id: 1, title: 'Mua văn phòng phẩm', col: 'draft', who: 'NA' },
    { id: 2, title: 'Sửa máy lạnh khu A', col: 'review', who: 'BT' },
    { id: 3, title: 'In ấn biểu mẫu', col: 'review', who: 'CL' },
    { id: 4, title: 'Thay bóng đèn khu vực chung', col: 'done', who: 'NA' },
  ])
  const move = (id: number, dir: 1 | -1) =>
    setCards((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c
        const i = COLS.findIndex((x) => x.id === c.col)
        const next = Math.max(0, Math.min(COLS.length - 1, i + dir))
        return { ...c, col: COLS[next].id }
      }),
    )
  return (
    <div className="d-row" style={{ gap: 10, alignItems: 'flex-start', flexWrap: 'nowrap', width: '100%', maxWidth: 560, overflowX: 'auto' }}>
      {COLS.map((col) => {
        const items = cards.filter((c) => c.col === col.id)
        return (
          <div
            key={col.id}
            style={{
              flex: 1,
              minWidth: 158,
              padding: 8,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-2)',
            }}
          >
            <div className="d-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontSize: 12.5, color: col.color }}>{col.title}</strong>
              <span className="d-badge">{items.length}</span>
            </div>
            <div className="d-stack" style={{ gap: 7 }}>
              {items.map((c) => (
                <div key={c.id} className="d-card" style={{ padding: 9 }}>
                  <p style={{ margin: '0 0 7px', fontSize: 13 }}>{c.title}</p>
                  <div className="d-row" style={{ justifyContent: 'space-between' }}>
                    <span className="d-avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
                      {c.who}
                    </span>
                    <span className="d-row" style={{ gap: 2 }}>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 22, height: 22, fontSize: 11 }}
                        aria-label="Chuyển sang cột trước"
                        onClick={() => move(c.id, -1)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 22, height: 22, fontSize: 11 }}
                        aria-label="Chuyển sang cột sau"
                        onClick={() => move(c.id, 1)}
                      >
                        ›
                      </button>
                    </span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="d-hint" style={{ textAlign: 'center', padding: 10 }}>
                  Trống
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CalendarDemo() {
  const [sel, setSel] = useState(22)
  // Tháng 7/2026 bắt đầu vào thứ Tư → 2 ô trống đầu tuần (T2, T3).
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const events: Record<number, { label: string; tone: string }> = {
    20: { label: 'Đã nộp', tone: 'var(--success)' },
    21: { label: 'Đã nộp', tone: 'var(--success)' },
    22: { label: 'Chờ nộp', tone: 'var(--warning)' },
    24: { label: 'Họp vùng', tone: 'var(--info)' },
  }
  return (
    <div className="d-card d-panel" style={{ maxWidth: 340 }}>
      <div className="d-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <button type="button" className="icon-btn" aria-label="Tháng trước">
          ‹
        </button>
        <strong>Tháng 7 / 2026</strong>
        <button type="button" className="icon-btn" aria-label="Tháng sau">
          ›
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
          <span key={d} className="d-hint" style={{ textAlign: 'center', margin: 0 }}>
            {d}
          </span>
        ))}
        {[0, 1].map((k) => (
          <span key={`pad-${k}`} />
        ))}
        {days.map((d) => {
          const ev = events[d]
          return (
            <button
              key={d}
              type="button"
              aria-pressed={sel === d}
              onClick={() => setSel(d)}
              style={{
                aspectRatio: '1',
                border: 0,
                borderRadius: 7,
                background: sel === d ? 'var(--accent)' : 'transparent',
                color: sel === d ? 'var(--accent-fg)' : 'inherit',
                font: 'inherit',
                fontSize: 12.5,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {d}
              {ev && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: sel === d ? 'var(--accent-fg)' : ev.tone,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
      <p className="d-hint" style={{ marginTop: 10 }}>
        Ngày {sel}/07: {events[sel]?.label ?? 'Không có sự kiện'}
      </p>
    </div>
  )
}

function CommentThreadDemo() {
  const [comments, setComments] = useState([
    { id: 1, who: 'Trần Thị B', at: '10:40', text: 'Số tiền mặt lệch 1,2 triệu so với sổ quỹ, nhờ kiểm tra lại.' },
    { id: 2, who: 'Nguyễn Văn A', at: '10:52', text: 'Đã rà lại, do một hoá đơn ca đêm chưa nhập. Em bổ sung ngay.' },
  ])
  const [draft, setDraft] = useState('')
  return (
    <div className="d-panel d-stack">
      {comments.map((c) => (
        <div key={c.id} className="d-row" style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <span className="d-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
            {c.who.split(' ').slice(-1)[0][0]}
            {c.who[0]}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="d-row" style={{ gap: 7 }}>
              <strong style={{ fontSize: 13 }}>{c.who}</strong>
              <span className="d-hint" style={{ margin: 0 }}>
                {c.at}
              </span>
            </span>
            <p style={{ margin: '2px 0 0', fontSize: 13 }}>{c.text}</p>
          </div>
        </div>
      ))}
      <form
        className="d-row"
        style={{ gap: 8, flexWrap: 'nowrap' }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          setComments((c) => [
            ...c,
            { id: Date.now(), who: 'Bạn', at: 'vừa xong', text: draft.trim() },
          ])
          setDraft('')
        }}
      >
        <input
          className="d-field"
          placeholder="Viết phản hồi…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Viết phản hồi"
        />
        <button type="submit" className="d-btn is-sm" disabled={!draft.trim()}>
          Gửi
        </button>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Entries                                                                     */
/* -------------------------------------------------------------------------- */

export const dataAdvancedEntries: CatalogEntry[] = [
  {
    id: 'tree-view',
    nameEn: 'Tree View',
    nameVi: 'Cây phân cấp',
    aliases: ['tree', 'file explorer', 'cây thư mục', 'hierarchy'],
    category: 'data',
    platforms: ['web'],
    description:
      'Danh sách lồng nhiều cấp, mỗi nút cha bung/thu bằng mũi tên ▸ ▾ và các cấp con thụt vào. Cấu trúc quen thuộc như cây thư mục trong máy tính.',
    purpose:
      'Dùng khi dữ liệu thực sự có quan hệ cha–con và người dùng cần thấy vị trí trong cây: Vùng → Tỉnh → Chi nhánh, cơ cấu tổ chức, danh mục tài khoản kế toán.',
    states: [
      { name: 'Collapsed', note: 'Nút cha đóng, ▸.' },
      { name: 'Expanded', note: 'Nút cha mở, ▾, hiện các con.' },
      { name: 'Selected', note: 'Nút lá đang chọn được làm nổi.' },
      { name: 'Loading child', note: 'Tải cấp con theo yêu cầu — spinner tại nút đó.' },
      { name: 'Checked', note: 'Có checkbox — chọn cha thì chọn cả con (hoặc nửa vời).' },
    ],
    dos: [
      'Dùng role="tree"/"treeitem" và aria-expanded.',
      'Hỗ trợ ← → để đóng/mở cấp, ↑↓ để đi giữa các nút.',
      'Nhớ trạng thái mở/đóng giữa các lần vào.',
      'Có ô tìm kiếm tự bung tới nút khớp khi cây lớn.',
    ],
    donts: [
      'Không dùng cho dữ liệu phẳng — đó là danh sách.',
      'Không lồng quá 4 cấp — người dùng sẽ lạc.',
      'Không tải cả cây 10.000 nút một lần.',
    ],
    demo: () => <TreeDemo />,
    code: `<ul role="tree">
  {nodes.map((n) => (
    <li key={n.id} role="treeitem" aria-expanded={n.children ? isOpen(n.id) : undefined}>
      <button onClick={() => toggle(n.id)}>
        {n.children ? (isOpen(n.id) ? '▾' : '▸') : ''} {n.label}
      </button>
      {n.children && isOpen(n.id) && <TreeBranch nodes={n.children} depth={depth + 1} />}
    </li>
  ))}
</ul>`,
  },
  {
    id: 'kanban',
    nameEn: 'Kanban Board',
    nameVi: 'Bảng cột trạng thái',
    aliases: ['board', 'trello', 'bảng kanban', 'swimlane'],
    category: 'data',
    platforms: ['web'],
    description:
      'Các cột đại diện cho từng trạng thái trong quy trình, mỗi bản ghi là một thẻ nằm trong đúng cột của nó; kéo thẻ sang cột khác là đổi trạng thái.',
    purpose:
      'Dùng cho quy trình có số trạng thái ít và cố định, nơi câu hỏi chính là “đang tắc ở khâu nào”: đề xuất mua sắm, phiếu yêu cầu, công việc của đội.',
    states: [
      { name: 'Default', note: 'Cột có tiêu đề và số lượng thẻ.' },
      { name: 'Dragging', note: 'Thẻ nâng bóng, cột đích sáng lên.' },
      { name: 'Drop target', note: 'Khe chèn hiện rõ vị trí thẻ sẽ rơi vào.' },
      { name: 'Empty column', note: 'Trạng thái rỗng ngay trong cột.' },
      { name: 'WIP limit', note: 'Vượt giới hạn số thẻ — cột đổi màu cảnh báo.' },
    ],
    dos: [
      'Luôn có cách đổi trạng thái không cần kéo-thả (menu hoặc nút mũi tên) — kéo-thả không dùng được bằng bàn phím.',
      'Hiện số lượng thẻ trên đầu mỗi cột.',
      'Giữ tối đa 5–6 cột, nhiều hơn thì phải cuộn ngang.',
    ],
    donts: [
      'Không dùng khi số trạng thái không cố định.',
      'Không dùng thay cho bảng khi người dùng cần so sánh số liệu.',
      'Không để kéo-thả là cách duy nhất — vi phạm khả năng tiếp cận.',
    ],
    demo: () => <KanbanDemo />,
    code: `{columns.map((col) => (
  <div key={col.id} className="kanban-col"
    onDragOver={(e) => e.preventDefault()}
    onDrop={() => moveTo(draggingId, col.id)}>
    <header>{col.title} <span className="badge">{items.length}</span></header>
    {items.map((c) => (
      <div key={c.id} draggable onDragStart={() => setDragging(c.id)}>
        {c.title}
        {/* Luôn có lối đi bàn phím */}
        <button aria-label="Chuyển sang cột sau" onClick={() => move(c.id, 1)}>›</button>
      </div>
    ))}
  </div>
))}`,
  },
  {
    id: 'calendar-view',
    nameEn: 'Calendar / Schedule View',
    nameVi: 'Lịch tháng',
    aliases: ['calendar', 'schedule', 'lịch', 'month view', 'agenda'],
    category: 'data',
    platforms: ['web', 'mobile'],
    description:
      'Lưới 7 cột theo thứ trong tuần, mỗi ô là một ngày, ngày có sự kiện được đánh dấu bằng chấm màu hoặc dải sự kiện. Khác Date Picker: đây là để XEM dữ liệu, không phải để chọn giá trị nhập vào form.',
    purpose:
      'Dùng khi dữ liệu gắn với ngày và người dùng cần nhìn theo nhịp thời gian: ngày nào đã nộp báo cáo, lịch trực, lịch bảo trì, ngày nghỉ.',
    states: [
      { name: 'Today', note: 'Ô hôm nay có viền hoặc nền riêng.' },
      { name: 'Selected', note: 'Ngày đang chọn — nền đậm.' },
      { name: 'Has events', note: 'Chấm màu theo loại sự kiện.' },
      { name: 'Other month', note: 'Ngày của tháng liền kề — làm mờ.' },
      { name: 'Loading', note: 'Đổi tháng — giữ nguyên lưới, chỉ mờ phần chấm.' },
    ],
    dos: [
      'Bắt đầu tuần từ Thứ Hai cho người dùng Việt Nam.',
      'Có chú giải màu cho từng loại sự kiện.',
      'Trên mobile chuyển sang danh sách theo ngày (agenda) — lưới tháng quá nhỏ để chạm.',
    ],
    donts: [
      'Không nhồi quá 3 sự kiện vào một ô — phần dư gom thành “+2 nữa”.',
      'Không dùng riêng màu để phân loại sự kiện.',
    ],
    demo: () => <CalendarDemo />,
    code: `<div className="cal-grid">
  {['T2','T3','T4','T5','T6','T7','CN'].map((d) => <span key={d}>{d}</span>)}
  {Array.from({ length: leadingBlanks }).map((_, k) => <span key={k} />)}
  {days.map((d) => (
    <button key={d} aria-pressed={sel === d} onClick={() => setSel(d)}>
      {d}
      {events[d] && <span className="dot" style={{ background: events[d].tone }} />}
    </button>
  ))}
</div>`,
  },
  {
    id: 'comment-thread',
    nameEn: 'Comment Thread',
    nameVi: 'Luồng bình luận',
    aliases: ['comments', 'discussion', 'trao đổi', 'phản hồi', 'chat'],
    category: 'data',
    platforms: ['web', 'mobile'],
    description:
      'Chuỗi bình luận theo thứ tự thời gian, mỗi bình luận có avatar, tên, thời điểm và nội dung, cộng một ô soạn ở cuối để trả lời ngay.',
    purpose:
      'Dùng để trao đổi gắn với một bản ghi cụ thể — hỏi đáp về một đề xuất, lý do trả lại hồ sơ. Giữ ngữ cảnh tại chỗ thay vì đẩy sang email hay chat riêng.',
    states: [
      { name: 'Empty', note: 'Chưa có bình luận — chỉ hiện ô soạn.' },
      { name: 'Sending', note: 'Hiện ngay bình luận ở dạng mờ trong lúc gửi.' },
      { name: 'Failed', note: 'Gửi lỗi — giữ nội dung và cho nút Thử lại.' },
      { name: 'Edited', note: 'Đã sửa — ghi chú “(đã sửa)” kèm thời điểm.' },
      { name: 'Mention', note: 'Nhắc tên @ai đó — người được nhắc nhận thông báo.' },
    ],
    dos: [
      'Cho gửi bằng Ctrl/⌘ + Enter.',
      'Giữ nội dung đang soạn nếu người dùng lỡ chuyển tab.',
      'Ghi rõ ai sửa gì lúc nào — đây thường là bằng chứng nghiệp vụ.',
    ],
    donts: [
      'Không cho xoá cứng bình luận trong luồng phê duyệt — nên đánh dấu đã xoá.',
      'Không lồng trả lời quá 2 cấp.',
    ],
    demo: () => <CommentThreadDemo />,
    code: `{comments.map((c) => (
  <article key={c.id}>
    <Avatar name={c.who} />
    <header><strong>{c.who}</strong> <time>{c.at}</time></header>
    <p>{c.text}</p>
  </article>
))}

<form onSubmit={send}>
  <input value={draft} onChange={(e) => setDraft(e.target.value)}
    placeholder="Viết phản hồi…" />
  <button disabled={!draft.trim()}>Gửi</button>
</form>`,
  },
]
