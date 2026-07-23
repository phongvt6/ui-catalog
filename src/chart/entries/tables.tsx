import { useState } from 'react'
import type { ChartEntry } from '../types'
import {
  CATEGORIES,
  pivot,
  rankRows,
  regionRollup,
  revenueByBranch,
  varianceRows,
} from '../data/sample'
import {
  CHROME,
  SEQUENTIAL,
  SERIES,
  labelInk,
  rampColor,
  vnCompact,
  vnPercent,
} from '../lib/theme'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */
/* Bảng chéo (pivot)                                                           */
/* -------------------------------------------------------------------------- */

function PivotDemo() {
  return (
    <div className="tbl-scroll">
      <table className="dtable dtable-pivot">
        <thead>
          <tr>
            <th className="tbl-corner">Chi nhánh \ Danh mục</th>
            {CATEGORIES.map((c) => (
              <th key={c} className="num">
                {c}
              </th>
            ))}
            <th className="num tbl-total-col">Tổng</th>
          </tr>
        </thead>
        <tbody>
          {pivot.rows.map((r) => (
            <tr key={r.branch}>
              <th scope="row" className="tbl-rowhead">
                {r.branch}
              </th>
              {r.cells.map((v, i) => (
                <td key={i} className="num">
                  {vnCompact(v)}
                </td>
              ))}
              <td className="num tbl-total-col">{vnCompact(r.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="tbl-total-row">
            <th scope="row" className="tbl-rowhead">
              Tổng
            </th>
            {pivot.colTotals.map((v, i) => (
              <td key={i} className="num">
                {vnCompact(v)}
              </td>
            ))}
            <td className="num tbl-total-col">{vnCompact(pivot.grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Bảng phân cấp có tổng phụ                                                   */
/* -------------------------------------------------------------------------- */

function TreeTableDemo() {
  const [open, setOpen] = useState<string[]>(['Miền Bắc'])
  const toggle = (r: string) =>
    setOpen((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))

  return (
    <div className="tbl-scroll">
      <table className="dtable dtable-pivot">
        <thead>
          <tr>
            <th>Vùng / Chi nhánh</th>
            {CATEGORIES.map((c) => (
              <th key={c} className="num">
                {c}
              </th>
            ))}
            <th className="num tbl-total-col">Tổng</th>
          </tr>
        </thead>
        <tbody>
          {regionRollup.map((g) => {
            const expanded = open.includes(g.region)
            return [
              <tr key={g.region} className="tbl-group-row">
                <th scope="row" className="tbl-rowhead">
                  <button
                    type="button"
                    className="tbl-toggle"
                    onClick={() => toggle(g.region)}
                    aria-expanded={expanded}
                  >
                    <span aria-hidden>{expanded ? '▾' : '▸'}</span> {g.region}
                    <span className="tbl-count">{g.children.length}</span>
                  </button>
                </th>
                {g.cells.map((v, i) => (
                  <td key={i} className="num">
                    {vnCompact(v)}
                  </td>
                ))}
                <td className="num tbl-total-col">{vnCompact(g.total)}</td>
              </tr>,
              ...(expanded
                ? g.children.map((c) => (
                    <tr key={c.branch} className="tbl-child-row">
                      <td className="tbl-indent">{c.branch}</td>
                      {c.cells.map((v, i) => (
                        <td key={i} className="num">
                          {vnCompact(v)}
                        </td>
                      ))}
                      <td className="num tbl-total-col">{vnCompact(c.total)}</td>
                    </tr>
                  ))
                : []),
            ]
          })}
        </tbody>
        <tfoot>
          <tr className="tbl-total-row">
            <th scope="row" className="tbl-rowhead">
              Toàn chuỗi
            </th>
            {pivot.colTotals.map((v, i) => (
              <td key={i} className="num">
                {vnCompact(v)}
              </td>
            ))}
            <td className="num tbl-total-col">{vnCompact(pivot.grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Thanh trong ô                                                               */
/* -------------------------------------------------------------------------- */

function BarInCellDemo() {
  const mode = useMode()
  const max = Math.max(...revenueByBranch.map((r) => r.revenue))
  const total = revenueByBranch.reduce((s, r) => s + r.revenue, 0)

  return (
    <table className="dtable">
      <thead>
        <tr>
          <th>Chi nhánh</th>
          <th className="num">Doanh thu</th>
          <th className="tbl-barcol">So với chi nhánh lớn nhất</th>
          <th className="num">Tỷ trọng</th>
        </tr>
      </thead>
      <tbody>
        {revenueByBranch.map((r) => (
          <tr key={r.branch}>
            <td>{r.branch}</td>
            <td className="num">{vnCompact(r.revenue)}</td>
            <td className="tbl-barcol">
              {/* Thanh mọc từ MỘT đường gốc chung ở mép trái ô — đó là điều
                  khiến nó so sánh được, y hệt một bar chart thu nhỏ. */}
              <span className="cellbar-track">
                <span
                  className="cellbar-fill"
                  style={{ width: `${(r.revenue / max) * 100}%`, background: SERIES[mode][0] }}
                />
              </span>
            </td>
            <td className="num">{vnPercent((r.revenue / total) * 100)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* -------------------------------------------------------------------------- */
/* Bảng tô nền theo giá trị                                                    */
/* -------------------------------------------------------------------------- */

function HeatmapTableDemo() {
  const mode = useMode()
  const flat = pivot.rows.flatMap((r) => r.cells)
  const min = Math.min(...flat)
  const max = Math.max(...flat)

  return (
    <div className="tbl-scroll">
      <table className="dtable dtable-pivot">
        <thead>
          <tr>
            <th className="tbl-corner">Chi nhánh \ Danh mục</th>
            {CATEGORIES.map((c) => (
              <th key={c} className="num">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pivot.rows.map((r) => (
            <tr key={r.branch}>
              <th scope="row" className="tbl-rowhead">
                {r.branch}
              </th>
              {r.cells.map((v, i) => {
                const bg = rampColor(SEQUENTIAL[mode], (v - min) / (max - min))
                return (
                  <td key={i} className="num tbl-heat" style={{ background: bg, color: labelInk(bg) }}>
                    {vnCompact(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Bảng chênh lệch                                                             */
/* -------------------------------------------------------------------------- */

function VarianceTableDemo() {
  const mode = useMode()
  const c = CHROME[mode]

  return (
    <div className="tbl-scroll">
      <table className="dtable">
        <thead>
          <tr>
            <th>Chi nhánh</th>
            <th className="num">Thực hiện</th>
            <th className="num">Kế hoạch</th>
            <th className="num">Δ so KH</th>
            <th className="num">% KH</th>
            <th className="num">Cùng kỳ</th>
            <th className="num">Δ cùng kỳ</th>
          </tr>
        </thead>
        <tbody>
          {varianceRows.map((r) => {
            const dPlan = r.actual - r.plan
            const dPrior = (r.actual / r.priorPeriod - 1) * 100
            return (
              <tr key={r.branch}>
                <td>{r.branch}</td>
                <td className="num">{vnCompact(r.actual)}</td>
                <td className="num tbl-muted">{vnCompact(r.plan)}</td>
                {/* Dấu + / − đi kèm màu: màu KHÔNG bao giờ gánh nghĩa một mình. */}
                <td className="num" style={{ color: dPlan >= 0 ? c.deltaGood : c.deltaBad }}>
                  {dPlan >= 0 ? '+' : '−'}
                  {vnCompact(Math.abs(dPlan))}
                </td>
                <td className="num">{vnPercent((r.actual / r.plan) * 100, 0)}</td>
                <td className="num tbl-muted">{vnCompact(r.priorPeriod)}</td>
                <td className="num" style={{ color: dPrior >= 0 ? c.deltaGood : c.deltaBad }}>
                  {dPrior >= 0 ? '▲' : '▼'} {vnPercent(Math.abs(dPrior))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Bảng xếp hạng                                                               */
/* -------------------------------------------------------------------------- */

function RankTableDemo() {
  const mode = useMode()
  const c = CHROME[mode]

  return (
    <table className="dtable">
      <thead>
        <tr>
          <th className="num tbl-rank">#</th>
          <th>Mặt hàng</th>
          <th className="num">Doanh thu 30 ngày</th>
          <th className="num">Thay đổi hạng</th>
        </tr>
      </thead>
      <tbody>
        {rankRows.map((r) => (
          <tr key={r.name}>
            <td className="num tbl-rank">{r.rank}</td>
            <td>{r.name}</td>
            <td className="num">{vnCompact(r.value)}</td>
            <td
              className="num"
              style={{
                color:
                  r.rankChange === 0 ? c.inkMuted : r.rankChange > 0 ? c.deltaGood : c.deltaBad,
              }}
            >
              {r.rankChange === 0
                ? '– giữ hạng'
                : `${r.rankChange > 0 ? '▲' : '▼'} ${Math.abs(r.rankChange)} bậc`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* -------------------------------------------------------------------------- */

export const tableEntries: ChartEntry[] = [
  {
    id: 'pivot-table',
    nameVi: 'Bảng chéo (pivot)',
    nameEn: 'Pivot / cross-tab table',
    aliases: ['pivot table', 'cross tab', 'bảng chéo', 'bảng tổng hợp', 'ma trận'],
    job: 'table',
    status: 'ready',
    description:
      'Một chiều chạy theo hàng, một chiều chạy theo cột, ô là giá trị đo lường — cộng tổng phụ ở rìa. Đây là xương sống của báo cáo quản trị: đọc được cả chi tiết lẫn tổng ở cùng một chỗ.',
    useWhen: [
      'Hai chiều phân tích rõ ràng và người xem cần con số CHÍNH XÁC.',
      'Người nhận sẽ copy sang Excel hoặc đối chiếu với hệ thống khác.',
      'Cần tổng phụ theo cả hàng lẫn cột — biểu đồ không làm được việc này.',
    ],
    avoidWhen: [
      'Thông điệp là hình dạng hoặc thứ hạng → biểu đồ đọc nhanh hơn nhiều.',
      'Chiều cột có quá nhiều giá trị (12 tháng × 8 danh mục) → bảng tràn ngang, không ai đọc. Gộp bớt hoặc tách nhiều bảng.',
      'Ô rỗng chiếm phần lớn → ma trận thưa nên chuyển về dạng danh sách.',
    ],
    dataShape:
      'Dữ liệu dài (long): chiều hàng + chiều cột + đo lường. Tổng phụ tính sẵn ở tầng dữ liệu, đừng tính trong JSX.',
    variants: [
      'Thêm cột “% theo hàng” bên cạnh số tuyệt đối.',
      'Ghim hàng tổng ở đáy khi bảng dài (`position: sticky`).',
      'Kết hợp tô nền theo giá trị → thành bảng heatmap.',
    ],
    seriesCap: 'Chiều cột nên ≤ 8 giá trị.',
    demo: () => <PivotDemo />,
    code: `<table className="dtable dtable-pivot">
  <thead><tr>
    <th className="tbl-corner">Chi nhánh \\ Danh mục</th>
    {CATEGORIES.map(c => <th key={c} className="num">{c}</th>)}
    <th className="num tbl-total-col">Tổng</th>
  </tr></thead>
  <tbody>
    {pivot.rows.map(r => (
      <tr key={r.branch}>
        {/* Ô đầu hàng là <th scope="row"> — trình đọc màn hình cần nó
            để biết mỗi số thuộc về hàng nào */}
        <th scope="row" className="tbl-rowhead">{r.branch}</th>
        {r.cells.map((v, i) => <td key={i} className="num">{vnCompact(v)}</td>)}
        <td className="num tbl-total-col">{vnCompact(r.total)}</td>
      </tr>
    ))}
  </tbody>
  <tfoot>{/* hàng tổng nằm trong tfoot, không phải tbody */}</tfoot>
</table>

/* Cột số luôn: text-align: right + font-variant-numeric: tabular-nums,
   để các chữ số thẳng hàng dọc và so được bằng mắt. */`,
  },

  {
    id: 'tree-table',
    nameVi: 'Bảng phân cấp có tổng phụ',
    nameEn: 'Tree table / grouped rows',
    aliases: ['grouped table', 'drill-down', 'rollup', 'bảng nhóm', 'tổng phụ', 'thu gọn'],
    job: 'table',
    status: 'ready',
    description:
      'Hàng cha là tổng phụ của cả nhóm, bấm để mở ra các hàng con. Cho phép xem toàn cảnh trước, rồi đào xuống đúng nhánh cần — thay vì đổ hết vài trăm dòng ra một lượt.',
    useWhen: [
      'Dữ liệu có cấu trúc phân cấp thật: vùng → chi nhánh → nhân viên.',
      'Người xem bắt đầu từ tổng thể rồi mới cần chi tiết một nhánh.',
      'Số dòng khi mở hết quá nhiều để đọc một lần.',
    ],
    avoidWhen: [
      'Cấu trúc phẳng → gập mở chỉ tạo thêm thao tác thừa.',
      'Người xem cần so sánh các hàng con thuộc các nhóm KHÁC nhau — chúng bị giấu sau các nhóm khác nhau; khi đó dùng bảng phẳng có cột nhóm và cho lọc.',
      'Mặc định gập hết tất cả → người xem mở trang thấy gần như trống. Nên mở sẵn nhóm quan trọng nhất.',
    ],
    dataShape: 'Cây `{ nhóm, children[], tổng phụ }`. Tổng phụ tính sẵn ở tầng dữ liệu.',
    variants: [
      'Nhiều hơn 2 cấp — thụt lề tăng dần theo cấp.',
      'Hiện số lượng con ngay cạnh tên nhóm (như demo).',
      'Nút “mở tất cả / gập tất cả” khi có nhiều nhóm.',
    ],
    seriesCap: '2–3 cấp.',
    demo: () => <TreeTableDemo />,
    code: `const [open, setOpen] = useState<string[]>(['Miền Bắc'])   // mở sẵn nhóm quan trọng

{regionRollup.map(g => {
  const expanded = open.includes(g.region)
  return [
    <tr key={g.region} className="tbl-group-row">
      <th scope="row">
        <button type="button" onClick={() => toggle(g.region)} aria-expanded={expanded}>
          <span aria-hidden>{expanded ? '▾' : '▸'}</span> {g.region}
        </button>
      </th>
      {g.cells.map((v, i) => <td key={i} className="num">{vnCompact(v)}</td>)}
    </tr>,
    ...(expanded ? g.children.map(c => <tr className="tbl-child-row">…</tr>) : []),
  ]
})}

/* aria-expanded là bắt buộc: mũi tên ▸/▾ chỉ là hình vẽ,
   trình đọc màn hình không suy ra được trạng thái gập/mở từ nó. */`,
  },

  {
    id: 'bar-in-cell',
    nameVi: 'Thanh trong ô',
    nameEn: 'Bar-in-cell / data bars',
    aliases: ['data bar', 'in-cell bar', 'thanh trong bảng', 'conditional bar'],
    job: 'table',
    status: 'ready',
    description:
      'Một thanh nhỏ ngay trong ô bảng, mọc từ đường gốc chung ở mép trái. Cho phép so độ lớn bằng mắt mà không phải rời sang biểu đồ riêng — con số chính xác vẫn nằm ngay bên cạnh.',
    useWhen: [
      'Bảng đã có sẵn và bạn chỉ muốn thêm một tầng cảm nhận về độ lớn.',
      'Người xem vừa cần số chính xác vừa cần biết “ai lớn hơn ai”.',
      'Giá trị không âm và có một mốc so sánh rõ ràng (lớn nhất, hoặc tổng).',
    ],
    avoidWhen: [
      'Mỗi hàng một thang đo riêng — thanh sẽ dài bằng nhau dù giá trị khác hẳn. Luôn dùng CHUNG một mốc cho cả cột.',
      'Có giá trị âm → cần thanh hai chiều quanh trục giữa, không phải thanh thường.',
      'Đã có sparkline ở cột khác → hai loại mark nhỏ cạnh nhau gây nhiễu, chọn một.',
    ],
    dataShape: 'Giá trị của hàng + một mốc chuẩn hoá dùng chung cho cả cột.',
    variants: [
      'Chuẩn hoá theo giá trị lớn nhất (như demo) hoặc theo tổng.',
      'Thanh hai chiều quanh trục giữa cho giá trị có dấu.',
      'Đặt số chồng lên thanh khi cột hẹp — nhớ chọn màu chữ theo độ sáng của thanh.',
    ],
    demo: () => <BarInCellDemo />,
    code: `<td className="tbl-barcol">
  <span className="cellbar-track">
    <span className="cellbar-fill"
          style={{ width: \`\${(r.revenue / max) * 100}%\`,   // max CHUNG cho cả cột
                   background: SERIES[mode][0] }} />
  </span>
</td>

.cellbar-track { display: block; height: 8px; border-radius: 4px; background: var(--grid); }
.cellbar-fill  { display: block; height: 100%; border-radius: 4px; }

/* Sai lầm kinh điển: chuẩn hoá theo từng hàng.
   Khi đó mọi thanh đều đầy 100% và cột thanh không nói lên điều gì. */`,
  },

  {
    id: 'heatmap-table',
    nameVi: 'Bảng tô nền theo giá trị',
    nameEn: 'Heatmap table / conditional formatting',
    aliases: ['conditional formatting', 'bảng nhiệt', 'tô màu ô', 'color scale'],
    job: 'table',
    status: 'ready',
    description:
      'Bảng chéo có nền ô tô theo giá trị. Giữ nguyên con số chính xác nhưng thêm một tầng đọc nhanh — mắt tìm ra vùng nóng trước, rồi mới đọc số.',
    useWhen: [
      'Ma trận đủ đặc và người xem cần cả “vùng nào cao” lẫn con số cụ thể.',
      'Muốn ưu điểm của heatmap mà không mất khả năng đọc chính xác.',
    ],
    avoidWhen: [
      'Không kiểm soát màu chữ theo độ sáng nền → chữ trắng trên ô nhạt sẽ biến mất. Phải tính tương phản cho từng ô.',
      'Tô cả bảng kể cả hàng tổng → hàng tổng luôn đậm nhất và át hết phần còn lại. Loại hàng/cột tổng ra khỏi thang màu.',
      'Thang cầu vồng — cấm, như mọi thang sequential khác. Có dấu (+/−) thì dùng diverging với xám ở giữa.',
    ],
    dataShape: 'Giống bảng chéo, cộng min/max để chuẩn hoá giá trị về [0, 1].',
    variants: [
      'Chuẩn hoá toàn bảng (như demo) hoặc theo từng hàng — nói rõ đang dùng cách nào.',
      'Thang diverging khi ô là chênh lệch so với trung bình.',
      'Chỉ tô ô vượt ngưỡng, phần còn lại để trắng — nhẹ mắt hơn nhiều.',
    ],
    demo: () => <HeatmapTableDemo />,
    code: `const bg = rampColor(SEQUENTIAL[mode], (v - min) / (max - min))

<td className="num" style={{ background: bg, color: labelInk(bg) }}>
  {vnCompact(v)}
</td>

/* labelInk() chọn trắng hay mực theo độ sáng của CHÍNH ô đó —
   không có nó thì chữ sẽ biến mất ở một đầu của thang màu. */

/* min/max phải tính từ các ô DỮ LIỆU, loại hàng/cột tổng ra:
   tổng luôn lớn nhất nên sẽ chiếm trọn đầu đậm của thang. */`,
  },

  {
    id: 'variance-table',
    nameVi: 'Bảng chênh lệch',
    nameEn: 'Variance table',
    aliases: ['thực hiện kế hoạch', 'actual vs plan', 'so cùng kỳ', 'bảng biến động', 'TH/KH'],
    job: 'table',
    status: 'ready',
    description:
      'Thực hiện đặt cạnh kế hoạch và cùng kỳ, cộng cột chênh lệch tuyệt đối và phần trăm. Điểm mấu chốt: **tính sẵn cột Δ**, đừng bắt người xem tự trừ hai cột trong đầu.',
    useWhen: [
      'Báo cáo định kỳ có mốc so sánh cố định (kế hoạch, cùng kỳ, dự báo).',
      'Người xem cần biết chênh bao nhiêu, không chỉ là cao hay thấp.',
    ],
    avoidWhen: [
      'Chỉ để hai cột số cạnh nhau mà không có cột Δ — đó là bắt người đọc làm toán, và họ sẽ không làm.',
      'Dùng riêng màu đỏ/xanh để báo tốt xấu → người mù màu không đọc được. Luôn kèm dấu +/− hoặc ▲▼.',
      'Mẫu số quá nhỏ → % nhảy loạn; khi đó chỉ nên hiện chênh lệch tuyệt đối.',
    ],
    dataShape: 'Mỗi hàng: giá trị kỳ này + các mốc so sánh. Cột Δ và Δ% tính ở tầng dữ liệu.',
    variants: [
      'Thêm cột thanh trong ô cho Δ để thấy ngay ai lệch nhiều nhất.',
      'Chỉ tô màu khi vượt ngưỡng (ví dụ lệch > 5%), còn lại để mực thường.',
      'Với chỉ số “tăng là xấu” (chi phí) phải đảo chiều màu — và ghi rõ ở chú giải.',
    ],
    demo: () => <VarianceTableDemo />,
    code: `const dPlan  = r.actual - r.plan
const dPrior = (r.actual / r.priorPeriod - 1) * 100

{/* Dấu +/− và ▲▼ đi KÈM màu — màu không bao giờ gánh nghĩa một mình */}
<td className="num" style={{ color: dPlan >= 0 ? c.deltaGood : c.deltaBad }}>
  {dPlan >= 0 ? '+' : '−'}{vnCompact(Math.abs(dPlan))}
</td>

/* Cột mốc tham chiếu (kế hoạch, cùng kỳ) để màu mực NHẠT —
   chúng là ngữ cảnh, không phải con số cần đọc trước. */`,
  },

  {
    id: 'rank-table',
    nameVi: 'Bảng xếp hạng',
    nameEn: 'Leaderboard / ranking table',
    aliases: ['leaderboard', 'top n', 'bảng xếp hạng', 'thứ hạng'],
    job: 'table',
    status: 'ready',
    description:
      'Danh sách sắp theo thứ hạng, kèm cột thay đổi hạng so với kỳ trước. Cột thay đổi mới là phần có giá trị — thứ hạng tuyệt đối thường khá tĩnh và ít tin tức.',
    useWhen: [
      'Có yếu tố thi đua giữa các đơn vị và người xem quan tâm vị trí.',
      'Cần chỉ ra ai đang lên hoặc xuống nhanh.',
      'Top-N là đủ, không cần toàn bộ danh sách.',
    ],
    avoidWhen: [
      'Chênh lệch giữa các hạng rất nhỏ → thứ hạng gây cảm giác khác biệt lớn hơn thực tế. Luôn hiện kèm giá trị thật.',
      'Số đối tượng thay đổi giữa hai kỳ → “thay đổi hạng” mất ý nghĩa; nói rõ hoặc bỏ cột đó.',
      'Xếp hạng cá nhân công khai khi dữ liệu nhạy cảm — cân nhắc yếu tố con người.',
    ],
    dataShape: 'Mỗi hàng: đối tượng + giá trị + hạng kỳ này + hạng kỳ trước.',
    variants: [
      'Top-N + dòng “còn lại” gộp phần đuôi.',
      'Ghim hàng của chính người đang xem, kể cả khi nằm ngoài top.',
      'Thêm sparkline diễn biến hạng theo thời gian.',
    ],
    demo: () => <RankTableDemo />,
    code: `// rankChange = hạng kỳ trước − hạng kỳ này  (dương = leo hạng)
<td className="num" style={{ color: r.rankChange === 0 ? c.inkMuted
                                  : r.rankChange > 0 ? c.deltaGood : c.deltaBad }}>
  {r.rankChange === 0 ? '– giữ hạng'
                      : \`\${r.rankChange > 0 ? '▲' : '▼'} \${Math.abs(r.rankChange)} bậc\`}
</td>

/* LUÔN hiện giá trị thật cạnh thứ hạng. Hạng 1 và hạng 5 có thể chỉ
   chênh nhau 2% — bảng chỉ có cột hạng sẽ phóng đại khoảng cách đó. */`,
  },
]
