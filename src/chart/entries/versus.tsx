import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { StatTile } from '../components/Figures'
import {
  BRANCHES,
  VERSUS,
  dailyByBranch,
  dates,
  shortDate,
  varianceRows,
  productRevenue,
  versusByCategory,
} from '../data/sample'
import { CHROME, DIVERGING, FONT_STACK, MARK, SERIES, vnCompact, vnPercent } from '../lib/theme'
import { areaFill, base, catAxis, lineSeries, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */
/* Bố cục đối chiếu hai cột                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Biểu đồ nhỏ của một bên. `sharedMax` do bên ngoài truyền vào — đó chính là
 * điểm sống còn: hai khung phải dùng CHUNG một thang đo, nếu không hai đường
 * trông giống hệt nhau dù giá trị chênh nhau gấp đôi.
 */
function VersusMini({ branch, sharedMax }: { branch: (typeof BRANCHES)[number]; sharedMax: number }) {
  const mode = useMode()
  const c = CHROME[mode]
  const color = SERIES[mode][0]
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 4, right: 8, top: 10, bottom: 4, containLabel: true },
      xAxis: catAxis(mode, dates.map(shortDate), {
        boundaryGap: false,
        axisLabel: { interval: 9, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact, { max: sharedMax, min: 0 }),
      series: [
        {
          name: branch,
          ...lineSeries(color, mode),
          data: dailyByBranch[branch],
          areaStyle: areaFill(color),
        },
      ],
    }),
    [mode, c, color, branch, sharedMax],
  )
  return <EChart option={option} resetKey={`${mode}-${branch}`} height={150} />
}

function SideBySideDemo() {
  const [a, b] = VERSUS
  const rowA = varianceRows.find((r) => r.branch === a)!
  const rowB = varianceRows.find((r) => r.branch === b)!
  // Thang đo chung, tính từ CẢ HAI bên.
  const sharedMax = Math.max(...dailyByBranch[a], ...dailyByBranch[b]) * 1.08

  return (
    <div className="vs">
      <div className="vs-head">
        <span className="vs-title">{a}</span>
        <span className="vs-vs">so với</span>
        <span className="vs-title">{b}</span>
      </div>

      {[
        { label: 'Doanh thu 30 ngày', fa: rowA.actual, fb: rowB.actual, fmt: vnCompact },
        {
          label: '% hoàn thành kế hoạch',
          fa: (rowA.actual / rowA.plan) * 100,
          fb: (rowB.actual / rowB.plan) * 100,
          fmt: (v: number) => vnPercent(v, 0),
        },
        {
          label: 'Tăng trưởng so cùng kỳ',
          fa: (rowA.actual / rowA.priorPeriod - 1) * 100,
          fb: (rowB.actual / rowB.priorPeriod - 1) * 100,
          fmt: (v: number) => vnPercent(v),
        },
      ].map((m) => (
        <div className="vs-row" key={m.label}>
          <div className="vs-cell">
            <StatTile label={m.label} value={m.fmt(m.fa)} />
          </div>
          <div className="vs-cell">
            <StatTile label={m.label} value={m.fmt(m.fb)} />
          </div>
        </div>
      ))}

      <div className="vs-row">
        <div className="vs-cell vs-panel">
          <h5>{a} — doanh thu theo ngày</h5>
          <VersusMini branch={a} sharedMax={sharedMax} />
        </div>
        <div className="vs-cell vs-panel">
          <h5>{b} — doanh thu theo ngày</h5>
          <VersusMini branch={b} sharedMax={sharedMax} />
        </div>
      </div>
      <p className="vs-note">
        Hai khung dùng chung một thang đo (trần {vnCompact(sharedMax)} ₫) — nếu để mỗi bên tự co
        giãn, hai đường sẽ trông giống hệt nhau dù quy mô chênh nhau rõ rệt.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Tornado                                                                     */
/* -------------------------------------------------------------------------- */

function TornadoDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const [a, b] = VERSUS
  const rows = useMemo(() => [...versusByCategory].reverse(), [])
  const max = Math.max(...rows.flatMap((r) => [r.left, r.right])) * 1.15

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode, { legend: true }),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { seriesName: string; name: string; value: number }
          return `${d.name} · ${d.seriesName}<br/><b>${vnCompact(Math.abs(d.value))} ₫</b>`
        },
      },
      grid: { left: 8, right: 8, top: 44, bottom: 8, containLabel: true },
      xAxis: valAxis(mode, (v) => vnCompact(Math.abs(v)), { min: -max, max }),
      yAxis: catAxis(
        mode,
        rows.map((r) => r.category),
        { axisLine: { show: false }, position: 'left' },
      ),
      series: [
        {
          // Nhánh trái mang dấu ÂM để mọc ngược chiều — giá trị hiển thị vẫn
          // lấy trị tuyệt đối ở nhãn và tooltip.
          name: a,
          type: 'bar',
          stack: 'vs',
          barMaxWidth: 22,
          data: rows.map((r) => -r.left),
          itemStyle: { color: SERIES[mode][0], borderRadius: [MARK.barRadius, 0, 0, MARK.barRadius] },
        },
        {
          name: b,
          type: 'bar',
          stack: 'vs',
          barMaxWidth: 22,
          data: rows.map((r) => r.right),
          itemStyle: { color: SERIES[mode][1], borderRadius: [0, MARK.barRadius, MARK.barRadius, 0] },
          // Trục 0 vẽ bằng MỰC — thiếu nó, hai nhánh dính vào nhau và đọc
          // nhầm thành một thanh chồng bình thường.
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: c.ink, width: 1 },
            label: { show: false },
            data: [{ xAxis: 0 }],
          },
        },
      ],
    }),
    [mode, c, rows, max, a, b],
  )
  return <EChart option={option} resetKey={mode} height={280} />
}

