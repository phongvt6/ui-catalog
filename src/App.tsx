import { useEffect, useMemo, useState } from 'react'
import { CATALOG, deaccent } from './data'
import { CATEGORIES, type CategoryId, type Platform } from './types'
import { Combobox } from './components/Combobox'
import { EntryDetail } from './components/EntryDetail'
import { HomePage } from './components/HomePage'

type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const saved = localStorage.getItem('ui-catalog-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function idFromHash(): string {
  return decodeURIComponent(window.location.hash.replace(/^#\/?/, ''))
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | ''>('')
  const [platform, setPlatform] = useState<Platform | ''>('')
  // Chuỗi rỗng = đang ở trang chủ.
  const [selectedId, setSelectedId] = useState<string>(() => idFromHash())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ui-catalog-theme', theme)
  }, [theme])

  useEffect(() => {
    const onHash = () => {
      const id = idFromHash()
      if (!id || CATALOG.some((e) => e.id === id)) setSelectedId(id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id: string) => {
    setSelectedId(id)
    window.location.hash = `/${id}`
    document.querySelector('.main')?.scrollTo({ top: 0 })
  }

  const goHome = () => select('')

  const visible = useMemo(() => {
    const q = deaccent(query.trim())
    return CATALOG.filter((e) => {
      if (category && e.category !== category) return false
      if (platform && !e.platforms.includes(platform)) return false
      if (!q) return true
      const haystack = deaccent(
        [e.nameEn, e.nameVi, ...(e.aliases ?? []), e.description, e.purpose].join(' '),
      )
      return haystack.includes(q)
    })
  }, [query, category, platform])

  const grouped = useMemo(
    () =>
      CATEGORIES.map((c) => ({ category: c, items: visible.filter((e) => e.category === c.id) })).filter(
        (g) => g.items.length > 0,
      ),
    [visible],
  )

  const selected = CATALOG.find((e) => e.id === selectedId)

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.id,
    label: `${c.nameVi} · ${c.nameEn}`,
    count: CATALOG.filter((e) => e.category === c.id).length,
  }))

  return (
    <div className="app">
      <header className="app-head">
        <button type="button" className="brand" onClick={goHome} title="Về trang chủ">
          <span className="brand-mark">UI</span>
          Từ điển UI — Element &amp; Component
        </button>
        <div className="head-spacer" />
        <span className="head-stat">
          {visible.length}/{CATALOG.length} component
        </span>
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
        <div className="sidebar-filters">
          <input
            className="combo-input"
            type="search"
            placeholder="Tìm theo tên, mô tả… (gõ không dấu cũng được)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Tìm component"
          />
          <Combobox
            options={categoryOptions}
            value={category}
            onChange={(v) => setCategory(v as CategoryId | '')}
            allLabel="Tất cả nhóm"
            placeholder="Lọc theo nhóm…"
          />
          <Combobox
            options={[
              { value: 'web', label: 'Web', count: CATALOG.filter((e) => e.platforms.includes('web')).length },
              {
                value: 'mobile',
                label: 'Mobile',
                count: CATALOG.filter((e) => e.platforms.includes('mobile')).length,
              },
            ]}
            value={platform}
            onChange={(v) => setPlatform(v as Platform | '')}
            allLabel="Cả hai nền tảng"
            placeholder="Lọc theo nền tảng…"
          />
        </div>

        <nav className="sidebar-list">
          <button
            type="button"
            className="side-item is-home"
            aria-current={selectedId === ''}
            onClick={goHome}
          >
            <span aria-hidden>⌂</span>
            <span className="side-item-names">
              <span className="side-item-en">Trang chủ</span>
              <span className="side-item-vi">Toàn bộ {CATALOG.length} component</span>
            </span>
          </button>
          {grouped.map((g) => (
            <div key={g.category.id}>
              <p className="side-group-head">
                {g.category.nameVi} <span>({g.items.length})</span>
              </p>
              {g.items.map((e) => (
                <button
                  type="button"
                  key={e.id}
                  className="side-item"
                  aria-current={e.id === selectedId}
                  ref={(el) => {
                    // Vào thẳng bằng link #/<id> — kéo mục đang chọn vào tầm nhìn.
                    if (el && e.id === selectedId) el.scrollIntoView({ block: 'nearest' })
                  }}
                  onClick={() => select(e.id)}
                >
                  <span className="side-item-names">
                    <span className="side-item-en">{e.nameEn}</span>
                    <span className="side-item-vi">{e.nameVi}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
          {grouped.length === 0 && (
            <p className="side-empty">
              Không tìm thấy component nào khớp “{query}”.
              <br />
              Thử bỏ bớt bộ lọc.
            </p>
          )}
        </nav>
      </aside>

      <main className="main">
        {selected ? (
          <EntryDetail entry={selected} key={selected.id} />
        ) : (
          <HomePage
            entries={visible}
            total={CATALOG.length}
            onOpen={select}
            onPickCategory={setCategory}
          />
        )}
      </main>
    </div>
  )
}
