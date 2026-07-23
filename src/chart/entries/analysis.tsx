import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import {
  WEEKDAY_LABELS,
  hourBands,
  hourlyHeat,
  revenueByBranch,
  ordersVsRevenue,
} from '../data/sample'
import { CHROME, FONT_STACK, MARK, SEQUENTIAL, SERIES, vnCompact, vnNumber } from '../lib/theme'
import { base, catAxis, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function ScatterDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  // Scatter là dạng "mọi cặp màu cùng xuất hiện" → trần 3 slot màu đầu tiên.
  const shown = revenueByBranch.slice(0, 3).map((r) => r.branch)
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode, { legend: true }),
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { seriesName: string; value: [number, number] }
          return `${d.seriesName}<br/>${vnNumber(d.value[0])} đơn hàng<br/><b>${vnCompact(d.value[1])} ₫</b>`
        },
      },
      xAxis: valAxis(mode, (v) => vnNumber(v), {
        name: 'Số đơn / ngày',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: c.inkMuted, fontSize: 11, fontFamily: FONT_STACK },
        scale: true,
        splitLine: { show: false },
      }),
      yAxis: valAxis(mode, vnCompact, {
        name: 'Doanh thu / ngày',
        nameLocation: 'middle',
        nameGap: 44,
        nameTextStyle: { color: c.inkMuted, fontSize: 11, fontFamily: FONT_STACK },
        scale: true,
      }),
      series: shown.map((st, i) => {
        const found = ordersVsRevenue.find((v) => v.branch === st)!
        return {
          name: st,
          type: 'scatter' as const,
          symbolSize: 9,
          data: found.points,
          // Vòng 2px màu nền để các điểm chồng lấn vẫn tách được ra.
          itemStyle: {
            color: SERIES[mode][i],
            borderColor: c.surface,
            borderWidth: MARK.ring,
            opacity: 0.9,
          },
        }
      }),
    }),
    [mode, c, shown],
  )
  return <EChart option={option} resetKey={mode} height={320} />
}

function HeatmapDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const values = hourlyHeat.map((h) => h.value)
  const option = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      textStyle: { fontFamily: FONT_STACK, color: c.inkSecondary },
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { value: [number, number, number] }
          return `${WEEKDAY_LABELS[d.value[1]]} · ${hourBands[d.value[0]]}<br/><b>${vnCompact(d.value[2])} ₫</b>`
        },
      },
      grid: { left: 8, right: 8, top: 8, bottom: 56, containLabel: true },
      xAxis: catAxis(mode, hourBands, { splitArea: { show: false }, axisLine: { show: false } }),
      yAxis: catAxis(mode, WEEKDAY_LABELS, { axisLine: { show: false } }),
      visualMap: {
        min: Math.min(...values),
        max: Math.max(...values),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        itemWidth: 12,
        itemHeight: 120,
        // Sequential = MỘT hue. Ramp đảo chiều ở dark mode để giá trị thấp
        // luôn là bậc gần màu nền nhất.
        inRange: { color: SEQUENTIAL[mode] },
        textStyle: { color: c.inkMuted, fontSize: 11, fontFamily: FONT_STACK },
        formatter: (v) => vnCompact(v as number),
      },
      series: [
        {
          type: 'heatmap',
          data: hourlyHeat.map((h) => [h.band, h.weekday, h.value]),
          // Khe 2px màu nền giữa các ô, giống mọi mark chạm nhau khác.
          itemStyle: { borderColor: c.surface, borderWidth: MARK.gap },
          emphasis: { itemStyle: { borderColor: c.ink, borderWidth: 1 } },
        },
      ],
    }),
    [mode, c, values],
  )
  return <EChart option={option} resetKey={mode} height={300} />
}

/* -------------------------------------------------------------------------- */

