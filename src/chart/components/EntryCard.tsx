import type { ChartEntry } from '../types'
import { isNewEntry } from '../entries/history'

/**
 * Thẻ xem trước một mục. Dùng chung cho trang danh sách, trang nhóm, kết quả
 * tìm kiếm và trang “Mới cập nhật” — để nhãn “mới” xuất hiện ở mọi chỗ, không
 * phải nhớ gắn lại ở từng nơi.
 */
export function EntryCard({ entry }: { entry: ChartEntry }) {
  const planned = entry.status === 'planned'
  const fresh = isNewEntry(entry.id)
  return (
    <a className={planned ? 'card is-planned' : 'card'} href={`#/chart/${entry.id}`}>
      <div className="card-preview">
        {entry.demo ? entry.demo() : <div className="planned-box">Phase 2 — chưa dựng demo</div>}
      </div>
      <div className="card-meta">
        <div className="card-title">
          {entry.nameVi}
          {fresh && <span className="badge is-new">mới</span>}
          {planned && <span className="badge">sắp có</span>}
        </div>
        <div className="card-en">{entry.nameEn}</div>
      </div>
    </a>
  )
}
