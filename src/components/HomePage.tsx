import { useEffect, useRef, useState } from 'react'
import type { CatalogEntry, CategoryId } from '../types'
import { CATEGORIES } from '../types'

/**
 * Chỉ dựng demo khi thẻ lọt vào tầm nhìn — 80 demo sống cùng lúc sẽ nặng và
 * làm chạy hàng loạt setInterval không cần thiết.
 */
function LazyStage({ entry }: { entry: CatalogEntry }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  const webCapable = entry.platforms.includes('web')
  const node = webCapable ? entry.demo() : (entry.mobileDemo ?? entry.demo)()

  return (
    <div className="hp-stage" ref={ref}>
      {shown ? (
        <div className="hp-stage-inner">
          {/* Mục chỉ có bản mobile: dùng khung rút gọn thay vì cả chiếc điện
              thoại — thu nhỏ nguyên khung thì chữ bé tới mức không đọc nổi. */}
          {webCapable ? node : <div className="hp-mini-phone">{node}</div>}
        </div>
      ) : (
        <div className="hp-stage-skeleton">
          <span className="d-skeleton" style={{ width: '60%', height: 12 }} />
          <span className="d-skeleton" style={{ width: '85%', height: 12 }} />
          <span className="d-skeleton" style={{ width: '40%', height: 12 }} />
        </div>
      )}
    </div>
  )
}

function EntryCard({ entry, onOpen }: { entry: CatalogEntry; onOpen: (id: string) => void }) {
  return (
    <article className="hp-card">
      <LazyStage entry={entry} />
      <div className="hp-card-body">
        <h3 className="hp-card-title">{entry.nameEn}</h3>
        <p className="hp-card-vi">{entry.nameVi}</p>
      </div>
      <footer className="hp-card-foot">
        <a
          className="d-btn is-ghost is-sm"
          href={`#/${entry.id}`}
          onClick={(e) => {
            e.preventDefault()
            onOpen(entry.id)
          }}
        >
          Xem chi tiết →
        </a>
      </footer>
    </article>
  )
}

interface Props {
  /** Danh sách đã áp bộ lọc ở sidebar */
  entries: CatalogEntry[]
  total: number
  onOpen: (id: string) => void
  onPickCategory: (id: CategoryId) => void
}

export function HomePage({ entries, total, onOpen, onPickCategory }: Props) {
  const groups = CATEGORIES.map((c) => ({
    category: c,
    items: entries.filter((e) => e.category === c.id),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="hp">
      <header className="hp-hero">
        <h1>Từ điển UI — Element &amp; Component</h1>
        <p>
          Toàn bộ <strong>{total} component</strong> của web và mobile, chia {CATEGORIES.length}{' '}
          nhóm. Mỗi thẻ bên dưới là một demo <strong>chạy thật</strong> — bấm, gõ, kéo ngay tại
          đây. Mở chi tiết để xem diễn giải, công dụng và đoạn code mẫu.
        </p>
        <nav className="hp-jump" aria-label="Nhảy tới nhóm">
          {groups.map((g) => (
            <a
              key={g.category.id}
              href={`#group-${g.category.id}`}
              onClick={(e) => {
                e.preventDefault()
                document
                  .getElementById(`group-${g.category.id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {g.category.nameVi} <span>{g.items.length}</span>
            </a>
          ))}
        </nav>
      </header>

      {groups.map((g) => (
        <section key={g.category.id} className="hp-group" id={`group-${g.category.id}`}>
          <div className="hp-group-head">
            <div>
              <h2>
                {g.category.nameVi}{' '}
                <span className="hp-group-en">· {g.category.nameEn}</span>
              </h2>
              <p>{g.category.blurb}</p>
            </div>
            <button
              type="button"
              className="d-btn is-secondary is-sm"
              onClick={() => onPickCategory(g.category.id)}
            >
              Chỉ xem nhóm này
            </button>
          </div>
          <div className="hp-grid">
            {g.items.map((e) => (
              <EntryCard key={e.id} entry={e} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}

      {groups.length === 0 && (
        <div className="empty-state">
          <strong>Không có component nào khớp bộ lọc</strong>
          <span>Thử xoá bớt điều kiện ở cột bên trái.</span>
        </div>
      )}
    </div>
  )
}
