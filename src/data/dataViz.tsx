/* eslint-disable react-refresh/only-export-components -- demo components được đặt cạnh dữ liệu catalog cho dễ đối chiếu */
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { CatalogEntry } from '../types'

/* -------------------------------------------------------------------------- */
/* Demos                                                                       */
/* -------------------------------------------------------------------------- */

/* ---- Gantt --------------------------------------------------------------- */

interface GanttTask {
  id: string
  name: string
  owner: string
  start: number // ngày thứ mấy trong khung (0-based)
  len: number
  progress: number // 0–100
  after?: string // phụ thuộc: chỉ bắt đầu sau task này
}

const GANTT_DAYS = 14
const GANTT_TODAY = 5

const GANTT_TASKS: GanttTask[] = [
  { id: 't1', name: 'Chốt số liệu chi nhánh', owner: 'Hà', start: 0, len: 4, progress: 100 },
  { id: 't2', name: 'Đối soát công nợ', owner: 'Nam', start: 4, len: 3, progress: 60, after: 't1' },
  { id: 't3', name: 'Lập báo cáo quý', owner: 'Hà', start: 6, len: 4, progress: 25, after: 't2' },
  { id: 't4', name: 'Duyệt & ký', owner: 'Chị Lan', start: 10, len: 2, progress: 0, after: 't3' },
  { id: 't5', name: 'Gửi tập đoàn', owner: 'Nam', start: 12, len: 1, progress: 0 },
]

const pct = (v: number) => `${(v / GANTT_DAYS) * 100}%`

function GanttDemo() {
  const [sel, setSel] = useState<string | null>('t3')
  const task = GANTT_TASKS.find((t) => t.id === sel)
  const dep = task?.after ? GANTT_TASKS.find((t) => t.id === task.after) : undefined

  return (
    <div className="d-panel d-stack" style={{ maxWidth: 460 }}>
      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 13 }}>Báo cáo quý III · 20/07 → 02/08</strong>
        <span className="d-hint" style={{ margin: 0 }}>
          Hôm nay: 25/07
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: 6 }}>
        {/* Cột nhãn ngày */}
        <span />
        <div style={{ position: 'relative', height: 16 }}>
          {[0, 2, 4, 6, 8, 10, 12].map((d) => (
            <span
              key={d}
              style={{
                position: 'absolute',
                left: pct(d),
                color: 'var(--fg-subtle)',
                fontSize: 10,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {20 + d <= 31 ? 20 + d : 20 + d - 31}/{20 + d <= 31 ? '07' : '08'}
            </span>
          ))}
        </div>

        {GANTT_TASKS.map((t) => {
          const active = t.id === sel
          return (
            <FragmentRow key={t.id}>
              <button
                type="button"
                onClick={() => setSel(t.id)}
                style={{
                  padding: '3px 6px',
                  border: 0,
                  borderRadius: 6,
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--fg)',
                  font: 'inherit',
                  fontSize: 11.5,
                  fontWeight: active ? 600 : 400,
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {t.name}
              </button>

              <div
                style={{
                  position: 'relative',
                  height: 22,
                  borderRadius: 5,
                  background:
                    'repeating-linear-gradient(to right, var(--surface-2) 0 calc(100% / 14 - 1px), var(--border) calc(100% / 14 - 1px) calc(100% / 14))',
                }}
              >
                {/* Đường hôm nay */}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: -2,
                    bottom: -2,
                    left: pct(GANTT_TODAY),
                    width: 2,
                    background: 'var(--danger)',
                    opacity: 0.7,
                  }}
                />
                <button
                  type="button"
                  aria-label={`${t.name} — ${t.owner}, hoàn thành ${t.progress}%`}
                  aria-pressed={active}
                  onClick={() => setSel(t.id)}
                  title={`${t.name} · ${t.owner} · ${t.progress}%`}
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: pct(t.start),
                    width: pct(t.len),
                    height: 16,
                    padding: 0,
                    border: active ? '2px solid var(--accent)' : '1px solid transparent',
                    borderRadius: 5,
                    background: 'var(--accent-soft)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: `${t.progress}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      opacity: 0.75,
                    }}
                  />
                </button>
              </div>
            </FragmentRow>
          )
        })}
      </div>

      {task && (
        <div className="d-card" style={{ padding: 10 }}>
          <strong style={{ fontSize: 13 }}>{task.name}</strong>
          <p className="d-hint" style={{ margin: '2px 0 0' }}>
            {task.owner} · {task.len} ngày · hoàn thành {task.progress}%
            {dep ? ` · chỉ bắt đầu sau “${dep.name}”` : ' · không phụ thuộc việc nào'}
          </p>
        </div>
      )}
    </div>
  )
}

