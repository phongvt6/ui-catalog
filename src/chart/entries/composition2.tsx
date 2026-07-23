import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { categoryTree, revenueByCategory } from '../data/sample'
import {
  CHROME,
  FONT_STACK,
  MARK,
  SERIES,
  labelInk,
  towardSurface,
  vnCompact,
  vnPercent,
} from '../lib/theme'
import { tooltip } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function TreemapDemo() {
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
          return `${d.name}<br/><b>${vnCompact(d.value)} ₫</b>`
        },
      },
      series: [
        {
          type: 'treemap',
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          width: '100%',
          height: '100%',
          // Khe 2px màu nền, giống mọi mark chạm nhau khác trong catalog.
          itemStyle: { borderColor: c.surface, borderWidth: MARK.gap, gapWidth: MARK.gap },
          levels: [
            {
              // Cấp 1 (danh mục): mỗi ngành một slot màu, theo đúng thứ tự.
              itemStyle: { borderColor: c.surface, borderWidth: 4, gapWidth: 4 },
              label: { show: false },
            },
            {
              itemStyle: { borderColor: c.surface, borderWidth: MARK.gap, gapWidth: MARK.gap },
            },
          ],
          label: { show: true, fontSize: 11, fontFamily: FONT_STACK },
          upperLabel: {
            show: true,
            height: 20,
            fontSize: 11,
            fontFamily: FONT_STACK,
            color: c.inkSecondary,
          },
          data: categoryTree.map((node, i) => {
            const parent = SERIES[mode][i]
            return {
              name: node.name,
              itemStyle: { color: parent },
              // Cấp 2 (chi nhánh): GIỮ NGUYÊN hue của cha, chỉ nhạt dần về phía màu
              // nền — nên không tiêu thêm slot màu categorical nào.
              children: node.children.map((child, j) => {
                const color = towardSurface(parent, mode, 0.1 + j * 0.14)
                return {
                  ...child,
                  itemStyle: { color },
                  label: { color: labelInk(color) },
                }
              }),
            }
          }),
        },
      ],
    }),
    [mode, c],
  )
  return <EChart option={option} resetKey={mode} height={320} />
}

function WaffleDemo() {
  const mode = useMode()
  const total = revenueByCategory.reduce((s, x) => s + x.revenue, 0)
  // Làm tròn về 100 ô sao cho tổng luôn đúng 100 — phần dư dồn vào nhóm lớn nhất.
  const cells = useMemo(() => {
    const raw = revenueByCategory.map((r) => (r.revenue / total) * 100)
    const rounded = raw.map(Math.floor)
    let left = 100 - rounded.reduce((s, x) => s + x, 0)
    const order = raw
      .map((v, i) => ({ i, frac: v - Math.floor(v) }))
      .sort((a, b) => b.frac - a.frac)
    for (const { i } of order) {
      if (left <= 0) break
      rounded[i]++
      left--
    }
    return revenueByCategory.flatMap((r, i) =>
      Array.from({ length: rounded[i] }, () => ({ cat: r.category, slot: i })),
    )
  }, [total])

  return (
    <div className="waffle-wrap">
      <div className="waffle" role="img" aria-label="Cơ cấu doanh thu theo danh mục, mỗi ô bằng 1%">
        {cells.map((cell, i) => (
          <span key={i} className="waffle-cell" style={{ background: SERIES[mode][cell.slot] }} />
        ))}
      </div>
      <ul className="waffle-legend">
        {revenueByCategory.map((r, i) => (
          <li key={r.category}>
            <span className="key-swatch" style={{ background: SERIES[mode][i] }} />
            {r.category}
            <b>{vnPercent((r.revenue / total) * 100, 0)}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SunburstDemo() {
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
          return `${d.name}<br/><b>${vnCompact(d.value)} ₫</b>`
        },
      },
      series: [
        {
          type: 'sunburst',
          radius: ['16%', '92%'],
          nodeClick: false,
          itemStyle: { borderColor: c.surface, borderWidth: MARK.gap },
          levels: [
            {},
            {
              // Vòng trong: 4 danh mục, 4 slot màu.
              r0: '16%',
              r: '52%',
              label: { rotate: 'tangential', fontSize: 11, fontFamily: FONT_STACK },
            },
            {
              // Vòng ngoài: chi nhánh — cùng hue với cha, nhạt hơn.
              r0: '54%',
              r: '92%',
              label: { fontSize: 10, fontFamily: FONT_STACK, minAngle: 12 },
            },
          ],
          data: categoryTree.map((node, i) => {
            const parent = SERIES[mode][i]
            return {
              name: node.name,
              itemStyle: { color: parent },
              label: { color: labelInk(parent) },
              // Cùng hue với cha, nhạt dần — ECharts KHÔNG tự kế thừa màu cha
              // cho sunburst, nên phải gán tường minh.
              children: node.children.map((child, j) => {
                const color = towardSurface(parent, mode, 0.12 + j * 0.13)
                return {
                  ...child,
                  itemStyle: { color },
                  label: { color: labelInk(color) },
                }
              }),
            }
          }),
        },
      ],
    }),
    [mode, c],
  )
  return <EChart option={option} resetKey={mode} height={340} />
}

