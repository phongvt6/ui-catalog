import { useCallback, useMemo, useState } from 'react'
import type { EChartsOption } from 'echarts'
import type { ChartEntry } from '../types'
import { EChart } from '../components/EChart'
import { Sparkline } from '../components/Figures'
import {
  BRANCHES,
  CATEGORIES,
  dates,
  facts,
  revenueByBranch,
  shortDate,
  type Branch,
  type Category,
  type FactRow,
} from '../data/sample'
import { CHROME, FONT_STACK, MARK, SERIES, vnCompact, vnPercent } from '../lib/theme'
import {
  areaFill,
  barItem,
  base,
  catAxis,
  columnItem,
  lineSeries,
  tooltip,
  valAxis,
} from '../lib/echarts'
import { useMode } from '../lib/useMode'

/* ==========================================================================
   Tầng lọc chéo dùng chung cho cả nhóm
   ==========================================================================

   Một lát cắt = tối đa ba chiều đang chọn. Mọi khối trên trang đọc CÙNG một
   lát cắt này — đó là toàn bộ ý tưởng của lọc chéo: một nguồn sự thật cho
   trạng thái lọc, nhiều cách nhìn vào nó.

   Quy ước quan trọng nhất: một khối KHÔNG tự lọc chính nó. Biểu đồ chi nhánh
   vẫn vẽ đủ 5 chi nhánh khi đã chọn CN-01 (chỉ làm mờ 4 cái còn lại) — nếu
   lọc luôn thì người xem mất đường quay lại và không so được với phần còn lại.
   Tham số `except` bên dưới chính là chỗ hiện thực quy ước đó.
   ========================================================================== */

const WEEK_LEN = 6
const WEEK_COUNT = Math.floor(dates.length / WEEK_LEN)

/** Ngày → chỉ số kỳ (0…4). Tính sẵn để không phải dò mảng trong vòng lặp lọc. */
const weekOfDate: Record<string, number> = Object.fromEntries(
  dates.map((d, i) => [d, Math.min(WEEK_COUNT - 1, Math.floor(i / WEEK_LEN))]),
)

const WEEK_LABELS = Array.from(
  { length: WEEK_COUNT },
  (_, w) => `${shortDate(dates[w * WEEK_LEN])}–${shortDate(dates[w * WEEK_LEN + WEEK_LEN - 1])}`,
)

/**
 * Thứ tự chi nhánh CỐ ĐỊNH theo doanh thu toàn kỳ, không sắp lại theo lát cắt.
 * Vị trí đứng yên thì mắt mới bám được một hàng qua nhiều lần lọc.
 */
const BRANCH_ORDER: Branch[] = revenueByBranch.map((r) => r.branch)
/** Bản đảo ngược cho thanh ngang — ECharts vẽ phần tử đầu ở ĐÁY trục. */
const BRANCH_ORDER_ASC: Branch[] = [...BRANCH_ORDER].reverse()

export interface Sel {
  branch?: Branch
  category?: Category
  week?: number
}

type Dim = keyof Sel

function useSel() {
  const [sel, setSel] = useState<Sel>({})
  /** Click lại đúng thứ đang chọn = bỏ chọn. Không cần nút "bỏ" riêng cho từng mark. */
  const toggle = useCallback(<K extends Dim>(dim: K, value: NonNullable<Sel[K]>) => {
    setSel((s) => ({ ...s, [dim]: s[dim] === value ? undefined : value }))
  }, [])
  const remove = useCallback((dim: Dim) => setSel((s) => ({ ...s, [dim]: undefined })), [])
  const clear = useCallback(() => setSel({}), [])
  const active = Object.values(sel).some((v) => v !== undefined)
  return { sel, toggle, remove, clear, active }
}

function keep(f: FactRow, sel: Sel, except?: Dim): boolean {
  if (except !== 'branch' && sel.branch && f.branch !== sel.branch) return false
  if (except !== 'category' && sel.category && f.category !== sel.category) return false
  if (except !== 'week' && sel.week !== undefined && weekOfDate[f.date] !== sel.week) return false
  return true
}

function sumRows(rows: FactRow[]): number {
  return rows.reduce((s, x) => s + x.revenue, 0)
}

function slice(sel: Sel, except?: Dim): FactRow[] {
  return facts.filter((f) => keep(f, sel, except))
}

function branchTotals(sel: Sel, order: Branch[] = BRANCH_ORDER): number[] {
  const rows = slice(sel, 'branch')
  return order.map((b) => sumRows(rows.filter((f) => f.branch === b)))
}

function categoryTotals(sel: Sel): number[] {
  const rows = slice(sel, 'category')
  return CATEGORIES.map((c) => sumRows(rows.filter((f) => f.category === c)))
}

function weekTotals(sel: Sel): number[] {
  const rows = slice(sel, 'week')
  return Array.from({ length: WEEK_COUNT }, (_, w) =>
    sumRows(rows.filter((f) => weekOfDate[f.date] === w)),
  )
}

/** Chuỗi ngày của lát cắt — dùng cho đường xu hướng và sparkline trong bảng. */
function dailySeries(sel: Sel, extra: Partial<Sel> = {}): number[] {
  const merged = { ...sel, ...extra }
  const rows = facts.filter((f) => keep(f, merged, 'week'))
  return dates.map((d) => sumRows(rows.filter((f) => f.date === d)))
}

