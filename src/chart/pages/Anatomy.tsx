import { useState } from 'react'
import { CHROME, SERIES } from '../lib/theme'
import { useMode } from '../lib/useMode'

/* ==========================================================================
   Kiến thức về chart — giải phẫu một biểu đồ
   ==========================================================================

   Sơ đồ dưới đây vẽ TAY bằng SVG chứ không dùng ECharts — vì mục đích ở đây
   không phải trình bày dữ liệu, mà là chỉ vào từng bộ phận và gọi đúng tên
   nó. Vẽ tay thì mỗi bộ phận là một <g> riêng, làm mờ / khoanh vùng được
   từng cái một.
   ========================================================================== */

/** Hộp bao của một bộ phận trên khung 680×400 — dùng để khoanh vùng và đặt số. */
type Box = [x: number, y: number, w: number, h: number]

interface Part {
  id: string
  n: number
  nameVi: string
  nameEn: string
  /** Nó làm gì cho người đọc. */
  role: string
  /** Lỗi hay gặp nhất ở đúng bộ phận này. */
  mistake: string
  box: Box
  /** Vị trí đặt số hiệu — đặt tay để 14 con số không đè lên nhau. */
  badge: [x: number, y: number]
  /** Bộ phận bắt buộc phải có, hay chỉ thêm khi cần. */
  required: boolean
}

