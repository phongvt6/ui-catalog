import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { CATEGORIES, revenueByCategory, revenueByBranch, branchByCategory } from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, labelInk, vnCompact, vnPercent } from '../lib/theme'
import { base, catAxis, stackItem, tooltip, valAxis, valueLabel } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function StackedBarDemo() {
  const mode = useMode()
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode, { legend: true }),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      xAxis: catAxis(
        mode,
        revenueByBranch.map((r) => r.branch),
      ),
      yAxis: valAxis(mode, vnCompact),
      series: CATEGORIES.map((cat, i) => ({
        name: cat,
        type: 'bar' as const,
        stack: 'total',
        barMaxWidth: 32,
        data: branchByCategory[cat],
        // Khe 2px màu nền tách các segment — không phải viền trang trí.
        itemStyle: stackItem(SERIES[mode][i], mode),
      })),
    }),
    [mode],
  )
  return <EChart option={option} resetKey={mode} height={300} />
}

function Stacked100Demo() {
  const mode = useMode()
  const c = CHROME[mode]
  const totals = useMemo(
    () => revenueByBranch.map((_, idx) => CATEGORIES.reduce((s, cat) => s + branchByCategory[cat][idx], 0)),
    [],
  )
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode, { legend: true }),
      tooltip: {
        ...tooltip(mode),
        valueFormatter: (v) => vnPercent(v as number),
      },
      grid: { left: 8, right: 20, top: 44, bottom: 8, containLabel: true },
      xAxis: valAxis(mode, (v) => `${v}%`, { max: 100 }),
      yAxis: catAxis(
        mode,
        revenueByBranch.map((r) => r.branch),
        { axisLine: { show: false } },
      ),
      series: CATEGORIES.map((cat, i) => ({
        name: cat,
        type: 'bar' as const,
        stack: 'pct',
        barMaxWidth: 28,
        data: branchByCategory[cat].map((v, idx) => Number(((v / totals[idx]) * 100).toFixed(1))),
        itemStyle: stackItem(SERIES[mode][i], mode),
        label: {
          // Chỉ gắn nhãn cho segment đủ rộng để chữ nằm lọt — không cắt chữ bao giờ.
          show: true,
          formatter: valueLabel((v) => (v >= 12 ? `${Math.round(v)}%` : '')),
          // Chữ nằm TRONG mảng màu: chọn trắng/mực theo độ sáng của mảng đó.
          color: labelInk(SERIES[mode][i]),
          fontSize: 11,
          fontFamily: FONT_STACK,
        },
      })),
      backgroundColor: 'transparent',
      textStyle: { fontFamily: FONT_STACK, color: c.inkSecondary },
    }),
    [mode, totals, c.inkSecondary],
  )
  return <EChart option={option} resetKey={mode} height={280} />
}

function DonutDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const total = revenueByCategory.reduce((s, x) => s + x.revenue, 0)
  const option = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      textStyle: { fontFamily: FONT_STACK, color: c.inkSecondary },
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { name: string; value: number; percent: number }
          return `${d.name}<br/><b>${vnCompact(d.value)} ₫</b> · ${vnPercent(d.percent)}`
        },
      },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'middle',
        icon: 'circle',
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 14,
        textStyle: { color: c.inkSecondary, fontSize: 12, fontFamily: FONT_STACK },
      },
      series: [
        {
          type: 'pie',
          radius: ['58%', '82%'],
          center: ['32%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          // Khe 2px màu nền giữa các lát, giống stacked bar.
          itemStyle: { borderColor: c.surface, borderWidth: MARK.gap },
          data: revenueByCategory.map((r, i) => ({
            name: r.category,
            value: r.revenue,
            itemStyle: { color: SERIES[mode][i] },
          })),
        },
      ],
      graphic: [
        {
          type: 'text',
          left: '32%',
          top: '44%',
          style: {
            text: `${vnCompact(total)} ₫`,
            textAlign: 'center',
            fill: c.ink,
            fontSize: 20,
            fontWeight: 600,
            fontFamily: FONT_STACK,
          },
        },
        {
          type: 'text',
          left: '32%',
          top: '56%',
          style: {
            text: 'tổng 30 ngày',
            textAlign: 'center',
            fill: c.inkMuted,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
        },
      ],
    }),
    [mode, c, total],
  )
  return <EChart option={option} resetKey={mode} height={260} />
}

/* -------------------------------------------------------------------------- */

