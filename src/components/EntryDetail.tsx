import { useEffect, useState } from 'react'
import type { CatalogEntry, Platform } from '../types'
import { CATEGORIES, PLATFORM_LABEL } from '../types'
import { PhoneFrame } from './PhoneFrame'
import { copyText } from '../lib/clipboard'

type View = 'preview' | 'code'

export function EntryDetail({ entry }: { entry: CatalogEntry }) {
  const [platform, setPlatform] = useState<Platform>(entry.platforms[0])
  const [view, setView] = useState<View>('preview')
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'fail'>('idle')

  // Đổi component thì reset về nền tảng đầu tiên mà nó hỗ trợ.
  useEffect(() => {
    setPlatform(entry.platforms[0])
    setView('preview')
    setCopyState('idle')
  }, [entry])

  const category = CATEGORIES.find((c) => c.id === entry.category)
  const supports = (p: Platform) => entry.platforms.includes(p)

  const copy = async () => {
    setCopyState((await copyText(entry.code)) ? 'done' : 'fail')
    window.setTimeout(() => setCopyState('idle'), 1800)
  }

  const demoNode = platform === 'mobile' ? (entry.mobileDemo ?? entry.demo)() : entry.demo()

  return (
    <article className="entry">
      <header className="entry-head">
        <p className="entry-cat">
          {category?.nameVi} · {category?.nameEn}
        </p>
        <h1 className="entry-title">{entry.nameEn}</h1>
        <p className="entry-title-vi">{entry.nameVi}</p>
        <div className="entry-tags">
          {entry.platforms.map((p) => (
            <span className="tag is-platform" key={p}>
              {PLATFORM_LABEL[p]}
            </span>
          ))}
          {entry.aliases?.map((a) => (
            <span className="tag" key={a}>
              {a}
            </span>
          ))}
        </div>
      </header>

      <div className="stage">
        <div className="stage-bar">
          <div className="seg">
            <button
              type="button"
              aria-pressed={platform === 'web'}
              disabled={!supports('web')}
              onClick={() => setPlatform('web')}
            >
              Web
            </button>
            <button
              type="button"
              aria-pressed={platform === 'mobile'}
              disabled={!supports('mobile')}
              onClick={() => setPlatform('mobile')}
            >
              Mobile
            </button>
          </div>
          <div className="head-spacer" />
          <div className="seg">
            <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>
              Demo
            </button>
            <button type="button" aria-pressed={view === 'code'} onClick={() => setView('code')}>
              Code
            </button>
          </div>
          {view === 'code' && (
            <button type="button" className="d-btn is-secondary is-sm" onClick={copy}>
              {copyState === 'done'
                ? '✓ Đã chép'
                : copyState === 'fail'
                  ? '✕ Không chép được'
                  : 'Sao chép'}
            </button>
          )}
        </div>

        {view === 'preview' ? (
          <div className="stage-body">
            {platform === 'mobile' ? <PhoneFrame>{demoNode}</PhoneFrame> : demoNode}
          </div>
        ) : (
          <pre className="stage-code">
            <code>{entry.code}</code>
          </pre>
        )}
      </div>

      <div className="sections">
        <section className="card">
          <h3>Diễn giải</h3>
          <p>{entry.description}</p>
        </section>

        <section className="card">
          <h3>Công dụng</h3>
          <p>{entry.purpose}</p>
        </section>

        <section className="card">
          <h3>Biến thể &amp; trạng thái</h3>
          <ul className="state-list">
            {entry.states.map((s) => (
              <li key={s.name}>
                <span className="state-name">{s.name}</span>
                <span>{s.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="two-col">
          <section className="card is-do">
            <h3>Nên</h3>
            <ul className="tick-list">
              {entry.dos.map((d) => (
                <li key={d}>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card is-dont">
            <h3>Không nên</h3>
            <ul className="tick-list">
              {entry.donts.map((d) => (
                <li key={d}>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {entry.nativeNames && (
          <section className="card">
            <h3>Tên tương đương trên native</h3>
            <div className="native-names">
              {entry.nativeNames.ios && (
                <div>
                  <strong>iOS</strong>
                  {entry.nativeNames.ios}
                </div>
              )}
              {entry.nativeNames.android && (
                <div>
                  <strong>Android</strong>
                  {entry.nativeNames.android}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
