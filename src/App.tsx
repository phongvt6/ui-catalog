import { useEffect, useMemo, useState } from 'react'
import { CATALOG, deaccent } from './data'
import { CATEGORIES, LATEST_RELEASE } from './types'
import { EntryDetail } from './components/EntryDetail'
import { HomePage } from './components/HomePage'
import { CategoryPage } from './components/CategoryPage'
import { SearchPage } from './components/SearchPage'
import { ChangelogPage } from './components/ChangelogPage'
import { NewPage } from './components/NewPage'
import { hrefOf, useRoute } from './lib/route'

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

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ui-catalog-theme', theme)
  }, [theme])

  // Trang kết quả tìm kiếm che khung nội dung, nên đi tới bất kỳ đâu (sidebar,
  // thẻ, breadcrumb) đều phải tự thoát khỏi nó — nếu không sẽ như bấm hụt.
  useEffect(() => setQuery(''), [route])

  const results = useMemo(() => {
    const q = deaccent(query.trim())
    if (!q) return []
    return CATALOG.filter((e) => {
      const haystack = deaccent(
        [e.nameEn, e.nameVi, ...(e.aliases ?? []), e.description, e.purpose].join(' '),
      )
      return haystack.includes(q)
    })
  }, [query])

  const searching = query.trim().length > 0
  const entry = route.kind === 'entry' ? CATALOG.find((e) => e.id === route.id) : undefined
  const category =
    route.kind === 'category' ? CATEGORIES.find((c) => c.id === route.id) : undefined

  const countOf = (id: string) => CATALOG.filter((e) => e.category === id).length
  const newCount = CATALOG.filter((e) => e.since === LATEST_RELEASE.version).length

  return (
    <div className="app">
      <header className="app-head">
        <a className="brand" href={hrefOf({ kind: 'home' })} title="Về trang chủ">
          <span className="brand-mark">UI</span>
          <span className="brand-names">Từ điển UI</span>
        </a>

        <input
          className="head-search"
          type="search"
          placeholder="Tìm: ô nhập, lightbox, gantt… (gõ không dấu cũng được)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm component"
        />

        <button
          type="button"
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title="Đổi sáng/tối để kiểm tra component ở cả hai chế độ"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <aside className="sidebar">
        <nav className="nav" aria-label="Điều hướng chính">
          <a
            className={!searching && route.kind === 'home' ? 'nav-item is-active' : 'nav-item'}
            href={hrefOf({ kind: 'home' })}
          >
            Tất cả
            <span className="nav-count">{CATALOG.length}</span>
          </a>

          <div className="nav-sep" />

          {CATEGORIES.map((c) => {
            const active = !searching && route.kind === 'category' && route.id === c.id
            return (
              <a
                key={c.id}
                className={active ? 'nav-item is-active' : 'nav-item'}
                href={hrefOf({ kind: 'category', id: c.id })}
              >
                {c.nameVi}
                <span className="nav-count">{countOf(c.id)}</span>
              </a>
            )
          })}

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
          <SearchPage query={query.trim()} results={results} onClear={() => setQuery('')} />
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
