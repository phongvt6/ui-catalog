import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import {
  BRANCHES,
  dailyByBranch,
  dates,
  productRevenue,
  shortDate,
  weekFirstVsLast,
} from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, vnCompact } from '../lib/theme'
import { base, catAxis, lineSeries, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function DotPlotDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const rows = useMemo(() => [...productRevenue].reverse(), [])
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { name: string; value: number }
          return `${d.name}<br/><b>${vnCompact(d.value)} ₫</b>`
        },
      },
      grid: { left: 8, right: 60, top: 8, bottom: 8, containLabel: true },
      // Bỏ lưới dọc: nó chạy song song và cạnh tranh thị giác với chính cuống.
      xAxis: valAxis(mode, vnCompact, { splitLine: { show: false } }),
      yAxis: catAxis(
        mode,
        rows.map((r) => r.name),
        { axisLine: { show: false } },
      ),
      series: [
        {
          // Cuống của "kẹo mút": một sợi 1px, chỉ để mắt lần từ nhãn tới chấm.
          name: 'cuống',
          type: 'bar',
          barWidth: 1,
          silent: true,
          itemStyle: { color: c.axis },
          data: rows.map((r) => r.current),
          z: 1,
        },
        {
          name: 'Doanh thu 30 ngày',
          type: 'scatter',
          symbolSize: 11,
          data: rows.map((r) => r.current),
          itemStyle: { color: SERIES[mode][0], borderColor: c.surface, borderWidth: MARK.ring },
          z: 3,
        },
      ],
    }),
    [mode, c, rows],
  )
  return <EChart option={option} resetKey={mode} height={360} />
}

function DumbbellDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const rows = weekFirstVsLast
  const firstColor = mode === 'light' ? '#86b6ef' : '#256abf'
  const lastColor = SERIES[mode][0]
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode, { legend: true }),
      legend: {
        show: true,
        top: 0,
        left: 0,
        icon: 'circle',
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 18,
        // Chỉ liệt kê hai đầu mút; các đoạn nối không phải series có nghĩa.
        data: ['Tuần đầu', 'Tuần cuối'],
        textStyle: { color: c.inkSecondary, fontSize: 12, fontFamily: FONT_STACK },
      },
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { seriesName: string; value: [number, number] }
          return `${d.seriesName}<br/><b>${vnCompact(d.value[0])} ₫</b>`
        },
      },
      grid: { left: 8, right: 24, top: 44, bottom: 8, containLabel: true },
      xAxis: valAxis(mode, vnCompact, { scale: true }),
      yAxis: catAxis(
        mode,
        rows.map((r) => r.branch),
        { axisLine: { show: false } },
      ),
      series: [
        // Đoạn nối: một series line cho mỗi dòng, cùng màu xám, không vào legend.
        ...rows.map((r, i) => ({
          name: `nối-${r.branch}`,
          type: 'line' as const,
          silent: true,
          showSymbol: false,
          lineStyle: { width: 3, color: c.axis },
          data: [
            [r.first, i],
            [r.last, i],
          ],
          z: 1,
        })),
        {
          name: 'Tuần đầu',
          type: 'scatter',
          symbolSize: 11,
          data: rows.map((r, i) => [r.first, i]),
          itemStyle: { color: firstColor, borderColor: c.surface, borderWidth: MARK.ring },
          z: 3,
        },
        {
          name: 'Tuần cuối',
          type: 'scatter',
          symbolSize: 11,
          data: rows.map((r, i) => [r.last, i]),
          itemStyle: { color: lastColor, borderColor: c.surface, borderWidth: MARK.ring },
          z: 3,
        },
      ],
    }),
    [mode, c, rows, firstColor, lastColor],
  )
  return <EChart option={option} resetKey={mode} height={260} />
}

function SmallMultiplesDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const axisDates = useMemo(() => dates.map(shortDate), [])
  // Thang đo CHUNG cho mọi khung — đây là điều kiện sống còn của small multiples.
  const sharedMax = useMemo(
    () => Math.max(...BRANCHES.flatMap((s) => dailyByBranch[s])) * 1.08,
    [],
  )
  const option = useMemo<EChartsOption>(() => {
    const cols = BRANCHES.length
    const gapPct = 2.5
    // Chừa 7% bên trái làm chỗ đứng cho nhãn trục dùng chung.
    const leftPct = 7
    const width = (100 - leftPct - gapPct * cols) / cols
    return {
      backgroundColor: 'transparent',
      textStyle: { fontFamily: FONT_STACK, color: c.inkSecondary },
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: BRANCHES.map((_, i) => ({
        left: `${leftPct + i * (width + gapPct)}%`,
        width: `${width}%`,
        top: 34,
        bottom: 28,
      })),
      xAxis: BRANCHES.map((_, i) => ({
        ...catAxis(mode, axisDates, {
          boundaryGap: false,
          axisLabel: { interval: 14, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
        }),
        gridIndex: i,
      })),
      yAxis: BRANCHES.map((_, i) => ({
        ...valAxis(mode, vnCompact, { max: sharedMax, min: 0 }),
        gridIndex: i,
        // Chỉ khung đầu tiên hiện nhãn trục — 5 lần lặp cùng một thang là thừa.
        axisLabel: i === 0 ? { color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK, formatter: (v: number) => vnCompact(v) } : { show: false },
      })),
      title: BRANCHES.map((st, i) => ({
        text: st,
        left: `${leftPct + i * (width + gapPct)}%`,
        top: 4,
        textStyle: { color: c.inkSecondary, fontSize: 12, fontWeight: 500 as const, fontFamily: FONT_STACK },
      })),
      series: BRANCHES.map((st, i) => ({
        name: st,
        ...lineSeries(SERIES[mode][0], mode),
        xAxisIndex: i,
        yAxisIndex: i,
        data: dailyByBranch[st],
      })),
    }
  }, [mode, c, axisDates, sharedMax])
  return <EChart option={option} resetKey={mode} height={260} />
}

/* -------------------------------------------------------------------------- */

