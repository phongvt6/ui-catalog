import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { BRANCHES, allBranchDays, dailyByBranch, fiveNumber, histogram } from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, vnCompact } from '../lib/theme'
import { base, catAxis, columnItem, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function HistogramDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const bins = useMemo(() => histogram(allBranchDays, 12), [])
  const median = useMemo(() => {
    const v = [...allBranchDays].sort((a, b) => a - b)
    return v[Math.floor(v.length / 2)]
  }, [])
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { dataIndex: number; value: number }
          const b = bins[d.dataIndex]
          return `${vnCompact(b.from)} – ${vnCompact(b.to)} ₫<br/><b>${d.value} ngày-chi nhánh</b>`
        },
      },
      grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
      xAxis: catAxis(
        mode,
        bins.map((b) => vnCompact(b.from)),
        { axisLabel: { interval: 1, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK } },
      ),
      yAxis: valAxis(mode, (v) => String(v), {
        name: 'số ngày-chi nhánh',
        nameLocation: 'end',
        nameGap: 12,
        nameTextStyle: {
          color: c.inkMuted,
          fontSize: 11,
          fontFamily: FONT_STACK,
          align: 'left',
        },
      }),
      series: [
        {
          name: 'Số quan sát',
          type: 'bar',
          // Histogram: các cột SÁT NHAU (trục là liên tục, không phải danh mục rời).
          barCategoryGap: '0%',
          data: bins.map((b) => b.count),
          itemStyle: {
            ...columnItem(SERIES[mode][0]),
            // Khe 2px màu nền giữa hai cột kề nhau — vẫn là surface gap.
            borderColor: c.surface,
            borderWidth: 1,
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: c.ink, width: 1, type: 'dashed' },
            label: {
              formatter: `trung vị ${vnCompact(median)}`,
              color: c.inkSecondary,
              fontSize: 11,
              fontFamily: FONT_STACK,
              // Đường mốc là đường DỌC → phải ép rotate 0, nếu không ECharts
              // xoay chữ theo hướng đường và nhãn nằm dọc, đè lên các cột.
              rotate: 0,
              position: 'end',
              distance: 6,
            },
            data: [
              {
                xAxis: bins.findIndex((b) => median >= b.from && median <= b.to),
              },
            ],
          },
        },
      ],
    }),
    [mode, c, bins, median],
  )
  return <EChart option={option} resetKey={mode} height={280} />
}

function BoxplotDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const stats = useMemo(() => BRANCHES.map((s) => fiveNumber(dailyByBranch[s])), [])
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { name: string; value: number[]; seriesType: string }
          if (d.seriesType === 'scatter') {
            return `${BRANCHES[d.value[0]]}<br/>ngoại lệ: <b>${vnCompact(d.value[1])} ₫</b>`
          }
          const [min, q1, med, q3, max] = d.value.slice(1)
          return [
            `<b>${d.name}</b>`,
            `Lớn nhất ${vnCompact(max)}`,
            `Q3 ${vnCompact(q3)}`,
            `Trung vị <b>${vnCompact(med)}</b>`,
            `Q1 ${vnCompact(q1)}`,
            `Nhỏ nhất ${vnCompact(min)}`,
          ].join('<br/>')
        },
      },
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: catAxis(mode, [...BRANCHES]),
      yAxis: valAxis(mode, vnCompact, { scale: true }),
      series: [
        {
          name: 'Doanh thu ngày',
          type: 'boxplot',
          boxWidth: [12, 32],
          data: stats.map((s) => s.box),
          itemStyle: {
            color: c.surface,
            borderColor: SERIES[mode][0],
            borderWidth: 1.5,
          },
        },
        {
          name: 'Ngoại lệ',
          type: 'scatter',
          symbolSize: 8,
          data: stats.flatMap((s, i) => s.outliers.map((v) => [i, v])),
          itemStyle: {
            color: SERIES[mode][1],
            borderColor: c.surface,
            borderWidth: MARK.ring,
          },
        },
      ],
    }),
    [mode, c, stats],
  )
  return <EChart option={option} resetKey={mode} height={300} />
}

/* -------------------------------------------------------------------------- */