export const compositionEntries: ChartEntry[] = [
  {
    id: 'stacked-bar',
    nameVi: 'Cột chồng',
    nameEn: 'Stacked bar chart',
    aliases: ['stacked column', 'cột xếp chồng', 'part-to-whole'],
    job: 'composition',
    status: 'ready',
    description:
      'Mỗi cột là một tổng, chia thành các phần theo một chiều thứ hai. Đọc được TỔNG và phần ĐÁY chính xác; các phần ở giữa chỉ ước lượng được vì chúng không chung đường gốc.',
    useWhen: [
      'Câu hỏi là “tổng bao nhiêu VÀ gồm những gì” — cần cả hai.',
      '2–5 thành phần. Đặt thành phần quan trọng nhất xuống ĐÁY để nó có đường gốc chung.',
    ],
    avoidWhen: [
      'Người xem cần so sánh chính xác một thành phần ở GIỮA giữa các cột → tách thành small multiples hoặc line riêng.',
      'Hơn 5–6 thành phần → gộp đuôi thành “Khác”.',
      'Thành phần có giá trị âm → cột chồng vỡ nghĩa, dùng waterfall hoặc diverging bar.',
    ],
    dataShape: 'Ma trận nhóm × thành phần, các thành phần cộng lại ra tổng của nhóm.',
    variants: [
      'Ngang (khi tên nhóm dài) hoặc dọc.',
      'Stacked area cho trục thời gian liên tục.',
      'Sắp thứ tự thành phần CỐ ĐỊNH giữa mọi cột, không sắp lại theo từng cột.',
    ],
    seriesCap: '2–5 thành phần.',
    demo: () => <StackedBarDemo />,
    code: `series: CATEGORIES.map((cat, i) => ({
  name: cat,
  type: 'bar',
  stack: 'total',                        // cùng một tên stack = chồng lên nhau
  barMaxWidth: 32,
  data: matrix[cat],
  itemStyle: stackItem(SERIES[mode][i], mode),
}))

/* stackItem = màu series + border 2px MÀU NỀN.
   Đó là "surface gap" — dùng khoảng trắng để tách,
   chứ không vẽ viền tối quanh mark. */
export function stackItem(color, mode) {
  return { color, borderColor: CHROME[mode].surface, borderWidth: 2 }
}`,
  },

  {
    id: 'stacked-100',
    nameVi: 'Cột chồng 100%',
    nameEn: '100% stacked bar',
    aliases: ['tỷ trọng', 'share chart', 'proportional stacked bar', 'cơ cấu %'],
    job: 'composition',
    status: 'ready',
    description:
      'Mọi cột kéo dài bằng nhau; chỉ TỶ TRỌNG được so sánh. Trả lời “cơ cấu có khác nhau không”, và cố tình vứt bỏ thông tin về quy mô.',
    useWhen: [
      'So sánh cơ cấu giữa các đối tượng có quy mô rất chênh lệch.',
      'Câu hỏi thuần về tỷ lệ: “chi nhánh nào phụ thuộc nhóm Thiết bị nhiều nhất?”',
    ],
    avoidWhen: [
      'Người xem cũng cần biết quy mô — biểu đồ này giấu mất. Ghép thêm một cột số tổng, hoặc dùng cột chồng thường.',
      'Cơ cấu gần như giống nhau ở mọi nhóm → chẳng có gì để kể, dùng bảng.',
    ],
    dataShape: 'Giống cột chồng, nhưng chuẩn hoá mỗi nhóm về 100%.',
    variants: [
      'Diverging stacked bar cho thang có thứ tự (rất không hài lòng ↔ rất hài lòng), căn giữa ở mức trung lập.',
      'Ghi kèm tổng tuyệt đối ở cuối mỗi dòng để bù lại thông tin bị mất.',
    ],
    seriesCap: '2–5 thành phần.',
    demo: () => <Stacked100Demo />,
    code: `data: matrix[cat].map((v, i) => +(v / totals[i] * 100).toFixed(1)),
label: {
  show: true,
  // CHỈ gắn nhãn khi segment đủ rộng — thà không nhãn còn hơn cắt chữ.
  formatter: p => (p.value >= 12 ? \`\${Math.round(p.value)}%\` : ''),
  color: labelInk(SERIES[mode][i]),   // chữ NẰM TRONG mảng màu:
                                     // chọn trắng/mực theo độ sáng của chính mảng đó
}
xAxis: valAxis(mode, v => \`\${v}%\`, { max: 100 }),`,
  },

  {
    id: 'donut',
    nameVi: 'Biểu đồ vành khuyên',
    nameEn: 'Donut / pie chart',
    aliases: ['pie', 'bánh', 'tròn', 'cơ cấu tròn'],
    job: 'composition',
    status: 'ready',
    description:
      'Cơ cấu của MỘT tổng duy nhất. Mắt người so góc kém hơn so độ dài rất nhiều — nên đây là dạng yếu, chỉ dùng khi số lát ít và thông điệp là “một lát chiếm phần lớn”.',
    useWhen: [
      '2–4 lát, chênh lệch rõ ràng.',
      'Chỉ có MỘT tổng để mổ xẻ (không so giữa nhiều nhóm).',
      'Lỗ giữa donut là chỗ đặt con số tổng — tận dụng nó.',
    ],
    avoidWhen: [
      'Trên 5 lát → dùng thanh ngang, đọc nhanh và chính xác hơn hẳn.',
      'Các lát xấp xỉ nhau → không ai phân biệt được góc 24% với 26%.',
      'So sánh cơ cấu giữa nhiều nhóm → tuyệt đối không dùng nhiều pie cạnh nhau; dùng cột chồng 100%.',
      'Không bao giờ tách lát (exploded), không bao giờ 3D.',
    ],
    dataShape: 'Danh sách {tên, giá trị} không âm, cộng lại ra một tổng có nghĩa.',
    variants: [
      'Donut (có lỗ, đặt số tổng vào giữa) — gần như luôn tốt hơn pie đặc.',
      'Waffle 10×10 ô — đọc tỷ lệ chính xác hơn góc.',
    ],
    seriesCap: '2–5 lát; quá thì gộp “Khác”.',
    demo: () => <DonutDemo />,
    code: `series: [{
  type: 'pie',
  radius: ['58%', '82%'],       // lỗ giữa ≈ 58% để đặt con số tổng
  label: { show: false },       // nhãn quanh vành hay chồng chéo — để legend lo
  itemStyle: { borderColor: c.surface, borderWidth: 2 },  // khe 2px màu nền
  data: rows.map((r, i) => ({
    name: r.category, value: r.revenue,
    itemStyle: { color: SERIES[mode][i] },
  })),
}],
graphic: [{ type: 'text', style: { text: vnCompact(total) + ' ₫', fontSize: 20 } }]`,
  },
]
