/* eslint-disable react-refresh/only-export-components -- demo components được đặt cạnh dữ liệu catalog cho dễ đối chiếu */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { CatalogEntry } from '../types'

/* -------------------------------------------------------------------------- */
/* Ảnh giả lập — vẽ bằng gradient + SVG để demo không phụ thuộc mạng           */
/* -------------------------------------------------------------------------- */

interface Photo {
  id: string
  label: string
  sub: string
  grad: string
}

const PHOTOS: Photo[] = [
  {
    id: 'p1',
    label: 'Kho CN-07 — hàng về',
    sub: '22/07/2026 · 06:12',
    grad: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  {
    id: 'p2',
    label: 'Quầy thu ngân số 3',
    sub: '22/07/2026 · 08:40',
    grad: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  },
  {
    id: 'p3',
    label: 'Biên bản nghiệm thu',
    sub: '22/07/2026 · 09:05',
    grad: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  },
  {
    id: 'p4',
    label: 'Kệ trưng bày mới',
    sub: '22/07/2026 · 10:20',
    grad: 'linear-gradient(135deg, #d4a5ff 0%, #f3a7c4 100%)',
  },
  {
    id: 'p5',
    label: 'Xe giao hàng CN-12',
    sub: '22/07/2026 · 11:48',
    grad: 'linear-gradient(135deg, #ffd3a5 0%, #fd9a9a 100%)',
  },
  {
    id: 'p6',
    label: 'Khu vực đóng gói',
    sub: '22/07/2026 · 14:02',
    grad: 'linear-gradient(135deg, #9be9d2 0%, #5f9ea0 100%)',
  },
]

/** Khối "ảnh" dùng lại cho mọi demo trong nhóm. */
function PhotoBox({
  photo,
  ratio = '4 / 3',
  radius = 'var(--radius)',
  style,
}: {
  photo: Photo
  ratio?: string
  radius?: string
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: ratio,
        borderRadius: radius,
        overflow: 'hidden',
        background: photo.grad,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 100 75"
        preserveAspectRatio="none"
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <circle cx="79" cy="15" r="8" fill="#fff" opacity="0.4" />
        <path d="M0 75 L28 38 L48 60 L68 30 L100 75 Z" fill="#000" opacity="0.16" />
        <path d="M0 75 L18 52 L36 75 Z" fill="#000" opacity="0.12" />
      </svg>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Demos                                                                       */
/* -------------------------------------------------------------------------- */

function LightboxDemo() {
  const [index, setIndex] = useState<number | null>(null)
  const list = PHOTOS.slice(0, 4)
  const open = index !== null

  const close = useCallback(() => setIndex(null), [])
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + list.length) % list.length)),
    [list.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, step])

  return (
    <div className="d-stagebox">
      <div className="d-stagebox-inner d-stack">
        <p className="d-muted" style={{ margin: 0 }}>
          Bấm một ảnh để mở lớn · ← → đổi ảnh · Esc đóng
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Mở ảnh: ${p.label}`}
              onClick={() => setIndex(i)}
              style={{ padding: 0, border: 0, background: 'none', cursor: 'zoom-in' }}
            >
              <PhotoBox photo={p} ratio="1 / 1" />
            </button>
          ))}
        </div>
      </div>

      {open && index !== null && (
        <div
          className="d-scrim"
          role="dialog"
          aria-modal="true"
          aria-label={list[index].label}
          style={{ background: 'rgb(0 0 0 / 82%)', placeItems: 'stretch' }}
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
              width: '100%',
              padding: 10,
              color: '#fff',
            }}
          >
            <div className="d-row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {index + 1} / {list.length}
              </span>
              <button
                type="button"
                aria-label="Đóng"
                onClick={close}
                style={{ border: 0, background: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div
              className="d-row"
              style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'center', minHeight: 0 }}
            >
              <button
                type="button"
                aria-label="Ảnh trước"
                onClick={() => step(-1)}
                style={lightboxArrow}
              >
                ‹
              </button>
              <PhotoBox
                photo={list[index]}
                ratio="auto"
                style={{ flex: 1, minWidth: 0, height: '100%' }}
              />
              <button type="button" aria-label="Ảnh sau" onClick={() => step(1)} style={lightboxArrow}>
                ›
              </button>
            </div>

            <p style={{ margin: '6px 2px 0', fontSize: 12 }}>
              <strong style={{ fontWeight: 600 }}>{list[index].label}</strong>
              <span style={{ opacity: 0.75 }}> · {list[index].sub}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const lightboxArrow: CSSProperties = {
  flex: '0 0 auto',
  width: 30,
  height: 30,
  border: 0,
  borderRadius: '50%',
  background: 'rgb(255 255 255 / 18%)',
  color: '#fff',
  fontSize: 17,
  lineHeight: 1,
  cursor: 'pointer',
}

function ImageGridDemo() {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? PHOTOS : PHOTOS.slice(0, 5)
  const rest = PHOTOS.length - 5
  return (
    <div className="d-panel d-stack">
      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 13 }}>Ảnh hiện trường ({PHOTOS.length})</strong>
        {expanded && (
          <button type="button" className="d-btn is-ghost is-sm" onClick={() => setExpanded(false)}>
            Thu gọn
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {shown.map((p) => (
          <figure key={p.id} style={{ margin: 0, position: 'relative' }}>
            <PhotoBox photo={p} ratio="1 / 1" />
            <figcaption
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                left: 0,
                padding: '10px 6px 4px',
                background: 'linear-gradient(transparent, rgb(0 0 0 / 55%))',
                borderRadius: '0 0 var(--radius) var(--radius)',
                color: '#fff',
                fontSize: 10,
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </figcaption>
          </figure>
        ))}
        {!expanded && rest > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              border: 0,
              borderRadius: 'var(--radius)',
              background: PHOTOS[5].grad,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--radius)',
                background: 'rgb(0 0 0 / 45%)',
              }}
            >
              +{rest}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

function SlideshowDemo() {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(false)
  const n = PHOTOS.length
  useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => setI((v) => (v + 1) % n), 2200)
    return () => window.clearInterval(id)
  }, [auto, n])
  return (
    <div className="d-panel d-stack">
      <div style={{ position: 'relative' }}>
        <PhotoBox photo={PHOTOS[i]} ratio="16 / 9" radius="var(--radius-lg)" />
        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => setI((v) => (v - 1 + n) % n)}
          style={{ ...slideArrow, left: 8 }}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Ảnh sau"
          onClick={() => setI((v) => (v + 1) % n)}
          style={{ ...slideArrow, right: 8 }}
        >
          ›
        </button>
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '2px 7px',
            borderRadius: 999,
            background: 'rgb(0 0 0 / 55%)',
            color: '#fff',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {i + 1}/{n}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {PHOTOS.map((p, k) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Xem ảnh ${k + 1}: ${p.label}`}
            aria-current={k === i}
            onClick={() => setI(k)}
            style={{
              flex: '0 0 58px',
              padding: 0,
              border: k === i ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: 'var(--radius)',
              background: 'none',
              opacity: k === i ? 1 : 0.6,
              cursor: 'pointer',
            }}
          >
            <PhotoBox photo={p} ratio="1 / 1" radius="6px" />
          </button>
        ))}
      </div>

      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <span className="d-hint" style={{ margin: 0 }}>
          {PHOTOS[i].label} · {PHOTOS[i].sub}
        </span>
        <button type="button" className="d-btn is-secondary is-sm" onClick={() => setAuto((v) => !v)}>
          {auto ? '❚❚ Dừng' : '▶ Tự chạy'}
        </button>
      </div>
    </div>
  )
}

