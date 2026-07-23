/* Các trang của khu vực Biểu đồ — bê nguyên từ app chart-catalog.
   Khác bản gốc đúng hai chỗ: các hàm được export để router chung gọi, và
   trang Nhật ký thay đổi dùng bản chung của app thay vì bản riêng. */
import { JOBS, type JobId } from './types'
import { entries, findEntry } from './entries'
import { EntryCard } from './components/EntryCard'
import { CodeBlock } from './components/CodeBlock'
import { useMode } from './lib/useMode'
import { SERIES, SERIES_HUE_NAMES } from './lib/theme'


export function ChartHome() {
  return (
    <>
      <div className="page-head">
        <h1>Thư viện biểu đồ</h1>
        <p className="lede">
          Phân loại theo <b>mục đích phân tích</b>, không theo tên biểu đồ — vì khi thiết kế
          dashboard, câu hỏi trong đầu là “tôi cần so sánh cơ cấu”, chứ không phải “tôi cần
          treemap”. Mọi biểu đồ vẽ trên <b>cùng một bộ dữ liệu mẫu trung tính</b> (doanh thu chuỗi
          chi nhánh CN-01…CN-05, danh mục Thiết bị / Vật tư / Dịch vụ) để so được trực tiếp: cùng
          số liệu, cách nào đọc ra nhanh nhất.
        </p>
      </div>
      {JOBS.map((job) => {
        const list = entries.filter((e) => e.job === job.id)
        if (!list.length) return null
        return (
          <section className="job-block" key={job.id}>
            <div className="job-head">
              <h2>
                <a href={`#/chart/nhom/${job.id}`}>{job.nameVi}</a>
                <span className="job-en">{job.nameEn}</span>
              </h2>
              <p className="job-q">“{job.question}”</p>
            </div>
            <div className="card-grid">
              {list.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}

export function ChartJobPage({ id }: { id: JobId }) {
  const job = JOBS.find((j) => j.id === id)
  const list = entries.filter((e) => e.job === id)
  if (!job) return <p className="empty">Không có nhóm này.</p>
  return (
    <>
      <div className="page-head">
        <h1>{job.nameVi}</h1>
        <p className="lede">
          <span className="job-en">{job.nameEn}</span> — “{job.question}”
        </p>
      </div>
      <div className="card-grid">
        {list.map((e) => (
          <EntryCard key={e.id} entry={e} />
        ))}
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */

export function ChartDetail({ id }: { id: string }) {
  const entry = findEntry(id)
  if (!entry) return <p className="empty">Không tìm thấy biểu đồ này.</p>
  const job = JOBS.find((j) => j.id === entry.job)

  return (
    <article className="detail">
      <a className="back" href={job ? `#/chart/nhom/${job.id}` : '#/chart'}>
        ← {job?.nameVi ?? 'Tất cả'}
      </a>
      <h1>{entry.nameVi}</h1>
      <div className="detail-sub">
        <span className="job-en">{entry.nameEn}</span>
        {entry.status === 'planned' && <span className="badge">sắp có</span>}
      </div>
      {entry.aliases && <div className="aliases">Còn gọi là: {entry.aliases.join(' · ')}</div>}

      <p className="detail-desc">{entry.description}</p>

      <div className="demo-frame">
        {entry.demo ? (
          entry.demo()
        ) : (
          <div className="planned-box">
            Demo sẽ dựng ở Phase 2. Phần “khi nào dùng / khi nào không” bên dưới đã tra được ngay.
          </div>
        )}
      </div>

      <div className="rule-cols">
        <section className="rule-col is-do">
          <h3>Nên dùng khi</h3>
          <ul>
            {entry.useWhen.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
        <section className="rule-col is-dont">
          <h3>Không dùng khi</h3>
          <ul>
            {entry.avoidWhen.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>

      <dl className="spec">
        <dt>Dữ liệu đầu vào</dt>
        <dd>{entry.dataShape}</dd>
        {entry.seriesCap && (
          <>
            <dt>Số series tối đa</dt>
            <dd>{entry.seriesCap}</dd>
          </>
        )}
        {entry.variants && (
          <>
            <dt>Biến thể</dt>
            <dd>
              <ul className="tight">
                {entry.variants.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      {entry.code && (
        <section className="code-section">
          <h3>Code</h3>
          <CodeBlock code={entry.code} />
        </section>
      )}
    </article>
  )
}

/* -------------------------------------------------------------------------- */

export function ChartRules() {
  const mode = useMode()
  return (
    <article className="detail">
      <h1>Nguyên tắc & bảng màu</h1>
      <p className="lede">
        Bảy điều dưới đây đúng với mọi hệ thống thiết kế. Chúng đã được nướng sẵn vào{' '}
        <code>src/lib/theme.ts</code> và <code>src/lib/echarts.ts</code> — copy hai file đó sang
        app mới là có ngay nền tảng đúng.
      </p>

      <ol className="rules">
        <li>
          <b>Chọn hình thức trước, chọn màu sau.</b> Hầu hết biểu đồ xấu là vì làm ngược lại.
          Đôi khi câu trả lời đúng <em>không phải một biểu đồ</em> — mà là một ô chỉ số hoặc một
          cái bảng.
        </li>
        <li>
          <b>Một trục giá trị. Không bao giờ hai trục Y.</b> Đây là lỗi biểu đồ số một: hai thang
          đo khác nhau cho phép người vẽ “tạo ra” bất kỳ mối tương quan nào họ muốn. Hai đại lượng
          khác thang → hai biểu đồ, hoặc quy về cùng một mốc gốc = 100.
        </li>
        <li>
          <b>Cột và thanh phải bắt đầu từ 0.</b> Cắt gốc để “nhìn cho rõ chênh lệch” là bóp méo.
          (Với biểu đồ đường và scatter thì không cắt gốc vẫn hợp lệ — ở đó ta đọc hình dạng và
          quan hệ, không đọc độ dài.)
        </li>
        <li>
          <b>Màu bám theo thực thể, không bám theo thứ hạng.</b> Lọc bớt series thì những series
          còn lại phải giữ nguyên màu. Gán màu theo đúng thứ tự slot 1→8, không xoay vòng. Series
          thứ 9 không sinh màu mới — gộp “Khác” hoặc tách small multiples.
        </li>
        <li>
          <b>Sequential = một hue, nhạt→đậm. Diverging = hai hue + xám ở giữa.</b> Không bao giờ
          cầu vồng; không bao giờ đặt một hue ở điểm giữa của thang diverging.
        </li>
        <li>
          <b>Chữ mặc màu mực, không mặc màu series.</b> Nhãn, giá trị, legend luôn dùng
          primary/secondary/muted. Danh tính do <em>chấm màu bên cạnh</em> chữ gánh, không phải do
          tô màu chính chữ đó.
        </li>
        <li>
          <b>Từ 2 series trở lên: luôn có legend.</b> Nhãn trực tiếp là phần bổ sung, và phải gắn
          <em> có chọn lọc</em> — không bao giờ gắn số lên mọi điểm. Một series duy nhất thì không
          cần hộp legend: tiêu đề đã nói rồi.
        </li>
      </ol>

      <h2>Bảng màu categorical</h2>
      <p className="lede">
        Đã kiểm định bằng script cho cả light lẫn dark: cặp kề nhau xấu nhất đạt ΔE 9,1 dưới mô
        phỏng mù màu (ngưỡng ≥ 8) và ΔE 19,6 với mắt thường (ngưỡng ≥ 15). Thứ tự slot chính là
        cơ chế an toàn — đừng xáo lại.
      </p>
      <div className="swatches">
        {SERIES[mode].map((hex, i) => (
          <div className="swatch" key={hex + i}>
            <div className="swatch-chip" style={{ background: hex }} />
            <div className="swatch-meta">
              <b>Slot {i + 1}</b>
              <span>{SERIES_HUE_NAMES[i]}</span>
              <code>{hex}</code>
            </div>
          </div>
        ))}
      </div>

      <h2>Trần số series</h2>
      <table className="dtable">
        <thead>
          <tr>
            <th>Số series</th>
            <th>Cách xử lý</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1–3</td>
            <td>Màu tự nó đủ phân biệt cho mọi người xem. Gắn nhãn trực tiếp.</td>
          </tr>
          <tr>
            <td>4</td>
            <td>
              Dạng “kề nhau” (cột chồng, cột nhóm, đường) vẫn an toàn nhưng <b>bắt buộc</b> nhãn
              trực tiếp — vàng và cam đã đứng cạnh nhau. Dạng “mọi cặp cùng xuất hiện” (scatter,
              bubble, bản đồ) <b>chỉ tối đa 3</b>.
            </td>
          </tr>
          <tr>
            <td>5–6</td>
            <td>Trần mềm. Legend bắt buộc, cân nhắc small multiples.</td>
          </tr>
          <tr>
            <td>7–8</td>
            <td>Kịch trần. Quá 8 → gộp “Khác”, tách khung, hoặc mã hoá kép (màu × hình).</td>
          </tr>
        </tbody>
      </table>
    </article>
  )
}
