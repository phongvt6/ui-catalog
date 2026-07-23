import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { CATALOG, deaccent } from './data'
import { CATEGORIES, LATEST_RELEASE } from './types'
import { EntryDetail } from './components/EntryDetail'
import { HomePage } from './components/HomePage'
import { CategoryPage } from './components/CategoryPage'
import { SearchPage } from './components/SearchPage'
import { ChangelogPage } from './components/ChangelogPage'
import { NewPage } from './components/NewPage'
import { areaOf, hrefOf, useRoute, type Area } from './lib/route'
import { JOBS, CHART_COUNT, type ChartEntry } from './chart/types'
import type { ChartView } from './chart/ChartArea'

/** ECharts nặng gần 1MB — chỉ tải khi người dùng thật sự mở khu vực Biểu đồ. */
const ChartArea = lazy(() => import('./chart/ChartArea'))

type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const saved = localStorage.getItem('ui-catalog-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [query, setQuery] = useState('')
  const route = useRoute()
  const area: Area = areaOf(route)
  /**
   * Danh mục biểu đồ chỉ nạp khi thật sự cần (mở khu Biểu đồ hoặc đang tìm
   * kiếm) — nếu import tĩnh thì toàn bộ code demo chart sẽ nằm trong bundle
   * đầu, dù người dùng chỉ tra component.
   */
  const [charts, setCharts] = useState<ChartEntry[] | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ui-catalog-theme', theme)
    // Demo biểu đồ đọc màu từ JS chứ không chỉ CSS — báo cho chúng vẽ lại.
    window.dispatchEvent(new CustomEvent('chart-catalog-theme'))
  }, [theme])

  // Trang kết quả tìm kiếm che khung nội dung, nên đi tới bất kỳ đâu (sidebar,
  // thẻ, breadcrumb) đều phải tự thoát khỏi nó — nếu không sẽ như bấm hụt.
  useEffect(() => setQuery(''), [route])

  const q = query.trim()
  const searching = q.length > 0

  useEffect(() => {
    if (charts || (area !== 'chart' && !searching)) return
    let alive = true
    import('./chart/entries').then((m) => {
      if (alive) setCharts(m.entries)
    })
    return () => {
      alive = false
    }
  }, [charts, area, searching])

  const uiResults = useMemo(() => {
    const needle = deaccent(q)
    if (!needle) return []
    return CATALOG.filter((e) =>
      deaccent(
        [e.nameEn, e.nameVi, ...(e.aliases ?? []), e.description, e.purpose].join(' '),
      ).includes(needle),
    )
  }, [q])

  const chartResults = useMemo(() => {
    const needle = deaccent(q)
    if (!needle || !charts) return []
    return charts.filter((e) =>
      deaccent([e.nameVi, e.nameEn, ...(e.aliases ?? []), e.description].join(' ')).includes(
        needle,
      ),
    )
  }, [q, charts])

  const entry = route.kind === 'entry' ? CATALOG.find((e) => e.id === route.id) : undefined
  const category =
    route.kind === 'category' ? CATEGORIES.find((c) => c.id === route.id) : undefined

  const countOf = (id: string) => CATALOG.filter((e) => e.category === id).length
  const chartCountOf = (id: string) =>
    charts ? charts.filter((e) => e.job === id).length : undefined
  const newCount = CATALOG.filter((e) => e.since === LATEST_RELEASE.version).length

  const chartView: ChartView | null = searching
    ? { kind: 'search', query: q, results: chartResults }
    : route.kind === 'chart-home'
      ? { kind: 'home' }
      : route.kind === 'chart-job'
        ? { kind: 'job', id: route.id as never }
        : route.kind === 'chart-entry'
          ? { kind: 'entry', id: route.id }
          : route.kind === 'chart-rules'
            ? { kind: 'rules' }
            : route.kind === 'chart-anatomy'
              ? { kind: 'anatomy' }
              : null

  const navItem = (href: string, active: boolean, label: string, count?: number | string) => (
    <a className={active ? 'nav-item is-active' : 'nav-item'} href={href} key={href}>
      {label}
      {count !== undefined && <span className="nav-count">{count}</span>}
    </a>
  )

  return (
    <div className="app">
      <header className="app-head">
        <a className="brand" href={hrefOf({ kind: 'home' })} title="Về trang chủ">
          <span className="brand-mark">UI</span>
          <span className="brand-names">Từ điển UI</span>
        </a>

        {/* Hai khu vực: đổi khu là đổi luôn danh sách nhóm ở sidebar */}
        <nav className="area-tabs" aria-label="Khu vực">
          <a
            className={area === 'ui' ? 'area-tab is-on' : 'area-tab'}
            href={hrefOf({ kind: 'home' })}
            aria-current={area === 'ui'}
          >
            Component <span>{CATALOG.length}</span>
          </a>
          <a
            className={area === 'chart' ? 'area-tab is-on' : 'area-tab'}
            href={hrefOf({ kind: 'chart-home' })}
            aria-current={area === 'chart'}
          >
            Biểu đồ <span>{charts?.length ?? CHART_COUNT}</span>
          </a>
        </nav>

        <input
          className="head-search"
          type="search"
          placeholder="Tìm cả hai khu: ô nhập, lightbox, gantt, heatmap…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm component và biểu đồ"
        />

        <button
          type="button"
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title="Đổi sáng/tối để kiểm tra ở cả hai chế độ"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <aside className="sidebar">
        <nav className="nav" aria-label="Điều hướng chính">
          {area === 'ui' ? (
            <>
              {navItem(hrefOf({ kind: 'home' }), !searching && route.kind === 'home', 'Tất cả', CATALOG.length)}
              <div className="nav-sep" />
              {CATEGORIES.map((c) =>
                navItem(
                  hrefOf({ kind: 'category', id: c.id }),
                  !searching && route.kind === 'category' && route.id === c.id,
                  c.nameVi,
                  countOf(c.id),
                ),
              )}
            </>
          ) : (
            <>
              {navItem(
                hrefOf({ kind: 'chart-home' }),
                !searching && route.kind === 'chart-home',
                'Tất cả',
                charts?.length ?? CHART_COUNT,
              )}
              <div className="nav-sep" />
              {JOBS.filter((j) => !charts || chartCountOf(j.id)).map((j) =>
                navItem(
                  hrefOf({ kind: 'chart-job', id: j.id }),
                  !searching && route.kind === 'chart-job' && route.id === j.id,
                  j.nameVi,
                  chartCountOf(j.id),
                ),
              )}
              <div className="nav-sep" />
              {navItem(hrefOf({ kind: 'chart-anatomy' }), route.kind === 'chart-anatomy', 'Kiến thức về chart')}
              {navItem(hrefOf({ kind: 'chart-rules' }), route.kind === 'chart-rules', 'Nguyên tắc & bảng màu')}
            </>
          )}

          <div className="nav-sep" />

          <a
            className={!searching && route.kind === 'new' ? 'nav-item is-active' : 'nav-item'}
            href={hrefOf({ kind: 'new' })}
          >
            Mới cập nhật
            <span className="nav-count is-new">{newCount}</span>
          </a>
          <a
            className={!searching && route.kind === 'changelog' ? 'nav-item is-active' : 'nav-item'}
            href={hrefOf({ kind: 'changelog' })}
          >
            Nhật ký thay đổi
          </a>
        </nav>
      </aside>

      <main className="main">
        {searching ? (
          <div className="page">
            <SearchPage
              query={q}
              results={uiResults}
              chartCount={chartResults.length}
              onClear={() => setQuery('')}
            />
            {chartResults.length > 0 && (
              <Suspense fallback={<p className="d-muted">Đang tải khu vực Biểu đồ…</p>}>
                <ChartArea view={{ kind: 'search', query: q, results: chartResults }} />
              </Suspense>
            )}
          </div>
        ) : chartView ? (
          <Suspense fallback={<div className="page d-muted">Đang tải khu vực Biểu đồ…</div>}>
            <ChartArea view={chartView} />
          </Suspense>
        ) : route.kind === 'changelog' ? (
          <ChangelogPage />
        ) : route.kind === 'new' ? (
          <NewPage entries={CATALOG} />
        ) : category ? (
          <CategoryPage
            category={category}
            entries={CATALOG.filter((e) => e.category === category.id)}
          />
        ) : entry ? (
          <EntryDetail entry={entry} key={entry.id} />
        ) : route.kind === 'entry' || route.kind === 'category' ? (
          <div className="page">
            <div className="empty-state">
              <strong>Không có mục này</strong>
              <span>
                Link có thể đã cũ. <a href={hrefOf({ kind: 'home' })}>Về trang chủ</a>
              </span>
            </div>
          </div>
        ) : (
          <HomePage entries={CATALOG} total={CATALOG.length} />
        )}
      </main>
    </div>
  )
}
