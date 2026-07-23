import type { CatalogEntry } from '../types'
import { CATEGORIES } from '../types'
import { EntryCard } from './EntryCard'

interface Props {
  query: string
  results: CatalogEntry[]
  /** Số biểu đồ khớp — hiện ở dòng tóm tắt, phần lưới do khu Biểu đồ tự dựng. */
  chartCount: number
  onClear: () => void
}

/** Gõ vào ô tìm kiếm thì cả khung nội dung thành trang kết quả. */
export function SearchPage({ query, results, chartCount, onClear }: Props) {
  const groups = CATEGORIES.map((c) => ({
    category: c,
    items: results.filter((e) => e.category === c.id),
  })).filter((g) => g.items.length > 0)

  return (
    <>
      <header className="page-head">
        <h1>Kết quả cho “{query}”</h1>
        <p className="page-lede">
          {results.length} component · {chartCount} biểu đồ khớp.{' '}
          <button type="button" className="link-btn" onClick={onClear}>
            Xoá tìm kiếm
          </button>
        </p>
      </header>

      {results.length > 0 && <h2 className="wn-h2">Component · {results.length} mục</h2>}

      {results.length === 0 && chartCount === 0 ? (
        <div className="empty-state">
          <strong>Không tìm thấy gì</strong>
          <span>Thử từ khoá khác — gõ không dấu cũng được, ví dụ “o nhap”, “xem anh”, “heatmap”.</span>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.category.id} className="hp-group">
            <div className="hp-group-head">
              <div>
                <h2>
                  {g.category.nameVi} <span className="hp-group-en">· {g.items.length} mục</span>
                </h2>
              </div>
            </div>
            <div className="hp-grid">
              {g.items.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