/** Hai ô liền nhau trong lưới — tách ra cho dễ đọc. */
function FragmentRow({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/* ---- Timeline view (kiểu Notion) ----------------------------------------- */

interface TimelineItem {
  id: string
  name: string
  lane: string
  start: number
  len: number
  tone: 'accent' | 'success' | 'warning'
}

const TL_ITEMS: TimelineItem[] = [
  { id: 'a1', name: 'Khảo sát chi nhánh', lane: 'Hà', start: 0, len: 3, tone: 'accent' },
  { id: 'a2', name: 'Tổng hợp số liệu', lane: 'Hà', start: 4, len: 4, tone: 'success' },
  { id: 'b1', name: 'Đối soát công nợ', lane: 'Nam', start: 1, len: 5, tone: 'warning' },
  { id: 'b2', name: 'Gửi tập đoàn', lane: 'Nam', start: 8, len: 2, tone: 'accent' },
  { id: 'c1', name: 'Duyệt & ký', lane: 'Chị Lan', start: 6, len: 3, tone: 'success' },
]

/** span = số ngày lọt vào khung nhìn; zoom ra thì thanh ngắn lại. */
const TL_ZOOMS = [
  { id: 'day', label: 'Ngày', span: 12, cols: 6, tick: (i: number) => `${20 + i * 2}/07` },
  { id: 'week', label: 'Tuần', span: 28, cols: 4, tick: (i: number) => `Tuần ${30 + i}` },
  { id: 'month', label: 'Tháng', span: 60, cols: 2, tick: (i: number) => `Tháng ${7 + i}` },
]

const TONE_BG: Record<TimelineItem['tone'], string> = {
  accent: 'var(--accent-soft)',
  success: 'var(--success-soft)',
  warning: 'var(--warning-soft)',
}
const TONE_FG: Record<TimelineItem['tone'], string> = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
}

function TimelineViewDemo() {
  const [zoom, setZoom] = useState(TL_ZOOMS[0])
  const [sel, setSel] = useState<string | null>(null)
  const lanes = [...new Set(TL_ITEMS.map((i) => i.lane))]
  // Zoom xa thì thanh quá hẹp để chứa chữ — bỏ nhãn, giữ màu và tooltip.
  const compact = zoom.span > 30

  return (
    <div className="d-panel d-stack" style={{ maxWidth: 460 }}>
      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 13 }}>Timeline · nhóm theo người phụ trách</strong>
        <div className="d-row" style={{ gap: 4 }}>
          {TL_ZOOMS.map((z) => (
            <button
              key={z.id}
              type="button"
              aria-pressed={zoom.id === z.id}
              className={zoom.id === z.id ? 'd-btn is-sm' : 'd-btn is-secondary is-sm'}
              onClick={() => setZoom(z)}
              style={{ padding: '2px 9px', fontSize: 11 }}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '68px 1fr', gap: '4px 8px' }}>
        <span />
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingBottom: 3 }}>
          {Array.from({ length: zoom.cols }, (_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                color: 'var(--fg-subtle)',
                fontSize: 10,
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'left',
              }}
            >
              {zoom.tick(i)}
            </span>
          ))}
        </div>

        {lanes.map((lane) => (
          <FragmentRow key={lane}>
            <span style={{ color: 'var(--fg-muted)', fontSize: 11.5, alignSelf: 'center' }}>
              {lane}
            </span>
            <div
              style={{
                position: 'relative',
                height: 26,
                borderRadius: 6,
                background: 'var(--surface-2)',
              }}
            >
              {TL_ITEMS.filter((i) => i.lane === lane).map((it) => (
                <button
                  key={it.id}
                  type="button"
                  aria-pressed={sel === it.id}
                  aria-label={it.name}
                  title={it.name}
                  onClick={() => setSel(sel === it.id ? null : it.id)}
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: `${(it.start / zoom.span) * 100}%`,
                    width: `${(it.len / zoom.span) * 100}%`,
                    height: 20,
                    minWidth: 12,
                    padding: compact ? 0 : '0 7px',
                    border: `1px solid ${TONE_FG[it.tone]}`,
                    borderRadius: 999,
                    background: TONE_BG[it.tone],
                    color: TONE_FG[it.tone],
                    font: 'inherit',
                    fontSize: 10.5,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textAlign: 'left',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    boxShadow: sel === it.id ? 'var(--shadow-md)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {compact ? '' : it.name}
                </button>
              ))}
            </div>
          </FragmentRow>
        ))}
      </div>

      <p className="d-hint" style={{ margin: 0 }}>
        {sel
          ? `Đang chọn: ${TL_ITEMS.find((i) => i.id === sel)?.name} — kéo hai đầu thanh để đổi ngày bắt đầu/kết thúc.`
          : 'Bấm một thanh để xem chi tiết. Đổi mức Ngày / Tuần / Tháng để nhìn xa hay nhìn gần.'}
      </p>
    </div>
  )
}

