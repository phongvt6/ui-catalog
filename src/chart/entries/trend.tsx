import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { BRANCHES, dailyByBranch, dailyTotal, dates, revenueByBranch, shortDate } from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, vnCompact } from '../lib/theme'
import { areaFill, base, catAxis, lineSeries, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

const axisDates = dates.map(shortDate)

/* -------------------------------------------------------------------------- */

function LineDemo() {
  const mode = useMode()
  const top3 = revenueByBranch.slice(0, 3).map((r) => r.branch)
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode, { legend: true }),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      xAxis: catAxis(mode, axisDates, { boundaryGap: false, axisLabel: { interval: 4, color: CHROME[mode].inkMuted, fontSize: 11, fontFamily: FONT_STACK } }),
      yAxis: valAxis(mode, vnCompact),
      series: top3.map((st, i) => ({
        name: st,
        ...lineSeries(SERIES[mode][i], mode),
        data: dailyByBranch[st],
        // Nhãn trực tiếp ở ĐIỂM CUỐI — không phải ở mọi điểm.
        endLabel: {
          show: true,
          formatter: st,
          color: CHROME[mode].inkSecondary,
          fontSize: 11,
          fontFamily: FONT_STACK,
        },
      })),
      grid: { left: 8, right: 76, top: 44, bottom: 8, containLabel: true },
    }),
    [mode, top3],
  )
  return <EChart option={option} resetKey={mode} height={300} />
}

function AreaDemo() {
  const mode = useMode()
  const color = SERIES[mode][0]
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      xAxis: catAxis(mode, axisDates, { boundaryGap: false, axisLabel: { interval: 4, color: CHROME[mode].inkMuted, fontSize: 11, fontFamily: FONT_STACK } }),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu toàn chuỗi',
          ...lineSeries(color, mode),
          data: dailyTotal.map((d) => d.revenue),
          // Nền = hue của series ở 10% — một lớp phủ nhạt, không phải khối đặc.
          areaStyle: areaFill(color),
          showSymbol: false,
        },
      ],
    }),
    [mode, color],
  )
  return <EChart option={option} resetKey={mode} height={260} />
}

function EmphasisDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const focus = 'CN-03'
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      xAxis: catAxis(mode, axisDates, { boundaryGap: false, axisLabel: { interval: 4, color: c.inkMuted, fontSize: 11, fontFamily: FONT_STACK } }),
      yAxis: valAxis(mode, vnCompact),
      grid: { left: 8, right: 76, top: 16, bottom: 8, containLabel: true },
      series: BRANCHES.map((st) => {
        const isFocus = st === focus
        // Một series mặc màu nhấn, phần còn lại lùi về xám — đây là "emphasis",
        // không phải categorical. Không tiêu tốn slot màu cho nền.
        const color = isFocus ? SERIES[mode][0] : c.deemphasis
        return {
          name: st,
          ...lineSeries(color, mode),
          z: isFocus ? 5 : 1,
          lineStyle: { width: isFocus ? MARK.lineWidth : 1.5, color },
          data: dailyByBranch[st],
          endLabel: isFocus
            ? {
                show: true,
                formatter: st,
                color: c.ink,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: FONT_STACK,
              }
            : { show: false },
        }
      }),
    }),
    [mode, c],
  )
  return <EChart option={option} resetKey={mode} height={280} />
}

/* -------------------------------------------------------------------------- */

