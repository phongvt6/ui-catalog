import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { revenueByBranch, branchGeo } from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, vnCompact } from '../lib/theme'
import { tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function BubbleMapDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const maxRev = Math.max(...revenueByBranch.map((r) => r.revenue))
  const points = useMemo(
    () =>
      revenueByBranch.map(({ branch, revenue }) => ({
        name: branch,
        value: [branchGeo[branch].lon, branchGeo[branch].lat, revenue],
      })),
    [],
  )
  // Sắp theo vĩ độ để đường nối chạy đúng chiều Bắc → Nam.
  const route = useMemo(
    () =>
      [...points]
        .sort((a, b) => (b.value[1] as number) - (a.value[1] as number))
        .map((p) => [p.value[0], p.value[1]]),
    [points],
  )

  const option = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      textStyle: { fontFamily: FONT_STACK, color: c.inkSecondary },
      tooltip: {
        ...tooltip(mode, 'item'),
        formatter: (p: unknown) => {
          const d = p as { name: string; value: number[] }
          return `${d.name}<br/><b>${vnCompact(d.value[2])} ₫</b>`
        },
      },
      grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
      xAxis: valAxis(mode, (v) => `${v.toFixed(1)}°Đ`, {
        min: 105.5,
        max: 107,
        splitNumber: 3,
        splitLine: { show: false },
      }),
      yAxis: valAxis(mode, (v) => `${v.toFixed(1)}°B`, { min: 17, max: 21, splitNumber: 4 }),
      series: [
        {
          // Tuyến nối — chỉ là ngữ cảnh, nên vẽ bằng màu lưới.
          name: 'Trục tuyến nối',
          type: 'line',
          silent: true,
          showSymbol: false,
          lineStyle: { color: c.grid, width: 3 },
          data: route,
          z: 1,
        },
        {
          name: 'Doanh thu 30 ngày',
          type: 'scatter',
          data: points,
          // DIỆN TÍCH tỷ lệ với giá trị → bán kính theo căn bậc hai.
          symbolSize: (v: number[]) => 14 + 34 * Math.sqrt(v[2] / maxRev),
          itemStyle: {
            color: SERIES[mode][0],
            opacity: 0.75,
            borderColor: c.surface,
            borderWidth: MARK.ring,
          },
          label: {
            show: true,
            position: 'right',
            formatter: (p: { name: string }) => p.name,
            color: c.inkSecondary,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
          z: 3,
        },
      ],
    }),
    [mode, c, points, route, maxRev],
  )
  return <EChart option={option} resetKey={mode} height={360} />
}

/* -------------------------------------------------------------------------- */