export const analysisEntries: ChartEntry[] = [
  {
    id: 'scatter',
    nameVi: 'Biểu đồ phân tán',
    nameEn: 'Scatter plot',
    aliases: ['scatter', 'XY plot', 'tương quan', 'correlation chart'],
    job: 'correlation',
    status: 'ready',
    description:
      'Mỗi điểm là một quan sát, đặt theo hai chỉ số. Dạng duy nhất trả lời trực tiếp “X tăng thì Y có tăng theo không, và ngoại lệ nằm ở đâu”.',
    useWhen: [
      'Cần kiểm tra quan hệ giữa hai đại lượng liên tục.',
      'Cần soi ngoại lệ — điểm lạc ra khỏi đám mây chính.',
      'Có từ ~20 quan sát trở lên (ít hơn thì bảng là đủ).',
    ],
    avoidWhen: [
      'Một trong hai trục là danh mục → không phải scatter, đó là dot plot.',
      'Quá nhiều điểm chồng lên nhau → giảm opacity, hoặc chuyển sang heatmap mật độ.',
      'Đừng vẽ đường xu hướng rồi kết luận nhân quả — tương quan không phải nhân quả.',
      'Đây là dạng “mọi cặp màu cùng xuất hiện”: trần 3 màu. Nhiều nhóm hơn thì tách small multiples.',
    ],
    dataShape: 'Danh sách quan sát, mỗi quan sát có [x, y] và (tuỳ chọn) nhóm.',
    variants: [
      'Bubble chart — thêm chiều thứ ba bằng kích thước điểm (diện tích tỷ lệ với giá trị, KHÔNG phải bán kính).',
      'Thêm đường hồi quy — chỉ khi có ý nghĩa thống kê thật.',
      'Chia ô 4 phần theo hai đường trung vị để phân loại nhanh.',
    ],
    seriesCap: '1–3 nhóm màu.',
    demo: () => <ScatterDemo />,
    code: `series: shown.map((st, i) => ({
  name: st,
  type: 'scatter',
  symbolSize: 9,                     // ≥ 8px, nếu không thì không hover nổi
  data: points,                      // [[x, y], ...]
  itemStyle: {
    color: SERIES[mode][i],
    borderColor: c.surface, borderWidth: 2,   // vòng nền: điểm chồng nhau vẫn tách
    opacity: 0.9,
  },
})),
xAxis: valAxis(mode, vnNumber, { scale: true, splitLine: { show: false } }),

/* scale: true = KHÔNG ép trục về 0.
   Với scatter điều đó hợp lệ: ta đọc QUAN HỆ, không đọc độ lớn tuyệt đối.
   (Với biểu đồ cột thì ngược lại — cắt gốc là bóp méo.) */`,
  },

  {
    id: 'heatmap',
    nameVi: 'Bản đồ nhiệt',
    nameEn: 'Heatmap (matrix)',
    aliases: ['heatmap', 'ma trận nhiệt', 'calendar heatmap', 'cường độ'],
    job: 'pattern',
    status: 'ready',
    description:
      'Một lưới hai chiều, độ đậm của ô chở giá trị. Tìm QUY LUẬT theo lưới — cao điểm rơi vào khung giờ nào, ngày nào — thứ mà 56 cột trong một biểu đồ cột không bao giờ cho thấy.',
    useWhen: [
      'Hai chiều danh mục rõ ràng (giờ × thứ, tuần × tháng, sản phẩm × vùng).',
      'Cần thấy “vùng nóng” chứ không cần đọc số chính xác.',
      'Lưới đủ đặc — hầu hết ô đều có dữ liệu.',
    ],
    avoidWhen: [
      'Cần so sánh giá trị chính xác → mắt người ước lượng độ đậm rất tệ. Kèm thêm bảng, hoặc gắn số vào ô.',
      'Lưới thưa, nhiều ô rỗng → nhìn như nhiễu.',
      'Thang màu cầu vồng — cấm tuyệt đối. Sequential phải là MỘT hue, nhạt → đậm.',
    ],
    dataShape: 'Bộ ba [chỉ số cột, chỉ số dòng, giá trị] cho từng ô của lưới.',
    variants: [
      'Calendar heatmap — lưới ngày trong năm (kiểu contribution graph của GitHub).',
      'Ma trận tương quan — dùng thang DIVERGING (2 hue + xám ở giữa) vì giá trị có dấu.',
      'Gắn số vào ô khi lưới nhỏ (< ~40 ô).',
    ],
    demo: () => <HeatmapDemo />,
    code: `visualMap: {
  min, max,
  orient: 'horizontal', left: 'center', bottom: 0,
  inRange: { color: SEQUENTIAL[mode] },  // MỘT hue, 13 bậc; dark mode đảo chiều
},
series: [{
  type: 'heatmap',
  data: cells,                             // [[cột, dòng, giá trị], ...]
  itemStyle: { borderColor: c.surface, borderWidth: 2 },   // khe 2px màu nền
}]

/* Nếu giá trị có DẤU (chênh lệch so với trung bình, tương quan)
   thì đổi sang diverging: 2 hue + XÁM ở giữa.
   Không bao giờ đặt một hue thứ ba ở điểm giữa. */`,
  },
]