/* -------------------------------------------------------------------------- */
/* Thanh bộ lọc — luôn hiển thị, luôn gỡ được                                  */
/* -------------------------------------------------------------------------- */

function FilterBar({
  sel,
  onRemove,
  onClear,
  hint = 'Click vào một cột, một thanh hoặc một dòng bảng để lọc chéo.',
}: {
  sel: Sel
  onRemove: (dim: Dim) => void
  onClear: () => void
  hint?: string
}) {
  const chips: { dim: Dim; label: string }[] = []
  if (sel.branch) chips.push({ dim: 'branch', label: `Chi nhánh: ${sel.branch}` })
  if (sel.category) chips.push({ dim: 'category', label: `Danh mục: ${sel.category}` })
  if (sel.week !== undefined) chips.push({ dim: 'week', label: `Kỳ: ${WEEK_LABELS[sel.week]}` })

  return (
    <div className="xf-bar">
      <span className="xf-bar-label">Đang lọc</span>
      {chips.length === 0 ? (
        <span className="xf-hint">{hint}</span>
      ) : (
        <>
          {chips.map((ch) => (
            <button
              key={ch.dim}
              type="button"
              className="xf-chip"
              onClick={() => onRemove(ch.dim)}
              title="Bỏ điều kiện này"
            >
              {ch.label}
              <span className="xf-chip-x" aria-hidden>
                ✕
              </span>
            </button>
          ))}
          <button type="button" className="xf-clear" onClick={onClear}>
            Xoá tất cả
          </button>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Các khối dùng lại được                                                      */
/* -------------------------------------------------------------------------- */

/** Màu mark: cái đang chọn giữ hue, phần còn lại lùi về xám — KHÔNG biến mất. */
function useMarkColors(labels: readonly string[], picked?: string) {
  const mode = useMode()
  const c = CHROME[mode]
  const accent = SERIES[mode][0]
  return useMemo(
    () => labels.map((l) => (!picked || l === picked ? accent : c.deemphasis)),
    [labels, picked, accent, c.deemphasis],
  )
}

function BranchBar({
  sel,
  onPick,
  height = 168,
}: {
  sel: Sel
  onPick: (b: Branch) => void
  height?: number
}) {
  const mode = useMode()
  const c = CHROME[mode]
  const values = useMemo(() => branchTotals(sel, BRANCH_ORDER_ASC), [sel])
  const colors = useMarkColors(BRANCH_ORDER_ASC, sel.branch)

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: {
        ...tooltip(mode, 'item'),
        valueFormatter: (v) => `${vnCompact(v as number)} ₫`,
      },
      grid: { left: 4, right: 56, top: 6, bottom: 2, containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: catAxis(mode, BRANCH_ORDER_ASC, { axisLine: { show: false } }),
      series: [
        {
          name: 'Doanh thu',
          type: 'bar',
          barMaxWidth: MARK.barMaxWidth,
          cursor: 'pointer',
          data: values.map((v, i) => ({ value: v, itemStyle: barItem(colors[i]) })),
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
    [mode, c, values, colors],
  )

  return (
    <EChart
      option={option}
      resetKey={mode}
      height={height}
      onClick={(e) => onPick(e.name as Branch)}
    />
  )
}

function CategoryColumns({
  sel,
  onPick,
  height = 168,
}: {
  sel: Sel
  onPick: (c: Category) => void
  height?: number
}) {
  const mode = useMode()
  const c = CHROME[mode]
  const values = useMemo(() => categoryTotals(sel), [sel])
  const colors = useMarkColors(CATEGORIES, sel.category)

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode, 'item'), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 4, right: 8, top: 22, bottom: 2, containLabel: true },
      xAxis: catAxis(mode, [...CATEGORIES]),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu',
          type: 'bar',
          barMaxWidth: MARK.barMaxWidth,
          cursor: 'pointer',
          data: values.map((v, i) => ({ value: v, itemStyle: columnItem(colors[i]) })),
          label: {
            show: true,
            position: 'top',
            formatter: (p: { value: unknown }) => vnCompact(Number(p.value)),
            color: c.inkSecondary,
            fontSize: 11,
            fontFamily: FONT_STACK,
          },
        },
      ],
    }),
    [mode, c, values, colors],
  )

  return (
    <EChart
      option={option}
      resetKey={mode}
      height={height}
      onClick={(e) => onPick(e.name as Category)}
    />
  )
}

function WeekColumns({
  sel,
  onPick,
  height = 130,
}: {
  sel: Sel
  onPick: (w: number) => void
  height?: number
}) {
  const mode = useMode()
  const values = useMemo(() => weekTotals(sel), [sel])
  const picked = sel.week === undefined ? undefined : WEEK_LABELS[sel.week]
  const colors = useMarkColors(WEEK_LABELS, picked)

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode, 'item'), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 4, right: 8, top: 10, bottom: 2, containLabel: true },
      xAxis: catAxis(mode, WEEK_LABELS),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu kỳ 6 ngày',
          type: 'bar',
          barMaxWidth: MARK.barMaxWidth,
          cursor: 'pointer',
          data: values.map((v, i) => ({ value: v, itemStyle: columnItem(colors[i]) })),
        },
      ],
    }),
    [mode, values, colors],
  )

  return <EChart option={option} resetKey={mode} height={height} onClick={(e) => onPick(e.dataIndex)} />
}

/**
 * Đường xu hướng theo ngày. Kỳ đang chọn KHÔNG cắt bớt đường — nó được tô nền
 * một dải, để vẫn thấy phần trước/sau mà so.
 */