export const compare2Entries: ChartEntry[] = [
  {
    id: 'dot-plot',
    nameVi: 'Dot plot / lollipop',
    nameEn: 'Dot plot / lollipop chart',
    aliases: ['cleveland dot plot', 'kẹo mút', 'chấm'],
    job: 'compare',
    status: 'ready',
    description:
      'Một chấm thay cho cả thanh, kèm một sợi cuống mảnh dẫn từ nhãn tới chấm. Ít mực hơn bar chart rất nhiều nên chở được nhiều hạng mục hơn trên cùng diện tích, mà vẫn đọc chính xác vì chấm vẫn nằm trên một thang chung.',
    useWhen: [
      '12–40 hạng mục — nhiều hơn mức bar chart còn thoáng.',
      'Chênh lệch giữa các hạng mục nhỏ: rừng thanh dài gần bằng nhau nhìn rất nhàm, chấm thì vẫn rõ.',
      'Cần kèm thêm chiều thứ hai sau này (thành dumbbell) mà không phải vẽ lại từ đầu.',
    ],
    avoidWhen: [
      'Người xem hoàn toàn quen bar chart và đây là báo cáo dùng một lần → đừng bắt họ học dạng mới.',
      'Thông điệp chính là “gấp mấy lần” — độ dài của thanh diễn đạt tỷ lệ tốt hơn vị trí của chấm.',
      'Dưới ~8 hạng mục → thanh ngang gọn và quen mắt hơn.',
    ],
    dataShape: 'Giống bar chart: một cột danh mục + một cột giá trị.',
    variants: [
      'Bỏ cuống → dot plot thuần (ít mực nhất).',
      'Giữ cuống → lollipop, mắt lần từ nhãn sang chấm dễ hơn khi danh sách dài.',
      'Sắp xếp giảm dần gần như luôn đúng.',
    ],
    seriesCap: '1 series. Hai thời điểm → dumbbell.',
    demo: () => <DotPlotDemo />,
    code: `series: [
  {
    // Cuống: một series bar barWidth 1, màu lưới, silent (không nhận hover)
    name: 'cuống', type: 'bar', barWidth: 1, silent: true,
    itemStyle: { color: c.grid }, data: values, z: 1,
  },
  {
    name: 'Doanh thu', type: 'scatter', symbolSize: 11, data: values,
    itemStyle: { color: SERIES[mode][0], borderColor: c.surface, borderWidth: 2 },
    z: 3,   // chấm luôn nằm trên cuống
  },
]`,
  },

  {
    id: 'dumbbell',
    nameVi: 'Dumbbell (trước → sau)',
    nameEn: 'Dumbbell / range plot',
    aliases: ['before after', 'connected dot plot', 'tạ đôi', 'so sánh 2 kỳ'],
    job: 'compare',
    status: 'ready',
    description:
      'Hai chấm nối bằng một đoạn: giá trị kỳ đầu và kỳ cuối cho từng hạng mục. Độ dài đoạn nối chính là mức thay đổi — đọc “ai thay đổi nhiều nhất” nhanh hơn hẳn hai cột đứng cạnh nhau.',
    useWhen: [
      'So sánh đúng HAI thời điểm (hoặc hai kịch bản) cho nhiều hạng mục.',
      'Thông điệp là mức thay đổi, không phải giá trị tuyệt đối.',
      'Sắp xếp theo mức thay đổi để đoạn dài nhất nằm ở một đầu.',
    ],
    avoidWhen: [
      'Có từ 3 thời điểm trở lên → slope chart hoặc biểu đồ đường.',
      'Các đoạn nối cắt chéo nhau nhiều (thứ hạng đảo lộn) → dùng slope chart, nó vẽ đúng chuyện đó.',
      'Người xem cần con số cả hai kỳ → thêm bảng, vì chấm không mang nhãn.',
    ],
    dataShape: 'Mỗi dòng: nhãn + giá trị đầu + giá trị cuối (cùng đơn vị).',
    variants: [
      'Đổi màu đoạn nối theo hướng tăng/giảm — nhưng phải kèm icon hoặc nhãn, không để màu tự gánh.',
      'Range plot: hai đầu là min–max thay vì hai thời điểm.',
    ],
    seriesCap: 'Hai đầu mút. Ba đầu trở lên là biểu đồ khác.',
    demo: () => <DumbbellDemo />,
    code: `series: [
  // Đoạn nối: mỗi dòng một line series, cùng màu xám, KHÔNG đưa vào legend
  ...rows.map((r, i) => ({
    name: \`nối-\${r.branch}\`, type: 'line', silent: true, showSymbol: false,
    lineStyle: { width: 3, color: c.grid },
    data: [[r.first, i], [r.last, i]],   // [giá trị, chỉ số dòng]
    z: 1,
  })),
  { name: 'Tuần đầu',  type: 'scatter', symbolSize: 11,
    data: rows.map((r, i) => [r.first, i]), itemStyle: { color: '#86b6ef' } },
  { name: 'Tuần cuối', type: 'scatter', symbolSize: 11,
    data: rows.map((r, i) => [r.last, i]),  itemStyle: { color: SERIES[mode][0] } },
]

// legend.data chỉ liệt kê hai đầu mút — các đoạn nối không phải series có nghĩa.
legend: { data: ['Tuần đầu', 'Tuần cuối'] }

/* Một hue, HAI SẮC ĐỘ — không dùng hai hue khác nhau: hai đầu mút là
   hai trạng thái của cùng một thứ, không phải hai thực thể khác nhau. */`,
  },

  {
    id: 'small-multiples',
    nameVi: 'Small multiples',
    nameEn: 'Small multiples / faceting',
    aliases: ['trellis', 'facet grid', 'lưới biểu đồ nhỏ', 'panel chart'],
    job: 'compare',
    status: 'ready',
    description:
      'Cùng một biểu đồ lặp lại nhiều lần, mỗi khung một nhóm, DÙNG CHUNG THANG ĐO. Đây là câu trả lời chuẩn cho “quá nhiều series” — và gần như luôn tốt hơn việc nhồi 8 đường vào một khung.',
    useWhen: [
      'Từ 5 nhóm trở lên mà nhóm nào cũng đáng xem.',
      'Cần so sánh HÌNH DẠNG (nhịp tăng giảm) giữa các nhóm.',
      'Các đường chồng chéo đến mức không lần ra được đường nào của ai.',
    ],
    avoidWhen: [
      'Mỗi khung một thang đo riêng — đây là lỗi nặng nhất của dạng này: các khung trông giống nhau nhưng không so được với nhau. Luôn dùng chung trục.',
      'Chỉ có 2–3 nhóm → vẽ chung một khung, so sánh trực tiếp dễ hơn.',
      'Cần đọc giá trị chính xác từng điểm → khung quá nhỏ, dùng bảng.',
    ],
    dataShape: 'Dữ liệu dài (long format): nhóm + trục + giá trị.',
    variants: [
      'Xếp hàng ngang (như demo) hoặc lưới nhiều dòng khi có > 6 nhóm.',
      'Vẽ mờ toàn bộ các nhóm khác làm nền trong từng khung — thấy ngay khung nào lệch khỏi đám đông.',
      'Sắp thứ tự khung theo giá trị, không theo bảng chữ cái.',
    ],
    seriesCap: '5–20 khung.',
    demo: () => <SmallMultiplesDemo />,
    code: `const sharedMax = Math.max(...BRANCHES.flatMap(s => dailyByBranch[s])) * 1.08

grid:  BRANCHES.map((_, i) => ({ left: \`\${7 + i * (w + 2.5)}%\`,   // 7% đầu chừa cho nhãn trục
                                width: \`\${w}%\`, top: 34, bottom: 28 })),
xAxis: BRANCHES.map((_, i) => ({ ...catAxis(mode, dates), gridIndex: i })),
yAxis: BRANCHES.map((_, i) => ({
  ...valAxis(mode, vnCompact, { max: sharedMax, min: 0 }),   // ← THANG CHUNG
  gridIndex: i,
  axisLabel: i === 0 ? { ... } : { show: false },  // chỉ khung đầu hiện nhãn
})),
series: BRANCHES.map((st, i) => ({
  ...lineSeries(SERIES[mode][0], mode),   // MỌI khung cùng một màu:
  xAxisIndex: i, yAxisIndex: i,           // nhóm đã do tiêu đề khung phân biệt,
  data: dailyByBranch[st],               // màu không cần gánh thêm việc đó
})),`,
  },
]
