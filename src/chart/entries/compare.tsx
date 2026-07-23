import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { Sparkline } from '../components/Figures'
import { CATEGORIES, revenueByCategory, revenueByBranch, branchByCategory, tableRows } from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, vnCompact, vnNumber, vnPercent } from '../lib/theme'
import { base, barItem, catAxis, columnItem, tooltip, valAxis, valueLabel } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function ColumnDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: tooltip(mode),
      xAxis: catAxis(
        mode,
        revenueByBranch.map((r) => r.branch),
      ),
      // Mọi cột đã được gắn nhãn trực tiếp → bỏ hẳn trục giá trị cho đỡ nhiễu.
      yAxis: { type: 'value', show: false },
      grid: { left: 8, right: 8, top: 28, bottom: 8, containLabel: true },
      series: [
        {
          name: 'Doanh thu 30 ngày',
          type: 'bar',
          barMaxWidth: MARK.barMaxWidth,
          data: revenueByBranch.map((r) => r.revenue),
          itemStyle: columnItem(SERIES[mode][0]),
          label: {
            show: true,
            position: 'top',
            formatter: valueLabel(vnCompact),
            color: c.inkSecondary,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
        },
      ],
    }),
    [mode, c.inkSecondary],
  )
  return <EChart option={option} resetKey={mode} height={260} />
}

function BarDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const rows = useMemo(() => [...revenueByCategory].sort((a, b) => a.revenue - b.revenue), [])
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: tooltip(mode),
      grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: catAxis(
        mode,
        rows.map((r) => r.category),
        { axisLine: { show: false } },
      ),
      series: [
        {
          name: 'Doanh thu 30 ngày',
          type: 'bar',
          barMaxWidth: MARK.barMaxWidth,
          data: rows.map((r) => r.revenue),
          itemStyle: barItem(SERIES[mode][0]),
          label: {
            show: true,
            position: 'right',
            formatter: valueLabel(vnCompact),
            color: c.inkSecondary,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
        },
      ],
    }),
    [mode, rows, c.inkSecondary],
  )
  return <EChart option={option} resetKey={mode} height={220} />
}

function GroupedBarDemo() {
  const mode = useMode()
  // Chỉ 3 danh mục: đây là mức mà màu tự nó đủ phân biệt cho mọi người xem.
  const shown = CATEGORIES.slice(0, 3)
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode, { legend: true }),
      tooltip: {
        ...tooltip(mode),
        valueFormatter: (v) => `${vnCompact(v as number)} ₫`,
      },
      xAxis: catAxis(
        mode,
        revenueByBranch.map((r) => r.branch),
      ),
      yAxis: valAxis(mode, vnCompact),
      series: shown.map((cat, i) => ({
        name: cat,
        type: 'bar' as const,
        barMaxWidth: MARK.barMaxWidth,
        barGap: '15%',
        data: branchByCategory[cat],
        itemStyle: columnItem(SERIES[mode][i]),
      })),
    }),
    [mode, shown],
  )
  return <EChart option={option} resetKey={mode} height={280} />
}

function TableSparkDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  return (
    <table className="dtable">
      <thead>
        <tr>
          <th>Chi nhánh</th>
          <th className="num">Doanh thu 30 ngày</th>
          <th className="num">7 ngày qua</th>
          <th className="num">% chỉ tiêu</th>
          <th>Diễn biến 14 ngày</th>
        </tr>
      </thead>
      <tbody>
        {tableRows.map((r) => (
          <tr key={r.branch}>
            <td>{r.branch}</td>
            <td className="num">{vnNumber(Math.round(r.revenue / 1e6))} tr₫</td>
            <td className="num" style={{ color: r.delta >= 0 ? c.deltaGood : c.deltaBad }}>
              {r.delta >= 0 ? '▲' : '▼'} {vnPercent(Math.abs(r.delta))}
            </td>
            <td className="num">{vnPercent(r.completion, 0)}</td>
            <td>
              <Sparkline data={r.spark} width={120} height={26} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* -------------------------------------------------------------------------- */

export const compareEntries: ChartEntry[] = [
  {
    id: 'column',
    nameVi: 'Biểu đồ cột',
    nameEn: 'Column chart (vertical bar)',
    aliases: ['bar chart dọc', 'vertical bar', 'cột đứng'],
    job: 'compare',
    status: 'ready',
    description:
      'Cột mọc từ một đường gốc chung, chiều cao chở giá trị. Dạng so sánh chính xác nhất mà mắt người đọc được — độ dài là kênh mã hoá mạnh nhất.',
    useWhen: [
      'So sánh 3–12 hạng mục có tên ngắn.',
      'Trục giá trị bắt đầu từ 0 (bắt buộc — cắt gốc là bóp méo).',
      'Thứ tự hạng mục tự nhiên (thời gian) hoặc sắp xếp theo giá trị.',
    ],
    avoidWhen: [
      'Tên hạng mục dài → xoay nhãn 45° là dấu hiệu bạn nên dùng thanh ngang.',
      'Hơn ~12 hạng mục → thanh ngang hoặc bảng.',
      'KHÔNG BAO GIỜ cắt gốc trục để “nhìn cho rõ chênh lệch”. Cần soi chênh lệch nhỏ thì vẽ đường, hoặc vẽ chính phần chênh lệch.',
    ],
    dataShape: 'Một cột danh mục + một cột giá trị số. Mỗi hạng mục đúng một dòng.',
    variants: [
      'Sắp xếp giảm dần (mặc định nên dùng) hoặc theo thứ tự tự nhiên.',
      'Emphasis: tô đậm một cột, các cột còn lại xám — khi câu chuyện là về một hạng mục.',
      'Gắn nhãn hết mọi cột → bỏ luôn trục giá trị (như demo này).',
    ],
    seriesCap: '1 series. Nhiều series → grouped bar.',
    demo: () => <ColumnDemo />,
    code: `const option = {
  ...base(mode),
  xAxis: catAxis(mode, branchs),
  yAxis: { type: 'value', show: false },   // đã nhãn hết → bỏ trục
  series: [{
    type: 'bar',
    barMaxWidth: 24,                        // KHÔNG lấp đầy band, chừa khoảng thở
    data: values,
    itemStyle: columnItem(SERIES[mode][0]), // bo 4px ở đỉnh, vuông ở chân
    label: {
      show: true, position: 'top',
      formatter: p => vnCompact(p.value),
      color: CHROME[mode].inkSecondary,     // chữ mặc MỰC, không mặc màu series
    },
  }],
}`,
  },

  {
    id: 'bar',
    nameVi: 'Thanh ngang',
    nameEn: 'Bar chart (horizontal)',
    aliases: ['horizontal bar', 'thanh nằm', 'ranking chart'],
    job: 'compare',
    status: 'ready',
    description:
      'Cột nằm ngang. Cùng sức mạnh mã hoá như cột đứng, nhưng nhãn hạng mục chạy ngang nên đọc thoải mái dù tên dài.',
    useWhen: [
      'Tên hạng mục dài (tên chi nhánh, tên sản phẩm, câu trả lời khảo sát).',
      'Bảng xếp hạng — sắp xếp giảm dần, top-N.',
      'Nhiều hạng mục (10–25) — cuộn dọc tự nhiên hơn cuộn ngang.',
    ],
    avoidWhen: [
      'Trục là thời gian → thời gian phải chạy ngang, dùng cột đứng hoặc đường.',
      'Chỉ có 2–3 hạng mục tên ngắn → cột đứng gọn hơn.',
    ],
    dataShape: 'Giống cột đứng: một cột danh mục + một cột giá trị.',
    variants: [
      'Top-N + dòng “Khác” gộp phần đuôi.',
      'Nhãn giá trị đặt ở đầu thanh; nếu thanh quá ngắn thì đặt ra ngoài, không bao giờ cắt chữ.',
    ],
    seriesCap: '1 series.',
    demo: () => <BarDemo />,
    code: `const option = {
  ...base(mode),
  xAxis: { type: 'value', show: false },
  yAxis: catAxis(mode, categories, { axisLine: { show: false } }),
  grid: { right: 56 },                      // chừa chỗ cho nhãn ở đầu thanh
  series: [{
    type: 'bar',
    barMaxWidth: 24,
    data: values,
    itemStyle: barItem(SERIES[mode][0]),     // bo 4px ở đầu PHẢI
    label: { show: true, position: 'right', formatter: p => vnCompact(p.value) },
  }],
}

// Sắp xếp tăng dần khi vẽ ngang: ECharts vẽ y từ dưới lên,
// nên mảng tăng dần sẽ hiện ra thành xếp hạng giảm dần từ trên xuống.`,
  },

  {
    id: 'grouped-bar',
    nameVi: 'Cột nhóm',
    nameEn: 'Grouped bar chart',
    aliases: ['clustered bar', 'cột ghép', 'side-by-side bar'],
    job: 'compare',
    status: 'ready',
    description:
      'Nhiều series đứng cạnh nhau trong từng nhóm. Dùng khi phải so sánh CẢ hai chiều: giữa các nhóm và giữa các series trong một nhóm.',
    useWhen: [
      '2–3 series, 3–8 nhóm. Vượt mức đó là rừng cột.',
      'Người xem cần so sánh series-với-series trong cùng một nhóm (ví dụ kỳ này vs kỳ trước).',
    ],
    avoidWhen: [
      'Câu hỏi là “tổng bao nhiêu và cơ cấu ra sao” → stacked bar, vì cột nhóm không cho thấy tổng.',
      'Từ 4 series trở lên: vàng và cam bắt đầu đứng cạnh nhau, phải có nhãn trực tiếp — thường small multiples là lựa chọn đúng hơn.',
      'Số nhóm × số series > ~24 cột → tách thành small multiples.',
    ],
    dataShape: 'Ma trận nhóm × series. Mỗi series là một mảng cùng độ dài với danh sách nhóm.',
    variants: [
      'Small multiples: mỗi series một khung nhỏ riêng, dùng chung trục — đọc tốt hơn hẳn khi nhiều series.',
      'Cột nhóm 2 series “kỳ này vs kỳ trước” — biến thể phổ biến nhất.',
    ],
    seriesCap: '2–3 thoải mái, 4 phải có nhãn trực tiếp, quá 4 thì tách khung.',
    demo: () => <GroupedBarDemo />,
    code: `series: categories.map((cat, i) => ({
  name: cat,
  type: 'bar',
  barMaxWidth: 24,
  barGap: '15%',                       // khe giữa các cột trong cùng nhóm
  data: matrix[cat],
  itemStyle: columnItem(SERIES[mode][i]),   // GÁN THEO THỨ TỰ SLOT, không xoay vòng
}))

// Legend luôn bật khi ≥ 2 series — đó là kênh danh tính đáng tin,
// không bắt người xem tự dò màu.`,
  },

  {
    id: 'table-sparkline',
    nameVi: 'Bảng có sparkline',
    nameEn: 'Table with sparklines',
    aliases: ['data table', 'bảng số liệu', 'small multiples table'],
    job: 'compare',
    status: 'ready',
    description:
      'Bảng số chính xác, mỗi dòng kèm một đường nhỏ cho biết xu hướng. Là lựa chọn ĐÚNG khi có quá nhiều hạng mục để vẽ, hoặc khi người xem cần con số chính xác chứ không phải hình dạng.',
    useWhen: [
      'Nhiều hơn ~7 hạng mục mà hạng mục nào cũng có nghĩa.',
      'Người xem sẽ copy số ra Excel, hoặc cần đối chiếu chính xác.',
      'Cần nhiều chỉ số cho cùng một đối tượng (doanh thu, %, tiến độ) — bảng chở nhiều cột dễ hơn biểu đồ.',
    ],
    avoidWhen: [
      'Chỉ có 3–5 dòng và một chỉ số → biểu đồ đọc nhanh hơn.',
      'Đừng để mỗi dòng một sparkline có thang đo riêng rồi so sánh chúng với nhau — hình dạng so được, độ cao thì không.',
    ],
    dataShape: 'Mỗi dòng: khoá + các chỉ số + một mảng ~12–14 điểm cho sparkline.',
    variants: [
      'Thêm thanh nền trong ô (bar-in-cell) thay cho sparkline khi cần so độ lớn.',
      'Cho phép sắp xếp theo cột — bảng nào cũng nên sắp xếp được.',
    ],
    demo: () => <TableSparkDemo />,
    code: `<td className="num">{vnNumber(Math.round(r.revenue / 1e6))} tr₫</td>
<td className="num" style={{ color: r.delta >= 0 ? c.deltaGood : c.deltaBad }}>
  {r.delta >= 0 ? '▲' : '▼'} {vnPercent(Math.abs(r.delta))}
</td>
<td><Sparkline data={r.spark} width={120} height={26} /></td>

/* Cột số dùng font-variant-numeric: tabular-nums để các chữ số
   thẳng hàng dọc. (Con số lớn đứng một mình thì KHÔNG dùng tabular —
   nhìn lỏng lẻo.) */`,
  },
]
