import { useEffect, useRef, useState } from 'react'
import type { CatalogEntry } from '../types'
import { LATEST_RELEASE } from '../types'
import { hrefOf } from '../lib/route'

/**
 * Chỉ dựng demo khi thẻ lọt vào tầm nhìn — gần trăm demo sống cùng lúc sẽ nặng
 * và làm chạy hàng loạt setInterval không cần thiết.
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

export function EntryCard({ entry }: { entry: CatalogEntry }) {
  return (
    <article className="hp-card">
      <LazyStage entry={entry} />
      <div className="hp-card-body">
        <h3 className="hp-card-title">
          {entry.nameEn}
          {entry.since === LATEST_RELEASE.version && <span className="new-dot">Mới</span>}
        </h3>
        <p className="hp-card-vi">{entry.nameVi}</p>
      </div>
      <footer className="hp-card-foot">
        <a className="d-btn is-ghost is-sm" href={hrefOf({ kind: 'entry', id: entry.id })}>
          Xem chi tiết →
        </a>
      </footer>
    </article>
  )
}
