import { useEffect, useState } from 'react'
import type { Mode } from './theme'

const KEY = 'chart-catalog-theme'

function osPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Đọc mode hiện tại từ thuộc tính data-theme trên <html>, fallback về OS. */
export function currentMode(): Mode {
  const stamped = document.documentElement.getAttribute('data-theme')
  if (stamped === 'dark' || stamped === 'light') return stamped
  return osPrefersDark() ? 'dark' : 'light'
}

export function applyMode(mode: Mode) {
  document.documentElement.setAttribute('data-theme', mode)
  localStorage.setItem(KEY, mode)
  window.dispatchEvent(new CustomEvent('chart-catalog-theme'))
}

export function initMode() {
  const saved = localStorage.getItem(KEY)
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved)
  }
}

/** Hook: trả về mode hiện tại và re-render khi người dùng hoặc OS đổi theme. */
export function useMode(): Mode {
  const [mode, setMode] = useState<Mode>(currentMode)

  useEffect(() => {
    const sync = () => setMode(currentMode())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    window.addEventListener('chart-catalog-theme', sync)
    mq.addEventListener('change', sync)
    return () => {
      window.removeEventListener('chart-catalog-theme', sync)
      mq.removeEventListener('change', sync)
    }
  }, [])

  return mode
}