export const trendEntries: ChartEntry[] = [
  {
    id: 'line',
    nameVi: 'Biểu đồ đường',
    nameEn: 'Line chart',
    aliases: ['time series', 'chuỗi thời gian', 'xu hướng'],
    job: 'trend',
    status: 'ready',
    description:
      'Nối các điểm theo thời gian. Độ dốc chở thông tin “đang tăng/giảm nhanh chậm ra sao” — thứ mà biểu đồ cột không diễn đạt được.',
    useWhen: [
      'Trục hoành là thời gian liên tục, khoảng cách đều nhau.',
      'Từ ~8 điểm trở lên (ít hơn thì cột đọc rõ hơn).',
      'Cần so sánh hình dạng giữa 2–4 đối tượng.',
    ],
    avoidWhen: [
      'Trục hoành là danh mục rời rạc (tên chi nhánh, tên sản phẩm) — nối chúng bằng đường là bịa ra một sự liên tục không có thật.',
      'Quá 4–5 đường hội tụ vào nhau → nhãn cuối dính chùm; tách small multiples.',
      'Dữ liệu có lỗ hổng → phải để đứt đoạn, đừng nối thẳng qua chỗ thiếu.',
    ],
    dataShape: 'Mỗi series là một mảng giá trị theo cùng một trục thời gian.',
    variants: [
      'Có/không điểm đánh dấu — chỉ hiện điểm khi dữ liệu thưa (< 20 điểm).',
      'Đường mượt (smooth) — tránh dùng: nó bịa ra giá trị giữa hai mốc.',
      'Thêm đường trung bình động khi dữ liệu ngày nhiễu mạnh.',
    ],
    seriesCap: '1–4. Quá 4 → small multiples.',
    demo: () => <LineDemo />,
    code: `series: top3.map((st, i) => ({
  name: st,
  ...lineSeries(SERIES[mode][i], mode),   // 2px, bo đầu, dot 8px có vòng nền
  data: dailyByBranch[st],
  endLabel: { show: true, formatter: st },  // nhãn Ở ĐIỂM CUỐI, không phải mọi điểm
})),
xAxis: catAxis(mode, dates, {
  boundaryGap: false,
  axisLabel: { interval: 4 },   // thưa nhãn ra, đừng nhồi 30 mốc ngày
}),
grid: { right: 76 },            // chừa chỗ cho nhãn cuối đường

/* Khi các đường hội tụ ở mép phải, ĐỪNG đẩy nhãn lệch nhau theo chiều dọc —
   nhãn sẽ rời khỏi đường của nó. Dùng leader line, hoặc tách small multiples. */`,
  },

  {
    id: 'area',
    nameVi: 'Biểu đồ miền',
    nameEn: 'Area chart',
    aliases: ['area', 'miền', 'filled line'],
    job: 'trend',
    status: 'ready',
    description:
      'Đường có tô nền xuống trục gốc. Phần tô gợi ý “khối lượng tích luỹ”, hợp khi giá trị là một lượng cộng dồn được.',
    useWhen: [
      'MỘT series duy nhất, và bạn muốn nhấn cảm giác khối lượng.',
      'Trục giá trị bắt đầu từ 0 (bắt buộc — phần tô vô nghĩa nếu cắt gốc).',
    ],
    avoidWhen: [
      'Nhiều series chồng lấn → miền này che miền kia. Dùng đường thường.',
      'Giá trị là tỷ lệ, chỉ số, nhiệt độ — những thứ không “cộng dồn” được thì phần tô nói dối.',
      'Đừng tô đậm (opacity cao). 10% là đủ; đậm hơn thì phần tô át mất chính đường.',
    ],
    dataShape: 'Một mảng giá trị không âm theo trục thời gian.',
    variants: [
      'Stacked area — cơ cấu theo thời gian; chỉ dùng khi các phần thật sự cộng lại thành tổng có nghĩa.',
      'Streamgraph — đẹp nhưng khó đọc giá trị; chỉ hợp trình bày, không hợp báo cáo.',
    ],
    seriesCap: '1 (chồng lấn) hoặc 2–4 (stacked).',
    demo: () => <AreaDemo />,
    code: `series: [{
  ...lineSeries(color, mode),
  data: dailyTotal.map(d => d.revenue),
  areaStyle: areaFill(color),   // { color, opacity: 0.1 } — một lớp phủ nhạt
  showSymbol: false,
}]

/* Một series duy nhất thì KHÔNG cần hộp legend —
   tiêu đề biểu đồ đã nói rõ đang vẽ cái gì. */`,
  },

  {
    id: 'emphasis-line',
    nameVi: 'Nhấn mạnh một đường',
    nameEn: 'Emphasis (highlight one series)',
    aliases: ['highlight', 'focus chart', 'gray-out', 'làm nổi một series'],
    job: 'trend',
    status: 'ready',
    description:
      'Một đường mặc màu nhấn, tất cả các đường còn lại lùi về xám làm nền so sánh. Đây là dạng bị bỏ quên nhiều nhất — và thường là câu trả lời đúng cho “làm sao cho biểu đồ này dễ hiểu hơn”.',
    useWhen: [
      'Câu chuyện là về MỘT đối tượng, các đối tượng khác chỉ để làm ngữ cảnh.',
      'Có 5–15 series — quá nhiều cho màu danh tính, nhưng vẫn muốn thấy toàn cảnh.',
      'Dashboard có bộ lọc “chọn chi nhánh” — chi nhánh được chọn nhấn màu, phần còn lại xám.',
    ],
    avoidWhen: [
      'Mọi series đều quan trọng ngang nhau → dùng màu categorical, hoặc small multiples.',
      'Đừng nhấn nhiều hơn 2 series — nhấn tất cả nghĩa là không nhấn gì.',
    ],
    dataShape: 'Giống biểu đồ đường, thêm một biến “series nào đang được chọn”.',
    variants: [
      'Nhấn 1 vs so với đường trung bình toàn chuỗi (vẽ nét đứt màu mực).',
      'Áp dụng được cho cả cột, thanh ngang, scatter — không riêng gì đường.',
    ],
    seriesCap: 'Nền tuỳ ý; nhấn tối đa 2.',
    demo: () => <EmphasisDemo />,
    code: `series: BRANCHES.map(st => {
  const isFocus = st === focus
  const color = isFocus ? SERIES[mode][0] : CHROME[mode].deemphasis
  return {
    name: st,
    ...lineSeries(color, mode),
    z: isFocus ? 5 : 1,                                  // đường nhấn nằm trên
    lineStyle: { width: isFocus ? 2 : 1.5, color },
    data: dailyByBranch[st],
    endLabel: isFocus ? { show: true, formatter: st } : { show: false },
  }
})

/* Các đường nền KHÔNG tiêu tốn slot màu categorical —
   chúng dùng chung một màu xám de-emphasis. */`,
  },
]