/* ---- Gallery view -------------------------------------------------------- */

interface GalleryRecord {
  id: string
  title: string
  status: 'Đang làm' | 'Chờ duyệt' | 'Xong'
  owner: string
  due: string
  grad: string
}

const GALLERY_RECORDS: GalleryRecord[] = [
  {
    id: 'r1',
    title: 'Báo cáo quý III',
    status: 'Đang làm',
    owner: 'Hà',
    due: '02/08',
    grad: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  },
  {
    id: 'r2',
    title: 'Đối soát công nợ',
    status: 'Chờ duyệt',
    owner: 'Nam',
    due: '28/07',
    grad: 'linear-gradient(135deg, #ffd3a5, #fd9a9a)',
  },
  {
    id: 'r3',
    title: 'Kiểm kê kho CN-07',
    status: 'Xong',
    owner: 'Chị Lan',
    due: '19/07',
    grad: 'linear-gradient(135deg, #84fab0, #8fd3f4)',
  },
  {
    id: 'r4',
    title: 'Đề xuất mua thiết bị',
    status: 'Đang làm',
    owner: 'Hà',
    due: '05/08',
    grad: 'linear-gradient(135deg, #d4a5ff, #f3a7c4)',
  },
]

const STATUS_TONE: Record<GalleryRecord['status'], string> = {
  'Đang làm': 'is-info',
  'Chờ duyệt': 'is-warning',
  Xong: 'is-success',
}

