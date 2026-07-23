import { useState } from 'react'

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="code-wrap">
      <button className="code-copy" onClick={copy} type="button">
        {copied ? 'Đã chép ✓' : 'Chép'}
      </button>
      <pre className="code">
        <code>{code}</code>
      </pre>
    </div>
  )
}
