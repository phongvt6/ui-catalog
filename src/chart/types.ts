import type { ReactNode } from 'react'

/**
 * Phân loại theo MỤC ĐÍCH PHÂN TÍCH, không theo tên biểu đồ.
 * Người đi tìm không nghĩ "tôi cần treemap" — họ nghĩ "tôi cần so sánh cơ cấu".
 */
export type JobId =
  | 'single-value'
  | 'compare'
  | 'composition'
  | 'trend'
  | 'distribution'
  | 'correlation'
  | 'flow'
  | 'hierarchy'
  | 'geo'
  | 'pattern'
  | 'table'
  | 'versus'
  | 'cross-filter'
  | 'composite'
  | 'foundation'

export interface Job {
  id: JobId
  nameVi: string
  nameEn: string
  /** Câu hỏi nghiệp vụ mà nhóm này trả lời. */
  question: string
}

export const JOBS: Job[] = [
  {
    id: 'single-value',
    nameVi: 'Một con số',
    nameEn: 'Single value',
    question: 'Hôm nay con số đó là bao nhiêu, hơn kém kỳ trước thế nào?',
  },
  {
    id: 'compare',
    nameVi: 'So sánh',
    nameEn: 'Comparison',
    question: 'Ai nhiều hơn ai, hơn bao nhiêu?',
  },
  {
    id: 'versus',
    nameVi: 'So sánh hai bên',
    nameEn: 'Head-to-head comparison',
    question: 'Đặt A cạnh B thì hơn kém nhau ở chỗ nào?',
  },
  {
    id: 'composition',
    nameVi: 'Cơ cấu',
    nameEn: 'Composition',
    question: 'Cái tổng đó gồm những phần nào, mỗi phần chiếm bao nhiêu?',
  },
  {
    id: 'trend',
    nameVi: 'Xu hướng',
    nameEn: 'Trend over time',
    question: 'Đang tăng hay giảm, từ lúc nào?',
  },
  {
    id: 'pattern',
    nameVi: 'Quy luật theo lưới',
    nameEn: 'Pattern / intensity',
    question: 'Cao điểm rơi vào khung giờ nào, ngày nào?',
  },
  {
    id: 'table',
    nameVi: 'Bảng phân tích',
    nameEn: 'Analytical tables',
    question: 'Cần con số chính xác, nhiều chiều cùng lúc — bày ra thế nào?',
  },
  {
    id: 'correlation',
    nameVi: 'Tương quan',
    nameEn: 'Correlation',
    question: 'X tăng thì Y có tăng theo không?',
  },
  {
    id: 'distribution',
    nameVi: 'Phân bố',
    nameEn: 'Distribution',
    question: 'Dữ liệu trải ra sao, đâu là giá trị bất thường?',
  },
  {
    id: 'flow',
    nameVi: 'Luồng & biến động',
    nameEn: 'Flow & change',
    question: 'Từ đâu chảy đến đâu, cộng trừ những gì ra số cuối?',
  },
  {
    id: 'hierarchy',
    nameVi: 'Thứ bậc',
    nameEn: 'Hierarchy',
    question: 'Cấu trúc lồng nhau nhiều cấp trông thế nào?',
  },
  {
    id: 'cross-filter',
    nameVi: 'Lọc chéo & liên kết',
    nameEn: 'Cross-filtering & linked views',
    question: 'Click vào một chỗ, những khối còn lại đổi theo thế nào?',
  },
  {
    id: 'composite',
    nameVi: 'Mẫu ghép phức tạp',
    nameEn: 'Composite patterns',
    question: 'Nhiều khối, nhiều tầng thông tin — ghép lại thế nào cho vẫn đọc được?',
  },
  {
    id: 'foundation',
    nameVi: 'Nền tảng dashboard',
    nameEn: 'Dashboard foundations',
    question: 'Những thứ quanh biểu đồ mà thiếu là mất niềm tin.',
  },
  {
    id: 'geo',
    nameVi: 'Địa lý',
    nameEn: 'Geospatial',
    question: 'Chuyện đó xảy ra ở đâu trên bản đồ?',
  },
]

export type Status = 'ready' | 'planned'

export interface ChartEntry {
  id: string
  nameVi: string
  nameEn: string
  /** Tên khác hay gặp — giúp tìm ra đúng biểu đồ khi gõ từ khoá quen miệng. */
  aliases?: string[]
  job: JobId
  status: Status
  /** Nó LÀ cái gì. */
  description: string
  /** Khi nào NÊN dùng. */
  useWhen: string[]
  /** Khi nào KHÔNG dùng — phần quan trọng nhất của một entry. */
  avoidWhen: string[]
  /** Dữ liệu đầu vào phải có dạng gì mới vẽ được. */
  dataShape: string
  /** Biến thể hay gặp. */
  variants?: string[]
  /** Số series tối đa còn đọc được. */
  seriesCap?: string
  /** Bỏ trống với entry status='planned' — UI sẽ hiện khung "sắp có". */
  demo?: () => ReactNode
  code?: string
}

/**
 * Tổng số mục biểu đồ — hằng số nhẹ để header hiện được con số ngay khi app
 * mới mở, lúc danh mục (kèm code demo) còn chưa nạp. Thêm entry mới thì sửa
 * số này; lệch cũng chỉ sai một nhịp rồi tự đúng khi danh mục nạp xong.
 */
export const CHART_COUNT = 56