const PARTS: Part[] = [
  {
    id: 'title',
    n: 1,
    nameVi: 'Tiêu đề',
    nameEn: 'Title',
    role: 'Nói biểu đồ đang đo CÁI GÌ, của AI, trong KHOẢNG NÀO. Thiếu một trong ba thì người xem phải đoán.',
    mistake: '“Biểu đồ doanh thu” — đúng mà vô dụng. Không có phạm vi thời gian, không có đơn vị.',
    box: [18, 18, 320, 26],
    badge: [20, 30],
    required: true,
  },
  {
    id: 'subtitle',
    n: 2,
    nameVi: 'Câu trả lời (phụ đề)',
    nameEn: 'Subtitle / takeaway',
    role: 'Một câu nói thẳng điều người vẽ muốn người xem thấy. Đây là thứ phân biệt biểu đồ có ý kiến với biểu đồ chỉ đổ số ra màn hình.',
    mistake: 'Bỏ trống, hoặc lặp lại tiêu đề. Nếu không viết nổi một câu thì thường là biểu đồ chưa có gì để nói.',
    box: [18, 44, 360, 22],
    badge: [20, 54],
    required: false,
  },
  {
    id: 'legend',
    n: 3,
    nameVi: 'Chú giải',
    nameEn: 'Legend',
    role: 'Nối MÀU với DANH TÍNH. Từ 2 series trở lên là bắt buộc.',
    mistake: 'Có legend cho biểu đồ một series (thừa — tiêu đề nói rồi), hoặc để legend cuối trang xa tít khỏi mark.',
    box: [18, 70, 190, 24],
    badge: [20, 82],
    required: true,
  },
  {
    id: 'plot',
    n: 4,
    nameVi: 'Vùng vẽ',
    nameEn: 'Plot area',
    role: 'Khung chữ nhật mà mọi mark nằm trong đó. Mọi thứ khác chỉ là chú thích quanh nó.',
    mistake: 'Nhồi quá nhiều thứ vào một vùng vẽ. Vùng vẽ chật thì tách thành nhiều biểu đồ nhỏ (small multiples).',
    box: [96, 100, 548, 204],
    badge: [630, 114],
    required: true,
  },
  {
    id: 'grid',
    n: 5,
    nameVi: 'Lưới',
    nameEn: 'Gridlines',
    role: 'Giúp mắt dóng từ mark sang trục giá trị. Chỉ cần lưới NGANG, nét mảnh 1px, màu chỉ hơn nền một bậc.',
    mistake: 'Lưới dọc (nhiễu, không giúp đọc gì thêm), lưới đậm hơn cả mark, hoặc quá nhiều vạch — 3–5 vạch là đủ.',
    box: [96, 100, 548, 155],
    badge: [654, 204],
    required: false,
  },
  {
    id: 'yaxis',
    n: 6,
    nameVi: 'Trục giá trị + đơn vị',
    nameEn: 'Value axis',
    role: 'Thang đo độ lớn. Nhãn trục phải kèm ĐƠN VỊ, và với cột/thanh thì bắt buộc bắt đầu từ 0.',
    mistake: 'Cắt gốc để “nhìn cho rõ chênh lệch” — đó là bóp méo. Và không bao giờ có trục Y thứ hai.',
    box: [22, 92, 76, 220],
    badge: [46, 104],
    required: true,
  },
  {
    id: 'xaxis',
    n: 7,
    nameVi: 'Trục danh mục',
    nameEn: 'Category axis',
    role: 'Cho biết mỗi mark là ai. Có baseline (đường trục), không có lưới.',
    mistake: 'Xoay nhãn 45° cho “vừa chỗ” — nhãn dài thì lật biểu đồ thành thanh ngang, đọc thẳng hàng hơn hẳn.',
    box: [96, 306, 548, 46],
    badge: [100, 340],
    required: true,
  },
  {
    id: 'marks',
    n: 8,
    nameVi: 'Mark (cột) & series',
    nameEn: 'Marks & series',
    role: 'Phần MANG DỮ LIỆU. Một series = một nhóm mark cùng danh tính, cùng màu. Ở đây có 2 series × 4 danh mục = 8 mark.',
    mistake: 'Nhầm “series” với “danh mục”. Đổi màu theo thứ hạng thay vì theo thực thể — lọc bớt một series là mọi màu nhảy hết.',
    box: [122, 116, 496, 188],
    badge: [222, 130],
    required: true,
  },
  {
    id: 'datalabel',
    n: 9,
    nameVi: 'Nhãn dữ liệu',
    nameEn: 'Data label',
    role: 'Gắn số thẳng lên mark, cho những giá trị người xem chắc chắn cần đọc chính xác.',
    mistake: 'Gắn số lên MỌI mark → biểu đồ thành cái bảng xấu. Gắn có chọn lọc: giá trị lớn nhất, mới nhất, hoặc điểm đang nói tới.',
    box: [126, 104, 78, 22],
    badge: [188, 112],
    required: false,
  },
  {
    id: 'refline',
    n: 10,
    nameVi: 'Đường mốc / ngưỡng',
    nameEn: 'Reference line',
    role: 'Biến con số thành “đạt hay chưa đạt”. Chỉ tiêu, trung bình, ngưỡng cảnh báo.',
    mistake: 'Vẽ đường mốc dày và sặc sỡ như một series thật. Mốc là CHÚ THÍCH: nét đứt, màu mực, có nhãn ghi rõ.',
    box: [96, 168, 548, 30],
    badge: [108, 200],
    required: false,
  },
  {
    id: 'annotation',
    n: 11,
    nameVi: 'Chú thích sự kiện',
    nameEn: 'Annotation',
    role: 'Trả lời “vì sao chỗ này gãy?” ngay tại chỗ gãy: đổi giá, chiến dịch, sự cố hệ thống.',
    mistake: 'Để người xem tự đoán rồi hỏi lại trong cuộc họp. Hoặc chú thích chi chít, mất luôn tác dụng nhấn mạnh.',
    box: [352, 196, 168, 116],
    badge: [360, 212],
    required: false,
  },
  {
    id: 'tooltip',
    n: 12,
    nameVi: 'Tooltip',
    nameEn: 'Tooltip',
    role: 'Tầng chi tiết theo yêu cầu: con số chính xác của mark đang trỏ, kèm cả các series khác cùng vị trí để so.',
    mistake: 'Coi tooltip là chỗ chứa những gì không xếp được vào biểu đồ. In ra, chụp màn hình hay đọc bằng bàn phím đều không có tooltip.',
    box: [446, 108, 182, 86],
    badge: [440, 102],
    required: false,
  },
  {
    id: 'footnote',
    n: 13,
    nameVi: 'Ghi chú nguồn & độ tươi',
    nameEn: 'Source & freshness note',
    role: 'Số này ở đâu ra, tính đến lúc nào, đơn vị gì. Thiếu dòng này là mất niềm tin — người xem không có cách nào tự kiểm.',
    mistake: 'Bỏ qua vì “ai cũng biết rồi”. Sáu tháng sau, không ai biết nữa.',
    box: [18, 364, 440, 24],
    badge: [26, 376],
    required: true,
  },
  {
    id: 'whitespace',
    n: 14,
    nameVi: 'Lề & khoảng thở',
    nameEn: 'Margins & whitespace',
    role: 'Khoảng trống quanh vùng vẽ và giữa các mark. Đây là thành phần vô hình nhưng quyết định biểu đồ trông rối hay gọn.',
    mistake: 'Kéo mark sát mép khung, hoặc để cột dày dính nhau. Cột dày tối đa ~24px, phần thừa của band để làm khoảng thở.',
    box: [8, 8, 664, 384],
    badge: [660, 20],
    required: true,
  },
]