/* -------------------------------------------------------------------------- */
/* Slope chart                                                                 */
/* -------------------------------------------------------------------------- */

function SlopeDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  // Lấy 6 mặt hàng lớn nhất: biến động giữa hai kỳ đủ mạnh để các đoạn CẮT
  // NHAU — đó mới là thứ slope chart giỏi hơn bảng. Dừng ở 6 vì thêm nữa thì
  // nhãn ở đầu cuối bắt đầu dính chùm, đúng như phần "không dùng khi" đã nói.
  const rows = useMemo(
    () =>
      productRevenue
        .slice(0, 6)
        .map((p) => ({ label: p.name, first: p.previous, last: p.current })),
    [],
  )
  // Mốc so là mức tăng trưởng BÌNH QUÂN, không phải mốc 0 — nếu tất cả cùng
  // tăng thì "tăng/giảm" chẳng phân loại được ai.
  const chainGrowth =
    rows.reduce((s, r) => s + r.last, 0) / rows.reduce((s, r) => s + r.first, 0)
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { seriesName: string; value: [number, number] }
          return `${d.seriesName}<br/><b>${vnCompact(d.value[1])} ₫</b>`
        },
      },
      grid: { left: 56, right: 96, top: 16, bottom: 24 },
      xAxis: catAxis(mode, ['Kỳ trước', 'Kỳ này'], {
        boundaryGap: false,
        axisLine: { show: false },
        axisLabel: { color: c.inkSecondary, fontSize: 12, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact, { show: false, scale: true, splitLine: { show: false } }),
      series: rows.map((r) => {
        const up = r.last / r.first >= chainGrowth
        // Một hue + xám: vượt bình quân thì mặc màu nhấn, còn lại lùi về nền.
        // KHÔNG tiêu slot màu categorical cho thứ vốn chỉ có hai trạng thái.
        const color = up ? SERIES[mode][0] : c.deemphasis
        return {
          name: r.label,
          type: 'line' as const,
          symbol: 'circle',
          symbolSize: MARK.symbolSize,
          showSymbol: true,
          z: up ? 5 : 2,
          lineStyle: { width: MARK.lineWidth, color },
          itemStyle: { color, borderColor: c.surface, borderWidth: MARK.ring },
          data: [r.first, r.last],
          endLabel: {
            show: true,
            formatter: `${r.label}  ${vnPercent((r.last / r.first - 1) * 100)}`,
            color: up ? c.ink : c.inkMuted,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
          labelLayout: { moveOverlap: 'shiftY' as const },
        }
      }),
    }),
    [mode, c, rows, chainGrowth],
  )
  return <EChart option={option} resetKey={mode} height={320} />
}

/* -------------------------------------------------------------------------- */
/* Biểu đồ chênh lệch                                                          */
/* -------------------------------------------------------------------------- */

function DeltaBarDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const div = DIVERGING[mode]
  const rows = useMemo(
    () =>
      [...varianceRows]
        .map((r) => ({ branch: r.branch, delta: r.actual - r.plan }))
        .sort((a, b) => a.delta - b.delta),
    [],
  )
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { name: string; value: number }
          return `${d.name}<br/><b>${d.value >= 0 ? '+' : '−'}${vnCompact(Math.abs(d.value))} ₫</b> so kế hoạch`
        },
      },
      grid: { left: 8, right: 60, top: 16, bottom: 8, containLabel: true },
      xAxis: valAxis(mode, (v) => `${v >= 0 ? '+' : '−'}${vnCompact(Math.abs(v))}`),
      yAxis: catAxis(
        mode,
        rows.map((r) => r.branch),
        { axisLine: { show: false } },
      ),
      series: [
        {
          name: 'Chênh lệch so kế hoạch',
          type: 'bar',
          barMaxWidth: MARK.barMaxWidth,
          data: rows.map((r) => ({
            value: r.delta,
            itemStyle: {
              // Cặp diverging: một hue cho vượt, một hue cho hụt.
              color: r.delta >= 0 ? div.neg : div.pos,
              borderRadius:
                r.delta >= 0
                  ? [0, MARK.barRadius, MARK.barRadius, 0]
                  : [MARK.barRadius, 0, 0, MARK.barRadius],
            },
          })),
          label: {
            show: true,
            position: 'right',
            formatter: (p: { value: unknown }) => {
              const v = Number(p.value)
              return `${v >= 0 ? '+' : '−'}${vnCompact(Math.abs(v))}`
            },
            color: c.inkSecondary,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: c.ink, width: 1 },
            label: { show: false },
            data: [{ xAxis: 0 }],
          },
        },
      ],
    }),
    [mode, c, div, rows],
  )
  return <EChart option={option} resetKey={mode} height={260} />
}

/* -------------------------------------------------------------------------- */

