import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { Sparkline, StatTile } from '../components/Figures'
import {
  dailyTotal,
  dates,
  kpis,
  revenueByCategory,
  shortDate,
  tableRows,
} from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, vnCompact, vnNumber, vnPercent } from '../lib/theme'
import { areaFill, barItem, base, catAxis, lineSeries, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */

function MainTrend() {
  const mode = useMode()
  const c = CHROME[mode]
  const color = SERIES[mode][0]
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 8, right: 16, top: 12, bottom: 4, containLabel: true },
      xAxis: catAxis(mode, dates.map(shortDate), {
        boundaryGap: false,
        axisLabel: { interval: 6, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu toàn chuỗi',
          ...lineSeries(color, mode),
          data: dailyTotal.map((d) => d.revenue),
          areaStyle: areaFill(color),
        },
      ],
    }),
    [mode, c, color],
  )
  return <EChart option={option} resetKey={mode} height={200} />
}

function SideBreakdown() {
  const mode = useMode()
  const c = CHROME[mode]
  const rows = useMemo(() => [...revenueByCategory].sort((a, b) => a.revenue - b.revenue), [])
  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: tooltip(mode),
      grid: { left: 4, right: 52, top: 12, bottom: 4, containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: catAxis(
        mode,
        rows.map((r) => r.category),
        { axisLine: { show: false } },
      ),
      series: [
        {
          name: 'Doanh thu',
          type: 'bar',
          barMaxWidth: MARK.barMaxWidth,
          data: rows.map((r) => r.revenue),
          itemStyle: barItem(SERIES[mode][0]),
          label: {
            show: true,
            position: 'right',
            formatter: (p: { value: unknown }) => vnCompact(Number(p.value)),
            color: c.inkSecondary,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
        },
      ],
    }),
    [mode, c, rows],
  )
  return <EChart option={option} resetKey={mode} height={200} />
}

function DashboardDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  return (
    <div className="dash">
      {/* 1. Bộ lọc gom thành MỘT hàng trên cùng, áp cho cả trang. */}
      <div className="dash-filters">
        <span className="dash-chip is-on">30 ngày qua</span>
        <span className="dash-chip">Tất cả chi nhánh</span>
        <span className="dash-chip">Tất cả danh mục</span>
        <span className="dash-filter-note">Bộ lọc áp cho toàn bộ khối bên dưới</span>
      </div>

      {/* 2. Hàng KPI: câu trả lời trước, chi tiết sau. */}
      <div className="kpi-row">
        <StatTile
          label="Doanh thu hôm nay"
          value={`${vnCompact(kpis.todayRevenue)} ₫`}
          delta={kpis.todayDelta}
          deltaLabel="so với hôm qua"
          spark={kpis.spark}
          hero
        />
        <StatTile
          label="Doanh thu 7 ngày"
          value={`${vnCompact(kpis.week)} ₫`}
          delta={kpis.weekDelta}
          deltaLabel="so với 7 ngày trước"
        />
        <StatTile label="Số đơn hôm nay" value={vnNumber(kpis.ordersToday)} />
      </div>

      {/* 3. Một biểu đồ DẪN CHUYỆN chiếm phần lớn diện tích, một biểu đồ phụ bên cạnh. */}
      <div className="dash-charts">
        <section className="dash-panel is-main">
          <h4>Doanh thu theo ngày</h4>
          <MainTrend />
        </section>
        <section className="dash-panel">
          <h4>Cơ cấu danh mục</h4>
          <SideBreakdown />
        </section>
      </div>

      {/* 4. Bảng chi tiết ở dưới cùng, cho ai cần con số chính xác. */}
      <section className="dash-panel">
        <h4>Chi tiết theo chi nhánh</h4>
        <table className="dtable">
          <thead>
            <tr>
              <th>Chi nhánh</th>
              <th className="num">Doanh thu</th>
              <th className="num">7 ngày</th>
              <th className="num">% chỉ tiêu</th>
              <th>Diễn biến</th>
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
                  <Sparkline data={r.spark} width={100} height={24} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="dash-foot" style={{ color: c.inkMuted }}>
        {mode === 'dark' ? '☾' : '☀'} Cùng một bố cục đọc được ở cả hai chế độ sáng/tối — vì
        mọi màu đều lấy từ token, không hard-code.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export const dashboardEntries: ChartEntry[] = [
  {
    id: 'dashboard-patterns',
    nameVi: 'Mẫu bố cục dashboard',
    nameEn: 'Dashboard layout patterns',
    aliases: ['layout', 'bố cục', 'khung dashboard', 'template'],
    job: 'single-value',
    status: 'ready',
    description:
      'Không phải một biểu đồ, mà là cách XẾP nhiều biểu đồ. Thứ tự đọc: bộ lọc → hàng KPI (câu trả lời) → một biểu đồ dẫn chuyện → biểu đồ phụ → bảng chi tiết. Người xem trả lời được câu hỏi của mình ở tầng nào thì dừng ở tầng đó.',
    useWhen: [
      'Bất cứ trang nào có nhiều hơn 2 biểu đồ.',
      'Nhiều nhóm người xem khác nhau: lãnh đạo dừng ở hàng KPI, chuyên viên xuống tới bảng.',
    ],
    avoidWhen: [
      'Chỉ có một biểu đồ → không cần khung, đừng bịa thêm KPI cho “đầy trang”.',
      'Đừng rải bộ lọc khắp nơi cạnh từng biểu đồ — người xem sẽ không biết lọc nào áp cho cái gì.',
      'Đừng đặt hai biểu đồ quan trọng ngang nhau cùng kích thước: nếu mọi thứ đều nổi bật thì không gì nổi bật.',
    ],
    dataShape: '—',
    variants: [
      'Trang một cột trên mobile: KPI xếp dọc, bảng cho cuộn ngang trong khung riêng.',
      'Drill-down: click một cột → lọc toàn trang theo cột đó.',
      'Chọn một chi nhánh ở bộ lọc → biểu đồ chính chuyển sang dạng “nhấn mạnh một đường”.',
    ],
    seriesCap: '3–5 ô KPI; 2–4 biểu đồ mỗi trang.',
    demo: () => <DashboardDemo />,
    code: `<div className="dash">
  {/* 1. Bộ lọc: MỘT hàng trên cùng, áp cho cả trang */}
  <div className="dash-filters">…</div>

  {/* 2. Hàng KPI: câu trả lời trước, chi tiết sau. Đúng MỘT hero figure */}
  <div className="kpi-row"><StatTile hero … /><StatTile … /><StatTile … /></div>

  {/* 3. Một biểu đồ dẫn chuyện chiếm ~2/3, một biểu đồ phụ bên cạnh */}
  <div className="dash-charts">      /* grid-template-columns: 2fr 1fr */
    <section className="dash-panel is-main">…</section>
    <section className="dash-panel">…</section>
  </div>

  {/* 4. Bảng chi tiết ở dưới cùng */}
  <section className="dash-panel"><table className="dtable">…</table></section>
</div>

/* Ba lỗi bố cục hay gặp nhất:
   1. Rải bộ lọc cạnh từng biểu đồ → không ai biết lọc nào áp cho cái gì.
   2. Mọi panel cùng kích thước → không có thứ bậc, mắt không biết nhìn đâu trước.
   3. Nhồi 8 ô KPI cho "đầy trang" → thành bức tường số, không ai đọc. */`,
  },
]