/* -------------------------------------------------------------------------- */
/* Sơ đồ                                                                       */
/* -------------------------------------------------------------------------- */

const CATS = ['Thiết bị', 'Vật tư', 'Dịch vụ', 'Khác']
const CURRENT = [88.5, 28.7, 22.9, 12]
const PREVIOUS = [79.2, 31.4, 20.1, 9.6]

const PLOT = { x0: 96, x1: 644, y0: 100, y1: 304 }
const BAND = (PLOT.x1 - PLOT.x0) / CATS.length
const centerOf = (i: number) => PLOT.x0 + BAND * (i + 0.5)
/** Giá trị (tỷ) → toạ độ y. Trục bắt đầu từ 0, đúng như quy tắc cho cột. */
const yOf = (v: number) => PLOT.y1 - (v / 100) * (PLOT.y1 - PLOT.y0)

function AnatomyFigure({
  active,
  onHover,
}: {
  active: string | null
  onHover: (id: string | null) => void
}) {
  const mode = useMode()
  const c = CHROME[mode]
  const accent = SERIES[mode][0]
  const past = c.deemphasis

  /** Bộ phận không được chọn thì lùi hẳn về sau — đó là cách "chỉ tay" ở đây. */
  const dim = (id: string) => (active && active !== id ? 0.14 : 1)
  const g = (id: string, children: React.ReactNode) => (
    <g
      opacity={dim(id)}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{ transition: 'opacity .15s ease' }}
    >
      {children}
    </g>
  )

  const label = { fontSize: 11, fill: c.inkMuted }
  const activePart = PARTS.find((p) => p.id === active)

  return (
    <svg viewBox="0 0 680 400" className="anat-svg" role="img" aria-label="Sơ đồ các thành phần của một biểu đồ">
      {/* 14 — lề: vẽ trước, nằm dưới cùng */}
      {g(
        'whitespace',
        <rect
          x={8}
          y={8}
          width={664}
          height={384}
          rx={10}
          fill="none"
          stroke={c.border}
          strokeDasharray="2 4"
        />,
      )}

      {/* 1 — tiêu đề */}
      {g(
        'title',
        <text x={40} y={36} fontSize={15} fontWeight={600} fill={c.ink}>
          Doanh thu theo danh mục · 30 ngày gần nhất
        </text>,
      )}

      {/* 2 — phụ đề */}
      {g(
        'subtitle',
        <text x={40} y={60} fontSize={12} fill={c.inkSecondary}>
          Thiết bị vẫn chiếm hơn nửa tổng doanh thu và còn tăng so với kỳ trước.
        </text>,
      )}

      {/* 3 — chú giải */}
      {g(
        'legend',
        <>
          <circle cx={46} cy={82} r={4.5} fill={accent} />
          <text x={57} y={86} {...label} fill={c.inkSecondary}>
            Kỳ này
          </text>
          <circle cx={117} cy={82} r={4.5} fill={past} />
          <text x={128} y={86} {...label} fill={c.inkSecondary}>
            Kỳ trước
          </text>
        </>,
      )}

      {/* 4 — vùng vẽ */}
      {g(
        'plot',
        <rect
          x={PLOT.x0}
          y={PLOT.y0}
          width={PLOT.x1 - PLOT.x0}
          height={PLOT.y1 - PLOT.y0}
          fill={active === 'plot' ? accent : 'transparent'}
          fillOpacity={active === 'plot' ? 0.06 : 0}
        />,
      )}

      {/* 5 — lưới ngang */}
      {g(
        'grid',
        <>
          {[25, 50, 75, 100].map((v) => (
            <line
              key={v}
              x1={PLOT.x0}
              x2={PLOT.x1}
              y1={yOf(v)}
              y2={yOf(v)}
              stroke={c.grid}
              strokeWidth={1}
            />
          ))}
        </>,
      )}

      {/* 6 — trục giá trị */}
      {g(
        'yaxis',
        <>
          {[0, 25, 50, 75, 100].map((v) => (
            <text key={v} x={88} y={yOf(v) + 4} textAnchor="end" {...label}>
              {v === 0 ? '0' : `${v} tỷ`}
            </text>
          ))}
          <text
            x={34}
            y={202}
            {...label}
            textAnchor="middle"
            transform="rotate(-90 34 202)"
            fill={c.inkSecondary}
          >
            Doanh thu (tỷ ₫)
          </text>
        </>,
      )}

      {/* 8 — mark & series */}
      {g(
        'marks',
        <>
          {CATS.map((cat, i) => {
            const cx = centerOf(i)
            return (
              <g key={cat}>
                <path
                  d={roundedTop(cx - 38, yOf(CURRENT[i]), 34, PLOT.y1 - yOf(CURRENT[i]), 4)}
                  fill={accent}
                />
                <path
                  d={roundedTop(cx + 4, yOf(PREVIOUS[i]), 34, PLOT.y1 - yOf(PREVIOUS[i]), 4)}
                  fill={past}
                />
              </g>
            )
          })}
        </>,
      )}

      {/* 7 — trục danh mục */}
      {g(
        'xaxis',
        <>
          <line
            x1={PLOT.x0}
            x2={PLOT.x1}
            y1={PLOT.y1}
            y2={PLOT.y1}
            stroke={c.axis}
            strokeWidth={1}
          />
          {CATS.map((cat, i) => (
            <text key={cat} x={centerOf(i)} y={PLOT.y1 + 18} textAnchor="middle" {...label}>
              {cat}
            </text>
          ))}
          <text x={(PLOT.x0 + PLOT.x1) / 2} y={PLOT.y1 + 40} textAnchor="middle" {...label}>
            Danh mục
          </text>
        </>,
      )}

      {/* 9 — nhãn dữ liệu */}
      {g(
        'datalabel',
        <text
          x={centerOf(0) - 21}
          y={yOf(CURRENT[0]) - 8}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={600}
          fill={c.inkSecondary}
        >
          88,5 tỷ
        </text>,
      )}

      {/* 10 — đường mốc */}
      {g(
        'refline',
        <>
          <line
            x1={PLOT.x0}
            x2={PLOT.x1}
            y1={yOf(60)}
            y2={yOf(60)}
            stroke={c.ink}
            strokeWidth={1}
            strokeDasharray="5 4"
          />
          <text x={PLOT.x0 + 8} y={yOf(60) - 7} fontSize={11} fill={c.inkSecondary}>
            Mục tiêu 60 tỷ
          </text>
        </>,
      )}

      {/* 11 — chú thích sự kiện */}
      {g(
        'annotation',
        <>
          <line
            x1={370}
            x2={370}
            y1={PLOT.y1}
            y2={230}
            stroke={c.axis}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
          <circle cx={370} cy={230} r={3.5} fill={c.inkSecondary} />
          <text x={378} y={222} fontSize={11} fill={c.inkSecondary}>
            1/6 · đổi bảng giá
          </text>
        </>,
      )}

      {/* 12 — tooltip (vẽ sau cùng: nó luôn nằm trên) */}
      {g(
        'tooltip',
        <>
          <line
            x1={centerOf(2)}
            x2={centerOf(2)}
            y1={PLOT.y0}
            y2={PLOT.y1}
            stroke={c.axis}
            strokeWidth={1}
          />
          <rect
            x={446}
            y={108}
            width={182}
            height={86}
            rx={8}
            fill={c.surface}
            stroke={c.axis}
            strokeWidth={1}
          />
          <text x={460} y={130} fontSize={12} fontWeight={600} fill={c.ink}>
            Dịch vụ
          </text>
          <circle cx={464} cy={150} r={4} fill={accent} />
          <text x={475} y={154} fontSize={11.5} fill={c.inkSecondary}>
            Kỳ này
          </text>
          <text x={616} y={154} fontSize={11.5} textAnchor="end" fill={c.ink}>
            22,9 tỷ
          </text>
          <circle cx={464} cy={172} r={4} fill={past} />
          <text x={475} y={176} fontSize={11.5} fill={c.inkSecondary}>
            Kỳ trước
          </text>
          <text x={616} y={176} fontSize={11.5} textAnchor="end" fill={c.ink}>
            20,1 tỷ
          </text>
        </>,
      )}

      {/* 13 — ghi chú nguồn */}
      {g(
        'footnote',
        <text x={42} y={380} fontSize={11} fill={c.inkMuted}>
          Nguồn: kho dữ liệu bán hàng · số liệu đến 06:00 hôm nay · đơn vị: tỷ ₫
        </text>,
      )}

      {/* Số hiệu bộ phận — luôn hiện, đậm lên khi được chọn. */}
      {PARTS.map((p) => {
        const [x, y] = p.badge
        const on = active === p.id
        return (
          <g
            key={p.id}
            className="anat-badge"
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
          >
            <circle
              cx={x}
              cy={y}
              r={9}
              fill={on ? accent : c.surface}
              stroke={on ? accent : c.axis}
              strokeWidth={1}
              opacity={on || !active ? 1 : 0.3}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={600}
              fill={on ? '#ffffff' : c.inkMuted}
              opacity={on || !active ? 1 : 0.3}
              style={{ pointerEvents: 'none' }}
            >
              {p.n}
            </text>
          </g>
        )
      })}

      {/* Khoanh vùng bộ phận đang chọn */}
      {activePart && (
        <rect
          x={activePart.box[0]}
          y={activePart.box[1]}
          width={activePart.box[2]}
          height={activePart.box[3]}
          rx={6}
          fill="none"
          stroke={accent}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  )
}

/** Cột bo tròn ở ĐỈNH, vuông ở chân baseline — đúng quy ước mark của catalog. */
function roundedTop(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, h)
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`
}

/* -------------------------------------------------------------------------- */
/* Từ vựng hay nhầm                                                            */
/* -------------------------------------------------------------------------- */

const GLOSSARY: { a: string; b: string; note: string }[] = [
  {
    a: 'Series',
    b: 'Danh mục (category)',
    note: 'Series là MỘT đường/MỘT màu chạy qua nhiều danh mục. Danh mục là các vị trí trên trục. “Kỳ này” là series; “Thiết bị” là danh mục.',
  },
  {
    a: 'Mark',
    b: 'Biểu đồ (chart)',
    note: 'Mark là một hình đơn lẻ mang dữ liệu (một cột, một điểm, một lát). Biểu đồ là toàn bộ khung chứa các mark đó.',
  },
  {
    a: 'Chú giải (legend)',
    b: 'Nhãn dữ liệu (data label)',
    note: 'Legend giải thích MÀU nghĩa là gì. Data label là con số dán lên chính cái mark. Có legend rồi vẫn có thể cần nhãn, và ngược lại.',
  },
  {
    a: 'Trục giá trị',
    b: 'Trục danh mục',
    note: 'Trục giá trị đo độ lớn (liên tục, có đơn vị, bắt đầu từ 0 với cột). Trục danh mục chỉ liệt kê tên — không có “khoảng cách” giữa hai tên.',
  },
  {
    a: 'Giá trị tuyệt đối',
    b: 'Tỷ trọng (%)',
    note: 'Cột chồng thường trả lời độ lớn; cột chồng 100% trả lời cơ cấu. Trộn hai câu hỏi vào một biểu đồ là nguồn hiểu nhầm kinh điển.',
  },
  {
    a: 'Bin (khoảng chia)',
    b: 'Danh mục',
    note: 'Histogram chia một đại lượng liên tục thành các bin — đổi độ rộng bin là đổi hình dạng. Bar chart đếm theo danh mục có sẵn, không chia được.',
  },
]

/* -------------------------------------------------------------------------- */

export function Anatomy() {
  const [active, setActive] = useState<string | null>(null)
  /** Click = ghim, để rời chuột đi đọc mà vùng khoanh vẫn còn. */
  const [pinned, setPinned] = useState<string | null>(null)
  const shown = pinned ?? active
  const mode = useMode()
  const c = CHROME[mode]

  return (
    <article className="detail is-wide">
      <h1>Kiến thức về chart</h1>
      <p className="lede">
        Trước khi chọn loại biểu đồ, cần gọi đúng tên các bộ phận — vì mọi cuộc trao đổi về
        dashboard đều diễn ra bằng những từ này. Rê chuột (hoặc bấm để ghim) vào một dòng bên dưới
        để thấy bộ phận đó nằm ở đâu. Bấm lại để bỏ ghim.
      </p>

      <h2 className="anat-h2">Giải phẫu một biểu đồ</h2>

      {/* Bọc sơ đồ + danh sách trong một khối: sơ đồ chỉ dính trong phạm vi khối
          này, hết danh sách là nhả ra — không lẽo đẽo theo tới cuối trang. */}
      <div className="anat-explore">
        <div className="anat-stage">
          <AnatomyFigure active={shown} onHover={(id) => setActive(id)} />
          <p className="anat-cap" style={{ color: c.inkMuted }}>
            {shown
              ? `${PARTS.find((p) => p.id === shown)!.n}. ${PARTS.find((p) => p.id === shown)!.nameVi}${pinned ? ' · đang ghim, bấm lại để bỏ' : ''}`
              : 'Cùng một biểu đồ cột nhóm, tách ra thành 14 bộ phận có tên riêng.'}
          </p>
        </div>

        <div className="anat-list">
          {PARTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={shown === p.id ? 'anat-item is-on' : 'anat-item'}
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.id)}
              onBlur={() => setActive(null)}
              onClick={() => setPinned((x) => (x === p.id ? null : p.id))}
            >
              <span className="anat-num">{p.n}</span>
              <span className="anat-body">
                <span className="anat-name">
                  {p.nameVi}
                  <em>{p.nameEn}</em>
                  <span className={p.required ? 'anat-tag is-req' : 'anat-tag'}>
                    {p.required ? 'bắt buộc' : 'khi cần'}
                  </span>
                </span>
                <span className="anat-role">{p.role}</span>
                <span className="anat-mistake">
                  <b>Hay sai:</b> {p.mistake}
                </span>
              </span>
            </button>
          ))}
        </div>

      </div>

      <h2>Bốn tầng, đọc từ trong ra ngoài</h2>
      <p className="lede">
        Khi rà lại một biểu đồ, đi theo đúng thứ tự này. Sai ở tầng trong thì sửa tầng ngoài bao
        nhiêu cũng vô ích.
      </p>
      <div className="anat-layers">
        <div className="anat-layer">
          <b>1 · Dữ liệu</b>
          <span>
            Một bảng fact: mỗi dòng một quan sát, mỗi cột một chiều. Sai ở đây thì mọi thứ phía sau
            đều sai — kiểm tổng trước khi vẽ.
          </span>
        </div>
        <div className="anat-layer">
          <b>2 · Mark</b>
          <span>
            Chọn hình thức thể hiện: độ dài (cột), vị trí (điểm), góc (lát), độ đậm (ô nhiệt). Chọn
            hình thức trước, chọn màu sau.
          </span>
        </div>
        <div className="anat-layer">
          <b>3 · Khung</b>
          <span>
            Trục, lưới, lề — phần lùi về sau. Nếu khung nổi hơn mark thì đã sai. Lưới hairline, chữ
            màu mực, không màu series.
          </span>
        </div>
        <div className="anat-layer">
          <b>4 · Diễn giải</b>
          <span>
            Tiêu đề, phụ đề, chú giải, đường mốc, ghi chú nguồn. Đây là tầng biến một hình vẽ thành
            một câu trả lời.
          </span>
        </div>
      </div>

      <h2>Từ vựng hay nhầm</h2>
      <table className="dtable">
        <thead>
          <tr>
            <th>Không phải…</th>
            <th>…và cũng không phải</th>
            <th>Khác nhau ở chỗ</th>
          </tr>
        </thead>
        <tbody>
          {GLOSSARY.map((g) => (
            <tr key={g.a}>
              <td>
                <b>{g.a}</b>
              </td>
              <td>
                <b>{g.b}</b>
              </td>
              <td>{g.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Rà lại trước khi đưa lên dashboard</h2>
      <ol className="rules">
        <li>
          Tiêu đề có đủ <b>đo cái gì · của ai · trong khoảng nào</b> chưa?
        </li>
        <li>
          Viết được <b>một câu</b> nói biểu đồ này cho thấy điều gì không? Không viết được thì
          thường là chưa có gì để nói.
        </li>
        <li>
          Trục giá trị có <b>đơn vị</b> chưa, và với cột/thanh thì có <b>bắt đầu từ 0</b> không?
        </li>
        <li>
          Từ 2 series trở lên đã có <b>chú giải</b> chưa? Màu có bám theo <b>thực thể</b>, không
          bám theo thứ hạng?
        </li>
        <li>
          Nhãn dữ liệu có <b>chọn lọc</b> không, hay đang dán lên mọi mark?
        </li>
        <li>
          Có <b>mốc để so</b> (chỉ tiêu, kỳ trước, trung bình) chưa? Một con số trơ không nói lên
          gì.
        </li>
        <li>
          Có dòng <b>nguồn &amp; thời điểm cập nhật</b> chưa?
        </li>
        <li>
          Bỏ tooltip đi thì biểu đồ còn đọc được không? (Bản in, ảnh chụp, và người dùng bàn phím
          không có tooltip.)
        </li>
      </ol>

      <p className="lede">
        Phần nguyên tắc màu và trần số series nằm ở trang{' '}
        <a className="inline-link" href="#/rules">
          Nguyên tắc &amp; bảng màu
        </a>
        .
      </p>
    </article>
  )
}
