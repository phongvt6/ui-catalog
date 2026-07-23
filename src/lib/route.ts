import { useEffect, useState } from 'react'
import type { CategoryId } from '../types'

/**
 * Điều hướng 3 cấp: trang chủ → trang nhóm → trang chi tiết.
 * Dùng hash để mở được bằng link tĩnh, không cần server rewrite.
 */
export type Route =
  | { kind: 'home' }
  | { kind: 'changelog' }
  | { kind: 'new' }
  | { kind: 'category'; id: CategoryId }
  | { kind: 'entry'; id: string }

export function parseHash(hash: string): Route {
  const h = decodeURIComponent(hash.replace(/^#\/?/, ''))
  if (h === '') return { kind: 'home' }
  if (h === 'changelog') return { kind: 'changelog' }
  if (h === 'moi') return { kind: 'new' }
  if (h.startsWith('nhom/')) return { kind: 'category', id: h.slice(5) as CategoryId }
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
