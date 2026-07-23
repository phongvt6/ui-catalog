/**
 * Mục nào vào catalog ở phiên bản nào.
 *
 * ⚠️ Thêm entry mới thì thêm id của nó vào khối phiên bản đang làm ở đây.
 * Quên cũng không sao về mặt kỹ thuật: trang “Mới cập nhật” gom mọi id chưa
 * được gắn vào một khối riêng có cảnh báo, nên nó lộ ra ngay chứ không âm
 * thầm biến mất.
 *
 * Ngày tháng lấy đúng từ CHANGELOG.md — một nguồn sự thật, chỉ khác cách bày.
 */
export interface EntryRelease {
  version: string
  /** dd/mm/yyyy — định dạng đọc quen ở VN. */
  date: string
  /** Một câu tóm tắt phiên bản đó thêm gì cho catalog. */
  summary: string
  ids: string[]
}

/** Mới nhất lên đầu. */
export const ENTRY_HISTORY: EntryRelease[] = [
  {
    version: '0.9.0',
    date: '23/07/2026',
    summary: 'Nhóm “Mẫu ghép phức tạp” — dashboard và bảng nhiều tầng thông tin.',
    ids: [
      'funnel-band-dashboard',
      'repeated-panels',
      'multiselect-filter-table',
      'variance-bar-table',
      'period-statement-table',
    ],
  },
  {
    version: '0.7.0',
    date: '23/07/2026',
    summary: 'Nhóm “Lọc chéo & liên kết” — click một khối, cả trang đổi theo.',
    ids: [
      'crossfilter-chart-chart',
      'crossfilter-chart-table',
      'crossfilter-table-table',
      'crossfilter-3-panels',
      'crossfilter-4-panels',
      'crossfilter-5-panels',
    ],
  },
  {
    version: '0.5.0',
    date: '23/07/2026',
    summary: 'Hai nhóm “So sánh hai bên” và “Nền tảng dashboard”.',
    ids: [
      'side-by-side',
      'tornado',
      'slope-chart',
      'delta-bar',
      'scorecard-multi',
      'chart-states',
      'data-freshness',
      'annotations',
      'threshold-band',
      'forecast',
    ],
  },
  {
    version: '0.4.0',
    date: '22/07/2026',
    summary: 'Nhóm “Bảng phân tích” — khi câu trả lời đúng là một cái bảng.',
    ids: [
      'pivot-table',
      'tree-table',
      'bar-in-cell',
      'heatmap-table',
      'variance-table',
      'rank-table',
    ],
  },
  {
    version: '0.2.0',
    date: '22/07/2026',
    summary: 'Mở rộng sang phân bố, luồng, thứ bậc, địa lý và bố cục dashboard.',
    ids: [
      'dot-plot',
      'dumbbell',
      'small-multiples',
      'waffle',
      'histogram',
      'boxplot',
      'waterfall',
      'sankey',
      'funnel',
      'treemap',
      'sunburst',
      'bubble-map',
      'choropleth-vn',
      'dashboard-patterns',
    ],
  },
  {
    version: '0.1.0',
    date: '22/07/2026',
    summary: '15 dạng nền tảng, bảng màu đã kiểm định và bộ dữ liệu mẫu dùng chung.',
    ids: [
      'stat-tile',
      'meter',
      'bullet',
      'column',
      'bar',
      'grouped-bar',
      'table-sparkline',
      'stacked-bar',
      'stacked-100',
      'donut',
      'line',
      'area',
      'emphasis-line',
      'scatter',
      'heatmap',
    ],
  },
]

/**
 * Phiên bản gần nhất CÓ THÊM MỤC MỚI — không nhất thiết là phiên bản hiện tại
 * của app: có bản chỉ sửa lỗi hoặc thêm trang, không thêm biểu đồ nào. Lấy
 * mốc này thì nhãn “mới” luôn chỉ đúng vào đợt bổ sung gần nhất, thay vì biến
 * mất ngay khi phát hành một bản vá.
 */
export const latestEntryVersion = ENTRY_HISTORY[0].version

const VERSION_OF: Record<string, string> = Object.fromEntries(
  ENTRY_HISTORY.flatMap((r) => r.ids.map((id) => [id, r.version])),
)

/** Phiên bản mà mục này được thêm vào. `undefined` = chưa gắn. */
export function versionOf(id: string): string | undefined {
  return VERSION_OF[id]
}

/** Mục thuộc đợt bổ sung gần nhất — dùng để gắn nhãn “mới”. */
export function isNewEntry(id: string): boolean {
  return VERSION_OF[id] === latestEntryVersion
}

export const newEntryIds: string[] = ENTRY_HISTORY[0].ids
