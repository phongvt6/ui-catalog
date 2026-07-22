/**
 * Chép text vào clipboard.
 *
 * `navigator.clipboard` chỉ chạy ở secure context (https / localhost) và vẫn có
 * thể bị từ chối khi tài liệu không được focus — nên luôn có phương án dự phòng
 * và trả về kết quả để giao diện báo đúng cho người dùng, thay vì im lặng.
 */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // rơi xuống phương án dự phòng bên dưới
    }
  }

  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '-1000px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