export const distributionEntries: ChartEntry[] = [
  {
    id: 'histogram',
    nameVi: 'Histogram',
    nameEn: 'Histogram',
    aliases: ['phân phối', 'distribution', 'tần suất', 'biểu đồ tần số'],
    job: 'distribution',
    status: 'ready',
    description:
      'Chia giá trị thành các khoảng đều nhau rồi đếm số quan sát rơi vào mỗi khoảng. Cho thấy dữ liệu tụ ở đâu, có mấy đỉnh, lệch về phía nào — những thứ mà một con số trung bình che giấu hoàn toàn.',
    useWhen: [
      'Trước khi báo cáo bằng số trung bình — luôn nhìn phân bố trước.',
      'Cần biết dữ liệu có một đỉnh hay hai đỉnh (hai nhóm khác nhau bị trộn vào nhau).',
      'Có từ ~30 quan sát trở lên.',
    ],
    avoidWhen: [
      'Dưới ~30 quan sát → mỗi cột chỉ 1–2 quan sát, hình dạng là nhiễu. Dùng dot plot hoặc beeswarm.',
      'Trục hoành là danh mục rời rạc — đó là bar chart, không phải histogram (và các cột phải TÁCH nhau).',
      'So sánh phân bố giữa nhiều nhóm → box plot hoặc small multiples; nhiều histogram chồng lên nhau không đọc được.',
    ],
    dataShape: 'Một mảng giá trị số THÔ (chưa tổng hợp). Việc chia bin do biểu đồ làm.',
    variants: [
      'Đổi độ rộng bin — luôn thử vài mức trước khi chốt.',
      'Thêm đường mật độ (KDE) chồng lên.',
      'Vạch mốc trung vị / trung bình bằng nét đứt màu mực (như demo).',
    ],
    seriesCap: '1 phân bố mỗi khung.',
    demo: () => <HistogramDemo />,
    code: `series: [{
  type: 'bar',
  barCategoryGap: '0%',    // cột SÁT NHAU: trục là liên tục, không phải danh mục rời
  data: bins.map(b => b.count),
  itemStyle: { ...columnItem(SERIES[mode][0]), borderColor: c.surface, borderWidth: 1 },
  markLine: {              // mốc tham chiếu vẽ bằng MỰC, không bằng màu series
    symbol: 'none', silent: true,
    lineStyle: { color: c.ink, width: 1, type: 'dashed' },
    data: [{ xAxis: medianBinIndex }],
  },
}]

/* CẢNH BÁO: độ rộng bin có thể TẠO RA hoặc XOÁ ĐI cả một đỉnh.
   Luôn thử 8 / 12 / 20 bin trước khi chốt con số đưa vào báo cáo. */`,
  },

  {
    id: 'boxplot',
    nameVi: 'Box plot',
    nameEn: 'Box plot / violin',
    aliases: ['hộp râu', 'quartile chart', 'violin plot', 'box and whisker'],
    job: 'distribution',
    status: 'ready',
    description:
      'Tóm tắt phân bố bằng năm số: nhỏ nhất, Q1, trung vị, Q3, lớn nhất — cộng các điểm ngoại lệ vẽ riêng. Nén cả một phân bố vào một cột hẹp, nên so được nhiều nhóm cạnh nhau.',
    useWhen: [
      'So sánh phân bố giữa 3–15 nhóm trên cùng một khung.',
      'Ngoại lệ là thứ cần thấy (ngày lễ, sự cố, gian lận).',
      'Người xem có nền thống kê, hoặc bạn có chỗ để giải thích.',
    ],
    avoidWhen: [
      'Đưa cho lãnh đạo trên dashboard mà không giải thích — box plot cần được dạy cách đọc; phần lớn người xem sẽ hiểu sai.',
      'Phân bố hai đỉnh → box plot giấu mất hoàn toàn. Dùng violin, beeswarm, hoặc histogram small multiples.',
      'Ít hơn ~10 quan sát mỗi nhóm → vẽ thẳng từng điểm, đừng tóm tắt.',
    ],
    dataShape: 'Mỗi nhóm một mảng giá trị thô. Năm số và ngoại lệ do mình tính (1,5 × IQR).',
    variants: [
      'Violin plot: thay hộp bằng hình dạng mật độ — thấy được đa đỉnh.',
      'Beeswarm: vẽ hết các điểm, xô lệch nhau để không chồng — trung thực nhất khi n nhỏ.',
      'Chồng các điểm thô mờ lên trên hộp — vừa tóm tắt vừa không giấu gì.',
    ],
    seriesCap: '3–15 nhóm.',
    demo: () => <BoxplotDemo />,
    code: `// Năm số + ngoại lệ theo quy tắc 1,5 × IQR — tự tính, đừng phó mặc thư viện
export function fiveNumber(values) {
  const v = [...values].sort((a, b) => a - b)
  const q = p => { const i = (v.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i)
                   return v[lo] + (v[hi] - v[lo]) * (i - lo) }
  const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1
  const inl = v.filter(x => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr)
  return { box: [inl[0], q1, q(0.5), q3, inl.at(-1)],
           outliers: v.filter(x => x < q1 - 1.5 * iqr || x > q3 + 1.5 * iqr) }
}

series: [
  { type: 'boxplot', boxWidth: [12, 32], data: stats.map(s => s.box),
    itemStyle: { color: c.surface, borderColor: SERIES[mode][0], borderWidth: 1.5 } },
  { type: 'scatter', symbolSize: 8,      // ngoại lệ dùng SLOT MÀU KHÁC, không phải
    data: outlierPoints,                 // màu trạng thái — chúng chưa chắc là "xấu"
    itemStyle: { color: SERIES[mode][1], borderColor: c.surface, borderWidth: 2 } },
]`,
  },
]
