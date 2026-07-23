import type { ChartEntry } from '../types'
import { singleValueEntries } from './singleValue'
import { compareEntries } from './compare'
import { compare2Entries } from './compare2'
import { compositionEntries } from './composition'
import { composition2Entries } from './composition2'
import { trendEntries } from './trend'
import { analysisEntries } from './analysis'
import { distributionEntries } from './distribution'
import { flowEntries } from './flow'
import { geoEntries } from './geo'
import { dashboardEntries } from './dashboard'
import { tableEntries } from './tables'
import { versusEntries } from './versus'
import { crossFilterEntries } from './crossfilter'
import { compositeEntries } from './composite'
import { foundationEntries } from './foundation'

export const entries: ChartEntry[] = [
  ...singleValueEntries,
  ...dashboardEntries,
  ...compareEntries,
  ...compare2Entries,
  ...versusEntries,
  ...tableEntries,
  ...compositionEntries,
  ...composition2Entries,
  ...trendEntries,
  ...analysisEntries,
  ...distributionEntries,
  ...flowEntries,
  ...geoEntries,
  ...crossFilterEntries,
  ...compositeEntries,
  ...foundationEntries,
]

export function findEntry(id: string): ChartEntry | undefined {
  return entries.find((e) => e.id === id)
}

/** Tìm kiếm mờ trên tên VI/EN, alias và mô tả. */
export function searchEntries(q: string): ChartEntry[] {
  const needle = normalize(q)
  if (!needle) return entries
  return entries.filter((e) =>
    normalize(
      [e.nameVi, e.nameEn, ...(e.aliases ?? []), e.description].join(' '),
    ).includes(needle),
  )
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/đ/g, 'd')
}