function GalleryViewDemo() {
  const [big, setBig] = useState(false)
  const [showProps, setShowProps] = useState(true)

  return (
    <div className="d-panel d-stack" style={{ maxWidth: 440 }}>
      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 13 }}>Công việc · {GALLERY_RECORDS.length} bản ghi</strong>
        <div className="d-row" style={{ gap: 6 }}>
          <button
            type="button"
            className="d-btn is-secondary is-sm"
            aria-pressed={big}
            onClick={() => setBig((v) => !v)}
            style={{ padding: '2px 9px', fontSize: 11 }}
          >
            Thẻ {big ? 'lớn' : 'nhỏ'}
          </button>
          <button
            type="button"
            className="d-btn is-secondary is-sm"
            aria-pressed={showProps}
            onClick={() => setShowProps((v) => !v)}
            style={{ padding: '2px 9px', fontSize: 11 }}
          >
            Thuộc tính
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: big ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {GALLERY_RECORDS.map((r) => (
          <article
            key={r.id}
            className="d-card"
            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
          >
            <div
              style={{
                aspectRatio: big ? '16 / 9' : '4 / 3',
                background: r.grad,
              }}
            />
            <div style={{ padding: '8px 9px 10px' }}>
              <strong style={{ display: 'block', fontSize: 12.5, lineHeight: 1.3 }}>
                {r.title}
              </strong>
              {showProps && (
                <div className="d-row" style={{ gap: 5, marginTop: 6 }}>
                  <span className={`d-badge ${STATUS_TONE[r.status]}`} style={{ fontSize: 10 }}>
                    {r.status}
                  </span>
                  <span style={{ color: 'var(--fg-subtle)', fontSize: 10.5 }}>
                    {r.owner} · {r.due}
                  </span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="d-hint" style={{ margin: 0 }}>
        Cùng một bảng dữ liệu, chỉ đổi cách xem — thẻ hiện ảnh bìa và vài thuộc tính đã chọn.
      </p>
    </div>
  )
}

/* ---- Horizontal card rail ------------------------------------------------ */

const RAIL_ITEMS = [
  { id: 'c1', label: 'Doanh thu hôm nay', value: '182,4 tr', delta: '+8,2%', up: true },
  { id: 'c2', label: 'Đơn đã chốt', value: '1.204', delta: '+3,1%', up: true },
  { id: 'c3', label: 'Tỷ lệ huỷ', value: '2,4%', delta: '−0,6%', up: false },
  { id: 'c4', label: 'Khách mới', value: '318', delta: '+12,0%', up: true },
  { id: 'c5', label: 'Công nợ quá hạn', value: '46,1 tr', delta: '+4,4%', up: false },
]

function CardRailDemo() {
  const rail = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: 0, max: 0 })

  const measure = () => {
    const el = rail.current
    if (!el) return
    setPos({ left: el.scrollLeft, max: Math.max(0, el.scrollWidth - el.clientWidth) })
  }

  // Đo ngay khi dựng xong: nếu chờ sự kiện scroll đầu tiên thì nút › bị khoá oan.
  useEffect(measure, [])
  const nudge = (dir: -1 | 1) => {
    const el = rail.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const atStart = pos.left <= 2
  const atEnd = pos.max > 0 && pos.left >= pos.max - 2

  return (
    <div className="d-panel d-stack" style={{ maxWidth: 440 }}>
      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 13 }}>Chỉ số nhanh</strong>
        <div className="d-row" style={{ gap: 4 }}>
          <button
            type="button"
            className="d-btn is-secondary is-sm"
            aria-label="Cuộn sang trái"
            disabled={atStart}
            onClick={() => nudge(-1)}
            style={{ padding: '1px 9px' }}
          >
            ‹
          </button>
          <button
            type="button"
            className="d-btn is-secondary is-sm"
            aria-label="Cuộn sang phải"
            disabled={atEnd}
            onClick={() => nudge(1)}
            style={{ padding: '1px 9px' }}
          >
            ›
          </button>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          ref={rail}
          onScroll={measure}
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: 6,
          }}
        >
          {RAIL_ITEMS.map((it) => (
            <article
              key={it.id}
              className="d-card"
              style={{
                flex: '0 0 132px',
                padding: 11,
                scrollSnapAlign: 'start',
              }}
            >
              <span style={{ display: 'block', color: 'var(--fg-subtle)', fontSize: 11 }}>
                {it.label}
              </span>
              <strong
                style={{
                  display: 'block',
                  marginTop: 3,
                  fontSize: 18,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.01em',
                }}
              >
                {it.value}
              </strong>
              <span
                style={{
                  color: it.up ? 'var(--success)' : 'var(--danger)',
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                {it.delta}
              </span>
            </article>
          ))}
        </div>

        {/* Gợi ý còn nội dung phía sau */}
        {!atEnd && <span aria-hidden style={railFade} />}
      </div>

      {/* Thanh chỉ vị trí thay cho hàng chấm — hợp khi số thẻ không cố định */}
      <div style={{ height: 3, borderRadius: 999, background: 'var(--surface-3)' }}>
        <span
          style={{
            display: 'block',
            width: '38%',
            height: '100%',
            marginLeft: `${pos.max ? (pos.left / pos.max) * 62 : 0}%`,
            borderRadius: 999,
            background: 'var(--accent)',
          }}
        />
      </div>

      <p className="d-hint" style={{ margin: 0 }}>
        Cuộn ngang bằng chuột, vuốt trên mobile, hoặc Tab để nhảy qua từng thẻ.
      </p>
    </div>
  )
}