function TrendLine({ sel, height = 168 }: { sel: Sel; height?: number }) {
  const mode = useMode()
  const c = CHROME[mode]
  const color = SERIES[mode][0]
  const values = useMemo(() => dailySeries(sel), [sel])

  const option = useMemo<EChartsOption>(
    () => ({
      ...base(mode),
      tooltip: { ...tooltip(mode), valueFormatter: (v) => `${vnCompact(v as number)} ₫` },
      grid: { left: 4, right: 12, top: 12, bottom: 2, containLabel: true },
      xAxis: catAxis(mode, dates.map(shortDate), {
        boundaryGap: false,
        axisLabel: { interval: 6, color: c.inkMuted, fontSize: 10, fontFamily: FONT_STACK },
      }),
      yAxis: valAxis(mode, vnCompact),
      series: [
        {
          name: 'Doanh thu',
          ...lineSeries(color, mode),
          data: values,
          areaStyle: areaFill(color),
          ...(sel.week === undefined
            ? {}
            : {
                markArea: {
                  silent: true,
                  itemStyle: { color: mode === 'light' ? '#0b0b0b' : '#ffffff', opacity: 0.06 },
                  data: [
                    [
                      { xAxis: shortDate(dates[sel.week * WEEK_LEN]) },
                      { xAxis: shortDate(dates[sel.week * WEEK_LEN + WEEK_LEN - 1]) },
                    ],
                  ],
                },
              }),
        },
      ],
    }),
    [mode, c, color, values, sel.week],
  )

  return <EChart option={option} resetKey={mode} height={height} />
}

/* -------------------------------------------------------------------------- */
/* Bảng                                                                        */
/* -------------------------------------------------------------------------- */

