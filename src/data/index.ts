import type { CatalogEntry } from '../types'
import { inputEntries } from './inputs'
import { inputsAdvancedEntries } from './inputsAdvanced'
import { actionEntries } from './actions'
import { actionsAdvancedEntries } from './actionsAdvanced'
import { feedbackEntries } from './feedback'
import { feedbackAdvancedEntries } from './feedbackAdvanced'
import { dataEntries } from './dataDisplay'
import { dataAdvancedEntries } from './dataAdvanced'
import { overlayEntries } from './overlay'
import { mediaMobileEntries } from './mediaMobile'
import { mediaAdvancedEntries } from './mediaAdvanced'
import { galleryEntries } from './gallery'

export const CATALOG: CatalogEntry[] = [
  ...inputEntries,
  ...inputsAdvancedEntries,
  ...actionEntries,
  ...actionsAdvancedEntries,
  ...feedbackEntries,
  ...feedbackAdvancedEntries,
  ...dataEntries,
  ...dataAdvancedEntries,
  ...overlayEntries,
  ...mediaMobileEntries,
  ...mediaAdvancedEntries,
  ...galleryEntries,
]

const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g')

/** Bỏ dấu tiếng Việt để gõ không dấu vẫn tìm ra kết quả. */
export function deaccent(s: string): string {
  return s.normalize('NFD').replace(COMBINING, '').replace(/[đĐ]/g, 'd').toLowerCase()
}