/* -------------------------------------------------------------------------- */

export const composition2Entries: ChartEntry[] = [
  {
    id: 'treemap',
    nameVi: 'Treemap',
    nameEn: 'Treemap',
    aliases: ['ô vuông lồng', 'bản đồ cây', 'mosaic'],
    job: 'hierarchy',
    status: 'ready',
    description:
      'Diện tích ô chở giá trị, ô lồng nhau chở cấp bậc. Nhồi được rất nhiều hạng mục vào một khung chữ nhật — đổi lại độ chính xác khi đọc: mắt người so diện tích còn tệ hơn so góc.',
    useWhen: [
      'Nhiều hạng mục (20–200) nằm trong một cấu trúc phân cấp.',
      'Thông điệp là “cái nào chiếm phần lớn, cái nào không đáng kể”.',
      'Không gian bị bó hẹp mà vẫn phải trình bày cả cây.',
    ],
    avoidWhen: [
      'Cần so sánh chính xác hai hạng mục — dùng bar chart, độ dài đọc chính xác hơn diện tích rất nhiều.',
      'Cấu trúc phẳng, dưới ~15 hạng mục → thanh ngang.',
      'Có giá trị âm hoặc bằng 0 → treemap không biểu diễn được.',
      'Quá 3 cấp → nhãn không còn chỗ, ô nhỏ như hạt vừng.',
    ],
    dataShape: 'Cây `{ name, value }` hoặc `{ name, children: [...] }`. Giá trị phải không âm.',
    variants: [
      'Ô cấp 2 dùng cùng hue với cha, chỉ đổi độ bão hoà — đó là cách giữ đúng trần 8 màu dù có 20 ô.',
      'Tô màu theo một chỉ số THỨ HAI (tăng trưởng) trong khi diện tích chở doanh thu — mạnh, nhưng phải ghi rõ ở chú giải.',
      'Cho click để đi sâu (drill-down) khi cây nhiều cấp.',
    ],
    seriesCap: 'Cấp 1 tối đa 8 hạng mục (bằng số slot màu); cấp 2 tuỳ ý.',
    demo: () => <TreemapDemo />,
    code: `series: [{
  type: 'treemap',
  itemStyle: { borderColor: c.surface, borderWidth: 2, gapWidth: 2 },
  levels: [
    { itemStyle: { borderWidth: 4, gapWidth: 4 }, label: { show: false } },  // cấp 1
    { colorSaturation: [0.35, 0.75] },   // cấp 2: CÙNG HUE với cha, khác độ bão hoà
  ],
  data: categoryTree.map((node, i) => ({
    ...node,
    itemStyle: { color: SERIES[mode][i] },   // chỉ cấp 1 mới tiêu slot màu
  })),
}]`,
  },

  {
    id: 'waffle',
    nameVi: 'Waffle chart',
    nameEn: 'Waffle / unit chart',
    aliases: ['lưới 100 ô', 'unit chart', 'pictogram', 'square pie'],
    job: 'composition',
    status: 'ready',
    description:
      'Lưới 10×10, mỗi ô bằng 1%. Người xem đếm ô thay vì ước lượng góc, nên đọc tỷ lệ chính xác hơn hẳn pie — đặc biệt với người không quen đọc biểu đồ.',
    useWhen: [
      'Trình bày một cơ cấu cho khán giả rộng (báo cáo nội bộ, slide họp).',
      '2–4 nhóm, và con số phần trăm chính là thông điệp.',
      'Muốn nhấn “cứ 100 đồng doanh thu thì 58 đồng đến từ nhóm Thiết bị”.',
    ],
    avoidWhen: [
      'Nhiều hơn 4–5 nhóm → lưới thành khảm màu, hết đếm nổi.',
      'Tỷ lệ rất nhỏ (0,3%) → không có ô nào để biểu diễn; làm tròn sẽ nói dối.',
      'Cần so sánh cơ cấu giữa nhiều nhóm → cột chồng 100%.',
    ],
    dataShape: 'Danh sách `{ tên, tỷ lệ % }` cộng lại bằng 100.',
    variants: [
      'Đổi ô vuông thành icon (hình người, hình xe) → pictogram, hợp khi đơn vị là “người”.',
      'Lưới 5×20 hoặc 20×5 nếu bố cục cần ngang/dọc.',
    ],
    seriesCap: '2–4 nhóm.',
    demo: () => <WaffleDemo />,
    code: `// Làm tròn phải đảm bảo tổng đúng 100 ô: lấy phần nguyên trước,
// rồi rải phần dư cho các nhóm có phần thập phân lớn nhất.
const rounded = raw.map(Math.floor)
let left = 100 - rounded.reduce((s, x) => s + x, 0)
for (const { i } of raw.map((v, i) => ({ i, frac: v % 1 }))
                       .sort((a, b) => b.frac - a.frac)) {
  if (left-- <= 0) break
  rounded[i]++
}

.waffle { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; }
.waffle-cell { aspect-ratio: 1; border-radius: 2px; }`,
  },

  {
    id: 'sunburst',
    nameVi: 'Sunburst',
    nameEn: 'Sunburst / icicle',
    aliases: ['pie nhiều lớp', 'radial treemap', 'vòng đồng tâm'],
    job: 'hierarchy',
    status: 'ready',
    description:
      'Pie nhiều vòng đồng tâm: vòng trong là cấp cha, vòng ngoài là cấp con nằm đúng trong cung của cha. Thấy được cả tổng thể lẫn đường đi xuống từng nhánh.',
    useWhen: [
      'Cấu trúc 2–3 cấp, và quan hệ cha–con là thông điệp chính.',
      'Số nhánh mỗi cấp ít (≤ 8 ở cấp 1).',
      'Trình bày, giới thiệu — sunburst gây ấn tượng tốt hơn là để đọc số.',
    ],
    avoidWhen: [
      'Quá 3 cấp → vòng ngoài mỏng như sợi chỉ, nhãn không nhét được. Dùng icicle (chính nó nhưng duỗi thẳng thành thanh) — dễ đọc hơn nhiều.',
      'Cần đọc giá trị → góc là kênh yếu; kèm bảng.',
      'Nhánh có giá trị rất chênh lệch → nhánh nhỏ biến mất.',
    ],
    dataShape: 'Cây `{ name, value, children }`, giống treemap.',
    variants: [
      'Icicle / partition: cùng dữ liệu, vẽ thành thanh xếp tầng — luôn dễ đọc hơn khi từ 3 cấp trở lên.',
      'Cho click để zoom vào một nhánh.',
    ],
    seriesCap: 'Cấp 1 tối đa 8; cấp 2 dùng sắc độ của cha.',
    demo: () => <SunburstDemo />,
    code: `series: [{
  type: 'sunburst',
  radius: ['16%', '92%'],
  itemStyle: { borderColor: c.surface, borderWidth: 2 },
  levels: [
    {},                                    // phần tử rỗng = tâm, bắt buộc có
    { r0: '16%', r: '52%', label: { rotate: 'tangential' } },   // vòng trong
    { r0: '54%', r: '92%', colorSaturation: [0.3, 0.7],         // vòng ngoài
      label: { minAngle: 12 } },           // cung hẹp hơn 12° thì bỏ nhãn
  ],
  data: categoryTree.map((n, i) => ({ ...n, itemStyle: { color: SERIES[mode][i] } })),
}]`,
  },
]
