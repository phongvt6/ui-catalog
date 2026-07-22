import type { ReactNode } from 'react'
import { useMemo } from 'react'
// Nhúng thẳng file changelog để chỉ có MỘT nguồn sự thật: hook pre-push kiểm
// tra đúng file này, và trang dưới đây hiển thị đúng nội dung đó.
import raw from '../../CHANGELOG.md?raw'

/* -------------------------------------------------------------------------- */
/* Parser markdown tối giản — chỉ đủ cú pháp mà CHANGELOG.md thực sự dùng      */
/* -------------------------------------------------------------------------- */

type ListItem = { depth: number; text: string }

type Block =
  | { kind: 'h1'; text: string }
  | { kind: 'version'; label: string; date?: string }
  | { kind: 'section'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; items: ListItem[] }

// `**đậm**` phải đứng trước `*nghiêng*` trong nhánh chọn, nếu không dấu ** sẽ
// bị nuốt mất một nửa.
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|_[^_]+_)/g
const LINK_DEF = /^\[[^\]]+\]:\s/
const VERSION_HEAD = /^\[([^\]]+)\](?:\s*[–-]\s*(.+))?$/

function parse(md: string): Block[] {
  const lines = md.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim() || LINK_DEF.test(line)) {
      i++
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push({ kind: 'h1', text: line.slice(2).trim() })
      i++
      continue
    }

    if (line.startsWith('## ')) {
      const text = line.slice(3).trim()
      const m = VERSION_HEAD.exec(text)
      blocks.push(
        m ? { kind: 'version', label: m[1], date: m[2] } : { kind: 'version', label: text },
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push({ kind: 'section', text: line.slice(4).trim() })
      i++
      continue
    }

    if (line.startsWith('>')) {
      const buf: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        buf.push(lines[i].replace(/^>\s?/, '').trim())
        i++
      }
      blocks.push({ kind: 'quote', text: buf.join(' ').trim() })
      continue
    }

    if (/^\s*-\s/.test(line)) {
      const items: ListItem[] = []
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#')) {
        const cur = lines[i]
        const indent = cur.length - cur.trimStart().length
        const trimmed = cur.trim()
        if (trimmed.startsWith('- ')) {
          items.push({ depth: Math.min(1, Math.floor(indent / 2)), text: trimmed.slice(2) })
        } else if (items.length) {
          // dòng gấp khúc của gạch đầu dòng phía trên
          items[items.length - 1].text += ` ${trimmed}`
        } else {
          break
        }
        i++
      }
      blocks.push({ kind: 'list', items })
      continue
    }

    const buf: string[] = []
    while (i < lines.length && lines[i].trim() && !/^[#>]|^\s*-\s/.test(lines[i])) {
      buf.push(lines[i].trim())
      i++
    }
    if (buf.length) blocks.push({ kind: 'p', text: buf.join(' ') })
  }

  return blocks
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, n) => {
      const key = `${keyPrefix}-${n}`
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={key}>{part.slice(2, -2)}</strong>
      if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>
      if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{part.slice(1, -1)}</em>
      if (part.startsWith('_') && part.endsWith('_')) return <em key={key}>{part.slice(1, -1)}</em>
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
      if (link) {
        const href = link[2]
        // Link tương đối trong repo (README.md…) không mở được từ app — giữ lại
        // chữ, bỏ thẻ <a> để không dẫn người đọc tới trang 404.
        if (!/^(https?:|#|\/)/.test(href)) return <em key={key}>{link[1]}</em>
        return (
          <a
            key={key}
            href={href}
            {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {link[1]}
          </a>
        )
      }
      return <span key={key}>{part}</span>
    })
}

/** Màu nhãn theo 6 nhóm thay đổi của Keep a Changelog. */
const SECTION_TONE: Record<string, string> = {
  'Thêm mới': 'is-added',
  'Thay đổi': 'is-changed',
  'Ngừng dùng': 'is-deprecated',
  'Gỡ bỏ': 'is-removed',
  'Sửa lỗi': 'is-fixed',
  'Bảo mật': 'is-security',
}

/* -------------------------------------------------------------------------- */

export function ChangelogPage() {
  const blocks = useMemo(() => parse(raw), [])

  return (
    <article className="cl">
      {blocks.map((b, i) => {
        const key = `b-${i}`
        switch (b.kind) {
          case 'h1':
            return (
              <header className="cl-head" key={key}>
                <p className="entry-cat">Nhật ký thay đổi · Changelog</p>
                <h1>{b.text}</h1>
              </header>
            )
          case 'version':
            return (
              <h2 className="cl-version" key={key}>
                <span className="cl-version-tag">{b.label}</span>
                {b.date && <span className="cl-version-date">{b.date}</span>}
              </h2>
            )
          case 'section':
            return (
              <h3 className={`cl-section ${SECTION_TONE[b.text] ?? ''}`} key={key}>
                {b.text}
              </h3>
            )
          case 'quote':
            return (
              <blockquote className="cl-quote" key={key}>
                {renderInline(b.text, key)}
              </blockquote>
            )
          case 'list':
            return (
              <ul className="cl-list" key={key}>
                {b.items.map((it, n) => (
                  <li key={`${key}-${n}`} className={it.depth ? 'is-nested' : undefined}>
                    {renderInline(it.text, `${key}-${n}`)}
                  </li>
                ))}
              </ul>
            )
          default:
            return (
              <p className="cl-p" key={key}>
                {renderInline(b.text, key)}
              </p>
            )
        }
      })}
    </article>
  )
}
