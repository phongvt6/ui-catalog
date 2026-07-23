import type { CatalogEntry } from '../types'
import { CATEGORIES, RELEASES } from '../types'
import { EntryCard } from './EntryCard'
import { hrefOf } from '../lib/route'

/**
 * “Mới cập nhật”: xem nhanh đợt nào vừa thêm những gì, không phải đọc changelog
 * rồi tự đi tìm từng mục.
 */
export function NewPage({ entries }: { entries: CatalogEntry[] }) {
  const batches = RELEASES.map((r) => ({
    release: r,
    items: entries.filter((e) => e.since === r.version),
  })).filter((b) => b.items.length > 0)

  const nameOfCategory = (id: string) => CATEGORIES.find((c) => c.id === id)?.nameVi ?? id

  return (
    <div className="page">
      <header className="page-head">
        <h1>Mới cập nhật</h1>
        <p className="page-lede">
          Các đợt bổ sung component, mới nhất trước. Muốn đọc đầy đủ mọi thay đổi (kể cả sửa lỗi
          và chỉnh giao diện) thì xem{' '}
          <a href={hrefOf({ kind: 'changelog' })}>Nhật ký thay đổi</a>.
        </p>
      </header>

      {batches.map((b) => {
        const inCats = [...new Set(b.items.map((e) => nameOfCategory(e.category)))]
        return (
          <section key={b.release.version} className="hp-group">
            <div className="hp-group-head">
              <div>
                <h2>
                  {b.release.unreleased ? 'Chưa phát hành' : `Phiên bản ${b.release.version}`}{' '}
                  <span className="hp-group-en">
                    · {b.release.date} · {b.items.length} mục
                  </span>
                </h2>
                <p>
                  {b.release.note} <em>Nhóm: {inCats.join(' · ')}.</em>
                </p>
              </div>
            </div>
            <div className="hp-grid">
              {b.items.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
