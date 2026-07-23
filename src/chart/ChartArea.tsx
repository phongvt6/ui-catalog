import './chart.css'
import { ChartHome, ChartJobPage, ChartDetail, ChartRules } from './ChartPages'
import { Anatomy } from './pages/Anatomy'
import { EntryCard } from './components/EntryCard'
import type { ChartEntry, JobId } from './types'
import { JOBS } from './types'

/**
 * Toàn bộ khu vực Biểu đồ nằm trong `.chart-scope` — CSS và token màu của nó
 * chỉ có hiệu lực bên trong khối này, nên hai khu vực không giẫm chân nhau.
 * File này được nạp bằng `lazy()` để ECharts không vào bundle lần tải đầu.
 */
export type ChartView =
  | { kind: 'home' }
  | { kind: 'job'; id: JobId }
  | { kind: 'entry'; id: string }
  | { kind: 'rules' }
  | { kind: 'anatomy' }
  | { kind: 'search'; query: string; results: ChartEntry[] }

export default function ChartArea({ view }: { view: ChartView }) {
  return (
    <div className="chart-scope">
      {view.kind === 'home' ? (
        <ChartHome />
      ) : view.kind === 'job' ? (
        <ChartJobPage id={view.id} />
      ) : view.kind === 'entry' ? (
        <ChartDetail id={view.id} />
      ) : view.kind === 'rules' ? (
        <ChartRules />
      ) : view.kind === 'anatomy' ? (
        <Anatomy />
      ) : (
        <ChartSearch query={view.query} results={view.results} />
      )}
    </div>
  )
}

function ChartSearch({ query, results }: { query: string; results: ChartEntry[] }) {
  const groups = JOBS.map((j) => ({
    job: j,
    items: results.filter((e) => e.job === j.id),
  })).filter((g) => g.items.length > 0)

  if (!results.length) return null

  return (
    <>
      <div className="page-head">
        <h2 className="wn-h2">
          Biểu đồ · {results.length} mục khớp “{query}”
        </h2>
      </div>
      {groups.map((g) => (
        <section className="job-block" key={g.job.id}>
          <div className="job-head">
            <h2>
              <a href={`#/chart/nhom/${g.job.id}`}>{g.job.nameVi}</a>
              <span className="job-en">{g.items.length} mục</span>
            </h2>
          </div>
          <div className="card-grid">
            {g.items.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
