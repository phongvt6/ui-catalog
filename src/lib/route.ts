import { useEffect, useState } from 'react'
import type { CategoryId } from '../types'

/**
 * App có hai khu vực: **Component** (`#/…`) và **Biểu đồ** (`#/chart/…`).
 * Mỗi khu vực đi theo 3 cấp: tất cả → nhóm → chi tiết.
 * Dùng hash để mở được bằng link tĩnh, không cần server rewrite.
 */
export type Route =
  | { kind: 'home' }
  | { kind: 'changelog' }
  | { kind: 'new' }
  | { kind: 'category'; id: CategoryId }
  | { kind: 'entry'; id: string }
  | { kind: 'chart-home' }
  | { kind: 'chart-job'; id: string }
  | { kind: 'chart-entry'; id: string }
  | { kind: 'chart-rules' }
  | { kind: 'chart-anatomy' }

export type Area = 'ui' | 'chart'

export function areaOf(route: Route): Area {
  return route.kind.startsWith('chart-') ? 'chart' : 'ui'
}

export function parseHash(hash: string): Route {
  const h = decodeURIComponent(hash.replace(/^#\/?/, ''))
  if (h === '') return { kind: 'home' }
  if (h === 'changelog') return { kind: 'changelog' }
  if (h === 'moi') return { kind: 'new' }
  if (h.startsWith('nhom/')) return { kind: 'category', id: h.slice(5) as CategoryId }

  if (h === 'chart') return { kind: 'chart-home' }
  if (h === 'chart/nguyen-tac') return { kind: 'chart-rules' }
  if (h === 'chart/kien-thuc') return { kind: 'chart-anatomy' }
  if (h.startsWith('chart/nhom/')) return { kind: 'chart-job', id: h.slice(11) }
  if (h.startsWith('chart/')) return { kind: 'chart-entry', id: h.slice(6) }

  return { kind: 'entry', id: h }
}

export function hrefOf(route: Route): string {
  switch (route.kind) {
    case 'home':
      return '#/'
    case 'changelog':
      return '#/changelog'
    case 'new':
      return '#/moi'
    case 'category':
      return `#/nhom/${route.id}`
    case 'entry':
      return `#/${route.id}`
    case 'chart-home':
      return '#/chart'
    case 'chart-job':
      return `#/chart/nhom/${route.id}`
    case 'chart-entry':
      return `#/chart/${route.id}`
    case 'chart-rules':
      return '#/chart/nguyen-tac'
    case 'chart-anatomy':
      return '#/chart/kien-thuc'
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  useEffect(() => {
    const on = () => {
      setRoute(parseHash(window.location.hash))
      document.querySelector('.main')?.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