const slideArrow: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 28,
  height: 28,
  border: 0,
  borderRadius: '50%',
  background: 'rgb(0 0 0 / 45%)',
  color: '#fff',
  fontSize: 16,
  lineHeight: 1,
  cursor: 'pointer',
}

function CompareDemo() {
  const [pos, setPos] = useState(52)
  return (
    <div className="d-panel d-stack">
      <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <PhotoBox photo={PHOTOS[3]} ratio="16 / 9" radius="0" />
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <PhotoBox photo={PHOTOS[0]} ratio="16 / 9" radius="0" style={{ height: '100%' }} />
        </div>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${pos}%`,
            width: 2,
            background: '#fff',
            boxShadow: '0 0 0 1px rgb(0 0 0 / 25%)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 26,
              height: 26,
              transform: 'translate(-50%, -50%)',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              background: '#fff',
              color: '#16181d',
              fontSize: 12,
            }}
          >
            ↔
          </span>
        </div>
        <span style={{ ...compareTag, left: 8 }}>Trước</span>
        <span style={{ ...compareTag, right: 8 }}>Sau</span>
      </div>
      <label className="d-label" htmlFor="cmp-range" style={{ marginBottom: 0 }}>
        Vị trí thanh so sánh
      </label>
      <input
        id="cmp-range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
      <p className="d-hint" style={{ margin: 0 }}>
        Kéo thanh (hoặc dùng phím ← →) để lộ dần ảnh bên dưới.
      </p>
    </div>
  )
}

const compareTag: CSSProperties = {
  position: 'absolute',
  bottom: 8,
  padding: '2px 7px',
  borderRadius: 999,
  background: 'rgb(0 0 0 / 55%)',
  color: '#fff',
  fontSize: 11,
}

/**
 * Kéo để di chuyển ảnh — dùng chung cho Zoom/Pan và Cropper.
 * `bound` trả về khoảng dịch tối đa theo mỗi trục để ảnh không trôi khỏi khung.
 */
function usePan(enabled: boolean, bound?: (el: HTMLDivElement) => { x: number; y: number }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const max = bound?.(e.currentTarget)
    const clamp = (v: number, m?: number) => (m === undefined ? v : Math.max(-m, Math.min(m, v)))
    setOffset({
      x: clamp(d.ox + (e.clientX - d.x), max?.x),
      y: clamp(d.oy + (e.clientY - d.y), max?.y),
    })
  }
  const onPointerUp = () => {
    drag.current = null
  }

  return { offset, setOffset, handlers: { onPointerDown, onPointerMove, onPointerUp } }
}

function ZoomPanDemo() {
  const [scale, setScale] = useState(1)
  const viewport = useRef<HTMLDivElement>(null)
  // Ảnh phóng to bao nhiêu thì được kéo bấy nhiêu — không để hở nền phía sau.
  const maxPan = useCallback(
    (s: number) => {
      const el = viewport.current
      if (!el) return { x: 0, y: 0 }
      return { x: (el.clientWidth * (s - 1)) / 2, y: (el.clientHeight * (s - 1)) / 2 }
    },
    [],
  )
  const { offset, setOffset, handlers } = usePan(scale > 1, () => maxPan(scale))

  /** Đổi mức phóng to và kéo ảnh về trong biên tương ứng. */
  const zoomTo = (next: number) => {
    const s = Math.min(3, Math.max(1, Number(next.toFixed(2))))
    const m = maxPan(s)
    setScale(s)
    setOffset((o) => ({
      x: Math.max(-m.x, Math.min(m.x, o.x)),
      y: Math.max(-m.y, Math.min(m.y, o.y)),
    }))
  }
  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }
  return (
    <div className="d-panel d-stack">
      <div
        ref={viewport}
        {...handlers}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-3)',
          touchAction: 'none',
          cursor: scale > 1 ? 'grab' : 'default',
        }}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center',
          }}
        >
          <PhotoBox photo={PHOTOS[2]} ratio="4 / 3" radius="0" />
        </div>
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            padding: '2px 7px',
            borderRadius: 999,
            background: 'rgb(0 0 0 / 55%)',
            color: '#fff',
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(scale * 100)}%
        </span>
      </div>
      <div className="d-row">
        <button
          type="button"
          className="d-btn is-secondary is-sm"
          aria-label="Thu nhỏ"
          onClick={() => zoomTo(scale - 0.25)}
        >
          −
        </button>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={scale}
          onChange={(e) => zoomTo(Number(e.target.value))}
          aria-label="Mức phóng to"
          style={{ flex: 1, accentColor: 'var(--accent)' }}
        />
        <button
          type="button"
          className="d-btn is-secondary is-sm"
          aria-label="Phóng to"
          onClick={() => zoomTo(scale + 0.25)}
        >
          +
        </button>
        <button type="button" className="d-btn is-ghost is-sm" onClick={reset}>
          Về gốc
        </button>
      </div>
      <p className="d-hint" style={{ margin: 0 }}>
        Phóng to rồi kéo ảnh để xem chi tiết. Trên mobile là chụm hai ngón (pinch) và
        chạm hai lần để phóng nhanh.
      </p>
    </div>
  )
}

const CROP_RATIOS = [
  { id: '1:1', label: '1:1', value: 1 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
]

function CropperDemo() {
  const [ratio, setRatio] = useState(CROP_RATIOS[0])
  const [zoom, setZoom] = useState(1.2)
  const { offset, setOffset, handlers } = usePan(true)
  const [saved, setSaved] = useState(false)
  return (
    <div className="d-panel d-stack">
      <div
        {...handlers}
        style={{
          position: 'relative',
          height: 170,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          background: '#101216',
          touchAction: 'none',
          cursor: 'move',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            opacity: 0.85,
          }}
        >
          <PhotoBox photo={PHOTOS[1]} ratio="16 / 9" radius="0" style={{ height: '100%' }} />
        </div>
        {/* Khung cắt */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            height: 116,
            aspectRatio: `${ratio.value}`,
            transform: 'translate(-50%, -50%)',
            border: '2px solid #fff',
            borderRadius: ratio.id === '1:1' ? 6 : 4,
            boxShadow: '0 0 0 9999px rgb(0 0 0 / 55%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right, transparent 33%, rgb(255 255 255 / 45%) 33%, rgb(255 255 255 / 45%) 34%, transparent 34%, transparent 66%, rgb(255 255 255 / 45%) 66%, rgb(255 255 255 / 45%) 67%, transparent 67%), linear-gradient(to bottom, transparent 33%, rgb(255 255 255 / 45%) 33%, rgb(255 255 255 / 45%) 34%, transparent 34%, transparent 66%, rgb(255 255 255 / 45%) 66%, rgb(255 255 255 / 45%) 67%, transparent 67%)',
            }}
          />
        </div>
      </div>

      <div className="d-row">
        {CROP_RATIOS.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={ratio.id === r.id}
            className={ratio.id === r.id ? 'd-btn is-sm' : 'd-btn is-secondary is-sm'}
            onClick={() => setRatio(r)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <label className="d-label" htmlFor="crop-zoom" style={{ marginBottom: 0 }}>
        Phóng to ({Math.round(zoom * 100)}%)
      </label>
      <input
        id="crop-zoom"
        type="range"
        min={1}
        max={2.5}
        step={0.05}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />

      <div className="d-row" style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          className="d-btn is-ghost is-sm"
          onClick={() => {
            setOffset({ x: 0, y: 0 })
            setZoom(1.2)
            setSaved(false)
          }}
        >
          Đặt lại
        </button>
        <button type="button" className="d-btn is-sm" onClick={() => setSaved(true)}>
          Cắt &amp; lưu
        </button>
      </div>
      {saved && (
        <p className="d-hint" style={{ margin: 0, color: 'var(--success)' }}>
          ✓ Đã cắt {ratio.id} — ảnh gốc vẫn được giữ lại.
        </p>
      )}
    </div>
  )
}

const MASONRY_HEIGHTS = [120, 78, 96, 140, 84, 110]

function MasonryDemo() {
  return (
    <div className="d-panel d-stack">
      <div style={{ columns: 3, columnGap: 6 }}>
        {PHOTOS.map((p, i) => (
          <div key={p.id} style={{ breakInside: 'avoid', marginBottom: 6 }}>
            <div
              style={{
                position: 'relative',
                height: MASONRY_HEIGHTS[i],
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: p.grad,
              }}
            >
              <svg
                viewBox="0 0 100 75"
                preserveAspectRatio="none"
                aria-hidden
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <circle cx="79" cy="15" r="8" fill="#fff" opacity="0.4" />
                <path d="M0 75 L28 38 L48 60 L68 30 L100 75 Z" fill="#000" opacity="0.16" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <p className="d-hint" style={{ margin: 0 }}>
        Mỗi ảnh giữ đúng tỷ lệ gốc, xếp so le để không còn khoảng trắng thừa.
      </p>
    </div>
  )
}

function ImagePickerDemo() {
  const [items, setItems] = useState(PHOTOS.slice(0, 3))
  const [cover, setCover] = useState(PHOTOS[0].id)
  const pool = PHOTOS.filter((p) => !items.some((it) => it.id === p.id))

  const move = (id: string, dir: -1 | 1) => {
    setItems((list) => {
      const i = list.findIndex((p) => p.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return list
      const next = [...list]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  return (
    <div className="d-panel d-stack">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {items.map((p, i) => (
          <div key={p.id} style={{ position: 'relative' }}>
            <PhotoBox
              photo={p}
              ratio="1 / 1"
              style={{ outline: cover === p.id ? '2px solid var(--accent)' : 'none', outlineOffset: 2 }}
            />
            <button
              type="button"
              aria-label={`Bỏ ảnh ${p.label}`}
              onClick={() => setItems((l) => l.filter((x) => x.id !== p.id))}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                border: 0,
                borderRadius: '50%',
                background: 'rgb(0 0 0 / 62%)',
                color: '#fff',
                fontSize: 11,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <div
              className="d-row"
              style={{ gap: 4, marginTop: 6, flexWrap: 'nowrap', justifyContent: 'center' }}
            >
              <button
                type="button"
                className="d-btn is-secondary is-sm"
                aria-label={`Chuyển ${p.label} lên trước`}
                disabled={i === 0}
                onClick={() => move(p.id, -1)}
                style={{ padding: '0 6px', fontSize: 11 }}
              >
                ←
              </button>
              {cover === p.id ? (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                    fontSize: 10,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ảnh bìa
                </span>
              ) : (
                <button
                  type="button"
                  className="d-btn is-secondary is-sm"
                  onClick={() => setCover(p.id)}
                  style={{ padding: '1px 7px', fontSize: 10, whiteSpace: 'nowrap' }}
                >
                  Đặt bìa
                </button>
              )}
              <button
                type="button"
                className="d-btn is-secondary is-sm"
                aria-label={`Chuyển ${p.label} ra sau`}
                disabled={i === items.length - 1}
                onClick={() => move(p.id, 1)}
                style={{ padding: '0 6px', fontSize: 11 }}
              >
                →
              </button>
            </div>
          </div>
        ))}

        {items.length < 6 && (
          <button
            type="button"
            onClick={() => pool[0] && setItems((l) => [...l, pool[0]])}
            style={{
              aspectRatio: '1 / 1',
              border: '1.5px dashed var(--border-strong)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface-2)',
              color: 'var(--fg-muted)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            + Thêm ảnh
          </button>
        )}
      </div>
      <p className="d-hint" style={{ margin: 0 }}>
        {items.length}/6 ảnh · JPG, PNG · tối đa 5MB mỗi ảnh. Ảnh bìa là ảnh hiện đầu tiên
        trong danh sách chứng từ.
      </p>
    </div>
  )
}

function StoryViewerDemo() {
  const [i, setI] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const list = PHOTOS.slice(0, 4)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p < 100) return p + 4
        setI((v) => (v + 1) % list.length)
        return 0
      })
    }, 90)
    return () => window.clearInterval(id)
  }, [paused, list.length])

  const go = (d: number) => {
    setI((v) => (v + d + list.length) % list.length)
    setProgress(0)
  }

  return (
    <div className="d-panel d-stack">
      <div
        style={{
          position: 'relative',
          maxWidth: 168,
          borderRadius: 18,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <PhotoBox photo={list[i]} ratio="9 / 16" radius="0" />

        {/* Thanh tiến độ từng ảnh */}
        <div style={{ position: 'absolute', top: 8, right: 8, left: 8, display: 'flex', gap: 4 }}>
          {list.map((p, k) => (
            <span
              key={p.id}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                background: 'rgb(0 0 0 / 32%)',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: k < i ? '100%' : k === i ? `${progress}%` : '0%',
                  height: '100%',
                  background: '#fff',
                }}
              />
            </span>
          ))}
        </div>

        {/* Vùng chạm trái / phải */}
        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => go(-1)}
          style={{ ...storyTapZone, left: 0 }}
        />
        <button
          type="button"
          aria-label="Ảnh sau"
          onClick={() => go(1)}
          style={{ ...storyTapZone, right: 0 }}
        />

        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            left: 10,
            color: '#fff',
            fontSize: 11,
            textShadow: '0 1px 3px rgb(0 0 0 / 60%)',
          }}
        >
          <strong style={{ fontWeight: 600 }}>{list[i].label}</strong>
          <br />
          <span style={{ opacity: 0.8 }}>{list[i].sub}</span>
        </div>
      </div>

      <div className="d-row">
        <button type="button" className="d-btn is-secondary is-sm" onClick={() => setPaused((v) => !v)}>
          {paused ? '▶ Tiếp tục' : '❚❚ Tạm dừng'}
        </button>
        <span className="d-hint" style={{ margin: 0 }}>
          Chạm nửa trái / nửa phải để lùi hoặc tiến.
        </span>
      </div>
    </div>
  )
}

const storyTapZone: CSSProperties = {
  position: 'absolute',
  top: 24,
  bottom: 44,
  width: '50%',
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
}

/* -------------------------------------------------------------------------- */
/* Entries                                                                     */
/* -------------------------------------------------------------------------- */

export const galleryEntries: CatalogEntry[] = [
  {
    id: 'lightbox',
    nameEn: 'Lightbox / Image Viewer',
    nameVi: 'Xem ảnh phóng to',
    aliases: [
      'lightbox',
      'image viewer',
      'photo viewer',
      'xem ảnh lớn',
      'phóng to ảnh',
      'modal ảnh',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Lớp phủ tối toàn màn hình hiện một ảnh ở kích thước lớn nhất có thể, kèm nút đóng, nút ‹ › và số thứ tự “3/12”. Trang phía sau vẫn giữ nguyên vị trí cuộn.',
    purpose:
      'Dùng khi người dùng cần nhìn rõ chi tiết ảnh (chứng từ, biên bản, ảnh hiện trường) mà không muốn rời khỏi trang đang xem. Rẻ hơn nhiều so với mở một trang chi tiết riêng.',
    states: [
      { name: 'Closed', note: 'Chỉ có thumbnail, con trỏ là zoom-in.' },
      { name: 'Opening', note: 'Ảnh phóng ra từ đúng vị trí thumbnail.' },
      { name: 'Loading', note: 'Ảnh gốc còn tải — hiện tạm bản mờ độ phân giải thấp.' },
      { name: 'Navigating', note: 'Đổi ảnh bằng ‹ ›, phím ← →, hoặc vuốt ngang.' },
      { name: 'Error', note: 'Ảnh gốc lỗi — báo rõ và vẫn cho đóng.' },
    ],
    dos: [
      'Đóng được bằng Esc, bằng nút ✕ và bằng cách bấm ra nền tối.',
      'Bẫy focus trong lớp phủ, đóng xong trả focus về đúng thumbnail vừa bấm.',
      'Hiện số thứ tự và chú thích để người dùng biết đang ở ảnh nào trong bao nhiêu ảnh.',
      'Khoá cuộn trang nền trong lúc lightbox mở.',
    ],
    donts: [
      'Không dùng lightbox cho nội dung cần thao tác tiếp (form, danh sách) — đó là việc của Modal.',
      'Không để ảnh tràn khỏi màn hình buộc người dùng phải cuộn hai chiều.',
      'Không chặn nút Back của trình duyệt/điện thoại — Back phải đóng lightbox.',
    ],
    nativeNames: { ios: 'QLPreviewController', android: 'PhotoView / Media3 viewer' },
    demo: () => <LightboxDemo />,
    code: `const [i, setI] = useState<number | null>(null)

useEffect(() => {
  if (i === null) return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setI(null)
    if (e.key === 'ArrowRight') setI((v) => (v! + 1) % photos.length)
    if (e.key === 'ArrowLeft') setI((v) => (v! - 1 + photos.length) % photos.length)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [i])

{i !== null && (
  <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setI(null)}>
    <span>{i + 1} / {photos.length}</span>
    <img src={photos[i].full} alt={photos[i].alt} onClick={(e) => e.stopPropagation()} />
    <button aria-label="Đóng" onClick={() => setI(null)}>✕</button>
  </div>
)}`,
  },
  {
    id: 'image-gallery',
    nameEn: 'Image Gallery / Photo Grid',
    nameVi: 'Thư viện ảnh dạng lưới',
    aliases: [
      'gallery',
      'photo grid',
      'thumbnail grid',
      'thư viện ảnh',
      'lưới ảnh',
      'album ảnh',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Lưới thumbnail vuông đều nhau, thường kèm ô cuối dạng “+N” khi số ảnh vượt quá số ô hiển thị. Bấm một ô sẽ mở Lightbox đúng ảnh đó.',
    purpose:
      'Dùng để tóm tắt cả bộ ảnh trong một khoảng màn hình cố định: ảnh đính kèm của một phiếu, album chi nhánh, bộ ảnh nghiệm thu. Người dùng quét mắt trước, chỉ mở lớn ảnh cần xem.',
    states: [
      { name: 'Loading', note: 'Ô skeleton đúng kích thước để lưới không nhảy.' },
      { name: 'Loaded', note: 'Thumbnail đã cắt sẵn theo tỷ lệ ô.' },
      { name: 'Overflow', note: 'Ô cuối là “+N” — bấm để xem toàn bộ.' },
      { name: 'Selectable', note: 'Chế độ chọn nhiều để tải xuống hoặc xoá hàng loạt.' },
      { name: 'Empty', note: 'Chưa có ảnh — hiện trạng thái rỗng kèm nút thêm ảnh.' },
    ],
    dos: [
      'Dùng ảnh thumbnail đã resize sẵn ở server, không tải ảnh gốc.',
      'Giữ tỷ lệ ô cố định (aspect-ratio) và object-fit: cover để lưới thẳng hàng.',
      'Cho phép đi giữa các ô bằng Tab và mở bằng Enter.',
      'Tải dần (lazy) các ảnh nằm dưới màn hình đầu.',
    ],
    donts: [
      'Không đổ hàng trăm ảnh cùng lúc — phân trang hoặc cuộn vô hạn.',
      'Không để “+N” dẫn tới một trang khác không liên quan.',
      'Không bỏ alt của toàn bộ thumbnail — người dùng đọc màn hình sẽ mất trắng nội dung.',
    ],
    nativeNames: { ios: 'UICollectionView (PHAsset)', android: 'RecyclerView + GridLayoutManager' },
    demo: () => <ImageGridDemo />,
    code: `<ul className="gallery">
  {photos.slice(0, 5).map((p) => (
    <li key={p.id}>
      <button onClick={() => openLightbox(p.id)}>
        <img src={p.thumb} alt={p.alt} loading="lazy" />
      </button>
    </li>
  ))}
  {rest > 0 && <li><button onClick={showAll}>+{rest}</button></li>}
</ul>

.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px }
.gallery img { width: 100%; aspect-ratio: 1; object-fit: cover }`,
  },
  {
    id: 'photo-slideshow',
    nameEn: 'Photo Slideshow / Thumbnail Strip',
    nameVi: 'Slide ảnh có dải thu nhỏ',
    aliases: [
      'slideshow',
      'image slider',
      'thumbnail strip',
      'product gallery',
      'slide ảnh',
      'trình chiếu ảnh',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Một ảnh lớn đang xem cộng dải thumbnail bên dưới. Khác Carousel ở chỗ đây là cùng một chủ thể nhìn từ nhiều góc, người dùng thường muốn xem hết chứ không lướt qua.',
    purpose:
      'Dùng cho ảnh sản phẩm, bộ ảnh một phiếu giao hàng, hồ sơ hiện trường — nơi người dùng cần nhảy thẳng tới đúng ảnh mình muốn thay vì bấm ‹ › nhiều lần.',
    states: [
      { name: 'Active', note: 'Thumbnail đang xem có viền nổi bật và aria-current.' },
      { name: 'Auto-play', note: 'Tự chạy — bắt buộc có nút dừng.' },
      { name: 'Swiping', note: 'Vuốt ngang trên mobile, có bám nhẹ theo ngón (snap).' },
      { name: 'Overflow', note: 'Dải thumbnail cuộn ngang khi quá nhiều ảnh.' },
    ],
    dos: [
      'Cuộn dải thumbnail sao cho ảnh đang xem luôn nằm trong tầm nhìn.',
      'Hỗ trợ phím ← →, và vuốt ngang trên cảm ứng.',
      'Hiện chỉ số “3/12” để người dùng biết còn bao nhiêu ảnh.',
      'Tải trước (preload) ảnh kế tiếp để bấm sang là thấy ngay.',
    ],
    donts: [
      'Không tự chạy khi người dùng đang thao tác — dừng khi rê chuột hoặc focus.',
      'Không giấu dải thumbnail nếu bộ ảnh trên 4 tấm.',
      'Không đổi chiều cao khung ảnh khi chuyển slide — trang sẽ nhảy.',
    ],
    nativeNames: { ios: 'UIPageViewController', android: 'ViewPager2 + TabLayout' },
    demo: () => <SlideshowDemo />,
    code: `const [i, setI] = useState(0)

<figure>
  <img src={photos[i].full} alt={photos[i].alt} />
  <figcaption>{photos[i].caption}</figcaption>
</figure>

<div className="strip" role="tablist">
  {photos.map((p, k) => (
    <button key={p.id} role="tab" aria-selected={k === i}
      aria-current={k === i} onClick={() => setI(k)}>
      <img src={p.thumb} alt="" />
    </button>
  ))}
</div>`,
  },
  {
    id: 'image-compare',
    nameEn: 'Image Comparison Slider',
    nameVi: 'Thanh so sánh hai ảnh',
    aliases: [
      'before after',
      'compare slider',
      'split view image',
      'so sánh ảnh',
      'ảnh trước sau',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Hai ảnh chồng khít lên nhau, một thanh dọc kéo được để lộ dần ảnh bên dưới. Chỉ hoạt động khi hai ảnh cùng khung hình, cùng kích thước.',
    purpose:
      'Dùng để chứng minh khác biệt trước/sau: quầy trước và sau khi sắp xếp, ảnh gốc và ảnh đã chỉnh, hiện trạng trước và sau sửa chữa. Đặt cạnh nhau sẽ khó thấy khác biệt hơn nhiều.',
    states: [
      { name: 'Default', note: 'Thanh đứng giữa, hai nhãn Trước / Sau luôn hiện.' },
      { name: 'Dragging', note: 'Đang kéo — con trỏ đổi thành col-resize.' },
      { name: 'Keyboard', note: 'Có focus, phím ← → dịch thanh từng nấc.' },
      { name: 'Loading', note: 'Chưa đủ hai ảnh thì chưa cho kéo.' },
    ],
    dos: [
      'Cài bằng một <input type="range"> ẩn để có sẵn bàn phím và đọc màn hình.',
      'Gắn nhãn “Trước” / “Sau” cố định ở hai bên.',
      'Bảo đảm hai ảnh cùng góc chụp, cùng tỷ lệ, cùng độ sáng nền.',
    ],
    donts: [
      'Không so sánh hai ảnh khác khung hình — người xem sẽ hiểu sai.',
      'Không để thanh tự chạy qua lại gây rối mắt.',
      'Không chỉ dựa vào kéo chuột mà bỏ quên bàn phím và cảm ứng.',
    ],
    demo: () => <CompareDemo />,
    code: `const [pos, setPos] = useState(50)

<div className="compare">
  <img src={after} alt="Sau khi sắp xếp" />
  <div className="clip" style={{ clipPath: \`inset(0 \${100 - pos}% 0 0)\` }}>
    <img src={before} alt="Trước khi sắp xếp" />
  </div>
  <span className="handle" style={{ left: \`\${pos}%\` }} />
  <input type="range" min={0} max={100} value={pos}
    aria-label="Vị trí thanh so sánh"
    onChange={(e) => setPos(Number(e.target.value))} />
</div>`,
  },
  {
    id: 'image-zoom-pan',
    nameEn: 'Zoom & Pan Viewer',
    nameVi: 'Phóng to & kéo xem ảnh',
    aliases: [
      'pinch to zoom',
      'pan',
      'double tap zoom',
      'phóng to ảnh',
      'kéo xem ảnh',
      'kính lúp',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Khung xem cho phép phóng to ảnh vượt kích thước khung rồi kéo để di chuyển. Trên mobile là chụm hai ngón; trên web là cuộn chuột, nút +/− hoặc chạm hai lần.',
    purpose:
      'Dùng khi chi tiết nhỏ trong ảnh mới là thứ quan trọng: số seri trên tem, chữ ký trên biên bản, mã lô hàng in mờ. Thường nằm ngay bên trong Lightbox.',
    states: [
      { name: 'Fit', note: '100% — ảnh vừa khung, chưa kéo được.' },
      { name: 'Zoomed', note: 'Trên 100% — con trỏ thành grab, kéo được.' },
      { name: 'Panning', note: 'Đang kéo, có chặn biên để ảnh không trôi mất.' },
      { name: 'Max zoom', note: 'Chạm trần phóng to — dừng lại, không nhoè vô hạn.' },
    ],
    dos: [
      'Luôn có nút “Về gốc” để thoát khỏi trạng thái phóng to lạc lối.',
      'Chặn biên: không cho kéo ảnh ra khỏi khung nhìn.',
      'Chạm hai lần (hoặc bấm đúp) để phóng nhanh rồi trở lại.',
      'Đặt touch-action: none để trình duyệt không cướp cử chỉ kéo.',
    ],
    donts: [
      'Không cho phóng to quá mức ảnh gốc chịu được — chỉ còn thấy điểm ảnh vỡ.',
      'Không dùng cuộn chuột để zoom mà không giữ Ctrl trên trang có nội dung dài — người dùng sẽ kẹt cuộn.',
      'Không quên nút +/− cho người không dùng được cử chỉ.',
    ],
    nativeNames: { ios: 'UIScrollView (zoomScale)', android: 'PhotoView / ScaleGestureDetector' },
    demo: () => <ZoomPanDemo />,
    code: `const [scale, setScale] = useState(1)
const [off, setOff] = useState({ x: 0, y: 0 })

<div className="viewport" style={{ touchAction: 'none' }}
  onPointerDown={startDrag} onPointerMove={drag} onPointerUp={endDrag}>
  <img src={src} alt={alt}
    style={{ transform: \`translate(\${off.x}px, \${off.y}px) scale(\${scale})\` }} />
</div>

<button onClick={() => setScale((s) => Math.min(3, s + 0.25))}>+</button>
<button onClick={() => { setScale(1); setOff({ x: 0, y: 0 }) }}>Về gốc</button>`,
  },
  {
    id: 'image-cropper',
    nameEn: 'Image Cropper',
    nameVi: 'Cắt ảnh',
    aliases: [
      'crop',
      'avatar cropper',
      'aspect ratio',
      'cắt ảnh',
      'chỉnh ảnh đại diện',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Khung cắt cố định tỷ lệ đặt trên ảnh; người dùng kéo ảnh và phóng to để chọn phần giữ lại. Vùng ngoài khung bị làm tối, thường kèm lưới ba phần.',
    purpose:
      'Dùng ngay sau khi chọn ảnh, để ảnh đưa lên hệ thống luôn đúng tỷ lệ chỗ sẽ hiển thị: ảnh đại diện vuông, ảnh bìa 16:9, ảnh chứng từ 4:3.',
    states: [
      { name: 'Idle', note: 'Khung cắt ở giữa, ảnh vừa khung.' },
      { name: 'Dragging', note: 'Đang kéo ảnh trong khung.' },
      { name: 'Zooming', note: 'Thanh trượt phóng to — không cho nhỏ hơn khung cắt.' },
      { name: 'Ratio locked', note: 'Đang khoá theo 1:1 / 4:3 / 16:9.' },
      { name: 'Saving', note: 'Đang xử lý và tải phần đã cắt lên.' },
    ],
    dos: [
      'Giữ nguyên ảnh gốc, chỉ lưu thêm bản đã cắt để còn cắt lại được.',
      'Khoá tỷ lệ đúng bằng tỷ lệ nơi ảnh sẽ hiển thị.',
      'Không cho thu ảnh nhỏ hơn khung cắt (sẽ hở viền trắng).',
      'Cho xoay 90° — ảnh chụp bằng điện thoại rất hay bị nằm ngang.',
    ],
    donts: [
      'Không tự ý cắt giữa ảnh rồi báo “xong” — mặt người thường không ở chính giữa.',
      'Không bắt người dùng cắt thủ công nếu hệ thống chấp nhận mọi tỷ lệ.',
      'Không xử lý ảnh 12MP trên luồng chính — giao diện sẽ đứng vài giây.',
    ],
    nativeNames: { ios: 'TOCropViewController / PHPicker + crop', android: 'uCrop / Image Cropper' },
    demo: () => <CropperDemo />,
    code: `<div className="cropper" onPointerDown={startDrag} onPointerMove={drag}>
  <img src={src} alt=""
    style={{ transform: \`translate(\${off.x}px, \${off.y}px) scale(\${zoom})\` }} />
  <div className="crop-frame" style={{ aspectRatio: ratio }} />
</div>

<input type="range" min={1} max={2.5} step={0.05} value={zoom}
  aria-label="Phóng to" onChange={(e) => setZoom(Number(e.target.value))} />
<button onClick={save}>Cắt &amp; lưu</button>`,
  },
  {
    id: 'masonry-gallery',
    nameEn: 'Masonry Gallery',
    nameVi: 'Lưới ảnh so le',
    aliases: [
      'masonry',
      'pinterest layout',
      'waterfall grid',
      'lưới ảnh so le',
      'ghép ảnh mosaic',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Lưới nhiều cột trong đó mỗi ảnh giữ đúng tỷ lệ gốc, các cột xếp so le nhau nên không còn khoảng trắng thừa như lưới ô vuông đều.',
    purpose:
      'Dùng khi tỷ lệ ảnh là một phần nội dung — ảnh dọc, ảnh ngang, ảnh chụp màn hình lẫn lộn — và việc cắt vuông sẽ làm mất thông tin quan trọng.',
    states: [
      { name: 'Loading', note: 'Ô giữ chỗ đúng tỷ lệ từng ảnh, không phải ô vuông.' },
      { name: 'Loaded', note: 'Ảnh hiện dần, bố cục đã ổn định từ trước.' },
      { name: 'Infinite scroll', note: 'Tải thêm khi cuộn gần cuối.' },
      { name: 'Responsive', note: 'Số cột đổi theo bề ngang màn hình.' },
    ],
    dos: [
      'Lưu sẵn width/height của ảnh ở server để giữ chỗ trước, tránh bố cục nhảy.',
      'Dùng CSS `columns` hoặc grid, chỉ dùng thư viện JS khi thật sự cần.',
      'Giảm còn 2 cột (hoặc 1) trên màn hình hẹp.',
    ],
    donts: [
      'Không dùng masonry cho danh sách cần so sánh theo hàng — mắt sẽ mất mốc.',
      'Không tính bố cục bằng JS sau khi ảnh tải xong — trang sẽ giật một nhịp.',
      'Không trộn masonry với ô có chiều cao cố định trong cùng lưới.',
    ],
    demo: () => <MasonryDemo />,
    code: `.masonry { columns: 3; column-gap: 6px }
.masonry > * { break-inside: avoid; margin-bottom: 6px }

<div className="masonry">
  {photos.map((p) => (
    <img key={p.id} src={p.thumb} alt={p.alt}
      width={p.w} height={p.h} loading="lazy" />
  ))}
</div>`,
  },
  {
    id: 'image-picker-preview',
    nameEn: 'Image Picker with Preview',
    nameVi: 'Chọn ảnh kèm xem trước',
    aliases: [
      'image upload preview',
      'photo picker',
      'chọn ảnh',
      'xem trước ảnh',
      'ảnh bìa',
      'sắp xếp ảnh',
    ],
    category: 'media',
    platforms: ['web', 'mobile'],
    description:
      'Lưới ảnh đã chọn, mỗi ảnh có nút bỏ, nút sắp xếp lại thứ tự và tuỳ chọn đặt làm ảnh bìa; cộng một ô “+ Thêm ảnh”. Khác File Upload ở chỗ nó xem trước được nội dung chứ không chỉ liệt kê tên tệp.',
    purpose:
      'Dùng khi người dùng đưa lên nhiều ảnh mà thứ tự và ảnh đại diện có ý nghĩa: ảnh sản phẩm, bộ ảnh nghiệm thu, ảnh minh chứng theo trình tự thao tác.',
    states: [
      { name: 'Empty', note: 'Chỉ có ô “+ Thêm ảnh”, ghi rõ giới hạn.' },
      { name: 'Uploading', note: 'Ảnh mờ kèm vòng tiến độ ngay trên thumbnail.' },
      { name: 'Cover', note: 'Ảnh bìa có viền và nhãn riêng.' },
      { name: 'Reordering', note: 'Đang kéo đổi chỗ — phải có cả nút ← → cho bàn phím.' },
      { name: 'Rejected', note: 'Ảnh quá nặng hoặc sai định dạng — báo ngay tại ô đó.' },
      { name: 'Full', note: 'Đủ số lượng tối đa — ẩn ô thêm ảnh.' },
    ],
    dos: [
      'Xem trước ngay bằng URL cục bộ, không chờ tải lên xong.',
      'Nén ảnh ở phía máy khách trước khi gửi — ảnh điện thoại thường 4–8MB.',
      'Cho sắp xếp bằng cả kéo-thả lẫn nút, vì kéo-thả không dùng được bằng bàn phím.',
      'Nói rõ số lượng đang có trên tối đa (3/6) và giới hạn dung lượng.',
    ],
    donts: [
      'Không xoá ảnh ngay khi bấm nhầm ✕ — cho hoàn tác hoặc hỏi lại.',
      'Không mất hết ảnh đã chọn khi form báo lỗi ở bước sau.',
      'Không chỉ hiện tên tệp — người dùng không nhớ IMG_2039.HEIC là ảnh nào.',
    ],
    nativeNames: { ios: 'PHPickerViewController', android: 'Photo Picker (ACTION_PICK_IMAGES)' },
    demo: () => <ImagePickerDemo />,
    code: `const onPick = (files: FileList) => {
  const next = [...files].map((f) => ({
    id: crypto.randomUUID(),
    file: f,
    url: URL.createObjectURL(f),   // nhớ revokeObjectURL khi gỡ
  }))
  setItems((l) => [...l, ...next].slice(0, 6))
}

{items.map((it, i) => (
  <figure key={it.id}>
    <img src={it.url} alt="" />
    <button aria-label="Bỏ ảnh" onClick={() => remove(it.id)}>✕</button>
    <button onClick={() => setCover(it.id)}>Đặt bìa</button>
  </figure>
))}`,
  },
  {
    id: 'story-viewer',
    nameEn: 'Story / Fullscreen Photo Viewer',
    nameVi: 'Xem ảnh toàn màn hình kiểu story',
    aliases: [
      'story',
      'stories',
      'fullscreen photo',
      'tap to advance',
      'xem ảnh toàn màn hình',
      'ảnh tự chuyển',
    ],
    category: 'media',
    platforms: ['mobile'],
    description:
      'Ảnh chiếm trọn màn hình, tự chuyển sau vài giây, có dải thanh tiến độ ở trên đầu cho biết đang ở ảnh thứ mấy. Chạm nửa trái để lùi, nửa phải để tiến, giữ để tạm dừng.',
    purpose:
      'Dùng cho chuỗi ảnh xem theo trình tự và có tính thời điểm: nhật ký thi công trong ngày, bản tin nội bộ, hướng dẫn từng bước bằng ảnh.',
    states: [
      { name: 'Playing', note: 'Thanh tiến độ của ảnh hiện tại đang chạy.' },
      { name: 'Paused', note: 'Giữ ngón — dừng đếm, ẩn bớt lớp giao diện.' },
      { name: 'First / Last', note: 'Đầu chuỗi không lùi được; cuối chuỗi thì đóng hoặc sang chuỗi kế.' },
      { name: 'Loading', note: 'Thanh tiến độ dừng chờ, không tính thời gian tải vào lượt xem.' },
    ],
    dos: [
      'Tải trước ảnh kế tiếp để chuyển là thấy ngay.',
      'Giữ ngón để tạm dừng — thói quen người dùng đã quen từ mạng xã hội.',
      'Vuốt xuống để đóng, và luôn có nút ✕ nhìn thấy được.',
      'Đặt chữ trong vùng an toàn, tránh tai thỏ và thanh gạt dưới.',
    ],
    donts: [
      'Không đặt thời lượng quá ngắn cho ảnh có nhiều chữ.',
      'Không dùng story cho nội dung cần đọc kỹ hoặc cần đối chiếu — nó biến mất quá nhanh.',
      'Không để vùng chạm tiến/lùi đè lên nút bấm thật trong ảnh.',
    ],
    nativeNames: { ios: 'UIPageViewController toàn màn hình', android: 'ViewPager2 fullscreen' },
    demo: () => <StoryViewerDemo />,
    code: `useEffect(() => {
  if (paused) return
  const id = setInterval(() => {
    setProgress((p) => {
      if (p < 100) return p + 2
      setI((v) => v + 1)
      return 0
    })
  }, 60)
  return () => clearInterval(id)
}, [paused, i])

<div className="story">
  <div className="bars">
    {photos.map((_, k) => (
      <span key={k}><i style={{ width: barWidth(k) }} /></span>
    ))}
  </div>
  <img src={photos[i].full} alt={photos[i].alt} />
  <button aria-label="Ảnh trước" onClick={prev} className="tap left" />
  <button aria-label="Ảnh sau" onClick={next} className="tap right" />
</div>`,
  },
]
