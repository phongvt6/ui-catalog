import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { CATEGORIES, funnelSteps, profitBridge, sankeyFlows } from '../data/sample'
import {
  CHROME,
  DIVERGING,
  FONT_STACK,
  MARK,
  ORDINAL_BLUE,
  SERIES,
  labelInk,
  vnCompact,
  vnNumber,
  vnPercent,
} from '../lib/theme'
import { base, catAxis, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function WaterfallDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const div = DIVERGING[mode]

  const rows = useMemo(() => {
    let running = 0
    return profitBridge.map((step) => {
      if (step.kind === 'total') {
        // Cột mốc: mọc từ 0. Cột cuối lấy đúng giá trị tích luỹ.
        const value = step.delta !== 0 ? step.delta : running
        running = value
        return { ...step, bottom: 0, size: value, isTotal: true }
      }
      const bottom = step.delta >= 0 ? running : running + step.delta
      running += step.delta
      return { ...step, bottom, size: Math.abs(step.delta), isTotal: false }
    })
  }, [])

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { dataIndex: number; seriesName: string }
          const r = rows[d.dataIndex]
          if (r.isTotal) return `${r.label}<br/><b>${vnCompact(r.size)} ₫</b>`
          return `${r.label}<br/><b>${r.delta >= 0 ? '+' : '−'}${vnCompact(Math.abs(r.delta))} ₫</b>`
        },
      },
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: catAxis(
        mode,
        rows.map((r) => r.label),
        {
          axisLabel: {
            color: c.inkMuted,
            fontSize: 10,
            fontFamily: FONT_STACK,
            interval: 0,
            width: 74,
            overflow: 'break',
          },
        },
      ),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          // Chân đế trong suốt — đây là cách dựng waterfall bằng bar chồng.
          name: 'chân đế',
          type: 'bar',
          stack: 'wf',
          silent: true,
          itemStyle: { color: 'transparent' },
          emphasis: { disabled: true },
          data: rows.map((r) => r.bottom),
        },
        {
          name: 'Biến động',
          type: 'bar',
          stack: 'wf',
          barMaxWidth: 40,
          data: rows.map((r) => ({
            value: r.size,
            itemStyle: {
              // Mốc = mực trung tính; tăng = xanh; giảm = đỏ (cặp diverging).
              color: r.isTotal ? c.inkSecondary : r.delta >= 0 ? div.neg : div.pos,
              borderRadius: 2,
            },
          })),
          label: {
            show: true,
            position: 'top',
            formatter: (p: { dataIndex: number }) => {
              const r = rows[p.dataIndex]
              return r.isTotal
                ? vnCompact(r.size)
                : `${r.delta >= 0 ? '+' : '−'}${vnCompact(Math.abs(r.delta))}`
            },
            color: c.inkSecondary,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
        },
      ],
    }),
    [mode, c, div, rows],
  )
  return <EChart option={option} resetKey={mode} height={320} />
}

function SankeyDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const option = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      textStyle: { fontFamily: FONT_STACK, color: c.inkSecondary },
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { name: string; value: number }
          return `${d.name.replace(' > ', ' → ')}<br/><b>${vnCompact(d.value)} ₫</b>`
        },
      },
      series: [
        {
          type: 'sankey',
          left: 8,
          right: 96,
          top: 8,
          bottom: 8,
          nodeGap: 10,
          nodeWidth: 12,
          emphasis: { focus: 'adjacency' },
          data: [
            // Nút nguồn KHÔNG tiêu slot màu — chúng chỉ là điểm xuất phát.
            ...[...new Set(sankeyFlows.map((f) => f.source))].map((name) => ({
              name,
              itemStyle: { color: c.deemphasis, borderColor: 'transparent' },
            })),
            // Chỉ nút đích mang danh tính, nên chỉ nó mới dùng màu categorical.
            ...CATEGORIES.map((name, i) => ({
              name: name as string,
              itemStyle: { color: SERIES[mode][i], borderColor: 'transparent' },
            })),
          ],
          links: sankeyFlows.map((f) => ({
            source: f.source,
            target: f.target,
            value: f.value,
            lineStyle: {
              color: SERIES[mode][CATEGORIES.indexOf(f.target as (typeof CATEGORIES)[number])],
              opacity: 0.32,
            },
          })),
          label: { color: c.inkSecondary, fontSize: 11, fontFamily: FONT_STACK },
        },
      ],
    }),
    [mode, c],
  )
  return <EChart option={option} resetKey={mode} height={340} />
}

function FunnelDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const top = funnelSteps[0].value
  const option = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      textStyle: { fontFamily: FONT_STACK, color: c.inkSecondary },
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { dataIndex: number; name: string; value: number }
          const prev = d.dataIndex === 0 ? null : funnelSteps[d.dataIndex - 1].value
          return [
            `<b>${d.name}</b>`,
            `${vnNumber(d.value)} đơn`,
            `${vnPercent((d.value / top) * 100)} so với bước đầu`,
            prev ? `${vnPercent((d.value / prev) * 100)} so với bước trước` : '',
          ]
            .filter(Boolean)
            .join('<br/>')
        },
      },
      series: [
        {
          type: 'funnel',
          left: 8,
          right: 8,
          top: 8,
          bottom: 8,
          minSize: '28%',
          gap: MARK.gap,
          // Bậc rời rạc có THỨ TỰ → ramp ordinal một hue, không phải 5 màu khác nhau.
          sort: 'none',
          data: funnelSteps.map((s, i) => ({
            name: s.label,
            value: s.value,
            itemStyle: { color: ORDINAL_BLUE[mode][i] },
            // Chữ nằm TRONG bậc → chọn trắng/mực theo độ sáng của CHÍNH bậc đó,
            // không dùng một màu chữ chung cho cả phễu.
            label: { color: labelInk(ORDINAL_BLUE[mode][i]) },
          })),
          label: {
            position: 'inside',
            formatter: (p: { name: string; value: unknown }) =>
              `${p.name}  ${vnPercent((Number(p.value) / top) * 100, 0)}`,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
          labelLine: { show: false },
        },
      ],
    }),
    [mode, c, top],
  )
  return <EChart option={option} resetKey={mode} height={320} />
}

/* -------------------------------------------------------------------------- */