const railFade: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 6,
  width: 26,
  background: 'linear-gradient(to right, transparent, var(--surface))',
  pointerEvents: 'none',
}

/* -------------------------------------------------------------------------- */
/* Entries                                                                     */
/* -------------------------------------------------------------------------- */

export const dataVizEntries: CatalogEntry[] = [
  {
    id: 'gantt-chart',
    nameEn: 'Gantt Chart',
    nameVi: 'Biểu đồ Gantt',
    aliases: ['gantt', 'sơ đồ ngang', 'tiến độ dự án', 'project schedule', 'dependency'],
    category: 'data',
    platforms: ['web'],
    description:
      'Mỗi công việc là một thanh nằm ngang trên trục thời gian: vị trí cho biết bắt đầu khi nào, độ dài cho biết kéo dài bao lâu, phần tô đậm bên trong là mức hoàn thành. Mũi tên hoặc ghi chú thể hiện việc nào phải xong trước.',
    purpose:
      'Dùng khi câu hỏi là “việc nào chặn việc nào, trễ một khâu thì trễ tới đâu”: kế hoạch quyết toán, tiến độ thi công, lịch triển khai chi nhánh. Không phải để theo dõi công việc hằng ngày — cái đó dùng Kanban.',
    states: [
      { name: 'Default', note: 'Thanh theo lịch dự kiến, có đường “hôm nay”.' },
      { name: 'In progress', note: 'Thanh tô một phần theo % hoàn thành.' },
      { name: 'Late', note: 'Quá hạn mà chưa xong — đổi sang màu cảnh báo.' },
      { name: 'Milestone', note: 'Mốc không có độ dài — vẽ hình thoi.' },
      { name: 'Dependency', note: 'Mũi tên nối việc trước sang việc sau.' },
      { name: 'Collapsed', note: 'Gộp nhóm việc con thành một thanh tổng.' },
    ],
    dos: [
      'Luôn vẽ đường “hôm nay” — không có nó thì biểu đồ chỉ là hình trang trí.',
      'Cho phóng to / thu nhỏ trục thời gian (ngày ↔ tuần ↔ tháng).',
      'Giữ cột tên việc dính bên trái khi cuộn ngang.',
      'Kèm một bảng liệt kê cùng dữ liệu để đọc bằng trình đọc màn hình.',
    ],
    donts: [
      'Không nhồi quá ~30 dòng vào một màn hình — gộp nhóm lại.',
      'Không dùng Gantt cho công việc không có ngày bắt đầu/kết thúc rõ.',
      'Không chỉ dựa vào màu để báo trễ hạn — thêm nhãn hoặc biểu tượng.',
    ],
    demo: () => <GanttDemo />,
    code: `{tasks.map((t) => (
  <div key={t.id} className="gantt-row">
    <span className="gantt-name">{t.name}</span>
    <div className="gantt-track">
      <i className="gantt-today" style={{ left: pct(todayIndex) }} />
      <button className="gantt-bar"
        style={{ left: pct(t.start), width: pct(t.len) }}
        aria-label={\`\${t.name} — hoàn thành \${t.progress}%\`}>
        <i style={{ width: \`\${t.progress}%\` }} />
      </button>
    </div>
  </div>
))}

const pct = (v) => \`\${(v / totalDays) * 100}%\``,
  },
  {
    id: 'timeline-view',
    nameEn: 'Timeline View',
    nameVi: 'Dòng thời gian dạng bảng',
    aliases: [
      'timeline chart',
      'notion timeline',
      'roadmap',
      'lịch trình ngang',
      'swimlane timeline',
    ],
    category: 'data',
    platforms: ['web'],
    description:
      'Một cách xem khác của cùng một bảng dữ liệu: mỗi bản ghi có ngày bắt đầu/kết thúc thành một thanh trên trục thời gian, các thanh xếp theo làn (người phụ trách, dự án, chi nhánh). Kéo thanh để đổi ngày, kéo hai đầu để đổi độ dài.',
    purpose:
      'Dùng để trả lời “trong khoảng này ai đang bận việc gì, có chồng lịch không”. Nhẹ hơn Gantt: không có phụ thuộc, không có đường găng — bù lại chỉnh lịch nhanh bằng cách kéo.',
    states: [
      { name: 'Zoom', note: 'Đổi mức Ngày / Tuần / Tháng để nhìn gần hay nhìn xa.' },
      { name: 'Grouped', note: 'Gom theo làn: người, dự án, trạng thái.' },
      { name: 'Selected', note: 'Thanh đang chọn nổi lên, hiện hai tay nắm ở hai đầu.' },
      { name: 'Dragging', note: 'Đang kéo — hiện ngày mới ngay trên thanh.' },
      { name: 'Overlap', note: 'Hai việc trùng lịch — xếp so le, không đè lên nhau.' },
      { name: 'No date', note: 'Bản ghi chưa có ngày — gom vào một khay riêng.' },
    ],
    dos: [
      'Nói rõ mỗi cột là bao lâu, và luôn có mốc “hôm nay”.',
      'Cho kéo bằng chuột nhưng vẫn sửa ngày được bằng ô nhập.',
      'Xếp so le các thanh trùng khoảng thời gian thay vì chồng lên nhau.',
      'Nhớ vị trí cuộn và mức zoom khi người dùng quay lại.',
    ],
    donts: [
      'Không giấu các bản ghi chưa có ngày — người dùng sẽ tưởng mất dữ liệu.',
      'Không dùng khi khoảng thời gian giữa các bản ghi chênh nhau quá lớn (một ngày và một năm).',
      'Không bắt buộc phải kéo mới sửa được lịch.',
    ],
    demo: () => <TimelineViewDemo />,
    code: `{lanes.map((lane) => (
  <div key={lane} className="tl-lane">
    <span className="tl-lane-name">{lane}</span>
    <div className="tl-track">
      {items.filter((i) => i.lane === lane).map((i) => (
        <button key={i.id} className="tl-bar"
          style={{ left: pct(i.start), width: pct(i.len) }}
          onClick={() => select(i.id)}>
          {i.name}
        </button>
      ))}
    </div>
  </div>
))}`,
  },
  {
    id: 'gallery-view',
    nameEn: 'Gallery / Card View',
    nameVi: 'Xem dạng lưới thẻ',
    aliases: [
      'gallery view',
      'card grid',
      'database view',
      'lưới thẻ',
      'xem dạng thẻ',
      'tile view',
    ],
    category: 'data',
    platforms: ['web', 'mobile'],
    description:
      'Một chế độ xem của tập dữ liệu, trong đó mỗi bản ghi là một thẻ có ảnh bìa và vài thuộc tính do người dùng chọn hiện. Cùng dữ liệu đó vẫn xem được dạng bảng, dạng bảng cột hay dòng thời gian.',
    purpose:
      'Dùng khi hình ảnh hoặc tiêu đề mới là thứ giúp nhận ra bản ghi: tài liệu có ảnh bìa, mặt bằng, sản phẩm, hồ sơ ứng viên. Bảng hợp để so sánh số; lưới thẻ hợp để nhận diện.',
    states: [
      { name: 'Card size', note: 'Nhỏ / Vừa / Lớn — đổi số cột trên một hàng.' },
      { name: 'Properties', note: 'Bật/tắt từng thuộc tính hiển thị trên thẻ.' },
      { name: 'Cover fit', note: 'Ảnh bìa cắt vừa khung hoặc thu vừa khung.' },
      { name: 'Loading', note: 'Thẻ skeleton đúng kích thước, lưới không nhảy.' },
      { name: 'Empty', note: 'Chưa có bản ghi — nút tạo mới ngay trong lưới.' },
      { name: 'Selected', note: 'Chọn nhiều thẻ để thao tác hàng loạt.' },
    ],
    dos: [
      'Cho đổi qua lại giữa các chế độ xem mà không mất bộ lọc đang đặt.',
      'Giới hạn 3–4 thuộc tính trên thẻ, phần còn lại để ở trang chi tiết.',
      'Giữ tỷ lệ ảnh bìa cố định để lưới thẳng hàng.',
      'Có ảnh bìa dự phòng (màu sinh từ tên) khi bản ghi chưa có ảnh.',
    ],
    donts: [
      'Không dùng lưới thẻ khi người dùng cần so sánh số liệu giữa các dòng.',
      'Không nhét cả chục thuộc tính lên một thẻ — nó thành cái bảng xấu.',
      'Không đổ toàn bộ bản ghi cùng lúc; tải dần khi cuộn.',
    ],
    demo: () => <GalleryViewDemo />,
    code: `<div className="gallery-view" data-size={size}>
  {records.map((r) => (
    <article key={r.id} className="gv-card" onClick={() => open(r.id)}>
      <div className="gv-cover" style={{ background: r.cover }} />
      <strong>{r.title}</strong>
      {visibleProps.map((p) => <Prop key={p} record={r} name={p} />)}
    </article>
  ))}
</div>

.gallery-view { display: grid; gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) }`,
  },
  {
    id: 'card-rail',
    nameEn: 'Horizontal Card Rail',
    nameVi: 'Dải thẻ kéo ngang',
    aliases: [
      'horizontal scroll',
      'card carousel',
      'scroll snap',
      'kéo ngang',
      'dải thẻ',
      'shelf',
    ],
    category: 'data',
    platforms: ['web', 'mobile'],
    description:
      'Một hàng thẻ cuộn ngang, có điểm bám (scroll-snap) để mỗi lần cuộn dừng đúng đầu thẻ, kèm nút ‹ › trên web và vệt mờ ở mép báo còn nội dung phía sau. Khác Carousel ở chỗ nhiều thẻ cùng hiện một lúc và người dùng chủ động cuộn.',
    purpose:
      'Dùng khi có một danh sách phụ, đồng hạng và không cần xem hết: dải chỉ số nhanh, danh mục hàng, báo cáo gần đây. Nó đổi chiều cao lấy chiều ngang — giữ trang chính ngắn.',
    states: [
      { name: 'At start', note: 'Nút ‹ mờ đi, chỉ có vệt mờ bên phải.' },
      { name: 'Scrolling', note: 'Bám vào đầu thẻ khi thả tay.' },
      { name: 'At end', note: 'Nút › mờ đi, bỏ vệt mờ bên phải.' },
      { name: 'Focus', note: 'Tab tới thẻ nào thì thẻ đó tự cuộn vào tầm nhìn.' },
      { name: 'Loading', note: 'Vài thẻ skeleton đúng bề ngang.' },
    ],
    dos: [
      'Để lộ một phần thẻ kế tiếp — đó là tín hiệu rõ nhất rằng cuộn được.',
      'Dùng `scroll-snap-type: x mandatory` để không dừng giữa hai thẻ.',
      'Trên web luôn có nút ‹ ›; chỉ vuốt thì người dùng chuột sẽ không biết.',
      'Trên mobile cho thẻ tràn ra sát mép màn hình (scroll-padding), nhìn tự nhiên hơn.',
    ],
    donts: [
      'Không đặt nội dung quan trọng hoặc bắt buộc phải xem trong dải kéo ngang.',
      'Không lồng dải kéo ngang bên trong một vùng cũng cuộn ngang khác.',
      'Không ẩn thanh cuộn mà không có tín hiệu nào khác báo còn nội dung.',
    ],
    nativeNames: { ios: 'UICollectionView cuộn ngang', android: 'RecyclerView + PagerSnapHelper' },
    demo: () => <CardRailDemo />,
    code: `<div className="rail" ref={rail} onScroll={onScroll}>
  {items.map((it) => (
    <article key={it.id} className="rail-card">{/* … */}</article>
  ))}
</div>

.rail { display: flex; gap: 10px; overflow-x: auto;
  scroll-snap-type: x mandatory }
.rail-card { flex: 0 0 132px; scroll-snap-align: start }

const nudge = (dir) =>
  rail.current.scrollBy({ left: dir * rail.current.clientWidth * 0.8,
    behavior: 'smooth' })`,
  },
]
