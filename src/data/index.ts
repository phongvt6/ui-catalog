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
import { dataVizEntries } from './dataViz'
import { positioningEntries } from './positioning'

/** Đánh dấu đợt bổ sung cho cả lô; entry tự khai `since` thì giữ nguyên. */
const since = (list: CatalogEntry[], version: string): CatalogEntry[] =>
  list.map((e) => ({ ...e, since: e.since ?? version }))

export const CATALOG: CatalogEntry[] = [
  ...since(inputEntries, '0.1.0'),
  ...since(inputsAdvancedEntries, '0.2.0'),
  ...since(actionEntries, '0.1.0'),
  ...since(actionsAdvancedEntries, '0.2.0'),
  ...since(feedbackEntries, '0.1.0'),
  ...since(feedbackAdvancedEntries, '0.2.0'),
  ...since(dataEntries, '0.1.0'),
  ...since(dataAdvancedEntries, '0.2.0'),
  ...since(overlayEntries, '0.1.0'),
  ...since(mediaMobileEntries, '0.1.0'),
  ...since(mediaAdvancedEntries, '0.2.0'),
  ...since(galleryEntries, '0.4.0'),
  ...since(dataVizEntries, '0.4.0'),
  ...since(positioningEntries, '0.4.0'),
]

const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g')

/** Bỏ dấu tiếng Việt để gõ không dấu vẫn tìm ra kết quả. */
export function deaccent(s: string): string {
  return s.normalize('NFD').replace(COMBINING, '').replace(/[đĐ]/g, 'd').toLowerCase()
}
