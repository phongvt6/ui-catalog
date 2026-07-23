import { useMemo, useState } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { Sparkline } from '../components/Figures'
import {
  PRODUCTS,
  adFunnel,
  dailyByBranch,
  dates,
  periodLabels,
  plByPeriod,
  productRevenue,
  regionOf,
  regionPanels,
  revenueByBranch,
} from '../data/sample'
import {
  CHROME,
  MARK,
  SERIES,
  towardSurface,
  vnCompact,
  vnNumber,
  vnPercent,
} from '../lib/theme'
import { columnItem, base, tooltip } from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* ==========================================================================
   1 — Dashboard theo phễu: băng màu theo NHÓM chỉ số
   ==========================================================================

   Mẫu này khác mọi mẫu khác trong catalog ở một điểm: màu KHÔNG phân biệt
   series, mà phân biệt GIAI ĐOẠN của phễu. Mỗi băng là một câu hỏi ("có ai
   nhìn thấy không?", "có ai bấm vào không?"…), và mọi thứ trong băng — KPI,
   biểu đồ, cột tương ứng dưới bảng — đều mang cùng một hue.
   ========================================================================== */

const { daily, totals, channels } = adFunnel

/** Δ% giữa nửa sau và nửa đầu kỳ — dùng chung cho mọi KPI của phễu. */
function halfDelta(series: number[]): number {
  const half = Math.floor(series.length / 2)
  const first = series.slice(0, half).reduce((s, x) => s + x, 0)
  const last = series.slice(half).reduce((s, x) => s + x, 0)
  return (last / first - 1) * 100
}

const ratio = (a: number[], b: number[], scale = 1) =>
  a.map((v, i) => (b[i] ? (v / b[i]) * scale : 0))

interface Band {
  id: string
  title: string
  question: string
  slot: number
  kpis: { label: string; value: string; delta?: number; upIsGood?: boolean }[]
  bars: { name: string; data: number[] }
  line: { name: string; data: number[]; format: (v: number) => string }
}

const BANDS: Band[] = [
  {
    id: 'visibility',
    title: 'Hiển thị',
    question: 'Có ai nhìn thấy không?',
    slot: 0,
    kpis: [
      {
        label: 'Lượt hiển thị',
        value: vnCompact(totals.impressions),
        delta: halfDelta(daily.impressions),
      },
      { label: 'Tỷ lệ ở vị trí đầu', value: vnPercent(adFunnel.topShare) },
    ],
    bars: { name: 'Lượt hiển thị', data: daily.impressions },
    line: {
      name: 'Hiển thị / đơn',
      data: ratio(daily.impressions, daily.orders),
      format: (v) => vnNumber(v, 0),
    },
  },
  {
    id: 'acquisition',
    title: 'Tiếp cận',
    question: 'Có ai bấm vào không?',
    slot: 1,
    kpis: [
      { label: 'Lượt click', value: vnCompact(totals.clicks), delta: halfDelta(daily.clicks) },
      { label: 'CTR', value: vnPercent(adFunnel.ctr, 2) },
    ],
    bars: { name: 'Lượt click', data: daily.clicks },
    line: {
      name: 'CTR',
      data: ratio(daily.clicks, daily.impressions, 100),
      format: (v) => vnPercent(v, 2),
    },
  },
  {
    id: 'conversion',
    title: 'Chuyển đổi',
    question: 'Có ai mua không?',
    slot: 2,
    kpis: [
      { label: 'Số đơn', value: vnNumber(totals.orders), delta: halfDelta(daily.orders) },
      { label: 'Tỷ lệ chuyển đổi', value: vnPercent(adFunnel.convRate, 2) },
    ],
    bars: { name: 'Số đơn', data: daily.orders },
    line: {
      name: 'Tỷ lệ chuyển đổi',
      data: ratio(daily.orders, daily.clicks, 100),
      format: (v) => vnPercent(v, 2),
    },
  },
  {
    id: 'cost',
    title: 'Chi phí',
    question: 'Trả bao nhiêu cho từng đơn?',
    slot: 3,
    kpis: [
      {
        label: 'Chi phí',
        value: `${vnCompact(totals.cost)} ₫`,
        delta: halfDelta(daily.cost),
        upIsGood: false,
      },
      { label: 'Chi phí / đơn', value: `${vnCompact(adFunnel.costPerOrder)} ₫` },
    ],
    bars: { name: 'Chi phí', data: daily.cost },
    line: {
      name: 'Chi phí / đơn',
      data: ratio(daily.cost, daily.orders),
      format: (v) => `${vnCompact(v)} ₫`,
    },
  },
]

/**
 * Hai dải chồng nhau, KHÔNG phải combo hai trục Y.
 *
 * Bản gốc của mẫu này (Google Ads / Looker Studio) vẽ cột và đường chồng lên
 * nhau trên hai trục Y — cách đó cho phép "tạo ra" bất kỳ tương quan nào giữa
 * hai thang đo. Ở đây tách thành hai dải dùng chung trục thời gian: vẫn đọc
 * được "lượng" và "tỷ lệ" cùng lúc, mà không bịa ra quan hệ nào.
 */
function BandChart({ band, height = 108 }: { band: Band; height?: number }) {
  const mode = useMode()
  const c = CHROME[mode]
  const hue = SERIES[mode][band.slot]
  const soft = towardSurface(hue, mode, 0.45)
  const labels = dates.map((d) => d.slice(8, 10))

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode),
        axisPointer: { type: 'line', lineStyle: { color: c.axis, width: 1 } },
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      grid: [
        { left: 2, right: 2, top: 4, height: Math.round(height * 0.46) },
        { left: 2, right: 2, top: Math.round(height * 0.56), height: Math.round(height * 0.4) },
      ],
      xAxis: [
        { gridIndex: 0, type: 'category', data: labels, show: false, boundaryGap: false },
        { gridIndex: 1, type: 'category', data: labels, show: false },
      ],
      yAxis: [
        { gridIndex: 0, type: 'value', show: false, scale: true },
        { gridIndex: 1, type: 'value', show: false },
      ],
      series: [
        {
          name: band.line.name,
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: band.line.data,
          showSymbol: false,
          symbolSize: MARK.symbolSize,
          lineStyle: { width: MARK.lineWidth, color: hue, cap: 'round' },
          itemStyle: { color: hue },
          tooltip: { valueFormatter: (v) => band.line.format(v as number) },
        },
        {
          name: band.bars.name,
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: band.bars.data,
          barMaxWidth: 10,
          itemStyle: columnItem(soft),
          tooltip: { valueFormatter: (v) => vnCompact(v as number) },
        },
      ],
    }),
    [mode, c, hue, soft, band, labels, height],
  )

  return <EChart option={option} resetKey={mode} height={height} />
}

function FunnelBandsDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const maxImpr = Math.max(...channels.map((r) => r.impressions))
  const maxClicks = Math.max(...channels.map((r) => r.clicks))
  const maxOrders = Math.max(...channels.map((r) => r.orders))
  const maxCost = Math.max(...channels.map((r) => r.cost))
  const maxCtr = Math.max(...channels.map((r) => r.ctr))
  const maxConv = Math.max(...channels.map((r) => r.convRate))

  const tint = (slot: number) => towardSurface(SERIES[mode][slot], mode, 0.9)

  /** Ô "tỷ lệ": nền lấy từ ramp của chính hue băng đó — cùng cơ chế heatmap. */
  const rateCell = (v: number, max: number, slot: number) => {
    const hue = SERIES[mode][slot]
    const t = max ? v / max : 0
    return { background: towardSurface(hue, mode, 1 - t * 0.55), color: c.ink }
  }

  const bar = (v: number, max: number, slot: number) => (
    <span className="cellbar-track" style={{ background: c.grid }}>
      <span
        className="cellbar-fill"
        style={{ width: `${(v / max) * 100}%`, background: SERIES[mode][slot] }}
      />
    </span>
  )

  return (
    <div className="cx">
      <div className="fb-bands">
        {BANDS.map((b, i) => (
          <section
            key={b.id}
            className="fb-band"
            style={{ background: tint(b.slot), borderColor: c.border }}
          >
            <h5 style={{ color: SERIES[mode][b.slot] }}>
              {b.title}
              {i < BANDS.length - 1 && (
                <span className="fb-arrow" style={{ color: c.inkMuted }} aria-hidden>
                  →
                </span>
              )}
            </h5>
            <p className="fb-q" style={{ color: c.inkMuted }}>
              {b.question}
            </p>
            <div className="fb-kpis">
              {b.kpis.map((k) => {
                const good = k.delta === undefined ? true : k.delta >= 0 === (k.upIsGood ?? true)
                return (
                  <div className="fb-kpi" key={k.label}>
                    <span className="tile-label">{k.label}</span>
                    <b>{k.value}</b>
                    {k.delta !== undefined && (
                      <i style={{ color: good ? c.deltaGood : c.deltaBad }}>
                        {k.delta >= 0 ? '▲' : '▼'} {vnPercent(Math.abs(k.delta))}
                      </i>
                    )}
                  </div>
                )
              })}
            </div>
            <BandChart band={b} />
          </section>
        ))}
      </div>

      {/* Bảng dưới dùng LẠI đúng bộ hue của băng — cột nào thuộc giai đoạn nào
          là thấy ngay, không phải dò lại tiêu đề. */}
      <div className="tbl-scroll">
        <table className="dtable fb-table">
          <thead>
            <tr>
              <th rowSpan={2}>Kênh</th>
              {BANDS.map((b) => (
                <th
                  key={b.id}
                  colSpan={2}
                  className="fb-group"
                  style={{ background: tint(b.slot), color: SERIES[mode][b.slot] }}
                >
                  {b.title}
                </th>
              ))}
            </tr>
            <tr>
              <th className="tbl-barcol">Tỷ trọng</th>
              <th className="num">Lượt hiển thị</th>
              <th className="tbl-barcol">Tỷ trọng</th>
              <th className="num">CTR</th>
              <th className="tbl-barcol">Tỷ trọng</th>
              <th className="num">Tỷ lệ CĐ</th>
              <th className="tbl-barcol">Tỷ trọng</th>
              <th className="num">Chi phí</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((r) => (
              <tr key={r.channel}>
                <td>{r.channel}</td>
                <td className="tbl-barcol">{bar(r.impressions, maxImpr, 0)}</td>
                <td className="num">{vnCompact(r.impressions)}</td>
                <td className="tbl-barcol">{bar(r.clicks, maxClicks, 1)}</td>
                <td className="num" style={rateCell(r.ctr, maxCtr, 1)}>
                  {vnPercent(r.ctr, 2)}
                </td>
                <td className="tbl-barcol">{bar(r.orders, maxOrders, 2)}</td>
                <td className="num" style={rateCell(r.convRate, maxConv, 2)}>
                  {vnPercent(r.convRate, 2)}
                </td>
                <td className="tbl-barcol">{bar(r.cost, maxCost, 3)}</td>
                <td className="num">{vnCompact(r.cost)} ₫</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="tbl-total-row">
              <th scope="row" className="tbl-rowhead">
                Tổng
              </th>
              <td className="tbl-barcol" />
              <td className="num">{vnCompact(totals.impressions)}</td>
              <td className="tbl-barcol" />
              <td className="num">{vnPercent(adFunnel.ctr, 2)}</td>
              <td className="tbl-barcol" />
              <td className="num">{vnPercent(adFunnel.convRate, 2)}</td>
              <td className="tbl-barcol" />
              <td className="num">{vnCompact(totals.cost)} ₫</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

/* ==========================================================================
   2 — Panel lặp: cùng một bố cục, mỗi vùng một cột
   ========================================================================== */

function RegionPanelsDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const accent = SERIES[mode][0]

  // Thang đo DÙNG CHUNG cho mọi panel — đây là điều kiện sống còn của mẫu này.
  const maxCat = Math.max(...regionPanels.flatMap((p) => p.byCategory.map((x) => x.revenue)))
  const maxBranch = Math.max(...regionPanels.flatMap((p) => p.branches.map((x) => x.revenue)))
  const totalAll = regionPanels.reduce((s, p) => s + p.revenue, 0)
  // Sparkline cũng phải chung miền giá trị, nếu không ba đường sẽ trông y hệt
  // nhau dù quy mô ba vùng chênh nhau ba lần.
  const sparkDomain: [number, number] = [
    0,
    Math.max(...regionPanels.flatMap((p) => p.daily)),
  ]

  return (
    <div className="cx">
      <div className="rp-grid">
        {regionPanels.map((p) => (
          <section className="rp-panel" key={p.region}>
            <header className="rp-head">
              <h5>{p.region}</h5>
              <span style={{ color: c.inkMuted }}>{p.branches.length} chi nhánh</span>
            </header>

            <div className="rp-kpis">
              <div>
                <span className="tile-label">Doanh thu</span>
                <b>{vnCompact(p.revenue)} ₫</b>
              </div>
              <div>
                <span className="tile-label">Tỷ trọng</span>
                <b>{vnPercent((p.revenue / totalAll) * 100, 0)}</b>
              </div>
              <div>
                <span className="tile-label">Số đơn</span>
                <b>{vnNumber(p.orders)}</b>
              </div>
            </div>

            <div className="rp-section" style={{ color: c.inkMuted }}>
              Danh mục
            </div>
            <div className="rp-bars">
              {p.byCategory.map((x) => (
                <div className="rp-barrow" key={x.category}>
                  <span className="rp-barlabel">{x.category}</span>
                  <span className="cellbar-track" style={{ background: c.grid }}>
                    <span
                      className="cellbar-fill"
                      style={{ width: `${(x.revenue / maxCat) * 100}%`, background: accent }}
                    />
                  </span>
                  <span className="rp-barvalue">{vnCompact(x.revenue)}</span>
                </div>
              ))}
            </div>

            <div className="rp-section" style={{ color: c.inkMuted }}>
              Diễn biến 30 ngày
            </div>
            <Sparkline data={p.daily} width={240} height={34} domain={sparkDomain} />

            <div className="rp-section" style={{ color: c.inkMuted }}>
              Chi nhánh
            </div>
            <ol className="rp-rank">
              {p.branches.map((b, i) => (
                <li key={b.branch}>
                  <span className="rp-rankno" style={{ color: c.inkMuted }}>
                    {i + 1}
                  </span>
                  <span className="rp-rankname">{b.branch}</span>
                  <span className="cellbar-track" style={{ background: c.grid }}>
                    <span
                      className="cellbar-fill"
                      style={{ width: `${(b.revenue / maxBranch) * 100}%`, background: accent }}
                    />
                  </span>
                  <span className="rp-barvalue">{vnCompact(b.revenue)}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className="cx-note" style={{ color: c.inkMuted }}>
        Ba panel dùng <b>chung một thang đo</b> — cả thanh lẫn sparkline. Thanh dài hơn, đường
        cao hơn nghĩa là thật sự lớn hơn. Nếu mỗi
        panel tự co giãn theo dữ liệu của mình thì các panel trông giống hệt nhau, và mọi so sánh
        giữa chúng đều sai.
      </p>
    </div>
  )
}

/* ==========================================================================
   3 — Bảng + panel lọc nhiều lựa chọn
   ========================================================================== */

const PAGE_SIZE = 8

function MultiSelectTableDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const accent = SERIES[mode][0]
  const [picked, setPicked] = useState<string[]>(() => PRODUCTS.slice(0, 9).map(String))
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(true)

  const options = useMemo(
    () =>
      productRevenue.filter((p) =>
        p.name.toLowerCase().includes(term.trim().toLowerCase()),
      ),
    [term],
  )
  const rows = useMemo(
    () => productRevenue.filter((p) => picked.includes(p.name)),
    [picked],
  )
  const shown = rows.slice(0, PAGE_SIZE)
  const total = rows.reduce((s, x) => s + x.current, 0)
  const max = Math.max(...productRevenue.map((p) => p.current))

  const toggle = (name: string) =>
    setPicked((xs) => (xs.includes(name) ? xs.filter((x) => x !== name) : [...xs, name]))

  return (
    <div className="cx">
      <div className="fp-bar">
        <button type="button" className="fp-trigger" onClick={() => setOpen((x) => !x)}>
          Mặt hàng
          <span className="fp-count">
            {picked.length === PRODUCTS.length ? 'Tất cả' : `${picked.length}/${PRODUCTS.length}`}
          </span>
          <span aria-hidden>{open ? '▴' : '▾'}</span>
        </button>
        <span className="fp-hint" style={{ color: c.inkMuted }}>
          Bộ lọc áp cho bảng bên dưới · bảng luôn nói rõ còn lại bao nhiêu dòng
        </span>
      </div>

      <div className={open ? 'fp-wrap is-open' : 'fp-wrap'}>
        {open && (
          <aside className="fp-panel">
            <input
              className="fp-search"
              type="search"
              placeholder="Gõ để tìm…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <div className="fp-actions">
              <button
                type="button"
                onClick={() => setPicked(productRevenue.map((p) => p.name))}
              >
                Chọn tất cả
              </button>
              <button type="button" onClick={() => setPicked([])}>
                Bỏ chọn hết
              </button>
            </div>
            <div className="fp-list">
              {options.map((p) => (
                <label className="fp-opt" key={p.name}>
                  <input
                    type="checkbox"
                    checked={picked.includes(p.name)}
                    onChange={() => toggle(p.name)}
                  />
                  <span>{p.name}</span>
                </label>
              ))}
              {options.length === 0 && (
                <p className="fp-empty" style={{ color: c.inkMuted }}>
                  Không có mục nào khớp “{term}”.
                </p>
              )}
            </div>
          </aside>
        )}

        <div className="fp-main">
          {rows.length === 0 ? (
            <div className="state-box" style={{ height: 180 }}>
              <div className="state-msg">
                <b>Chưa chọn mặt hàng nào</b>
                <span>Bảng rỗng vì bộ lọc, không phải vì không có dữ liệu.</span>
                <button
                  type="button"
                  className="dash-chip"
                  onClick={() => setPicked(productRevenue.map((p) => p.name))}
                >
                  Chọn tất cả
                </button>
              </div>
            </div>
          ) : (
            <table className="dtable">
              <thead>
                <tr>
                  <th>Mặt hàng</th>
                  <th className="num">Kỳ này</th>
                  <th className="num">Kỳ trước</th>
                  <th className="tbl-barcol">So với mặt hàng lớn nhất</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td className="num">{vnCompact(p.current)} ₫</td>
                    <td className="num" style={{ color: c.inkMuted }}>
                      {vnCompact(p.previous)} ₫
                    </td>
                    <td className="tbl-barcol">
                      <span className="cellbar-track" style={{ background: c.grid }}>
                        <span
                          className="cellbar-fill"
                          style={{ width: `${(p.current / max) * 100}%`, background: accent }}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="tbl-total-row">
                  <th scope="row" className="tbl-rowhead">
                    Tổng của lát cắt
                  </th>
                  <td className="num">{vnCompact(total)} ₫</td>
                  <td />
                  <td />
                </tr>
              </tfoot>
            </table>
          )}

          <div className="fp-foot" style={{ color: c.inkMuted }}>
            <span>
              Hiển thị {Math.min(PAGE_SIZE, rows.length)} / {rows.length} dòng đã lọc
              {rows.length < PRODUCTS.length && ` (trên tổng ${PRODUCTS.length})`}
            </span>
            <span className="fp-pager">
              <button type="button" disabled>
                ‹
              </button>
              <button type="button" disabled={rows.length <= PAGE_SIZE}>
                ›
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   4 — Bảng chênh lệch có thanh hai chiều quanh trục 0
   ========================================================================== */

interface VarNode {
  label: string
  current: number
  prior: number
  children?: VarNode[]
}

const varianceTree: VarNode[] = (() => {
  const half = Math.floor(dates.length / 2)
  const ofBranch = (b: (typeof revenueByBranch)[number]['branch']) => {
    const series = dailyByBranch[b]
    return {
      label: b as string,
      current: series.slice(half).reduce((s, x) => s + x, 0),
      prior: series.slice(0, half).reduce((s, x) => s + x, 0),
    }
  }
  const regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam'] as const
  return regions.map((region) => {
    const children = revenueByBranch
      .filter((r) => regionOf(r.branch) === region)
      .map((r) => ofBranch(r.branch))
    return {
      label: region,
      current: children.reduce((s, x) => s + x.current, 0),
      prior: children.reduce((s, x) => s + x.prior, 0),
      children,
    }
  })
})()

function VarianceTreeDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const [open, setOpen] = useState<string[]>(['Miền Bắc'])

  const maxAbs = Math.max(
    ...varianceTree.flatMap((n) => [
      Math.abs(n.current - n.prior),
      ...(n.children ?? []).map((x) => Math.abs(x.current - x.prior)),
    ]),
  )

  const VarBar = ({ delta }: { delta: number }) => {
    const good = delta >= 0
    const w = (Math.abs(delta) / maxAbs) * 50
    return (
      <span className="vt-track">
        <span className="vt-axis" style={{ background: c.axis }} />
        <span
          className="vt-fill"
          style={{
            width: `${w}%`,
            left: good ? '50%' : `${50 - w}%`,
            background: good ? c.deltaGood : c.deltaBad,
          }}
        />
      </span>
    )
  }

  const Row = ({ node, child }: { node: VarNode; child?: boolean }) => {
    const delta = node.current - node.prior
    const pct = node.prior ? (delta / node.prior) * 100 : 0
    const good = delta >= 0
    const expanded = open.includes(node.label)
    return (
      <tr className={child ? 'tbl-child-row' : 'tbl-group-row'}>
        <th scope="row" className="tbl-rowhead">
          {child ? (
            <span className="tbl-indent">{node.label}</span>
          ) : (
            <button
              type="button"
              className="tbl-toggle"
              aria-expanded={expanded}
              onClick={() =>
                setOpen((xs) =>
                  xs.includes(node.label)
                    ? xs.filter((x) => x !== node.label)
                    : [...xs, node.label],
                )
              }
            >
              <span aria-hidden>{expanded ? '▾' : '▸'}</span> {node.label}
              <span className="tbl-count">{node.children?.length}</span>
            </button>
          )}
        </th>
        <td className="num">{vnCompact(node.current)}</td>
        <td className="num">{vnCompact(node.prior)}</td>
        <td className="vt-cell">
          <VarBar delta={delta} />
          <span className="vt-value" style={{ color: good ? c.deltaGood : c.deltaBad }}>
            {good ? '+' : '−'}
            {vnCompact(Math.abs(delta))}
          </span>
        </td>
        <td className="num" style={{ color: good ? c.deltaGood : c.deltaBad }}>
          {good ? '+' : '('}
          {vnPercent(Math.abs(pct))}
          {good ? '' : ')'}
        </td>
      </tr>
    )
  }

  return (
    <div className="cx">
      <table className="dtable dtable-pivot">
        <thead>
          <tr>
            <th>Vùng / Chi nhánh</th>
            <th className="num">15 ngày gần nhất</th>
            <th className="num">15 ngày trước đó</th>
            <th className="vt-cell">Chênh lệch</th>
            <th className="num">Δ%</th>
          </tr>
        </thead>
        <tbody>
          {varianceTree.map((n) => [
            <Row key={n.label} node={n} />,
            ...(open.includes(n.label)
              ? (n.children ?? []).map((ch) => <Row key={ch.label} node={ch} child />)
              : []),
          ])}
        </tbody>
      </table>
      <p className="cx-note" style={{ color: c.inkMuted }}>
        Thanh mọc từ <b>một trục 0 dùng chung</b> cho cả bảng, nên độ dài so được giữa các dòng.
        Số âm dùng dấu ngoặc đơn <i>và</i> màu — quy ước kế toán, và cũng để người không phân biệt
        được màu vẫn đọc đúng.
      </p>
    </div>
  )
}

/* ==========================================================================
   5 — Bảng nhiều kỳ có micro-chart trong cột
   ========================================================================== */

function PeriodStatementDemo() {
  const mode = useMode()
  const c = CHROME[mode]
  const revenue = plByPeriod[0].values

  /** Micro-bar: thay đổi so với kỳ liền trước, mọi dòng dùng chung một thang. */
  const maxSwing = Math.max(
    ...plByPeriod.flatMap((r) =>
      r.values.slice(1).map((v, i) => Math.abs(v / r.values[i] - 1)),
    ),
  )

  return (
    <div className="cx">
      <div className="tbl-scroll">
        <table className="dtable ps-table">
          <thead>
            <tr>
              <th>Chỉ tiêu</th>
              {periodLabels.map((p) => (
                <th key={p} className="num">
                  {p}
                </th>
              ))}
              <th className="ps-spark">Diễn biến</th>
              <th className="ps-micro">Thay đổi từng kỳ</th>
            </tr>
          </thead>
          <tbody>
            {plByPeriod.map((row) => {
              const isTotal = row.kind === 'total'
              const contra = row.kind === 'contra'
              return (
                <tr key={row.label} className={isTotal ? 'ps-total' : undefined}>
                  <th scope="row" className="tbl-rowhead">
                    {row.label}
                    {row.showPercent && (
                      <em className="ps-sub" style={{ color: c.inkMuted }}>
                        % doanh thu
                      </em>
                    )}
                  </th>
                  {row.values.map((v, i) => (
                    <td key={i} className="num">
                      {contra ? `(${vnCompact(v)})` : vnCompact(v)}
                      {row.showPercent && (
                        <em className="ps-sub" style={{ color: c.inkMuted }}>
                          {vnPercent((v / revenue[i]) * 100, 1)}
                        </em>
                      )}
                    </td>
                  ))}
                  <td className="ps-spark">
                    <Sparkline data={row.values} width={92} height={22} showEnd={false} />
                  </td>
                  <td className="ps-micro">
                    <span className="ps-microrow">
                      {row.values.slice(1).map((v, i) => {
                        const chg = v / row.values[i] - 1
                        // Với dòng chi phí, tăng là XẤU — hướng tốt/xấu do dòng quyết định.
                        const good = contra ? chg <= 0 : chg >= 0
                        const h = Math.max(2, (Math.abs(chg) / maxSwing) * 14)
                        return (
                          <span className="ps-microcell" key={i} title={vnPercent(chg * 100)}>
                            <span
                              className="ps-microbar"
                              style={{
                                height: h,
                                marginTop: chg >= 0 ? 14 - h : 14,
                                background: good ? c.deltaGood : c.deltaBad,
                              }}
                            />
                          </span>
                        )
                      })}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="cx-note" style={{ color: c.inkMuted }}>
        Ba tầng thông tin trong một dòng: <b>con số</b> để đọc chính xác, <b>sparkline</b> để thấy
        hình dạng, <b>micro-bar</b> để thấy từng bước thay đổi. Không tầng nào thay được tầng kia —
        nhưng cũng đừng thêm tầng thứ tư.
      </p>
    </div>
  )
}

/* ========================================================================== */

export const compositeEntries: ChartEntry[] = [
  {
    id: 'funnel-band-dashboard',
    nameVi: 'Dashboard theo phễu · băng màu theo nhóm chỉ số',
    nameEn: 'Funnel-band dashboard',
    aliases: ['phễu', 'funnel dashboard', 'marketing', 'băng màu', 'nhóm chỉ số', 'combo'],
    job: 'composite',
    status: 'ready',
    description:
      'Chia dashboard thành các băng theo GIAI ĐOẠN của phễu, mỗi băng một hue. Trong băng có KPI, biểu đồ và các cột tương ứng dưới bảng — tất cả cùng màu, nên mắt gom nhóm được ngay mà không cần đọc tiêu đề. Đây là trường hợp hiếm mà màu mã hoá nhóm chứ không mã hoá series.',
    useWhen: [
      'Quy trình có thứ tự rõ ràng và mỗi bước có bộ chỉ số riêng: hiển thị → click → đơn → chi phí.',
      'Người xem cần biết “tắc ở khâu nào”, chứ không chỉ “tổng bao nhiêu”.',
      'Có bảng chi tiết dài, cần một cách gom cột thành nhóm mà không kẻ thêm khung.',
    ],
    avoidWhen: [
      'Các nhóm chỉ số không có thứ tự trước–sau → băng màu gợi ý một luồng không tồn tại.',
      'Quá 4–5 băng: hết slot màu phân biệt được, và hàng ngang thành quá chật.',
      'Đừng dùng combo cột + đường trên HAI trục Y như bản gốc của mẫu này — hai thang đo cho phép “tạo ra” bất kỳ tương quan nào. Ở đây tách thành hai dải chung trục thời gian.',
    ],
    dataShape:
      'Mỗi giai đoạn cần một chuỗi “lượng” theo thời gian + một “tỷ lệ” dẫn xuất. Bảng chi tiết: một dòng một đối tượng, các cột nhóm theo đúng giai đoạn.',
    variants: [
      'Mũi tên giữa các băng để nhấn thứ tự đọc trái → phải.',
      'Băng cuối là “chi phí/hiệu quả” — nơi tăng là xấu, nên mũi tên delta đổi chiều nghĩa.',
      'Trên mobile: các băng xếp dọc, giữ nguyên thứ tự.',
    ],
    seriesCap: '4 băng; mỗi băng 2–3 KPI và tối đa 2 dải biểu đồ.',
    demo: () => <FunnelBandsDemo />,
    code: `// Màu ở đây mã hoá GIAI ĐOẠN, không mã hoá series.
const BANDS = [
  { id: 'visibility', title: 'Hiển thị',   slot: 0, … },
  { id: 'acquisition', title: 'Tiếp cận',  slot: 1, … },
  { id: 'conversion', title: 'Chuyển đổi', slot: 2, … },
  { id: 'cost',       title: 'Chi phí',    slot: 3, … },
]
const tint = (slot) => towardSurface(SERIES[mode][slot], mode, 0.9)  // nền băng

// Hai dải chồng nhau thay cho combo hai trục Y: mỗi dải MỘT thang đo riêng,
// chung trục thời gian, nối bằng axisPointer.
grid: [{ top: 4, height: 50 }, { top: 60, height: 44 }],
xAxis: [{ gridIndex: 0, data: days, show: false }, { gridIndex: 1, data: days, show: false }],
yAxis: [{ gridIndex: 0, show: true }, { gridIndex: 1, show: false }],
axisPointer: { link: [{ xAxisIndex: 'all' }] },
series: [
  { type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: rate },
  { type: 'bar',  xAxisIndex: 1, yAxisIndex: 1, data: volume },
]

// Bảng: tiêu đề nhóm gộp bằng colSpan, tô đúng tint của băng.
<th colSpan={2} style={{ background: tint(b.slot), color: SERIES[mode][b.slot] }}>{b.title}</th>`,
  },
  {
    id: 'repeated-panels',
    nameVi: 'Panel lặp · so sánh nhiều vùng cùng bố cục',
    nameEn: 'Repeated panels / dashboard small multiples',
    aliases: ['small multiples', 'panel lặp', 'so sánh vùng', 'regional comparison', 'trellis'],
    job: 'composite',
    status: 'ready',
    description:
      'Small multiples ở cấp DASHBOARD chứ không phải cấp biểu đồ: cùng một bố cục (KPI → danh mục → xu hướng → xếp hạng) lặp lại cho từng vùng, đặt cạnh nhau. Mắt học bố cục đúng một lần rồi quét ngang so sánh — cách so nhiều đối tượng nhiều chiều rẻ nhất về mặt nhận thức.',
    useWhen: [
      'So 3–5 đối tượng cùng loại (vùng, chi nhánh, dòng sản phẩm) trên nhiều chiều cùng lúc.',
      'Mỗi đối tượng có người phụ trách riêng — ai cũng tìm thấy cột của mình ở đúng chỗ.',
    ],
    avoidWhen: [
      'Mỗi panel tự co giãn thang đo → mọi panel trông giống hệt nhau và so sánh sai hoàn toàn. Đây là lỗi số một của mẫu này.',
      'Quá 5 panel trên một hàng: chữ co lại tới mức không đọc được.',
      'Các đối tượng khác loại nhau (một vùng vs một dòng sản phẩm) — lặp bố cục sẽ gợi ý một phép so sánh không có nghĩa.',
    ],
    dataShape:
      'Cùng một tập chỉ số cho mọi đối tượng. Thiếu chỉ số ở một panel thì để ô trống có chú thích, không bỏ hẳn dòng đó khỏi panel.',
    variants: [
      'Panel “tổng” đặt đầu tiên làm mốc so.',
      'Sắp panel theo độ lớn giảm dần, hoặc theo thứ tự địa lý — chọn một và giữ nguyên.',
      'Trên màn hẹp: cuộn ngang trong khung, không xuống dòng làm vỡ hàng so sánh.',
    ],
    seriesCap: '3–5 panel; mỗi panel tối đa 4 khối con.',
    demo: () => <RegionPanelsDemo />,
    code: `// Thang đo tính MỘT LẦN trên toàn bộ dữ liệu, rồi truyền cho mọi panel.
const maxCat = Math.max(...panels.flatMap((p) => p.byCategory.map((x) => x.revenue)))

{panels.map((p) => (
  <section className="rp-panel" key={p.region}>
    <header><h5>{p.region}</h5></header>
    <div className="rp-kpis">…</div>
    {p.byCategory.map((x) => (
      <div className="rp-barrow" key={x.category}>
        <span>{x.category}</span>
        <span className="cellbar-track">
          {/* chia cho maxCat DÙNG CHUNG, không phải max của riêng panel này */}
          <span className="cellbar-fill" style={{ width: \`\${(x.revenue / maxCat) * 100}%\` }} />
        </span>
      </div>
    ))}
    <Sparkline data={p.daily} />
  </section>
))}`,
  },
  {
    id: 'multiselect-filter-table',
    nameVi: 'Bảng + panel lọc nhiều lựa chọn',
    nameEn: 'Multi-select filter panel with table',
    aliases: ['multi select', 'checkbox filter', 'lọc nhiều', 'dropdown lọc', 'panel lọc'],
    job: 'composite',
    status: 'ready',
    description:
      'Bộ lọc kiểu danh sách tick chọn: ô tìm trong danh sách, chọn tất cả / bỏ hết, và số đếm “đang chọn mấy trên mấy”. Cặp đôi kinh điển của mọi màn hình danh sách — và cũng là chỗ hay làm ẩu nhất, vì bảng lọc xong không nói cho người dùng biết đã mất bao nhiêu dòng.',
    useWhen: [
      'Danh sách lựa chọn dài quá 7–8 mục, không nhét vừa dãy chip.',
      'Người dùng thường chọn NHIỀU giá trị một lúc, không phải một.',
    ],
    avoidWhen: [
      'Chỉ có 2–5 lựa chọn → dùng dãy chip bật/tắt, thấy ngay không cần mở panel.',
      'Đừng để bảng rỗng mà không giải thích: rỗng vì bộ lọc khác hẳn rỗng vì không có dữ liệu.',
      'Đừng ẩn số đếm: “Mặt hàng ▾” không nói được là đang lọc 9 trên 14 hay đang xem tất cả.',
      'Đừng để tổng ở chân bảng tính trên TOÀN BỘ dữ liệu trong khi bảng đã lọc — tổng phải theo lát cắt.',
    ],
    dataShape: 'Một danh sách giá trị rời rạc để chọn + bảng dữ liệu lọc theo tập đã chọn.',
    variants: [
      'Chip tóm tắt bên ngoài: “Mặt hàng: 9/14” — bấm vào mở lại panel.',
      'Nhóm lựa chọn theo cấp (vùng → chi nhánh), tick cấp cha là tick hết cấp con.',
      'Giữ nguyên lựa chọn khi đổi trang, và ghi vào URL để gửi link.',
    ],
    seriesCap: 'Danh sách vài trăm mục vẫn ổn nếu có ô tìm; quá vài nghìn thì chuyển sang tìm-kiếm-rồi-chọn.',
    demo: () => <MultiSelectTableDemo />,
    code: `const [picked, setPicked] = useState<string[]>(defaults)
const [term, setTerm] = useState('')

// Ô tìm chỉ lọc DANH SÁCH LỰA CHỌN, không đụng tới tập đang chọn —
// gõ tìm rồi xoá đi thì những gì đã tick vẫn còn nguyên.
const options = all.filter((p) => p.name.toLowerCase().includes(term.toLowerCase()))
const rows    = all.filter((p) => picked.includes(p.name))

<button className="fp-trigger">
  Mặt hàng
  <span className="fp-count">{picked.length === all.length ? 'Tất cả' : \`\${picked.length}/\${all.length}\`}</span>
</button>

// Bảng luôn nói rõ đã lọc còn bao nhiêu, và tổng tính trên LÁT CẮT.
<div className="fp-foot">Hiển thị {shown.length} / {rows.length} dòng đã lọc</div>`,
  },
  {
    id: 'variance-bar-table',
    nameVi: 'Bảng chênh lệch có thanh hai chiều',
    nameEn: 'Variance table with diverging bars',
    aliases: ['variance', 'chênh lệch', 'diverging bar', 'so kỳ', 'baseline comparison', 'p&l'],
    job: 'composite',
    status: 'ready',
    description:
      'Bảng so hai kỳ, thay cột Δ khô khan bằng một thanh mọc hai chiều quanh trục 0 dùng chung. Dấu và độ lớn đọc được trong một cái liếc, mà vẫn giữ nguyên con số chính xác bên cạnh. Có phân cấp gập/mở để đi từ tổng xuống chi tiết.',
    useWhen: [
      'Báo cáo so kỳ / so kế hoạch, nơi câu hỏi đầu tiên luôn là “chỗ nào lệch nhiều nhất”.',
      'Dữ liệu có cả tăng lẫn giảm — nếu toàn dương thì thanh một chiều là đủ.',
      'Cần cả tổng cấp cao lẫn chi tiết bên dưới trong cùng một bảng.',
    ],
    avoidWhen: [
      'Mỗi dòng một thang đo riêng → thanh dài ngắn không so được với nhau, chỉ còn là trang trí.',
      'Chỉ dùng màu để phân biệt tăng/giảm: phải kèm dấu +/− hoặc ngoặc đơn.',
      'Trộn chung đơn vị khác nhau (tiền và %) vào cùng một cột thanh.',
    ],
    dataShape:
      'Mỗi dòng: giá trị kỳ này, giá trị kỳ đối chiếu. Δ và Δ% tính ra; thang thanh = |Δ| lớn nhất toàn bảng.',
    variants: [
      'Ba cột mốc: kế hoạch, cùng kỳ năm trước, trung bình ngành.',
      'Thêm cột “đóng góp vào chênh lệch tổng” khi cần biết ai kéo tổng đi.',
      'Tô nền dòng có |Δ%| vượt ngưỡng thay vì bắt người xem tự dò.',
    ],
    seriesCap: '2 cột giá trị + 1 cột thanh + 1 cột %. Thêm nữa thì tách bảng.',
    demo: () => <VarianceTreeDemo />,
    code: `// Thang thanh tính trên TOÀN BẢNG, không phải theo từng dòng.
const maxAbs = Math.max(...allRows.map((r) => Math.abs(r.current - r.prior)))

function VarBar({ delta }) {
  const good = delta >= 0
  const w = (Math.abs(delta) / maxAbs) * 50        // nửa bề ngang cho mỗi phía
  return (
    <span className="vt-track">
      <span className="vt-axis" />                  {/* trục 0 nằm đúng giữa */}
      <span className="vt-fill" style={{
        width: \`\${w}%\`,
        left: good ? '50%' : \`\${50 - w}%\`,        // âm mọc sang trái
        background: good ? c.deltaGood : c.deltaBad,
      }} />
    </span>
  )
}

// Số âm: ngoặc đơn + màu, không chỉ màu.
{good ? '+' : '('}{vnPercent(Math.abs(pct))}{good ? '' : ')'}`,
  },
  {
    id: 'period-statement-table',
    nameVi: 'Bảng nhiều kỳ có micro-chart trong cột',
    nameEn: 'Multi-period statement with in-table micro charts',
    aliases: ['income statement', 'báo cáo kết quả', 'sparkline table', 'micro chart', 'p&l'],
    job: 'composite',
    status: 'ready',
    description:
      'Dạng bảng dày nhất trong catalog: mỗi dòng một chỉ tiêu, mỗi cột một kỳ, cộng thêm một cột sparkline và một cột micro-bar cho mức thay đổi từng kỳ. Dòng tổng in đậm có nét kẻ, dòng trừ đi để trong ngoặc, dòng phụ “% doanh thu” nằm ngay dưới con số.',
    useWhen: [
      'Báo cáo tài chính / vận hành nhiều kỳ, nơi người đọc cần con số chính xác chứ không phải hình dạng.',
      'Số dòng cố định và ai cũng thuộc thứ tự các dòng — khi đó bảng nhanh hơn biểu đồ.',
    ],
    avoidWhen: [
      'Người xem chỉ cần xu hướng → một biểu đồ đường đọc nhanh hơn hẳn.',
      'Quá 8–10 kỳ trong một bảng: chuyển sang cuộn ngang có cột chỉ tiêu ghim lại, hoặc gộp kỳ.',
      'Đừng thêm tầng thứ tư (nền tô màu + sparkline + micro-bar + icon) — mỗi ô chỉ nên gánh một tín hiệu phụ.',
      'Micro-bar mỗi dòng một thang riêng: mất luôn khả năng so giữa các dòng.',
    ],
    dataShape:
      'Ma trận chỉ tiêu × kỳ, kèm phân loại dòng (tổng / thành phần / khoản trừ) để quyết định cách trình bày.',
    variants: [
      'Cột “luỹ kế từ đầu năm” đặt cạnh cột kỳ hiện tại.',
      'Ghim cột chỉ tiêu khi cuộn ngang (`position: sticky` trên ô đầu dòng).',
      'Nhấn vào một dòng để mở biểu đồ lớn của riêng chỉ tiêu đó.',
    ],
    seriesCap: '5–8 cột kỳ; 10–15 dòng chỉ tiêu.',
    demo: () => <PeriodStatementDemo />,
    code: `// Phân loại dòng quyết định CÁCH TRÌNH BÀY, không phải màu.
type PlRow = { label: string; kind: 'total' | 'step' | 'contra'; values: number[] }

<tr className={row.kind === 'total' ? 'ps-total' : undefined}>   // đậm + nét kẻ trên
  <th>{row.label}<em className="ps-sub">% doanh thu</em></th>
  {row.values.map((v, i) => (
    <td className="num">
      {row.kind === 'contra' ? \`(\${vnCompact(v)})\` : vnCompact(v)}   // khoản trừ: ngoặc đơn
      <em className="ps-sub">{vnPercent((v / revenue[i]) * 100)}</em>
    </td>
  ))}
  <td><Sparkline data={row.values} width={92} height={22} /></td>

  {/* Micro-bar: thang DÙNG CHUNG cho mọi dòng; hướng tốt/xấu do loại dòng quyết định */}
  <td>{row.values.slice(1).map((v, i) => {
    const chg  = v / row.values[i] - 1
    const good = row.kind === 'contra' ? chg <= 0 : chg >= 0
    return <span style={{ height: (Math.abs(chg) / maxSwing) * 14,
                          background: good ? c.deltaGood : c.deltaBad }} />
  })}</td>
</tr>`,
  },
]
