import { useMemo, useState } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { Sparkline } from '../components/Figures'
import {
  benchmark,
  dailyTotal,
  dates,
  events,
  forecast,
  shortDate,
  targetBand,
} from '../data/sample'
import {
  CHROME,
  FONT_STACK,
  MARK,
  SERIES,
  STATUS,
  vnCompact,
  vnPercent,
} from '../lib/theme'
import { areaFill, base, catAxis, lineSeries, tooltip, valAxis } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */
/* Scorecard nhiều mốc                                                         */
/* -------------------------------------------------------------------------- */

function ScorecardDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const accent = SERIES[mode][0]
  const marks = [
    { label: 'Kế hoạch', value: benchmark.plan },
    { label: 'Cùng kỳ', value: benchmark.priorPeriod },
    { label: 'TB toàn chuỗi', value: benchmark.groupAvg },
  ]
  const max = Math.max(benchmark.actual, ...marks.map((m) => m.value)) * 1.08

  return (
    <div className="scorecard">
      <div className="scorecard-head">
        <div>
          <div className="tile-label">Doanh thu 30 ngày · {benchmark.branch}</div>
          <div className="tile-value is-hero">{vnCompact(benchmark.actual)} ₫</div>
        </div>
        <Sparkline data={dailyTotal.slice(-12).map((d) => d.revenue)} width={120} height={32} />
      </div>

      {/* Một thanh, nhiều vạch mốc — thay vì bắt người xem đọc 4 con số rời rạc. */}
      <div className="scorecard-track" style={{ background: c.grid }}>
        <div
          className="scorecard-fill"
          style={{ width: `${(benchmark.actual / max) * 100}%`, background: accent }}
        />
        {marks.map((m) => (
          <span
            key={m.label}
            className="scorecard-mark"
            style={{ left: `${(m.value / max) * 100}%`, background: c.ink }}
            title={`${m.label}: ${vnCompact(m.value)}`}
          />
        ))}
      </div>

      <ul className="scorecard-legend">
        {marks.map((m) => {
          const diff = (benchmark.actual / m.value - 1) * 100
          return (
            <li key={m.label}>
              <span className="key-tick" style={{ background: c.ink, marginLeft: 0 }} />
              <span className="scorecard-mark-label">{m.label}</span>
              <b style={{ color: diff >= 0 ? c.deltaGood : c.deltaBad }}>
                {diff >= 0 ? '▲' : '▼'} {vnPercent(Math.abs(diff))}
              </b>
              <span className="scorecard-mark-value">{vnCompact(m.value)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Trạng thái rỗng / đang tải / lỗi                                            */
/* -------------------------------------------------------------------------- */

type State = 'ok' | 'loading' | 'empty' | 'error'

function ChartStatesDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const [state, setState] = useState<State>('loading')
  const color = SERIES[mode][0]

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 8, right: 12, top: 12, bottom: 4, containLabel: true },
      xAxis: catAxis(mode, dates.map(shortDate), {
        boundaryGap: false,
        axisLabel: { interval: 6, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu',
          ...lineSeries(color, mode),
          data: dailyTotal.map((d) => d.revenue),
          areaStyle: areaFill(color),
        },
      ],
    }),
    [mode, c, color],
  )

  const states: { id: State; label: string }[] = [
    { id: 'ok', label: 'Có dữ liệu' },
    { id: 'loading', label: 'Đang tải' },
    { id: 'empty', label: 'Rỗng' },
    { id: 'error', label: 'Lỗi' },
  ]

  return (
    <div>
      <div className="state-switch">
        {states.map((s) => (
          <button
            key={s.id}
            type="button"
            className={state === s.id ? 'dash-chip is-on' : 'dash-chip'}
            onClick={() => setState(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="state-frame">
        {state === 'ok' && <EChart option={option} resetKey={mode} height={200} />}

        {state === 'loading' && (
          // Khung xương giữ ĐÚNG chiều cao của biểu đồ thật → trang không nhảy
          // khi dữ liệu về.
          <div className="state-box" style={{ height: 200 }}>
            <div className="skeleton-chart" aria-label="Đang tải biểu đồ" />
          </div>
        )}

        {state === 'empty' && (
          <div className="state-box" style={{ height: 200 }}>
            <div className="state-msg">
              <b>Chưa có dữ liệu trong khoảng đã chọn</b>
              <span>Thử nới rộng khoảng thời gian, hoặc bỏ bớt bộ lọc.</span>
              <button type="button" className="dash-chip">
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="state-box" style={{ height: 200 }}>
            <div className="state-msg">
              <b style={{ color: STATUS.critical }}>⚠ Không tải được dữ liệu</b>
              <span>Máy chủ không phản hồi (mã E-503). Số liệu bên dưới có thể đã cũ.</span>
              <button type="button" className="dash-chip">
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Ghi chú nguồn & độ tươi dữ liệu                                             */
/* -------------------------------------------------------------------------- */

function FreshnessDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  return (
    <div className="fresh-demo">
      <div className="fresh-panel">
        <div className="fresh-head">
          <h5>Doanh thu theo ngày</h5>
          <span className="fresh-badge" style={{ borderColor: STATUS.good, color: STATUS.good }}>
            ● Mới cập nhật
          </span>
        </div>
        <Sparkline data={dailyTotal.slice(-14).map((d) => d.revenue)} width={240} height={40} />
        <p className="fresh-note" style={{ color: c.inkMuted }}>
          Nguồn: kho dữ liệu bán hàng · Số liệu tính đến <b>06:00 hôm nay</b> · Cập nhật mỗi 4 giờ
          · Chưa gồm đơn huỷ trong ngày
        </p>
      </div>

      <div className="fresh-panel">
        <div className="fresh-head">
          <h5>Tồn kho theo chi nhánh</h5>
          <span
            className="fresh-badge"
            style={{ borderColor: STATUS.warning, color: mode === 'light' ? '#7a5200' : STATUS.warning }}
          >
            ● Dữ liệu cũ
          </span>
        </div>
        <Sparkline data={dailyTotal.slice(-14).map((d) => d.revenue * 0.6)} width={240} height={40} />
        <p className="fresh-note" style={{ color: c.inkMuted }}>
          Nguồn: hệ thống kho · Lần đồng bộ gần nhất <b>2 ngày trước</b> · Đang chờ xử lý sự cố
          đồng bộ
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Chú thích sự kiện                                                           */
/* -------------------------------------------------------------------------- */

function AnnotationDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const color = SERIES[mode][0]
  const axisDates = useMemo(() => dates.map(shortDate), [])

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 8, right: 16, top: 30, bottom: 8, containLabel: true },
      xAxis: catAxis(mode, axisDates, {
        boundaryGap: false,
        axisLabel: { interval: 4, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu',
          ...lineSeries(color, mode),
          data: dailyTotal.map((d) => d.revenue),
          markLine: {
            silent: true,
            symbol: 'none',
            // Mốc sự kiện là NGỮ CẢNH, không phải dữ liệu → vẽ bằng mực, nét đứt.
            lineStyle: { color: c.axis, width: 1, type: 'dashed' },
            label: {
              formatter: (p: { name: string }) => p.name,
              color: c.inkSecondary,
              fontSize: 11,
              fontFamily: FONT_STACK,
              rotate: 0,
              position: 'end',
              distance: 4,
            },
            data: events.map((e) => ({ name: e.label, xAxis: shortDate(e.date) })),
          },
        },
      ],
    }),
    [mode, c, color, axisDates],
  )
  return <EChart option={option} resetKey={mode} height={280} />
}

/* -------------------------------------------------------------------------- */
/* Vùng ngưỡng mục tiêu                                                        */
/* -------------------------------------------------------------------------- */

function ThresholdDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const color = SERIES[mode][0]
  const axisDates = useMemo(() => dates.map(shortDate), [])

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: catAxis(mode, axisDates, {
        boundaryGap: false,
        axisLabel: { interval: 4, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu ngày',
          ...lineSeries(color, mode),
          data: dailyTotal.map((d) => d.revenue),
          markArea: {
            silent: true,
            // Dải nền cực nhạt: nó là NỀN để so, không được cạnh tranh với đường.
            itemStyle: { color: mode === 'light' ? '#cde2fb' : '#184f95', opacity: 0.28 },
            label: {
              show: true,
              position: 'insideTopLeft',
              formatter: targetBand.label,
              color: c.inkMuted,
              fontSize: 11,
              fontFamily: FONT_STACK,
            },
            data: [[{ yAxis: targetBand.min }, { yAxis: targetBand.max }]],
          },
        },
      ],
    }),
    [mode, c, color, axisDates],
  )
  return <EChart option={option} resetKey={mode} height={280} />
}

/* -------------------------------------------------------------------------- */
/* Dự báo & khoảng tin cậy                                                     */
/* -------------------------------------------------------------------------- */

function ForecastDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const color = SERIES[mode][0]

  const option = useMemo<EChartsOption>(() => {
    const histLen = dailyTotal.length
    const axis = [...dates, ...forecast.dates].map(shortDate)
    const hist = dailyTotal.map((d) => d.revenue)
    const pad = Array(histLen - 1).fill(null)
    const lastReal = hist[histLen - 1]

    return {
      ...base(mode, { legend: true }),
      legend: {
        show: true,
        top: 0,
        left: 0,
        icon: 'circle',
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 18,
        data: ['Thực tế', 'Dự báo'],
        textStyle: { color: c.inkSecondary, fontSize: 12, fontFamily: FONT_STACK },
      },
      tooltip: { ...tooltip(mode), valueFormatter: (v) => (v == null ? '—' : `${vnCompact(v as number)} ₫`) },
      grid: { left: 8, right: 16, top: 44, bottom: 8, containLabel: true },
      xAxis: catAxis(mode, axis, {
        boundaryGap: false,
        axisLabel: { interval: 5, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact),
      series: [
        // Dải tin cậy dựng bằng 2 series area chồng nhau: chặn dưới trong suốt,
        // phần loe ra mới được tô.
        {
          name: 'cận dưới',
          type: 'line',
          stack: 'ci',
          silent: true,
          showSymbol: false,
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0 },
          data: [...pad, lastReal, ...forecast.points.map((p) => p.lower)],
          tooltip: { show: false },
        },
        {
          name: 'khoảng tin cậy',
          type: 'line',
          stack: 'ci',
          silent: true,
          showSymbol: false,
          lineStyle: { opacity: 0 },
          areaStyle: { color, opacity: 0.14 },
          data: [...pad, 0, ...forecast.points.map((p) => p.upper - p.lower)],
          tooltip: { show: false },
        },
        {
          name: 'Thực tế',
          ...lineSeries(color, mode),
          data: hist,
          z: 5,
        },
        {
          name: 'Dự báo',
          ...lineSeries(color, mode),
          // Nét đứt = phần CHƯA XẢY RA. Đừng bao giờ vẽ liền mạch với số thật.
          lineStyle: { width: MARK.lineWidth, color, type: 'dashed' },
          data: [...pad, lastReal, ...forecast.points.map((p) => p.value)],
          z: 5,
        },
      ],
    }
  }, [mode, c, color])

  return <EChart option={option} resetKey={mode} height={300} />
}

/* -------------------------------------------------------------------------- */

export const foundationEntries: ChartEntry[] = [
  {
    id: 'scorecard-multi',
    nameVi: 'Scorecard nhiều mốc',
    nameEn: 'Scorecard with multiple benchmarks',
    aliases: ['benchmark card', 'nhiều mốc so sánh', 'KPI nâng cao'],
    job: 'foundation',
    status: 'ready',
    description:
      'Một chỉ số đặt cạnh NHIỀU mốc tham chiếu cùng lúc: kế hoạch, cùng kỳ, trung bình nhóm. Trả lời được “tốt hay không” — điều mà một con số trần trụi không bao giờ nói được.',
    useWhen: [
      'Con số chỉ có nghĩa khi có mốc so: 5,9 tỷ là tốt hay tệ?',
      'Có nhiều hơn một mốc đáng quan tâm và chúng không mâu thuẫn nhau.',
      'Muốn thay cả một hàng KPI rời rạc bằng một khối duy nhất có chiều sâu.',
    ],
    avoidWhen: [
      'Quá 3 mốc → các vạch dính nhau, đọc không ra. Chọn 2–3 mốc thật sự dẫn dắt quyết định.',
      'Các mốc mâu thuẫn (kế hoạch thấp hơn cùng kỳ) mà không giải thích → người xem hoang mang.',
      'Chỉ có một mốc → dùng stat tile có delta cho gọn.',
    ],
    dataShape: 'Một giá trị hiện tại + danh sách mốc `{ nhãn, giá trị }`.',
    variants: [
      'Thanh ngang có vạch mốc (như demo) hoặc bullet chart chuẩn.',
      'Thêm sparkline để có cả chiều thời gian.',
      'Ghi % chênh so từng mốc, kèm ▲▼ chứ không chỉ màu.',
    ],
    seriesCap: '2–3 mốc.',
    demo: () => <ScorecardDemo />,
    code: `{/* Một thanh, nhiều vạch mốc — thay vì 4 con số rời rạc */}
<div className="scorecard-track">
  <div className="scorecard-fill" style={{ width: \`\${actual / max * 100}%\` }} />
  {marks.map(m => (
    <span key={m.label} className="scorecard-mark"
          style={{ left: \`\${m.value / max * 100}%\` }}
          title={\`\${m.label}: \${vnCompact(m.value)}\`} />
  ))}
</div>

/* Vạch mốc vẽ bằng MỰC, không bằng màu series — chúng là mốc tham
   chiếu, không phải một series thứ hai đang cạnh tranh sự chú ý. */`,
  },

  {
    id: 'chart-states',
    nameVi: 'Trạng thái rỗng / đang tải / lỗi',
    nameEn: 'Empty, loading & error states',
    aliases: ['empty state', 'skeleton', 'loading', 'lỗi', 'no data'],
    job: 'foundation',
    status: 'ready',
    description:
      'Ba trạng thái mà biểu đồ nào cũng gặp nhưng gần như luôn bị quên tới lúc lên production. Mỗi trạng thái phải nói rõ CHUYỆN GÌ đang xảy ra và LÀM GÌ tiếp theo.',
    useWhen: [
      'Mọi biểu đồ lấy dữ liệu từ API — tức là gần như tất cả.',
      'Có bộ lọc: người dùng chắc chắn sẽ lọc ra tập rỗng.',
    ],
    avoidWhen: [
      'Vòng xoay giữa màn hình trống — không cho biết sắp có gì, và trang sẽ nhảy khi dữ liệu về. Dùng khung xương ĐÚNG chiều cao của biểu đồ thật.',
      'Rỗng và lỗi hiển thị giống nhau → người xem tưởng “không có dữ liệu” trong khi thực ra hệ thống hỏng.',
      'Thông báo lỗi kỹ thuật thô (`TypeError: undefined`) → vô nghĩa với người dùng. Nói bằng ngôn ngữ nghiệp vụ, kèm mã lỗi để tra khi cần.',
      'Trạng thái rỗng mà không có lối thoát → luôn kèm một nút hành động (đặt lại bộ lọc, nới khoảng thời gian).',
    ],
    dataShape: 'Một biến trạng thái: `ok | loading | empty | error`.',
    variants: [
      'Khung xương có hiệu ứng quét nhẹ (như demo).',
      'Lỗi một phần: vẫn vẽ dữ liệu cũ nhưng gắn nhãn “có thể đã cũ”.',
      'Rỗng lần đầu (chưa từng có dữ liệu) khác rỗng do lọc — lời nhắn nên khác nhau.',
    ],
    demo: () => <ChartStatesDemo />,
    code: `{state === 'loading' && (
  /* Khung xương giữ ĐÚNG chiều cao biểu đồ thật → trang không nhảy */
  <div className="state-box" style={{ height: 200 }}>
    <div className="skeleton-chart" aria-label="Đang tải biểu đồ" />
  </div>
)}

{state === 'empty' && (
  <div className="state-msg">
    <b>Chưa có dữ liệu trong khoảng đã chọn</b>
    <span>Thử nới rộng khoảng thời gian, hoặc bỏ bớt bộ lọc.</span>
    <button type="button">Đặt lại bộ lọc</button>   {/* luôn có lối thoát */}
  </div>
)}

{state === 'error' && (
  <div className="state-msg">
    <b style={{ color: STATUS.critical }}>⚠ Không tải được dữ liệu</b>
    {/* Ngôn ngữ nghiệp vụ + mã lỗi để tra, KHÔNG phải stack trace */}
    <span>Máy chủ không phản hồi (mã E-503). Số liệu bên dưới có thể đã cũ.</span>
    <button type="button">Thử lại</button>
  </div>
)}`,
  },

  {
    id: 'data-freshness',
    nameVi: 'Ghi chú nguồn & độ tươi dữ liệu',
    nameEn: 'Data source & freshness note',
    aliases: ['data freshness', 'nguồn dữ liệu', 'cập nhật lúc', 'footnote', 'metadata'],
    job: 'foundation',
    status: 'ready',
    description:
      'Một dòng nhỏ dưới biểu đồ: số liệu lấy từ đâu, tính đến lúc nào, còn thiếu gì. Rẻ tiền nhất trong cả dashboard nhưng quyết định việc người xem có TIN vào con số hay không.',
    useWhen: [
      'Luôn luôn. Không có ngoại lệ đáng kể.',
      'Đặc biệt quan trọng khi các khối trên trang có độ tươi khác nhau.',
      'Khi có định nghĩa dễ gây tranh cãi (doanh thu đã trừ huỷ chưa?) — nói rõ ngay tại chỗ.',
    ],
    avoidWhen: [
      'Ghi “cập nhật realtime” khi thực ra chạy theo lô 4 tiếng — sai một lần là mất niềm tin lâu dài.',
      'Nhét vào tooltip hoặc trang “Giới thiệu” — không ai tìm tới đó. Phải nằm ngay cạnh số.',
      'Chỉ hiện thời điểm mà không cảnh báo khi dữ liệu đã cũ bất thường — hãy đổi nhãn trạng thái.',
    ],
    dataShape: 'Metadata đi kèm mỗi khối: nguồn, thời điểm chốt số, nhịp cập nhật, cảnh báo.',
    variants: [
      'Nhãn trạng thái: mới cập nhật / đang đồng bộ / dữ liệu cũ (như demo).',
      'Hiện thời gian tương đối (“2 ngày trước”) kèm thời điểm tuyệt đối trong tooltip.',
      'Ghi rõ múi giờ khi có người xem ở nhiều nơi.',
    ],
    demo: () => <FreshnessDemo />,
    code: `<div className="fresh-head">
  <h5>Doanh thu theo ngày</h5>
  {/* Nhãn trạng thái = màu + CHẤM + CHỮ, không bao giờ chỉ mỗi màu */}
  <span className="fresh-badge" style={{ borderColor: STATUS.good, color: STATUS.good }}>
    ● Mới cập nhật
  </span>
</div>

<p className="fresh-note">
  Nguồn: kho dữ liệu bán hàng · Số liệu tính đến <b>06:00 hôm nay</b>
  · Cập nhật mỗi 4 giờ · Chưa gồm đơn huỷ trong ngày
</p>

/* Bốn thông tin đáng ghi: NGUỒN · THỜI ĐIỂM CHỐT SỐ · NHỊP CẬP NHẬT ·
   ĐIỀU CHƯA BAO GỒM. Cái cuối là thứ hay gây cãi nhau nhất trong họp. */`,
  },

  {
    id: 'annotations',
    nameVi: 'Chú thích sự kiện',
    nameEn: 'Event annotations',
    aliases: ['annotation', 'mốc sự kiện', 'event marker', 'ghi chú trên chart'],
    job: 'foundation',
    status: 'ready',
    description:
      'Vạch mốc kèm nhãn ngay trên biểu đồ, đánh dấu chuyện đã xảy ra: đổi giá, chiến dịch, sự cố. Biến một cái đỉnh bí ẩn thành một câu chuyện có nguyên nhân.',
    useWhen: [
      'Có sự kiện bên ngoài giải thích được biến động trong dữ liệu.',
      'Biểu đồ sẽ được xem lại sau nhiều tháng, khi không ai còn nhớ hôm đó có gì.',
      '1–4 mốc. Nhiều hơn thì biểu đồ thành cái bảng thông báo.',
    ],
    avoidWhen: [
      'Chú thích chen vào vùng có dữ liệu, che mất chính đường cần đọc.',
      'Vẽ mốc bằng màu series → người xem tưởng đó là một series thứ hai. Luôn dùng mực và nét đứt.',
      'Ghi chú suy diễn nhân quả chưa kiểm chứng (“nhờ chiến dịch nên tăng 20%”) — ghi sự kiện, đừng ghi kết luận.',
    ],
    dataShape: 'Danh sách `{ ngày, nhãn }` khớp với trục thời gian của biểu đồ.',
    variants: [
      'Vạch dọc (như demo) cho sự kiện một thời điểm.',
      'Dải nền cho sự kiện kéo dài (mùa cao điểm, đợt giãn cách).',
      'Chấm nhỏ trên đường + tooltip khi có nhiều mốc dày.',
    ],
    seriesCap: '1–4 mốc.',
    demo: () => <AnnotationDemo />,
    code: `markLine: {
  silent: true, symbol: 'none',
  // Mốc sự kiện là NGỮ CẢNH → mực + nét đứt, không dùng màu series
  lineStyle: { color: c.axis, width: 1, type: 'dashed' },
  label: {
    formatter: p => p.name,
    rotate: 0,          // BẮT BUỘC với đường dọc, nếu không chữ nằm dọc
    position: 'end',
  },
  data: events.map(e => ({ name: e.label, xAxis: shortDate(e.date) })),
}`,
  },

  {
    id: 'threshold-band',
    nameVi: 'Vùng ngưỡng mục tiêu',
    nameEn: 'Threshold / target band',
    aliases: ['target band', 'reference band', 'ngưỡng', 'vùng an toàn', 'SLA'],
    job: 'foundation',
    status: 'ready',
    description:
      'Một dải nền mờ đánh dấu khoảng giá trị chấp nhận được, thay cho một đường mục tiêu trơ trọi. Dải phản ánh đúng thực tế: mục tiêu thường là một khoảng, không phải một con số duy nhất.',
    useWhen: [
      'Có ngưỡng nghiệp vụ thật: mục tiêu doanh thu, SLA thời gian phản hồi, khoảng tồn kho an toàn.',
      'Người xem cần biết “hôm nay có nằm trong vùng ổn không”.',
      'Ngưỡng vốn là một khoảng chứ không phải một điểm.',
    ],
    avoidWhen: [
      'Tô dải quá đậm → nó át mất chính đường dữ liệu. Đây là nền, phải rất nhạt.',
      'Ngưỡng đặt tuỳ tiện, không ai cam kết → vẽ ra chỉ tạo áp lực giả.',
      'Nhiều dải chồng nhau → chọn tối đa một vùng “ổn” và một vùng “báo động”.',
    ],
    dataShape: 'Cận dưới + cận trên + nhãn.',
    variants: [
      'Ba vùng kém / đạt / tốt — chỉ khi các ngưỡng thật sự có nghĩa.',
      'Ngưỡng thay đổi theo thời gian → dải có hình bậc thang.',
      'Đổi màu chính đường khi ra ngoài vùng, kèm nhãn chữ.',
    ],
    demo: () => <ThresholdDemo />,
    code: `markArea: {
  silent: true,
  // Dải nền CỰC NHẠT — nó là nền để so, không được cạnh tranh với đường
  itemStyle: { color: mode === 'light' ? '#cde2fb' : '#184f95', opacity: 0.28 },
  label: { show: true, position: 'insideTopLeft', formatter: 'Vùng mục tiêu ngày' },
  data: [[{ yAxis: band.min }, { yAxis: band.max }]],
}

/* Dùng bậc NHẠT NHẤT của chính hue sequential, không phải một màu xám
   bất kỳ — như vậy dải vẫn thuộc cùng hệ màu với biểu đồ. */`,
  },

  {
    id: 'forecast',
    nameVi: 'Dự báo & khoảng tin cậy',
    nameEn: 'Forecast with confidence band',
    aliases: ['forecast', 'dự báo', 'projection', 'confidence interval', 'khoảng tin cậy'],
    job: 'foundation',
    status: 'ready',
    description:
      'Phần tương lai vẽ bằng nét đứt, kèm dải loe rộng dần thể hiện độ không chắc chắn. Hai tín hiệu này là bắt buộc: thiếu chúng, người xem sẽ đọc dự báo như số thật.',
    useWhen: [
      'Có mô hình dự báo thật và bạn nêu được sai số của nó.',
      'Quyết định phụ thuộc vào chuyện sắp tới, không chỉ chuyện đã qua.',
    ],
    avoidWhen: [
      'Vẽ dự báo liền mạch cùng nét với số thật — đây là lỗi nghiêm trọng nhất: người xem không phân biệt được đâu là đã xảy ra, đâu là phỏng đoán.',
      'Không có dải tin cậy → ngụ ý dự báo chắc chắn, điều không bao giờ đúng.',
      'Dải giữ nguyên độ rộng theo thời gian → sai về bản chất; càng xa càng phải loe.',
      'Kéo dài dự báo quá xa so với dữ liệu lịch sử có được.',
    ],
    dataShape: 'Chuỗi lịch sử + chuỗi dự báo `{ giá trị, cận dưới, cận trên }`, nối liền tại điểm cuối cùng của lịch sử.',
    variants: [
      'Nhiều mức tin cậy (50% / 80% / 95%) — các dải lồng nhau, càng ngoài càng nhạt.',
      'Vài kịch bản (thận trọng / cơ sở / lạc quan) thay cho dải liên tục.',
      'Vạch dọc đánh dấu “hôm nay” tại điểm giao giữa thật và dự báo.',
    ],
    seriesCap: '1 chuỗi dự báo mỗi khung.',
    demo: () => <ForecastDemo />,
    code: `// Dải tin cậy = 2 series area CHỒNG nhau: chặn dưới trong suốt,
// chỉ phần loe ra mới được tô.
{ name: 'cận dưới', type: 'line', stack: 'ci', silent: true,
  lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 },
  data: [...pad, lastReal, ...forecast.map(p => p.lower)] },
{ name: 'khoảng tin cậy', type: 'line', stack: 'ci', silent: true,
  lineStyle: { opacity: 0 }, areaStyle: { color, opacity: 0.14 },
  data: [...pad, 0, ...forecast.map(p => p.upper - p.lower)] },

// Đường dự báo: NÉT ĐỨT, cùng màu với đường thật
{ name: 'Dự báo', ...lineSeries(color, mode),
  lineStyle: { width: 2, color, type: 'dashed' },
  data: [...pad, lastReal, ...forecast.map(p => p.value)] }

/* pad = mảng null dài bằng (lịch sử − 1), rồi lặp lại giá trị thật cuối cùng
   để đường dự báo NỐI LIỀN vào đường thật thay vì lơ lửng. */

/* Biên độ nới theo căn bậc hai của số bước — càng xa càng ít chắc chắn. */`,
  },
]