export const flowEntries: ChartEntry[] = [
  {
    id: 'waterfall',
    nameVi: 'Waterfall (thác nước)',
    nameEn: 'Waterfall chart',
    aliases: ['bridge chart', 'cầu nối', 'biến động', 'phân rã'],
    job: 'flow',
    status: 'ready',
    description:
      'Đi từ số đầu kỳ đến số cuối kỳ, mỗi cột là một khoản cộng hoặc trừ. Trả lời câu hỏi mà không biểu đồ nào khác trả lời gọn được: “vì sao từ đây thành ra kia”.',
    useWhen: [
      'Phân rã một mức chênh lệch: doanh thu → lợi nhuận, kế hoạch → thực hiện, kỳ trước → kỳ này.',
      'Các khoản cộng lại ĐÚNG bằng số cuối — nếu không thì biểu đồ đang nói dối.',
      '4–10 bước.',
    ],
    avoidWhen: [
      'Quá 10 bước → cột nào cũng bé xíu; gộp các khoản nhỏ thành “Khác”.',
      'Thứ tự các bước không có ý nghĩa → waterfall ngụ ý một trình tự; nếu không có thì dùng bar chart.',
      'Các khoản chồng lấn nhau (một khoản đã bao gồm khoản kia) → tổng sai, phải làm sạch số trước.',
    ],
    dataShape:
      'Chuỗi CÓ THỨ TỰ: nhãn + delta (dương/âm), cộng một mốc đầu và một mốc cuối. Chân đế mỗi cột do mình tính tích luỹ.',
    variants: [
      'Ngang khi nhãn dài (rất hay gặp với khoản mục kế toán).',
      'Thêm mốc trung gian (ví dụ “Lợi nhuận gộp”) — vẽ như cột mốc mọc từ 0.',
      'Nối các cột bằng đường mảnh để mắt lần được mạch tích luỹ.',
    ],
    seriesCap: '4–10 bước.',
    demo: () => <WaterfallDemo />,
    code: `// Dựng bằng HAI series bar chồng nhau: chân đế trong suốt + cột thật
let running = 0
const rows = steps.map(s => {
  if (s.kind === 'total') { const v = s.delta || running; running = v
                            return { ...s, base: 0, size: v, isTotal: true } }
  const base = s.delta >= 0 ? running : running + s.delta
  running += s.delta
  return { ...s, base, size: Math.abs(s.delta), isTotal: false }
})

series: [
  { name: 'chân đế', type: 'bar', stack: 'wf', silent: true,
    itemStyle: { color: 'transparent' }, data: rows.map(r => r.base) },
  { name: 'Biến động', type: 'bar', stack: 'wf', barMaxWidth: 40,
    data: rows.map(r => ({ value: r.size, itemStyle: {
      // Mốc = mực trung tính; tăng = xanh; giảm = đỏ (đúng cặp diverging)
      color: r.isTotal ? c.inkSecondary : r.delta >= 0 ? div.neg : div.pos,
    }})) },
]`,
  },

  {
    id: 'sankey',
    nameVi: 'Sankey',
    nameEn: 'Sankey diagram',
    aliases: ['luồng', 'flow diagram', 'alluvial', 'dòng chảy'],
    job: 'flow',
    status: 'ready',
    description:
      'Dòng chảy có độ dày tỷ lệ với lượng, từ tập nút này sang tập nút khác. Thấy được cả cơ cấu hai đầu lẫn cách chúng nối với nhau — thứ mà hai biểu đồ tròn cạnh nhau không bao giờ cho thấy.',
    useWhen: [
      'Chuyển dịch giữa hai (hoặc vài) trạng thái: kênh → sản phẩm, nguồn → đích, kỳ trước → kỳ này.',
      'Lượng được BẢO TOÀN: vào bao nhiêu ra bấy nhiêu.',
      'Mỗi bên dưới ~8 nút.',
    ],
    avoidWhen: [
      'Quá nhiều nút → thành mớ mì, không lần ra dòng nào. Gộp đuôi thành “Khác”.',
      'Lượng không bảo toàn (có hao hụt không mô hình hoá) → người xem sẽ hiểu sai.',
      'Chỉ cần biết cơ cấu một đầu → cột chồng hoặc thanh ngang, gọn hơn nhiều.',
    ],
    dataShape: 'Danh sách nút + danh sách cạnh `{ source, target, value }`.',
    variants: [
      'Nhiều tầng (3+ cột nút) cho hành trình nhiều bước.',
      'Alluvial: cùng dạng nhưng trục ngang là thời gian, cho thấy thứ hạng thay đổi.',
    ],
    seriesCap: 'Mỗi tầng ≤ 8 nút mang màu.',
    demo: () => <SankeyDemo />,
    code: `data: [
  // Nút NGUỒN không tiêu slot màu — chúng chỉ là điểm xuất phát
  ...sources.map(name => ({ name, itemStyle: { color: c.deemphasis } })),
  // Chỉ nút ĐÍCH mang danh tính → chỉ nó mới dùng màu categorical
  ...CATEGORIES.map((name, i) => ({ name, itemStyle: { color: SERIES[mode][i] } })),
],
links: flows.map(f => ({
  source: f.source, target: f.target, value: f.value,
  lineStyle: { color: SERIES[mode][CATEGORIES.indexOf(f.target)], opacity: 0.32 },
})),
emphasis: { focus: 'adjacency' },   // hover một nút → làm nổi đúng các dòng của nó`,
  },

  {
    id: 'funnel',
    nameVi: 'Phễu',
    nameEn: 'Funnel chart',
    aliases: ['conversion funnel', 'phễu chuyển đổi', 'tỷ lệ rơi rụng'],
    job: 'flow',
    status: 'ready',
    description:
      'Các bậc thu hẹp dần theo một quy trình có thứ tự. Giá trị nằm ở tỷ lệ RƠI RỤNG giữa hai bậc liền kề — đó mới là con số cần đọc, không phải chiều rộng của bậc.',
    useWhen: [
      'Quy trình tuyến tính, và bậc sau là TẬP CON của bậc trước.',
      'Cần chỉ ra bước nào mất khách nhiều nhất.',
      '3–7 bậc.',
    ],
    avoidWhen: [
      'Các bậc không phải tập con của nhau → đó chỉ là bar chart đội lốt phễu, và hình dạng thu hẹp là bịa.',
      'Người dùng có thể quay lại bậc trước, hoặc nhảy cóc → phễu che mất điều đó; dùng sankey.',
      'Cần so sánh phễu giữa nhiều nhóm → dùng bảng tỷ lệ chuyển đổi, phễu không xếp cạnh nhau được.',
    ],
    dataShape: 'Chuỗi bậc CÓ THỨ TỰ + số lượng mỗi bậc, giảm dần đơn điệu.',
    variants: [
      'Ghi tỷ lệ so với bậc trước ngay trên mỗi bậc — thường hữu ích hơn tỷ lệ so với bậc đầu.',
      'Phễu ngang khi tên bậc dài.',
      'Bar chart ngang có ghi % rơi rụng — kém đẹp hơn nhưng đọc chính xác hơn.',
    ],
    seriesCap: '3–7 bậc.',
    demo: () => <FunnelDemo />,
    code: `series: [{
  type: 'funnel',
  sort: 'none',        // GIỮ nguyên thứ tự quy trình, không tự sắp lại theo giá trị
  gap: 2,              // khe 2px màu nền giữa các bậc
  minSize: '28%',
  data: steps.map((s, i) => ({
    name: s.label, value: s.value,
    // Bậc rời rạc CÓ THỨ TỰ → ramp ordinal MỘT hue,
    // không phải 5 màu categorical khác nhau
    itemStyle: { color: ORDINAL_BLUE[mode][i] },
  })),
  // Màu chữ đặt trên TỪNG bậc, theo độ sáng của chính bậc đó
  label: { position: 'inside' },
}]`,
  },
]