export const versusEntries: ChartEntry[] = [
  {
    id: 'side-by-side',
    nameVi: 'Bố cục đối chiếu 2 cột',
    nameEn: 'Side-by-side comparison layout',
    aliases: ['so sánh 2 bên', 'A/B', 'head to head', 'đối chiếu', 'versus'],
    job: 'versus',
    status: 'ready',
    description:
      'Hai cột đối xứng, mỗi bên một đối tượng: cùng bộ chỉ số, cùng loại biểu đồ, và quan trọng nhất là CÙNG THANG ĐO. Người xem quét ngang từng hàng để so, không phải nhớ số từ trang trước.',
    useWhen: [
      'So đúng HAI đối tượng ở nhiều khía cạnh cùng lúc: hai chi nhánh, hai kỳ, hai kịch bản.',
      'Bộ chỉ số giống hệt nhau ở cả hai bên.',
      'Người xem cần kết luận “bên nào tốt hơn, ở chỗ nào”.',
    ],
    avoidWhen: [
      'Mỗi bên tự co giãn thang đo — lỗi nặng nhất của bố cục này: hai biểu đồ trông y hệt trong khi quy mô chênh gấp đôi. Luôn tính thang chung từ cả hai bên.',
      'Từ 3 đối tượng trở lên → chuyển sang bảng hoặc small multiples; 3 cột đối chiếu bắt đầu chật.',
      'Hai đối tượng khác bản chất (một chi nhánh mới mở vs một chi nhánh lâu năm) → so trực tiếp là khập khiễng; thêm chỉ số chuẩn hoá.',
    ],
    dataShape: 'Cùng một cấu trúc chỉ số cho hai đối tượng + một thang đo chung tính từ cả hai.',
    variants: [
      'Thêm cột giữa hiện thẳng phần chênh lệch — bớt việc trừ nhẩm cho người xem.',
      'Tô nhẹ nền bên thắng ở từng hàng, kèm nhãn chữ chứ không chỉ màu.',
      'Trên mobile: xếp dọc theo từng chỉ số (A rồi B), không xếp hết A rồi mới tới B.',
    ],
    seriesCap: '2 bên.',
    demo: () => <SideBySideDemo />,
    code: `// Thang đo CHUNG tính từ CẢ HAI bên — đây là điểm sống còn
const sharedMax = Math.max(...dailyByBranch[a], ...dailyByBranch[b]) * 1.08

<div className="vs-row">
  <div className="vs-cell vs-panel"><VersusMini branch={a} sharedMax={sharedMax} /></div>
  <div className="vs-cell vs-panel"><VersusMini branch={b} sharedMax={sharedMax} /></div>
</div>

// bên trong VersusMini:
yAxis: valAxis(mode, vnCompact, { max: sharedMax, min: 0 })

/* Nếu bỏ max đi và để ECharts tự co giãn, hai đường sẽ có hình dạng
   gần như giống hệt nhau — và kết luận rút ra sẽ sai. */

.vs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }`,
  },

  {
    id: 'tornado',
    nameVi: 'Tornado (hai nhánh)',
    nameEn: 'Tornado / butterfly chart',
    aliases: ['butterfly chart', 'tháp dân số', 'population pyramid', 'hai nhánh', 'đối xứng'],
    job: 'versus',
    status: 'ready',
    description:
      'Hai bộ thanh mọc ngược chiều từ một trục giữa chung. Đọc được ngay hạng mục nào lệch nhiều nhất giữa hai bên — thứ mà hai biểu đồ đặt cạnh nhau không cho thấy.',
    useWhen: [
      'So hai nhóm trên cùng một bộ hạng mục (nam/nữ, kỳ này/kỳ trước, hai chi nhánh).',
      'Số hạng mục vừa phải (4–12) và có tên ngắn.',
      'Thông điệp là “ở đâu lệch nhất”.',
    ],
    avoidWhen: [
      'Hai bên có quy mô rất chênh lệch → nhánh nhỏ teo lại, không đọc được. Chuẩn hoá về % trước, và ghi rõ.',
      'Hơn 2 nhóm → tornado chỉ có đúng hai chiều; dùng cột nhóm.',
      'Người xem cần đọc giá trị chính xác — trục âm dễ gây hiểu nhầm dấu. Luôn hiện trị tuyệt đối ở nhãn và tooltip.',
    ],
    dataShape: 'Mỗi hạng mục: giá trị bên trái + giá trị bên phải. Nhánh trái mang dấu âm khi vẽ.',
    variants: [
      'Tháp dân số — biến thể kinh điển, hạng mục là nhóm tuổi.',
      'Chuẩn hoá về % của mỗi bên khi hai bên khác quy mô.',
      'Thêm một vạch mốc dọc cho giá trị trung bình từng bên.',
    ],
    seriesCap: 'Đúng 2 nhánh.',
    demo: () => <TornadoDemo />,
    code: `series: [
  { name: a, type: 'bar', stack: 'vs', barMaxWidth: 22,
    data: rows.map(r => -r.left),          // nhánh trái mang dấu ÂM
    itemStyle: { color: SERIES[mode][0], borderRadius: [4, 0, 0, 4] } },
  { name: b, type: 'bar', stack: 'vs', barMaxWidth: 22,
    data: rows.map(r => r.right),
    itemStyle: { color: SERIES[mode][1], borderRadius: [0, 4, 4, 0] } },
],
// Trục đối xứng quanh 0, và nhãn LUÔN hiện trị tuyệt đối
xAxis: valAxis(mode, v => vnCompact(Math.abs(v)), { min: -max, max }),

/* min và max phải đối xứng (−max … +max), nếu không trục giữa
   lệch khỏi số 0 và hai nhánh không còn so được với nhau. */`,
  },

  {
    id: 'slope-chart',
    nameVi: 'Slope chart',
    nameEn: 'Slope chart',
    aliases: ['slope graph', 'đường dốc', 'trước sau', 'bump chart'],
    job: 'versus',
    status: 'ready',
    description:
      'Hai cột giá trị nối bằng các đoạn thẳng: độ dốc chính là mức thay đổi, và các đoạn cắt nhau cho thấy thứ hạng bị đảo. Đọc “ai vượt ai” nhanh hơn hẳn bảng hoặc cột nhóm.',
    useWhen: [
      'Đúng HAI thời điểm, nhiều đối tượng (5–15).',
      'Thông điệp là thay đổi và đảo hạng, không phải giá trị tuyệt đối.',
      'Muốn cùng lúc thấy cả mức và chiều thay đổi.',
    ],
    avoidWhen: [
      'Giá trị các đối tượng quá sát nhau → nhãn hai đầu dính chùm. Gắn nhãn có chọn lọc hoặc dùng dumbbell.',
      'Từ 3 thời điểm trở lên → dùng biểu đồ đường bình thường.',
      'Trên 15 đối tượng → thành búi chỉ.',
    ],
    dataShape: 'Mỗi đối tượng: nhãn + giá trị đầu + giá trị cuối.',
    variants: [
      'Bump chart — trục dọc là THỨ HẠNG thay vì giá trị, chỉ quan tâm vị trí.',
      'Chỉ nhấn vài đối tượng đáng chú ý, phần còn lại để xám.',
      'Ghi giá trị ngay cạnh nhãn ở đầu cuối (như demo).',
    ],
    seriesCap: '5–15 đối tượng.',
    demo: () => <SlopeDemo />,
    code: `// Mốc so là mức tăng trưởng BÌNH QUÂN toàn chuỗi — nếu tất cả cùng tăng
// thì so với 0 chẳng phân loại được ai.
const chainGrowth = sum(rows, 'last') / sum(rows, 'first')

series: rows.map(r => {
  const up = r.last / r.first >= chainGrowth
  // Một hue + xám: vượt bình quân thì đậm, còn lại lùi về nền.
  // KHÔNG tiêu slot màu categorical cho thứ vốn chỉ có hai trạng thái.
  const color = up ? SERIES[mode][0] : CHROME[mode].deemphasis
  return {
    name: r.branch, type: 'line', symbol: 'circle', symbolSize: 8,
    z: up ? 5 : 2,
    lineStyle: { width: 2, color },
    data: [r.first, r.last],                    // đúng HAI điểm
    endLabel: { show: true, formatter: \`\${r.branch}  \${vnCompact(r.last)}\` },
    labelLayout: { moveOverlap: 'shiftY' },      // tự đẩy nhãn khỏi chồng nhau
  }
}),
xAxis: catAxis(mode, ['Kỳ trước', 'Kỳ này'], { boundaryGap: false }),
yAxis: valAxis(mode, vnCompact, { show: false, scale: true }),`,
  },

  {
    id: 'delta-bar',
    nameVi: 'Biểu đồ chênh lệch',
    nameEn: 'Delta / diverging bar',
    aliases: ['variance chart', 'chênh lệch', 'diverging bar', 'so kế hoạch'],
    job: 'versus',
    status: 'ready',
    description:
      'Vẽ thẳng phần CHÊNH LỆCH thay vì đặt hai cột cạnh nhau. Người xem không phải trừ nhẩm, và mức lệch — vốn là thông điệp — được đưa lên thành chiều dài thanh.',
    useWhen: [
      'Câu hỏi là “lệch bao nhiêu so với mốc” (kế hoạch, cùng kỳ, trung bình).',
      'Chênh lệch nhỏ so với giá trị gốc — hai cột cạnh nhau sẽ trông gần bằng nhau, còn biểu đồ chênh lệch thì phóng đúng phần cần nhìn.',
      'Có cả vượt lẫn hụt, cần thấy hai chiều.',
    ],
    avoidWhen: [
      'Người xem cũng cần biết giá trị gốc — biểu đồ này giấu mất. Ghép thêm cột số, hoặc dùng bullet.',
      'Mốc so sánh không đáng tin (kế hoạch đặt tuỳ tiện) → mọi kết luận rút ra đều lung lay.',
      'Dùng hai hue bất kỳ cho vượt/hụt — phải là cặp diverging thật, và luôn kèm dấu +/−.',
    ],
    dataShape: 'Mỗi hàng: nhãn + chênh lệch (có dấu). Sắp xếp theo chênh lệch để đọc thành một dải liên tục.',
    variants: [
      'Chênh lệch tương đối (%) thay vì tuyệt đối — hợp khi các đối tượng khác quy mô.',
      'Thêm dải nền cho ngưỡng chấp nhận được (±5%).',
      'Kết hợp với bảng chênh lệch: biểu đồ để nhìn, bảng để đọc số.',
    ],
    demo: () => <DeltaBarDemo />,
    code: `data: rows.map(r => ({
  value: r.delta,
  itemStyle: {
    color: r.delta >= 0 ? div.neg : div.pos,   // cặp DIVERGING, không phải 2 hue tuỳ ý
    // Bo góc ở ĐẦU DỮ LIỆU — đầu nào tuỳ theo thanh mọc sang trái hay phải
    borderRadius: r.delta >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
  },
})),
markLine: {                                    // đường 0 vẽ bằng MỰC
  symbol: 'none', silent: true,
  lineStyle: { color: c.ink, width: 1 },
  data: [{ xAxis: 0 }],
},

/* Sắp xếp theo giá trị chênh lệch để các thanh tạo thành một dải
   liên tục từ hụt nhất tới vượt nhất — đọc ra ngay ai nằm ở hai đầu. */`,
  },
]
