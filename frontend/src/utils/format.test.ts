import { describe, expect, it } from 'vitest'

import { formatCurrency, formatDateTime } from './format'

describe('formatCurrency', () => {
  it('formats a numeric string as BRL currency', () => {
    expect(formatCurrency('149.90')).toBe('R$ 149,90')
  })

  it('formats a number', () => {
    expect(formatCurrency(2)).toBe('R$ 2,00')
  })
})

describe('formatDateTime', () => {
  it('formats an ISO string using pt-BR short date/time style', () => {
    const result = formatDateTime('2026-01-05T10:00:00-03:00')
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/10:00/)
  })
})