/** Bảng chi nhánh: vừa là ĐÍCH của bộ lọc, vừa là NGUỒN chọn chi nhánh. */
function BranchTable({ sel, onPick }: { sel: Sel; onPick: (b: Branch) => void }) {
  const mode = useMode()
  const c = CHROME[mode]
  const rows = useMemo(() => {
    const scoped = slice(sel, 'branch')
    const total = sumRows(scoped)
    return BRANCH_ORDER.map((branch) => {
      const revenue = sumRows(scoped.filter((f) => f.branch === branch))
      return {
        branch,
        revenue,
        share: total ? (revenue / total) * 100 : 0,
        spark: dailySeries(sel, { branch }).slice(-14),
      }
    })
  }, [sel])

  return (
    <table className="dtable">
      <thead>
        <tr>
          <th>Chi nhánh</th>
          <th className="num">Doanh thu</th>
          <th className="num">Tỷ trọng</th>
          <th>Diễn biến 14 ngày</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const picked = sel.branch === r.branch
          return (
            <tr
              key={r.branch}
              className={picked ? 'xf-row is-picked' : 'xf-row'}
              onClick={() => onPick(r.branch)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPick(r.branch)
                }
              }}
              tabIndex={0}
              aria-selected={picked}
              title={picked ? 'Bấm lại để bỏ lọc' : `Lọc theo ${r.branch}`}
            >
              <td>{r.branch}</td>
              <td className="num">{vnCompact(r.revenue)} ₫</td>
              <td className="num" style={{ color: c.inkMuted }}>
                {vnPercent(r.share, 0)}
              </td>
              <td>
                <Sparkline data={r.spark} width={96} height={22} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** Bảng danh mục của MỘT chi nhánh — khối "phụ" trong cặp chính–phụ. */
function CategoryTable({ sel, onPick }: { sel: Sel; onPick: (c: Category) => void }) {
  const mode = useMode()
  const cr = CHROME[mode]
  const accent = SERIES[mode][0]
  const rows = useMemo(() => {
    const scoped = slice(sel, 'category')
    const total = sumRows(scoped)
    return CATEGORIES.map((category) => {
      const revenue = sumRows(scoped.filter((f) => f.category === category))
      return { category, revenue, share: total ? (revenue / total) * 100 : 0 }
    })
  }, [sel])
  const max = Math.max(...rows.map((r) => r.revenue), 1)

  return (
    <table className="dtable">
      <thead>
        <tr>
          <th>Danh mục</th>
          <th className="num">Doanh thu</th>
          <th className="tbl-barcol">Tỷ trọng</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const picked = sel.category === r.category
          return (
            <tr
              key={r.category}
              className={picked ? 'xf-row is-picked' : 'xf-row'}
              onClick={() => onPick(r.category)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPick(r.category)
                }
              }}
              tabIndex={0}
              aria-selected={picked}
              title={picked ? 'Bấm lại để bỏ lọc' : `Lọc theo ${r.category}`}
            >
              <td>{r.category}</td>
              <td className="num">{vnCompact(r.revenue)} ₫</td>
              <td className="tbl-barcol">
                <span className="xf-cellbar">
                  <span className="cellbar-track" style={{ background: cr.grid }}>
                    <span
                      className="cellbar-fill"
                      style={{
                        width: `${(r.revenue / max) * 100}%`,
                        background: picked || !sel.category ? accent : cr.deemphasis,
                      }}
                    />
                  </span>
                  <span className="xf-share" style={{ color: cr.inkMuted }}>
                    {vnPercent(r.share, 0)}
                  </span>
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** Bảng chi tiết: mỗi dòng là một cặp chi nhánh × danh mục CÒN LẠI sau khi lọc. */
function DetailTable({ sel }: { sel: Sel }) {
  const mode = useMode()
  const c = CHROME[mode]
  const rows = useMemo(() => {
    const scoped = slice(sel)
    const out: { branch: Branch; category: Category; revenue: number; orders: number }[] = []
    for (const branch of BRANCH_ORDER) {
      for (const category of CATEGORIES) {
        const cells = scoped.filter((f) => f.branch === branch && f.category === category)
        if (!cells.length) continue
        out.push({
          branch,
          category,
          revenue: sumRows(cells),
          orders: cells.reduce((s, x) => s + x.orders, 0),
        })
      }
    }
    return out.sort((a, b) => b.revenue - a.revenue)
  }, [sel])

  const allRows = BRANCHES.length * CATEGORIES.length

  return (
    <>
      <div className="xf-tablecap" style={{ color: c.inkMuted }}>
        {rows.length} / {allRows} dòng khớp lát cắt đang chọn
      </div>
      <div className="xf-scroll">
        <table className="dtable">
          <thead>
            <tr>
              <th>Chi nhánh</th>
              <th>Danh mục</th>
              <th className="num">Doanh thu</th>
              <th className="num">Số đơn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.branch}-${r.category}`}>
                <td>{r.branch}</td>
                <td>{r.category}</td>
                <td className="num">{vnCompact(r.revenue)} ₫</td>
                <td className="num">{r.orders ? r.orders.toLocaleString('vi-VN') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ==========================================================================
   Demo 1 — 2 khối: biểu đồ ↔ biểu đồ
   ========================================================================== */

function TwoChartsDemo() {
  const { sel, toggle, remove, clear } = useSel()
  return (
    <div className="xf">
      <FilterBar
        sel={sel}
        onRemove={remove}
        onClear={clear}
        hint="Click một thanh chi nhánh → đường bên phải đổi theo. Click lại để bỏ."
      />
      <div className="xf-grid is-2">
        <section className="dash-panel">
          <h4>Doanh thu theo chi nhánh · nguồn lọc</h4>
          <BranchBar sel={sel} onPick={(b) => toggle('branch', b)} />
        </section>
        <section className="dash-panel">
          <h4>
            Doanh thu theo ngày{' '}
            <span className="xf-scope">{sel.branch ? `· ${sel.branch}` : '· toàn chuỗi'}</span>
          </h4>
          <TrendLine sel={sel} />
        </section>
      </div>
    </div>
  )
}

/* ==========================================================================
   Demo 2 — 2 khối: biểu đồ ↔ bảng, lọc hai chiều
   ========================================================================== */

function ChartTableDemo() {
  const { sel, toggle, remove, clear } = useSel()
  return (
    <div className="xf">
      <FilterBar
        sel={sel}
        onRemove={remove}
        onClear={clear}
        hint="Click cột danh mục → bảng đổi số. Click dòng bảng → cột danh mục đổi theo."
      />
      <div className="xf-grid is-2">
        <section className="dash-panel">
          <h4>Doanh thu theo danh mục</h4>
          <CategoryColumns sel={sel} onPick={(c) => toggle('category', c)} />
        </section>
        <section className="dash-panel">
          <h4>
            Chi tiết theo chi nhánh{' '}
            <span className="xf-scope">
              {sel.category ? `· chỉ ${sel.category}` : '· tất cả danh mục'}
            </span>
          </h4>
          <BranchTable sel={sel} onPick={(b) => toggle('branch', b)} />
        </section>
      </div>
    </div>
  )
}

/* ==========================================================================
   Demo 3 — 2 khối: bảng ↔ bảng (chính – phụ)
   ========================================================================== */

function TableTableDemo() {
  const { sel, toggle, remove, clear } = useSel()
  return (
    <div className="xf">
      <FilterBar
        sel={sel}
        onRemove={remove}
        onClear={clear}
        hint="Chọn một dòng ở bảng trái → bảng phải mở chi tiết đúng dòng đó."
      />
      <div className="xf-grid is-2">
        <section className="dash-panel">
          <h4>Bảng chính · chi nhánh</h4>
          <BranchTable sel={sel} onPick={(b) => toggle('branch', b)} />
        </section>
        <section className="dash-panel">
          <h4>
            Bảng phụ · danh mục{' '}
            <span className="xf-scope">{sel.branch ? `của ${sel.branch}` : 'của toàn chuỗi'}</span>
          </h4>
          <CategoryTable sel={sel} onPick={(c) => toggle('category', c)} />
        </section>
      </div>
    </div>
  )
}

/* ==========================================================================
   Demo 4 — 3 khối: 2 biểu đồ + 1 bảng
   ========================================================================== */

function ThreePanelDemo() {
  const { sel, toggle, remove, clear } = useSel()
  return (
    <div className="xf">
      <FilterBar sel={sel} onRemove={remove} onClear={clear} />
      <div className="xf-grid is-2">
        <section className="dash-panel">
          <h4>Chi nhánh</h4>
          <BranchBar sel={sel} onPick={(b) => toggle('branch', b)} height={150} />
        </section>
        <section className="dash-panel">
          <h4>Danh mục</h4>
          <CategoryColumns sel={sel} onPick={(c) => toggle('category', c)} height={150} />
        </section>
      </div>
      <section className="dash-panel">
        <h4>Bảng chi tiết · đích của mọi bộ lọc</h4>
        <DetailTable sel={sel} />
      </section>
    </div>
  )
}

/* ==========================================================================
   Demo 5 — 4 khối: hàng KPI + 2 biểu đồ + bảng
   ========================================================================== */

function FourPanelDemo() {
  const { sel, toggle, remove, clear, active } = useSel()
  const mode = useMode()
  const c = CHROME[mode]

  const stats = useMemo(() => {
    const rows = slice(sel)
    const revenue = sumRows(rows)
    const orders = rows.reduce((s, x) => s + x.orders, 0)
    const days = new Set(rows.map((f) => f.date)).size
    const all = sumRows(facts)
    return { revenue, orders, days, share: (revenue / all) * 100 }
  }, [sel])

  return (
    <div className="xf">
      <FilterBar sel={sel} onRemove={remove} onClear={clear} />

      {/* Hàng KPI đọc CÙNG lát cắt — nếu KPI không đổi theo bộ lọc thì cả trang mất tin cậy. */}
      <div className="kpi-row">
        <div className="tile">
          <div className="tile-label">Doanh thu lát cắt</div>
          <div className="tile-value is-hero">{vnCompact(stats.revenue)} ₫</div>
          <div className="tile-delta" style={{ color: c.inkMuted }}>
            {vnPercent(stats.share, 1)} tổng toàn chuỗi
          </div>
        </div>
        <div className="tile">
          <div className="tile-label">Số đơn</div>
          <div className="tile-value">{stats.orders.toLocaleString('vi-VN')}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Số ngày có dữ liệu</div>
          <div className="tile-value">{stats.days}</div>
        </div>
      </div>

      <div className="xf-grid is-2">
        <section className="dash-panel">
          <h4>Chi nhánh</h4>
          <BranchBar sel={sel} onPick={(b) => toggle('branch', b)} height={150} />
        </section>
        <section className="dash-panel">
          <h4>Danh mục</h4>
          <CategoryColumns sel={sel} onPick={(c2) => toggle('category', c2)} height={150} />
        </section>
      </div>

      <section className="dash-panel">
        <h4>Bảng chi tiết</h4>
        <DetailTable sel={sel} />
      </section>

      <p className="dash-foot" style={{ color: c.inkMuted }}>
        {active
          ? 'Bộ lọc đang áp cho cả 4 khối — chip ở trên là chỗ duy nhất gỡ được.'
          : 'Chưa lọc: cả 4 khối đang xem toàn chuỗi, 30 ngày.'}
      </p>
    </div>
  )
}

/* ==========================================================================
   Demo 6 — 5 khối: chọn kỳ + 2 biểu đồ + đường + bảng
   ========================================================================== */

function FivePanelDemo() {
  const { sel, toggle, remove, clear } = useSel()
  const mode = useMode()
  const c = CHROME[mode]

  return (
    <div className="xf">
      <FilterBar
        sel={sel}
        onRemove={remove}
        onClear={clear}
        hint="Ba nguồn lọc độc lập — chi nhánh, danh mục, kỳ — cộng dồn thành MỘT lát cắt."
      />

      <section className="dash-panel">
        <h4>Chọn kỳ · 5 kỳ 6 ngày</h4>
        <WeekColumns sel={sel} onPick={(w) => toggle('week', w)} />
      </section>

      <div className="xf-grid is-3">
        <section className="dash-panel">
          <h4>Chi nhánh</h4>
          <BranchBar sel={sel} onPick={(b) => toggle('branch', b)} height={150} />
        </section>
        <section className="dash-panel">
          <h4>Danh mục</h4>
          <CategoryColumns sel={sel} onPick={(c2) => toggle('category', c2)} height={150} />
        </section>
        <section className="dash-panel">
          <h4>Theo ngày</h4>
          <TrendLine sel={sel} height={150} />
        </section>
      </div>

      <section className="dash-panel">
        <h4>Bảng chi tiết</h4>
        <DetailTable sel={sel} />
      </section>

      <p className="dash-foot" style={{ color: c.inkMuted }}>
        Kỳ đang chọn không cắt cụt đường xu hướng — nó chỉ tô nền một dải, để vẫn so được với
        phần trước và sau.
      </p>
    </div>
  )
}

/* ========================================================================== */

export const crossFilterEntries: ChartEntry[] = [
  {
    id: 'crossfilter-chart-chart',
    nameVi: 'Lọc chéo 2 khối · biểu đồ ↔ biểu đồ',
    nameEn: 'Cross-filter, two charts',
    aliases: ['cross filter', 'lọc chéo', 'linked chart', 'drill', 'liên kết biểu đồ'],
    job: 'cross-filter',
    status: 'ready',
    description:
      'Cặp nhỏ nhất của lọc chéo: một biểu đồ làm NGUỒN chọn, một biểu đồ làm ĐÍCH. Click một thanh chi nhánh thì đường doanh thu bên cạnh vẽ lại cho riêng chi nhánh đó. Điểm mấu chốt: nguồn không tự lọc chính nó — vẫn đủ 5 thanh, 4 thanh còn lại chỉ lùi về xám.',
    useWhen: [
      'Người xem cần đi từ “ai” sang “khi nào” mà không phải rời trang.',
      'Hai câu hỏi luôn đi liền nhau: xếp hạng rồi tới diễn biến.',
    ],
    avoidWhen: [
      'Chỉ có một biểu đồ → không có gì để lọc chéo, đừng bịa thêm khối cho có tương tác.',
      'Đừng xoá hẳn các mark không được chọn ở khối nguồn: mất ngữ cảnh, và người xem không còn chỗ bấm để quay lại.',
      'Đừng để bộ lọc chỉ tồn tại “trong đầu biểu đồ” — không có chip hiển thị thì 30 giây sau không ai nhớ đang xem lát cắt nào.',
    ],
    dataShape:
      'Một bảng fact chung cho cả hai khối (ngày × chi nhánh × danh mục × giá trị). Hai khối phải đọc CÙNG một nguồn, nếu không số sẽ lệch nhau.',
    variants: [
      'Hai chiều: click đường → lọc ngược lại biểu đồ chi nhánh.',
      'Hover-highlight thay vì click-filter khi chỉ cần liên hệ nhanh, không cần giữ trạng thái.',
      'Ctrl/Cmd-click để chọn nhiều giá trị cùng một chiều.',
    ],
    seriesCap: '2 khối. Từ 3 khối trở lên bắt buộc có thanh chip bộ lọc.',
    demo: () => <TwoChartsDemo />,
    code: `// MỘT nguồn sự thật cho trạng thái lọc, mọi khối đọc chung.
const [sel, setSel] = useState<{ branch?: Branch }>({})
const toggle = (b: Branch) =>
  setSel((s) => ({ ...s, branch: s.branch === b ? undefined : b })) // click lại = bỏ chọn

// Khối NGUỒN: không tự lọc chính nó, chỉ đổi màu.
data: BRANCHES.map((b) => ({
  value: totalOf(b),
  itemStyle: barItem(!sel.branch || b === sel.branch ? accent : c.deemphasis),
}))
<EChart option={option} onClick={(e) => toggle(e.name as Branch)} />

// Khối ĐÍCH: lọc thật.
const values = dates.map((d) =>
  facts.filter((f) => f.date === d && (!sel.branch || f.branch === sel.branch))
       .reduce((s, x) => s + x.revenue, 0))`,
  },
  {
    id: 'crossfilter-chart-table',
    nameVi: 'Lọc chéo 2 khối · biểu đồ ↔ bảng',
    nameEn: 'Cross-filter, chart and table',
    aliases: ['chart table link', 'biểu đồ và bảng', 'lọc hai chiều', 'bidirectional'],
    job: 'cross-filter',
    status: 'ready',
    description:
      'Biểu đồ trả lời “hình dạng”, bảng trả lời “con số chính xác” — nối hai chiều thì được cả hai. Click cột danh mục, bảng tính lại theo danh mục đó; click một dòng bảng, cột danh mục tính lại cho riêng chi nhánh đó. Mỗi khối là nguồn của một chiều khác nhau, nên không có vòng lặp.',
    useWhen: [
      'Người xem vừa cần thấy tổng quan vừa cần trích đúng con số để dán vào báo cáo.',
      'Bảng đã có sẵn và không muốn thêm bộ lọc dropdown ở trên đầu.',
    ],
    avoidWhen: [
      'Hai khối cùng lọc CÙNG một chiều → vòng lặp, bấm đâu cũng thấy trang nhấp nháy mà không rõ tại sao.',
      'Bảng dài hàng trăm dòng mà lọc làm dòng biến mất không báo gì → luôn hiện “x / y dòng khớp”.',
      'Đừng để dòng bảng vừa là link mở trang chi tiết vừa là nút lọc — một hành vi cho một cú click.',
    ],
    dataShape:
      'Cùng một fact table. Bảng hiển thị số liệu đã tổng hợp theo chiều mà biểu đồ KHÔNG dùng làm nguồn.',
    variants: [
      'Dòng bảng được chọn giữ nền nhạt + đậm chữ, không phải chỉ đổi màu chữ.',
      'Nút “Xuất Excel” xuất đúng lát cắt đang lọc, không xuất toàn bộ.',
    ],
    seriesCap: 'Bảng đích nên ≤ 12 dòng để thấy được thay đổi ngay, dài hơn thì cho cuộn trong khung.',
    demo: () => <ChartTableDemo />,
    code: `// Mỗi khối là NGUỒN của một chiều khác nhau → không bao giờ thành vòng lặp.
// Biểu đồ  → chọn 'category'
// Bảng     → chọn 'branch'
<CategoryColumns sel={sel} onPick={(c) => toggle('category', c)} />
<BranchTable    sel={sel} onPick={(b) => toggle('branch', b)} />

// Dòng bảng: click để lọc, có trạng thái chọn rõ ràng, và bàn phím dùng được.
<tr
  className={sel.branch === r.branch ? 'xf-row is-picked' : 'xf-row'}
  onClick={() => toggle('branch', r.branch)}
  onKeyDown={(e) => { if (e.key === 'Enter') toggle('branch', r.branch) }}
  tabIndex={0}
  aria-selected={sel.branch === r.branch}
>`,
  },
  {
    id: 'crossfilter-table-table',
    nameVi: 'Lọc chéo 2 khối · bảng ↔ bảng (chính–phụ)',
    nameEn: 'Master–detail tables',
    aliases: ['master detail', 'bảng chính phụ', 'drill down', 'bảng liên kết'],
    job: 'cross-filter',
    status: 'ready',
    description:
      'Bảng chính chọn một dòng, bảng phụ mở chi tiết của đúng dòng đó. Khác với bảng lồng nhau ở chỗ: chi tiết có CẤU TRÚC CỘT KHÁC hẳn bảng chính, nên không nhét vào cùng một bảng được. Khi chưa chọn gì, bảng phụ hiện chi tiết của toàn bộ — không bao giờ để trống trơn.',
    useWhen: [
      'Chi tiết có tập cột riêng (chi nhánh → danh mục, đơn hàng → dòng hàng).',
      'Cần so nhanh nhiều dòng chính trong khi vẫn giữ một chi tiết đang mở.',
    ],
    avoidWhen: [
      'Chi tiết cùng bộ cột với bảng chính → dùng bảng phân cấp có tổng phụ, gọn hơn hẳn.',
      'Đừng để bảng phụ trống khi chưa chọn dòng nào: mặc định phải là “toàn bộ”, kèm chữ nói rõ phạm vi.',
      'Đừng bắt cuộn xa mới thấy bảng phụ — hai bảng phải nằm trong cùng một tầm mắt, nếu không thì dùng trang chi tiết riêng.',
    ],
    dataShape:
      'Quan hệ cha–con: mỗi dòng bảng chính có khoá để lọc ra tập dòng của bảng phụ.',
    variants: [
      'Bảng phụ đặt dưới bảng chính khi màn hình hẹp — giữ nguyên thứ tự đọc chính trước phụ.',
      'Tiêu đề bảng phụ luôn nhắc lại phạm vi: “Danh mục của CN-01”.',
      'Bảng phụ cũng lọc ngược được (chọn danh mục) khi cần lát cắt hai chiều.',
    ],
    seriesCap: '2 bảng. Ba cấp trở lên → chuyển sang cây có tổng phụ hoặc trang chi tiết riêng.',
    demo: () => <TableTableDemo />,
    code: `// Bảng phụ luôn có phạm vi mặc định — KHÔNG bao giờ rỗng khi chưa chọn.
<h4>
  Bảng phụ · danh mục
  <span className="xf-scope">{sel.branch ? \`của \${sel.branch}\` : 'của toàn chuỗi'}</span>
</h4>

// Dữ liệu bảng phụ = fact đã lọc theo dòng chính đang chọn.
const rows = CATEGORIES.map((category) => ({
  category,
  revenue: facts
    .filter((f) => f.category === category && (!sel.branch || f.branch === sel.branch))
    .reduce((s, x) => s + x.revenue, 0),
}))`,
  },
  {
    id: 'crossfilter-3-panels',
    nameVi: 'Lọc chéo 3 khối · 2 biểu đồ + bảng',
    nameEn: 'Cross-filter, three panels',
    aliases: ['3 panel', 'ba khối', 'dashboard lọc chéo'],
    job: 'cross-filter',
    status: 'ready',
    description:
      'Hai biểu đồ là hai NGUỒN lọc theo hai chiều khác nhau, một bảng là ĐÍCH nhận cả hai. Điều kiện cộng dồn bằng VÀ: chọn CN-01 rồi chọn Thiết bị thì bảng còn đúng một dòng. Từ ba khối trở lên, thanh chip bộ lọc không còn là tuỳ chọn.',
    useWhen: [
      'Có 2–3 chiều phân tích mà người xem hay kết hợp với nhau.',
      'Muốn thay bộ dropdown khô khan bằng chính các biểu đồ — chọn ngay trên hình.',
    ],
    avoidWhen: [
      'Người xem chỉ cần lọc theo một chiều duy nhất → một dropdown là đủ, đừng bắt học cách tương tác mới.',
      'Đừng để hai biểu đồ cùng lọc một chiều: bấm cái này thì cái kia mất trạng thái, không ai hiểu vì sao.',
      'Đừng lọc chéo khi số dòng đích quá nhỏ (dưới ~5) — lọc xong còn 1 dòng thì thà cho bảng luôn.',
    ],
    dataShape: 'Fact table nhiều chiều; mỗi khối nguồn phụ trách đúng MỘT chiều.',
    variants: [
      'Thêm nút “Xoá tất cả” cạnh dãy chip khi có từ 2 điều kiện trở lên.',
      'Ghi lát cắt vào URL (?branch=CN-01&cat=…) để gửi link giữ nguyên trạng thái.',
      'Lưu lát cắt vào localStorage cho lần mở sau.',
    ],
    seriesCap: '3 khối; tối đa 3 chiều lọc cùng lúc trước khi nên chuyển sang panel bộ lọc riêng.',
    demo: () => <ThreePanelDemo />,
    code: `// Bộ lọc cộng dồn bằng VÀ. Tham số \`except\` là chỗ hiện thực quy ước
// "một khối không tự lọc chính nó".
function keep(f: FactRow, sel: Sel, except?: Dim) {
  if (except !== 'branch'   && sel.branch   && f.branch   !== sel.branch)   return false
  if (except !== 'category' && sel.category && f.category !== sel.category) return false
  return true
}

const branchValues   = BRANCHES.map((b)  => sum(facts.filter((f) => keep(f, sel, 'branch')   && f.branch === b)))
const categoryValues = CATEGORIES.map((c) => sum(facts.filter((f) => keep(f, sel, 'category') && f.category === c)))
const detailRows     = facts.filter((f) => keep(f, sel))   // bảng đích: lọc đủ mọi chiều

// Luôn nói rõ đã lọc mất bao nhiêu.
<div className="xf-tablecap">{rows.length} / {allRows} dòng khớp lát cắt đang chọn</div>`,
  },
  {
    id: 'crossfilter-4-panels',
    nameVi: 'Lọc chéo 4 khối · KPI + 2 biểu đồ + bảng',
    nameEn: 'Cross-filter, four panels',
    aliases: ['4 panel', 'bốn khối', 'kpi lọc theo'],
    job: 'cross-filter',
    status: 'ready',
    description:
      'Thêm hàng KPI vào bố cục 3 khối. Quy tắc sống còn: KPI phải đổi theo bộ lọc như mọi khối khác. Một hàng KPI đứng yên trong khi biểu đồ bên dưới đã lọc là cách nhanh nhất để mất niềm tin vào cả trang — người xem sẽ nghĩ số nào cũng sai.',
    useWhen: [
      'Trang có cả người xem tổng quan (dừng ở KPI) lẫn người soi chi tiết (xuống bảng).',
      'Cần thấy ngay lát cắt đang chọn chiếm bao nhiêu phần của tổng.',
    ],
    avoidWhen: [
      'KPI lấy từ nguồn khác không lọc được → thà bỏ KPI, hoặc ghi rõ “toàn chuỗi, không theo bộ lọc”.',
      'Đừng nhồi 6–8 ô KPI: lọc xong người xem phải quét lại cả bức tường số.',
      'Đừng để trang nhảy giật khi lọc — khối phải giữ nguyên chiều cao, chỉ đổi nội dung.',
    ],
    dataShape:
      'Fact table nhiều chiều. KPI = tổng hợp trên đúng tập dòng đã lọc, tính cùng chỗ với bảng.',
    variants: [
      'Mỗi KPI kèm “x% tổng toàn chuỗi” để lát cắt luôn có mốc so.',
      'Hiện đồng thời giá trị lát cắt và giá trị toàn chuỗi bị làm mờ phía sau.',
      'Nút quay lại lát cắt trước (undo) khi chuỗi lọc dài.',
    ],
    seriesCap: '3–4 ô KPI, 2 biểu đồ, 1 bảng.',
    demo: () => <FourPanelDemo />,
    code: `// KPI đọc CÙNG lát cắt với biểu đồ và bảng — không có ngoại lệ.
const rows    = facts.filter((f) => keep(f, sel))
const revenue = rows.reduce((s, x) => s + x.revenue, 0)
const share   = (revenue / totalAll) * 100

<div className="kpi-row">
  <div className="tile">
    <div className="tile-label">Doanh thu lát cắt</div>
    <div className="tile-value is-hero">{vnCompact(revenue)} ₫</div>
    <div className="tile-delta">{vnPercent(share)} tổng toàn chuỗi</div>
  </div>
  …
</div>`,
  },
  {
    id: 'crossfilter-5-panels',
    nameVi: 'Lọc chéo 5 khối · thêm chọn khoảng thời gian',
    nameEn: 'Cross-filter, five panels',
    aliases: ['5 panel', 'năm khối', 'brush', 'chọn khoảng', 'time range'],
    job: 'cross-filter',
    status: 'ready',
    description:
      'Bố cục lớn nhất còn đọc được: một khối chọn kỳ + ba khối phân tích + một bảng. Ba chiều lọc độc lập cộng dồn thành một lát cắt. Đường xu hướng cố tình KHÔNG bị cắt theo kỳ đang chọn — kỳ đó chỉ được tô nền, để phần trước và sau vẫn còn đó mà so.',
    useWhen: [
      'Dashboard vận hành mà người dùng thật sự khoanh vùng thời gian rồi mới soi tiếp.',
      'Đã có đủ 3 chiều lọc quen thuộc và người xem dùng chúng hằng ngày.',
    ],
    avoidWhen: [
      'Người xem lần đầu / xem một lần rồi thôi — 5 khối tương tác là quá nhiều để học.',
      'Đừng vượt quá 3 chiều lọc trên một trang: sau đó không ai đoán nổi vì sao bảng rỗng.',
      'Đừng để lọc xong ra rỗng mà không có lối thoát — luôn kèm “Xoá tất cả”.',
      'Đừng cắt cụt đường xu hướng theo kỳ đã chọn: mất hẳn phần so sánh trước/sau.',
    ],
    dataShape:
      'Fact table có cột thời gian; kỳ được gom sẵn thành các khối đều nhau (ở đây 5 kỳ × 6 ngày).',
    variants: [
      'Thay dãy cột chọn kỳ bằng brush kéo thả trên chính đường xu hướng (ECharts `brush` / `dataZoom`).',
      'Thanh chip bộ lọc dính (sticky) ở đầu trang khi cuộn dài.',
      'Nút “So với kỳ trước” tự đặt lát cắt đối chiếu.',
    ],
    seriesCap: '5 khối, 3 chiều lọc. Quá mức này → tách thành nhiều trang.',
    demo: () => <FivePanelDemo />,
    code: `// Chiều thời gian gom sẵn thành các kỳ đều nhau → click một cột là chọn cả kỳ.
const weekOfDate = Object.fromEntries(dates.map((d, i) => [d, Math.floor(i / 6)]))
<WeekColumns sel={sel} onPick={(w) => toggle('week', w)} />

// Đường xu hướng KHÔNG cắt theo kỳ — chỉ tô nền dải đang chọn.
markArea: sel.week === undefined ? undefined : {
  silent: true,
  itemStyle: { color: mode === 'light' ? '#0b0b0b' : '#ffffff', opacity: 0.06 },
  data: [[
    { xAxis: shortDate(dates[sel.week * 6]) },
    { xAxis: shortDate(dates[sel.week * 6 + 5]) },
  ]],
}`,
  },
]