export const geoEntries: ChartEntry[] = [
  {
    id: 'bubble-map',
    nameVi: 'Bản đồ điểm (bubble map)',
    nameEn: 'Bubble / symbol map',
    aliases: ['proportional symbol map', 'bản đồ bong bóng', 'điểm trên bản đồ'],
    job: 'geo',
    status: 'ready',
    description:
      'Mỗi địa điểm một chấm, diện tích chấm chở giá trị. Không cần file bản đồ nền: chỉ cần kinh độ/vĩ độ là vẽ được — và nó tránh được lỗi lớn nhất của choropleth (tỉnh to trông “nhiều” hơn).',
    useWhen: [
      'Dữ liệu gắn với ĐIỂM cụ thể: cửa hàng, chi nhánh, kho, dự án.',
      'Giá trị là số tuyệt đối (doanh thu, số lượng) — bubble map không bị lỗi diện tích như choropleth.',
      'Dưới ~50 điểm.',
    ],
    avoidWhen: [
      'Cho bán kính tỷ lệ thẳng với giá trị — đó là bóp méo kinh điển: giá trị gấp đôi sẽ trông gấp BỐN. Luôn cho DIỆN TÍCH tỷ lệ, tức bán kính theo căn bậc hai.',
      'Các điểm quá gần nhau → bong bóng chồng lấn; gộp theo cụm hoặc dùng bản đồ nền tô màu.',
      'Câu hỏi thật ra chỉ là xếp hạng → thanh ngang chính xác hơn bản đồ rất nhiều. Chỉ dùng bản đồ khi VỊ TRÍ là một phần câu chuyện.',
    ],
    dataShape: 'Mỗi điểm: `[kinh độ, vĩ độ, giá trị]` + tên.',
    variants: [
      'Có bản đồ nền: đăng ký GeoJSON rồi đổi sang `coordinateSystem: "geo"` — phần còn lại giữ nguyên.',
      'Không có bản đồ nền (như demo): vẽ trên trục kinh/vĩ độ thường; đủ dùng khi các điểm nằm dọc một trục.',
      'Thêm màu để chở chiều thứ hai (tăng trưởng) trong khi kích thước chở quy mô.',
    ],
    seriesCap: '1 nhóm màu; nhiều nhóm thì tối đa 3 (dạng “mọi cặp cùng xuất hiện”).',
    demo: () => <BubbleMapDemo />,
    code: `series: [{
  type: 'scatter',
  data: points,                    // [{ name, value: [lon, lat, giá trị] }]
  // DIỆN TÍCH tỷ lệ với giá trị → bán kính lấy CĂN BẬC HAI.
  // Nếu để symbolSize tỷ lệ thẳng với giá trị thì gấp đôi sẽ trông gấp bốn.
  symbolSize: v => 14 + 34 * Math.sqrt(v[2] / maxValue),
  itemStyle: { color: SERIES[mode][0], opacity: 0.75,
               borderColor: c.surface, borderWidth: 2 },
}]

/* Có bản đồ nền thì chỉ đổi hai dòng:
   echarts.registerMap('VN', geoJson)
   series: [{ type: 'scatter', coordinateSystem: 'geo', ... }],
   geo: { map: 'VN', itemStyle: { areaColor: c.plane, borderColor: c.axis } } */`,
  },

  {
    id: 'choropleth-vn',
    nameVi: 'Bản đồ nền tô màu (choropleth)',
    nameEn: 'Choropleth map',
    aliases: ['bản đồ nhiệt tỉnh thành', 'map', 'geo', 'tô màu theo tỉnh'],
    job: 'geo',
    status: 'planned',
    description:
      'Tô màu từng tỉnh/thành theo giá trị, dùng thang sequential một hue. Chưa dựng demo vì cần file GeoJSON ranh giới tỉnh — xem phần code bên dưới để biết cách gắn vào.',
    useWhen: [
      'Đơn vị dữ liệu chính là VÙNG (tỉnh, quận, vùng bán hàng), không phải điểm.',
      'Giá trị đã được CHUẨN HOÁ theo dân số / diện tích / số cửa hàng.',
      'Vị trí địa lý thật sự là một phần câu chuyện.',
    ],
    avoidWhen: [
      'Dùng số TUYỆT ĐỐI — lỗi phổ biến nhất: tỉnh to tự nhiên trông “nhiều” hơn chỉ vì nó rộng. Luôn chuẩn hoá, hoặc dùng bubble map.',
      'Chỉ cần xếp hạng → thanh ngang chính xác hơn nhiều; bản đồ chỉ thắng khi cần thấy quan hệ không gian.',
      'Nhiều vùng không có dữ liệu → mảng trắng loang lổ đọc như lỗi.',
      'Thang cầu vồng — cấm tuyệt đối, như mọi thang sequential khác.',
    ],
    dataShape: 'Mã tỉnh/thành + giá trị, khớp đúng thuộc tính `name` trong GeoJSON.',
    variants: [
      'Tile grid map (mỗi tỉnh một ô vuông bằng nhau) — bỏ hình dạng thật để mọi vùng có trọng số thị giác như nhau.',
      'Cartogram: biến dạng vùng theo giá trị.',
    ],
    code: `import * as echarts from 'echarts'
import vnGeo from './vn-provinces.geo.json'   // cần tự thêm file này

echarts.registerMap('VN', vnGeo)

const option = {
  geo: { map: 'VN', roam: false,
         itemStyle: { areaColor: c.plane, borderColor: c.axis, borderWidth: 1 } },
  visualMap: { min, max, inRange: { color: SEQUENTIAL[mode] } },  // MỘT hue
  series: [{ type: 'map', map: 'VN',
             data: rows.map(r => ({ name: r.province, value: r.perCapita })) }],
}

/* r.perCapita chứ không phải r.revenue — luôn chuẩn hoá trước khi tô. */`,
  },
]
