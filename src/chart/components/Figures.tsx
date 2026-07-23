import { CHROME, MARK, SERIES, vnCompact, vnPercent } from '../lib/theme'
import { useMode } from '../lib/useMode'

/* -------------------------------------------------------------------------- */
/* Sparkline — đường 12 điểm, không trục, không nhãn                           */
/* -------------------------------------------------------------------------- */

interface SparkProps {
  data: number[]
  width?: number
  height?: number
  /** Chấm ở điểm cuối để neo mắt vào "hiện tại". */
  showEnd?: boolean
  /**
   * Ép miền giá trị. Bỏ trống thì mỗi sparkline tự co giãn theo dữ liệu của
   * riêng nó — chỉ đúng khi đọc RIÊNG từng dòng. Khi xếp nhiều sparkline cạnh
   * nhau để SO SÁNH thì bắt buộc truyền miền dùng chung, nếu không mọi đường
   * trông giống nhau.
   */
  domain?: [min: number, max: number]
}

export function Sparkline({ data, width = 108, height = 28, showEnd = true, domain }: SparkProps) {
  const mode = useMode()
  const c = CHROME[mode]
  const min = domain ? domain[0] : Math.min(...data)
  const max = domain ? domain[1] : Math.max(...data)
  const span = max - min || 1
  const pad = 3
  const x = (i: number) => pad + (i * (width - pad * 2)) / (data.length - 1)
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2)
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={c.deemphasis}
        strokeWidth={MARK.lineWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEnd && (
        <circle
          cx={x(data.length - 1)}
          cy={y(data[data.length - 1])}
          r={MARK.symbolSize / 2}
          fill={SERIES[mode][0]}
          stroke={c.surface}
          strokeWidth={MARK.ring}
        />
      )}
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Stat tile — nhãn · giá trị · delta · sparkline                              */
/* -------------------------------------------------------------------------- */

interface StatTileProps {
  label: string
  value: string
  /** % so với kỳ trước. Dấu và màu do hướng + việc "tăng là tốt hay xấu" quyết định. */
  delta?: number
  deltaLabel?: string
  /** Với chỉ số mà tăng là xấu (chi phí, thời gian chờ) đặt false. */
  upIsGood?: boolean
  spark?: number[]
  hero?: boolean
}

export function StatTile({
  label,
  value,
  delta,
  deltaLabel = 'so với kỳ trước',
  upIsGood = true,
  spark,
  hero = false,
}: StatTileProps) {
  const mode = useMode()
  const c = CHROME[mode]
  const good = delta === undefined ? true : delta >= 0 === upIsGood
  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className={hero ? 'tile-value is-hero' : 'tile-value'}>{value}</div>
      {delta !== undefined && (
        <div className="tile-delta" style={{ color: good ? c.deltaGood : c.deltaBad }}>
          <span aria-hidden>{delta >= 0 ? '▲' : '▼'}</span>{' '}
          {vnPercent(Math.abs(delta))} <span style={{ color: c.inkMuted }}>{deltaLabel}</span>
        </div>
      )}
      {spark && (
        <div className="tile-spark">
          <Sparkline data={spark} />
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Meter — một tỷ lệ so với hạn mức, track cùng ramp với fill                   */
/* -------------------------------------------------------------------------- */

interface MeterProps {
  label: string
  /** 0–100+. Trên 100 vẫn vẽ được (tràn hạn mức). */
  percent: number
  caption?: string
}

export function Meter({ label, percent, caption }: MeterProps) {
  const mode = useMode()
  const c = CHROME[mode]
  const accent = SERIES[mode][0]
  const clamped = Math.min(percent, 100)
  return (
    <div className="meter">
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="meter-value">{vnPercent(percent, 0)}</span>
      </div>
      <div
        className="meter-track"
        style={{ background: mode === 'light' ? '#cde2fb' : '#184f95' }}
        role="meter"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="meter-fill" style={{ width: `${clamped}%`, background: accent }} />
      </div>
      {caption && (
        <div className="meter-caption" style={{ color: c.inkMuted }}>
          {caption}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Bullet — thực hiện so với chỉ tiêu, một dòng một đối tượng                   */
/* -------------------------------------------------------------------------- */

interface BulletProps {
  rows: { label: string; actual: number; target: number }[]
}

export function BulletChart({ rows }: BulletProps) {
  const mode = useMode()
  const c = CHROME[mode]
  const accent = SERIES[mode][0]
  const max = Math.max(...rows.flatMap((r) => [r.actual, r.target])) * 1.05

  return (
    <div className="bullet">
      {rows.map((r) => {
        const hit = r.actual >= r.target
        return (
          <div className="bullet-row" key={r.label}>
            <div className="bullet-label">{r.label}</div>
            <div className="bullet-track" style={{ background: c.grid }}>
              <div
                className="bullet-fill"
                style={{ width: `${(r.actual / max) * 100}%`, background: accent }}
              />
              <div
                className="bullet-target"
                style={{ left: `${(r.target / max) * 100}%`, background: c.ink }}
                title={`Chỉ tiêu ${vnCompact(r.target)}`}
              />
            </div>
            <div className="bullet-value" style={{ color: hit ? c.deltaGood : c.inkSecondary }}>
              {vnPercent((r.actual / r.target) * 100, 0)}
            </div>
          </div>
        )
      })}
      <div className="bullet-legend" style={{ color: c.inkMuted }}>
        <span className="key-swatch" style={{ background: accent }} /> Thực hiện
        <span className="key-tick" style={{ background: c.ink }} /> Chỉ tiêu tháng
      </div>
    </div>
  )
}
