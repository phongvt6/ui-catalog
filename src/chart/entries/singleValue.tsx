import type { ChartEntry } from '../types'
import { BulletChart, Meter, StatTile } from '../components/Figures'
import { kpis, targetVsActual } from '../data/sample'
import { vnCompact, vnNumber } from '../lib/theme'

export const singleValueEntries: ChartEntry[] = [
  {
    id: 'stat-tile',
    nameVi: 'Ô chỉ số (KPI)',
    nameEn: 'Stat tile / KPI row',
    aliases: ['KPI card', 'scorecard', 'big number', 'metric card', 'thẻ chỉ số'],
    job: 'single-value',
    status: 'ready',
    description:
      'Một con số hiện tại, kèm mức chênh so với kỳ trước và (tuỳ chọn) một sparkline nhỏ cho biết nó đang đi hướng nào. Xếp 3–5 ô thành một hàng ở đầu dashboard.',
    useWhen: [
      'Người xem chỉ cần biết “hôm nay bao nhiêu, hơn kém hôm qua thế nào”.',
      'Đầu dashboard, trước khi vào các biểu đồ chi tiết.',
      'Con số quan trọng đến mức không được để nó lẫn trong một biểu đồ.',
    ],
    avoidWhen: [
      'Có hơn 5–6 chỉ số → thành bức tường số, không ai đọc. Cắt còn 3–5 cái thật sự dẫn dắt quyết định.',
      'Chỉ số cần ngữ cảnh mới hiểu (ví dụ “tỷ lệ chuyển đổi 3,2%” mà không có mốc so sánh) → thêm delta hoặc dùng meter.',
      'Đừng thay một ô chỉ số bằng biểu đồ cột có đúng một cột — đó là lãng phí không gian.',
    ],
    dataShape:
      'Một giá trị hiện tại + một giá trị kỳ trước (để tính delta) + tuỳ chọn một chuỗi ~12 điểm cho sparkline.',
    variants: [
      'Hero figure: đúng MỘT con số cỡ ≥48px cho toàn view, không có ô nào khác to bằng.',
      'Có/không sparkline — sparkline chỉ để cảm nhận hướng đi, không đọc giá trị.',
      'Delta đảo màu với chỉ số “tăng là xấu” (chi phí, thời gian chờ, tỷ lệ lỗi).',
    ],
    seriesCap: '3–5 ô một hàng.',
    demo: () => (
      <div className="kpi-row">
        <StatTile
          label="Doanh thu hôm nay"
          value={`${vnCompact(kpis.todayRevenue)} ₫`}
          delta={kpis.todayDelta}
          deltaLabel="so với hôm qua"
          spark={kpis.spark}
          hero
        />
        <StatTile
          label="Doanh thu 7 ngày"
          value={`${vnCompact(kpis.week)} ₫`}
          delta={kpis.weekDelta}
          deltaLabel="so với 7 ngày trước"
        />
        <StatTile label="Số đơn hôm nay" value={vnNumber(kpis.ordersToday)} />
        <StatTile
          label="Giá trị đơn trung bình"
          value={`${vnNumber(Math.round(kpis.avgOrderValue / 1000))} k₫`}
          delta={2.4}
        />
      </div>
    ),
    code: `<div className="kpi-row">
  <StatTile
    label="Doanh thu hôm nay"
    value={\`\${vnCompact(kpis.todayRevenue)} ₫\`}
    delta={kpis.todayDelta}        // % so với kỳ trước
    deltaLabel="so với hôm qua"
    spark={kpis.spark}             // 12 điểm gần nhất
    hero                           // đúng MỘT hero mỗi view
  />
  <StatTile label="Số đơn hôm nay" value={vnNumber(kpis.ordersToday)} />
  {/* chỉ số mà tăng là xấu: */}
  <StatTile label="Chi phí vận hành" value="182 tr₫" delta={5.1} upIsGood={false} />
</div>`,
  },

  {
    id: 'meter',
    nameVi: 'Thanh tiến độ (meter)',
    nameEn: 'Meter / progress bar',
    aliases: ['gauge', 'progress', 'đồng hồ đo', 'tiến độ'],
    job: 'single-value',
    status: 'ready',
    description:
      'Một tỷ lệ so với hạn mức 100%. Phần chưa đạt dùng bậc NHẠT HƠN của cùng một hue, để trạng thái đọc được trên toàn thanh chứ không chỉ ở phần đã tô.',
    useWhen: [
      'Có một mốc trần rõ ràng: chỉ tiêu tháng, dung lượng kho, % hoàn thành.',
      'Người xem chỉ cần biết “đã tới đâu so với đích”, không cần con số tuyệt đối.',
    ],
    avoidWhen: [
      'Không có trần tự nhiên → tỷ lệ so với cái gì? Dùng stat tile.',
      'Cần so sánh nhiều đối tượng cùng lúc → dùng bullet chart, đọc nhanh hơn nhiều thanh rời rạc.',
      'Đừng dùng gauge hình bán nguyệt (kim đồng hồ): tốn gấp 3 diện tích để chở đúng một con số.',
    ],
    dataShape: 'Một giá trị thực hiện + một giá trị trần.',
    variants: ['Thanh ngang (mặc định).', 'Đổi màu fill theo ngưỡng cảnh báo khi vượt hạn mức.'],
    demo: () => (
      <div className="meter-grid">
        {targetVsActual.slice(0, 3).map((r) => (
          <Meter
            key={r.branch}
            label={r.branch}
            percent={(r.actual / r.target) * 100}
            caption={`${vnCompact(r.actual)} / ${vnCompact(r.target)} ₫`}
          />
        ))}
      </div>
    ),
    code: `<Meter
  label="CN-01"
  percent={(actual / target) * 100}
  caption={\`\${vnCompact(actual)} / \${vnCompact(target)} ₫\`}
/>

/* Track dùng BẬC NHẠT của chính hue fill (blue-on-blue),
   không dùng xám — để trạng thái đọc được trên cả thanh. */
.meter-track { background: #cde2fb; }   /* light */
.meter-fill  { background: #2a78d6; }`,
  },

  {
    id: 'bullet',
    nameVi: 'Thực hiện vs chỉ tiêu (bullet)',
    nameEn: 'Bullet chart',
    aliases: ['target vs actual', 'progress bar chart', 'so với kế hoạch'],
    job: 'single-value',
    status: 'ready',
    description:
      'Biến thể gọn của thanh tiến độ cho NHIỀU đối tượng: mỗi dòng là một thanh thực hiện, cộng một vạch dọc đánh dấu chỉ tiêu. Đọc được cả “bao nhiêu” lẫn “đạt hay chưa” trong một lần liếc.',
    useWhen: [
      'So sánh thực hiện với kế hoạch cho 3–10 đối tượng (chi nhánh, phòng ban, nhân viên).',
      'Thay cho gauge khi cần nhiều hơn một chỉ số.',
    ],
    avoidWhen: [
      'Không có chỉ tiêu để so → chỉ là bar chart thường, bỏ vạch mốc đi.',
      'Quá 10 dòng → chuyển sang bảng có cột % hoàn thành, sắp xếp được.',
    ],
    dataShape: 'Mỗi dòng: nhãn + giá trị thực hiện + giá trị chỉ tiêu (cùng đơn vị).',
    variants: [
      'Thêm dải nền phân vùng kém/đạt/tốt (bullet chuẩn Few) — chỉ khi ngưỡng thật sự có nghĩa.',
      'Tô màu số % theo đạt/không đạt, nhưng LUÔN kèm chữ, không để màu tự gánh nghĩa.',
    ],
    seriesCap: '3–10 dòng.',
    demo: () => (
      <BulletChart
        rows={targetVsActual.map((r) => ({
          label: r.branch,
          actual: r.actual,
          target: r.target,
        }))}
      />
    ),
    code: `<BulletChart
  rows={targetVsActual.map(r => ({
    label: r.branch,
    actual: r.actual,
    target: r.target,
  }))}
/>

/* Vạch chỉ tiêu vẽ bằng mực (ink), KHÔNG dùng màu series —
   nó là mốc tham chiếu, không phải một series thứ hai. */`,
  },
]
