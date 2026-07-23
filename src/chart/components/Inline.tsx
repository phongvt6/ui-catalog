/**
 * Render tập con markdown mà CHANGELOG.md thực sự dùng: **đậm**, *nghiêng*,
 * `code`, và [nhãn](đường-dẫn). Cố ý KHÔNG kéo thêm thư viện markdown — đây là
 * toàn bộ cú pháp cần đến, và giữ nó nhỏ thì không phải lo về HTML tuỳ ý.
 *
 * Thứ tự trong alternation có ý nghĩa: **đậm** phải đứng TRƯỚC *nghiêng*,
 * nếu không `**x**` sẽ bị khớp thành nghiêng rỗng.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((p) => p !== '')

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <b key={i}>{part.slice(2, -2)}</b>
        }
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i}>{part.slice(1, -1)}</code>
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link) {
          const href = link[2]
          const external = href.startsWith('http')
          return (
            <a
              key={i}
              className="inline-link"
              href={href}
              {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
            >
              {link[1]}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

interface NestedItem {
  text: string
  children: NestedItem[]
}

/** Danh sách lồng nhau, dùng lại cho mọi cấp của một mục changelog. */
export function ItemList({ items }: { items: NestedItem[] }) {
  return (
    <ul className="cl-list">
      {items.map((item, i) => (
        <li key={i}>
          <Inline text={item.text} />
          {item.children.length > 0 && <ItemList items={item.children} />}
        </li>
      ))}
    </ul>
  )
}
