import { useEffect, useRef, useState } from 'react'
import type * as echartsNS from 'echarts'
import type { EChartsOption } from 'echarts'

/** Phần thông tin của cú click mà tầng lọc chéo thực sự cần. */
export interface ChartClick {
  /** Tên hạng mục trên trục danh mục (tên chi nhánh, tên danh mục…). */
  name: string
  dataIndex: number
  seriesIndex: number
  seriesName?: string
}

interface Props {
  option: EChartsOption
  height?: number
  /** Đổi giá trị này để buộc vẽ lại từ đầu (ví dụ khi đổi light/dark). */
  resetKey?: string
  /** Click vào một mark (cột, thanh, điểm) — dùng cho lọc chéo. */
  onClick?: (e: ChartClick) => void
}

type EChartsModule = typeof echartsNS

/**
 * Nạp ECharts (~1MB) theo yêu cầu, dùng chung một promise cho mọi biểu đồ.
 * Nhờ vậy thư viện không nằm trong bundle đầu của app — người chỉ tra
 * component thì không phải tải nó.
 */
let cached: EChartsModule | null = null
let pending: Promise<EChartsModule> | null = null

function loadECharts(): Promise<EChartsModule> {
  if (cached) return Promise.resolve(cached)
  pending ??= import('echarts').then((m) => {
    cached = m
    return m
  })
  return pending
}

/**
 * Wrapper mỏng quanh ECharts — không dùng echarts-for-react để giữ app
 * self-contained và tránh lệ thuộc phiên bản peer React.
 */
export function EChart({ option, height = 280, resetKey, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const chart = useRef<echartsNS.ECharts | null>(null)
  // Giữ handler mới nhất trong ref: chart chỉ đăng ký sự kiện MỘT lần lúc init,
  // nên nếu bắt trực tiếp `onClick` thì nó sẽ đóng băng ở lần render đầu.
  const clickRef = useRef(onClick)
  clickRef.current = onClick
  const [lib, setLib] = useState<EChartsModule | null>(cached)

  useEffect(() => {
    if (lib) return
    let alive = true
    loadECharts().then((m) => {
      if (alive) setLib(m)
    })
    return () => {
      alive = false
    }
  }, [lib])

  useEffect(() => {
    if (!lib || !ref.current) return
    chart.current = lib.init(ref.current, undefined, { renderer: 'svg' })
    chart.current.on('click', (params) => {
      clickRef.current?.(params as unknown as ChartClick)
    })
    const ro = new ResizeObserver(() => chart.current?.resize())
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
      chart.current?.dispose()
      chart.current = null
    }
  }, [lib, resetKey])

  useEffect(() => {
    chart.current?.setOption(option, true)
  }, [option, lib])

  return <div ref={ref} style={{ width: '100%', height }} />
}
